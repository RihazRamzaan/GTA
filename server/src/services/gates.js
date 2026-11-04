import EventSettings from '../models/EventSettings.js';
import { httpError } from '../middleware/error.js';

/**
 * Evaluates whether a gate is open based on its mode and milestone dates.
 *
 * Rules (Buildathon SRS Section 5 & docs/REFERENCE.md):
 * - 'force_open' => true
 * - 'force_closed' => false
 * - 'auto' => opensAt <= now < closesAt
 * - Missing settings or dates => false
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

  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const startTime = opensAt instanceof Date ? opensAt.getTime() : new Date(opensAt).getTime();
  const endTime = closesAt instanceof Date ? closesAt.getTime() : new Date(closesAt).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return false;
  }

  return nowTime >= startTime && nowTime < endTime;
}

/**
 * The shared open/closed calculation rule.
 *
 * @param {Object} settings EventSettings instance or plain object
 * @param {Date} [now=new Date()]
 * @returns {{ registrationOpen: boolean, submissionOpen: boolean }}
 */
export function getEffectiveGates(settings, now = new Date()) {
  if (!settings) {
    return { registrationOpen: false, submissionOpen: false };
  }
  const { milestones = {}, registrationMode = 'auto', submissionMode = 'auto' } = settings;
  return {
    registrationOpen: isGateOpen(registrationMode, milestones.registrationOpensAt, milestones.registrationClosesAt, now),
    submissionOpen: isGateOpen(submissionMode, milestones.submissionOpensAt, milestones.submissionClosesAt, now),
  };
}

/**
 * Loads current settings from the database and returns effective gates.
 *
 * @param {Date} [now=new Date()]
 * @returns {Promise<{ registrationOpen: boolean, submissionOpen: boolean }>}
 */
export async function getCurrentGates(now = new Date()) {
  const settings = await EventSettings.getOrCreateSingleton();
  return getEffectiveGates(settings, now);
}

/**
 * Calculates effective gate statuses along with ISO server timestamp.
 *
 * @param {Object} settings EventSettings instance or plain object
 * @param {Date} [now=new Date()]
 * @returns {{ registrationOpen: boolean, submissionOpen: boolean, serverTime: string }}
 */
export function evaluateGateStatuses(settings, now = new Date()) {
  const { registrationOpen, submissionOpen } = getEffectiveGates(settings, now);
  const currentTime = now instanceof Date ? now : new Date(now);
  return {
    registrationOpen,
    submissionOpen,
    serverTime: currentTime.toISOString(),
  };
}

/**
 * Loads the singleton EventSettings and returns it alongside evaluated gate statuses.
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
 * Assert helper: verifies registration is open; throws a 403 HTTP error if closed.
 *
 * @param {Date} [now=new Date()]
 */
export async function assertRegistrationOpen(now = new Date()) {
  const open = await isRegistrationOpen(now);
  if (!open) {
    throw httpError(403, 'REGISTRATION_CLOSED', 'Registration is currently closed.');
  }
}

/**
 * Assert helper: verifies submission is open; throws a 403 HTTP error if closed.
 *
 * @param {Date} [now=new Date()]
 */
export async function assertSubmissionOpen(now = new Date()) {
  const open = await isSubmissionOpen(now);
  if (!open) {
    throw httpError(403, 'SUBMISSION_CLOSED', 'Game submissions are currently closed.');
  }
}

/**
 * Express middleware helper to guard routes requiring open registration (Akindu).
 */
export async function requireRegistrationOpen(_req, _res, next) {
  try {
    await assertRegistrationOpen();
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Express middleware helper to guard routes requiring open game submissions (Tharushi).
 */
export async function requireSubmissionOpen(_req, _res, next) {
  try {
    await assertSubmissionOpen();
    next();
  } catch (error) {
    next(error);
  }
}

export default {
  isGateOpen,
  getEffectiveGates,
  getCurrentGates,
  evaluateGateStatuses,
  getEffectiveSettings,
  isRegistrationOpen,
  isSubmissionOpen,
  assertRegistrationOpen,
  assertSubmissionOpen,
  requireRegistrationOpen,
  requireSubmissionOpen,
};
