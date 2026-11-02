import EventSettings from '../models/EventSettings.js';
import { validateMilestonesChronology } from '../utils/dates.js';

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
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GATE_MODE',
          message: `registrationMode must be one of: ${ALLOWED_MODES.join(', ')}`,
        },
      });
    }

    // Validate submissionMode if provided
    if (submissionMode !== undefined && !ALLOWED_MODES.includes(submissionMode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GATE_MODE',
          message: `submissionMode must be one of: ${ALLOWED_MODES.join(', ')}`,
        },
      });
    }

    const settings = await EventSettings.getOrCreateSingleton();

    // If milestones are being updated, merge with existing milestones to validate chronology
    if (milestones !== undefined) {
      if (typeof milestones !== 'object' || milestones === null) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MILESTONES',
            message: 'Milestones must be an object with date values.',
          },
        });
      }

      const mergedMilestones = {
        ...settings.milestones.toObject(),
        ...milestones,
      };

      const validation = validateMilestonesChronology(mergedMilestones);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CHRONOLOGY',
            message: validation.errors.join(' '),
          },
        });
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
