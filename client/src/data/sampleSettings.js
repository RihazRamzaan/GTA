// DEVELOPMENT ONLY: fake settings in the same shape the real API returns.
// The dates are worked out once when the page opens and then stay fixed, so the
// open/closed answers change on their own as time passes, just like the real server does.
const DAY = 24 * 60 * 60 * 1000;

// To test the closed look, change a mode to 'force_closed'. 'force_open' keeps it open.
const registrationMode = 'auto';
const submissionMode = 'auto';

let base = null;

export function sampleSettings() {
  const now = Date.now();
  if (base === null) base = now;
  const at = (days) => new Date(base + days * DAY).toISOString();

  const milestones = {
    registrationOpensAt: at(-5),
    registrationClosesAt: at(10),
    buildingStartsAt: at(14),
    submissionOpensAt: at(14.5),
    submissionClosesAt: at(16),
    resultsAt: at(20),
  };

  const isOpen = (mode, opensAt, closesAt) => {
    if (mode === 'force_open') return true;
    if (mode === 'force_closed') return false;
    return now >= Date.parse(opensAt) && now < Date.parse(closesAt);
  };

  return {
    milestones,
    registrationMode,
    submissionMode,
    registrationOpen: isOpen(registrationMode, milestones.registrationOpensAt, milestones.registrationClosesAt),
    submissionOpen: isOpen(submissionMode, milestones.submissionOpensAt, milestones.submissionClosesAt),
    serverTime: new Date(now).toISOString(),
  };
}