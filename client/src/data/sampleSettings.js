// DEVELOPMENT ONLY: fake settings in the same shape the real API will return.
// Dates are relative to today so the countdown always has something to count to.
const DAY = 24 * 60 * 60 * 1000;

export function sampleSettings() {
  const now = Date.now();
  const at = (days) => new Date(now + days * DAY).toISOString();
  return {
    milestones: {
      registrationOpensAt: at(-5),
      registrationClosesAt: at(10),
      buildingStartsAt: at(14),
      submissionOpensAt: at(14.5),
      submissionClosesAt: at(16),
      resultsAt: at(20),
    },
    registrationOpen: true,
    submissionOpen: false,
    serverTime: new Date(now).toISOString(),
  };
}