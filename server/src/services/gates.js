import EventSettings from '../models/EventSettings.js';

function isOpen(mode, opensAt, closesAt, now) {
  if (mode === 'force_open') return true;
  if (mode === 'force_closed') return false;
  if (!opensAt || !closesAt) return false;
  return new Date(opensAt) <= now && now < new Date(closesAt);
}

// The one shared open/closed rule. Missing settings or dates count as closed.
export function getEffectiveGates(settings, now = new Date()) {
  if (!settings) return { registrationOpen: false, submissionOpen: false };
  const { milestones = {}, registrationMode, submissionMode } = settings;
  return {
    registrationOpen: isOpen(registrationMode, milestones.registrationOpensAt, milestones.registrationClosesAt, now),
    submissionOpen: isOpen(submissionMode, milestones.submissionOpensAt, milestones.submissionClosesAt, now),
  };
}

export async function getCurrentGates(now = new Date()) {
  return getEffectiveGates(await EventSettings.findById('current').lean(), now);
}
