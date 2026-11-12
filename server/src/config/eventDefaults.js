// Proposal pages 12–14. All authored times are Asia/Colombo (UTC+05:30).
// The proposal's Dec 10 midnight is the START of Dec 10. Submission opening
// is an editable operational default at topic release, not a printed milestone.
export const DEFAULT_MILESTONES = {
  registrationOpensAt: new Date('2026-11-13T12:00:00+05:30'),
  registrationClosesAt: new Date('2026-11-27T12:00:00+05:30'),
  buildingStartsAt: new Date('2026-11-29T12:00:00+05:30'),
  submissionOpensAt: new Date('2026-11-29T12:00:00+05:30'),
  submissionClosesAt: new Date('2026-12-10T00:00:00+05:30'),
  resultsAt: new Date('2026-12-17T09:00:00+05:30'),
};

export const DEFAULT_AGENDA = [
  { id: 'awareness-1', title: 'Awareness Session Part I', description: 'Pre-recorded video', startsAt: '2026-11-12T19:00:00+05:30', location: 'Online' },
  { id: 'registration-opens', title: 'Registration Opens', milestoneKey: 'registrationOpensAt' },
  { id: 'awareness-2', title: 'Awareness Session Part II', startsAt: '2026-11-14T19:00:00+05:30', location: 'Online' },
  { id: 'registration-closes', title: 'Registration Closes', milestoneKey: 'registrationClosesAt' },
  { id: 'workshop', title: 'Game Buildathon Workshop', description: 'Registered teams only', startsAt: '2026-11-28T07:00:00+05:30', location: 'Online' },
  { id: 'round-1', title: 'Topic Release and Round 1 Begins', milestoneKey: 'buildingStartsAt' },
  { id: 'round-1-deadline', title: 'Round 1 Submission Deadline', milestoneKey: 'submissionClosesAt' },
  { id: 'finalists', title: 'Top 6 Finalists Announced and Round 2 Begins', startsAt: '2026-12-13T18:00:00+05:30' },
  { id: 'tech-talk-1', title: 'Industry Tech Talk Episode 1', startsAt: '2026-12-14T19:00:00+05:30' },
  { id: 'tech-talk-2', title: 'Industry Tech Talk Episode 2', startsAt: '2026-12-15T12:00:00+05:30' },
  { id: 'finale', title: 'Buildathon Finale and Gaming Expo', milestoneKey: 'resultsAt', endsAt: '2026-12-17T17:00:00+05:30', location: 'Dharmaloka Hall, University of Kelaniya' },
].map((entry, order) => ({ ...entry, order, published: true, description: entry.description || '', location: entry.location || '', url: '' }));

export const REQUIRED_AGENDA = Object.fromEntries(DEFAULT_AGENDA.filter(entry => entry.milestoneKey).map(entry => [entry.id, entry.milestoneKey]));
export const DEFAULT_EVENT = { name: 'GAMORA', venue: 'Dharmaloka Hall, University of Kelaniya' };
