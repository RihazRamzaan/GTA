import EventSettings from '../models/EventSettings.js';

/**
 * Evaluates whether a gate is open based on its mode and milestone dates.
 *
 * Rules (Buildathon SRS Section 5):
 * - 'force_open' => true
 * - 'force_closed' => false
 * - 'auto' => opensAt <= now < closesAt
 *
 * @param {'auto' | 'force_open' | 'force_closed'} mode
 * @param {Date | string} opensAt
 * @param {Date | string} closesAt
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
export function isGateOpen(mode, opensAt, closesAt, now = new Date()) {
  if (mode === 'force_open') {
    return true;
  }
  if (mode === 'force_closed') {
    return false;
  }

  // mode === 'auto'
  if (!opensAt || !closesAt) {
    return false;
  }

  const nowTime = now.getTime();
  const startTime = new Date(opensAt).getTime();
  const endTime = new Date(closesAt).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return false;
  }

  return nowTime >= startTime && nowTime < endTime;
}

/**
 * Calculates effective gate statuses and server timestamp for a given EventSettings document.
 *
 * @param {Object} settings EventSettings instance or plain object
 * @param {Date} [now=new Date()]
 * @returns {{ registrationOpen: boolean, submissionOpen: boolean, serverTime: string }}
 */
export function evaluateGateStatuses(settings, now = new Date()) {
  const milestones = settings?.milestones || {};
  const registrationOpen = isGateOpen(
    settings?.registrationMode || 'auto',
    milestones.registrationOpensAt,
    milestones.registrationClosesAt,
    now
  );
  const submissionOpen = isGateOpen(
    settings?.submissionMode || 'auto',
    milestones.submissionOpensAt,
    milestones.submissionClosesAt,
    now
  );

  return {
    registrationOpen,
    submissionOpen,
    serverTime: now.toISOString(),
  };
}

/**
 * Loads the current singleton EventSettings and returns it along with evaluated gate statuses.
 *
 * @param {Date} [now=new Date()]
 * @returns {Promise<Object>}
 */
export async function getEffectiveSettings(now = new Date()) {
  const settings = await EventSettings.getOrCreateSingleton();
  const statuses = evaluateGateStatuses(settings, now);

  return {
    milestones: settings.milestones,
    registrationMode: settings.registrationMode,
    submissionMode: settings.submissionMode,
    registrationOpen: statuses.registrationOpen,
    submissionOpen: statuses.submissionOpen,
    serverTime: statuses.serverTime,
    updatedAt: settings.updatedAt,
  };
}

/**
 * Quick check if registration is currently open.
 * Can be used by registration controllers / middleware (Akindu).
 *
 * @param {Date} [now=new Date()]
 * @returns {Promise<boolean>}
 */
export async function isRegistrationOpen(now = new Date()) {
  const settings = await EventSettings.getOrCreateSingleton();
  return isGateOpen(
    settings.registrationMode,
    settings.milestones?.registrationOpensAt,
    settings.milestones?.registrationClosesAt,
    now
  );
}

/**
 * Quick check if submission is currently open.
 * Can be used by submission controllers / middleware (Tharushi).
 *
 * @param {Date} [now=new Date()]
 * @returns {Promise<boolean>}
 */
export async function isSubmissionOpen(now = new Date()) {
  const settings = await EventSettings.getOrCreateSingleton();
  return isGateOpen(
    settings.submissionMode,
    settings.milestones?.submissionOpensAt,
    settings.milestones?.submissionClosesAt,
    now
  );
}

/**
 * Assert helper: verifies registration is open; throws a 403-coded error if closed.
 *
 * @param {Date} [now=new Date()]
 */
export async function assertRegistrationOpen(now = new Date()) {
  const open = await isRegistrationOpen(now);
  if (!open) {
    const error = new Error('Registration is currently closed.');
    error.statusCode = 403;
    error.code = 'REGISTRATION_CLOSED';
    throw error;
  }
}

/**
 * Assert helper: verifies submission is open; throws a 403-coded error if closed.
 *
 * @param {Date} [now=new Date()]
 */
export async function assertSubmissionOpen(now = new Date()) {
  const open = await isSubmissionOpen(now);
  if (!open) {
    const error = new Error('Game submissions are currently closed.');
    error.statusCode = 403;
    error.code = 'SUBMISSION_CLOSED';
    throw error;
  }
}

/**
 * Express middleware helper to guard routes requiring open registration (Akindu).
 * Returns 403 FORBIDDEN with error code REGISTRATION_CLOSED if closed.
 */
export async function requireRegistrationOpen(_req, res, next) {
  try {
    const open = await isRegistrationOpen();
    if (!open) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REGISTRATION_CLOSED',
          message: 'Registration is currently closed.',
        },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Express middleware helper to guard routes requiring open game submissions (Tharushi).
 * Returns 403 FORBIDDEN with error code SUBMISSION_CLOSED if closed.
 */
export async function requireSubmissionOpen(_req, res, next) {
  try {
    const open = await isSubmissionOpen();
    if (!open) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUBMISSION_CLOSED',
          message: 'Game submissions are currently closed.',
        },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

export default {
  isGateOpen,
  evaluateGateStatuses,
  getEffectiveSettings,
  isRegistrationOpen,
  isSubmissionOpen,
  assertRegistrationOpen,
  assertSubmissionOpen,
  requireRegistrationOpen,
  requireSubmissionOpen,
};
