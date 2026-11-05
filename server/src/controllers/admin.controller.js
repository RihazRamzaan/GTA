import EventSettings from '../models/EventSettings.js';
import { validateMilestonesChronology } from '../utils/dates.js';
import { httpError } from '../middleware/error.js';

const ALLOWED_MODES = ['auto', 'force_open', 'force_closed'];

/**
 * GET /api/admin/settings
 * Retrieves the raw event settings singleton for the admin dashboard.
 */
export async function getAdminSettings(_req, res, next) {
  try {
    const settings = await EventSettings.getOrCreateSingleton();
    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/settings
 * Updates milestones and/or gate override modes.
 * Validates chronological integrity of milestone dates.
 */
export async function updateAdminSettings(req, res, next) {
  try {
    const { milestones, registrationMode, submissionMode } = req.body || {};

    // Validate registrationMode if provided
    if (registrationMode !== undefined && !ALLOWED_MODES.includes(registrationMode)) {
      throw httpError(
        400,
        'INVALID_GATE_MODE',
        `registrationMode must be one of: ${ALLOWED_MODES.join(', ')}`
      );
    }

    // Validate submissionMode if provided
    if (submissionMode !== undefined && !ALLOWED_MODES.includes(submissionMode)) {
      throw httpError(
        400,
        'INVALID_GATE_MODE',
        `submissionMode must be one of: ${ALLOWED_MODES.join(', ')}`
      );
    }

    const settings = await EventSettings.getOrCreateSingleton();

    // If milestones are being updated, merge with existing milestones to validate chronology
    if (milestones !== undefined) {
      if (typeof milestones !== 'object' || milestones === null) {
        throw httpError(400, 'INVALID_MILESTONES', 'Milestones must be an object with date values.');
      }

      const mergedMilestones = {
        ...settings.milestones.toObject(),
        ...milestones,
      };

      const validation = validateMilestonesChronology(mergedMilestones);
      if (!validation.valid) {
        throw httpError(400, 'INVALID_CHRONOLOGY', validation.errors.join(' '));
      }

      // Apply valid parsed dates
      for (const [key, val] of Object.entries(validation.parsed)) {
        settings.milestones[key] = val;
      }
    }

    if (registrationMode !== undefined) {
      settings.registrationMode = registrationMode;
    }

    if (submissionMode !== undefined) {
      settings.submissionMode = submissionMode;
    }

    await settings.save();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/registrations/:id/slip
 * Safely streams the private payment slip file for admin review.
 */
export async function getRegistrationSlip(req, res, next) {
  try {
    const registration = await (await import('../models/Registration.js')).default.findById(req.params.id);
    if (!registration) {
      throw httpError(404, 'REGISTRATION_NOT_FOUND', 'Registration not found.');
    }
    const slipKey = registration.payment?.slipKey;
    if (!slipKey) {
      throw httpError(404, 'SLIP_NOT_FOUND', 'No payment slip has been uploaded for this registration.');
    }

    const { getSlipPath } = await import('../services/storage.js');
    const filePath = await getSlipPath(slipKey);
    if (registration.payment.slipMime) {
      res.type(registration.payment.slipMime);
    }
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}
