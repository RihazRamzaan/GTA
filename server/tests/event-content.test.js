import assert from 'node:assert/strict';
import EventSettings from '../src/models/EventSettings.js';
import { DEFAULT_AGENDA, DEFAULT_MILESTONES } from '../src/config/eventDefaults.js';
import { resolveAgenda, validateAgenda, validateSponsors } from '../src/services/eventContent.js';
import { getEffectiveSettings, getEffectiveGates } from '../src/services/gates.js';
import { updateAdminSettings } from '../src/controllers/admin.controller.js';

const doc = new EventSettings({ agenda: DEFAULT_AGENDA });
let saves = 0;
doc.save = async () => { saves++; return doc; };
const originalGet = EventSettings.getOrCreateSingleton;
const originalFind = EventSettings.findById;
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
async function update(body) {
  const res = response();
  await updateAdminSettings({ body }, res, error => { throw error; });
  return res;
}

try {
  assert.equal(DEFAULT_AGENDA.length, 11);
  assert.equal(DEFAULT_MILESTONES.registrationOpensAt.toISOString(), '2026-11-13T06:30:00.000Z');
  assert.equal(DEFAULT_MILESTONES.submissionClosesAt.toISOString(), '2026-12-09T18:30:00.000Z');
  let agenda = resolveAgenda(doc);
  assert.equal(agenda.find(entry => entry.id === 'workshop').startsAt.toISOString(), '2026-11-28T01:30:00.000Z');
  assert.equal(agenda.find(entry => entry.id === 'finale').endsAt.toISOString(), '2026-12-17T11:30:00.000Z');
  const jsonAgenda = () => JSON.parse(JSON.stringify(resolveAgenda(doc)));
  assert.throws(() => validateAgenda(jsonAgenda().filter(entry => entry.id !== 'registration-opens'), doc.milestones.toObject()));
  const bad = jsonAgenda(); bad[0].endsAt = bad[0].startsAt;
  assert.throws(() => validateAgenda(bad, doc.milestones.toObject()));
  const duplicate = jsonAgenda(); duplicate[1].id = duplicate[0].id;
  assert.throws(() => validateAgenda(duplicate, doc.milestones.toObject()));
  assert.throws(() => validateSponsors([{ id: 'x', name: 'X', category: 'Gold', logoUrl: 'javascript:alert(1)', published: true }]));
  assert.throws(() => validateSponsors([{ id: 'x', name: 'X', category: 'Gold', logoUrl: 'https://example.com/logo.png', published: 'false' }]));

  EventSettings.getOrCreateSingleton = async () => doc;
  const changed = jsonAgenda();
  changed.find(entry => entry.id === 'registration-closes').startsAt = '2026-11-26T12:00:00+05:30';
  let res = await update({ agenda: changed });
  assert.equal(res.statusCode, 200);
  assert.equal(doc.milestones.registrationClosesAt.toISOString(), '2026-11-26T06:30:00.000Z');
  assert.equal(doc.agenda.find(entry => entry.id === 'registration-closes').startsAt, undefined, 'Linked date is stored only in milestones');
  assert.equal(getEffectiveGates(doc, new Date('2026-11-26T06:30:00Z')).registrationOpen, false, 'Gate follows exact agenda cutoff');
  assert.equal(res.body.data.agenda.find(entry => entry.id === 'registration-closes').startsAt.toISOString(), doc.milestones.registrationClosesAt.toISOString());

  res = await update({ milestones: { registrationClosesAt: '2026-11-25T12:00:00+05:30' } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.agenda.find(entry => entry.id === 'registration-closes').startsAt.toISOString(), '2026-11-25T06:30:00.000Z', 'Legacy settings API stays synchronized');
  const beforeSaves = saves;
  const invalid = jsonAgenda(); invalid.find(entry => entry.id === 'registration-closes').startsAt = '2026-01-01T00:00:00Z';
  res = await update({ agenda: invalid });
  assert.equal(res.statusCode, 400);
  assert.equal(saves, beforeSaves, 'Invalid chronology is never saved');

  const sponsor = { id: 'company', name: 'Confirmed Company', category: 'Title Partner', logoUrl: 'https://example.com/logo.png', websiteUrl: 'https://example.com', published: false };
  await update({ sponsors: [sponsor] });
  assert.equal((await getEffectiveSettings()).sponsors.length, 0, 'Drafts never leak publicly');
  await update({ sponsors: [{ ...sponsor, published: true }] });
  assert.equal((await getEffectiveSettings()).sponsors[0].name, sponsor.name);
  await update({ sponsors: [] });
  assert.equal((await getEffectiveSettings()).sponsors.length, 0);
  assert.equal(doc.milestones.registrationClosesAt.toISOString(), '2026-11-25T06:30:00.000Z', 'Sponsor edits never reset dates');
  await update({ event: { name: 'GAMORA', venue: 'New venue' } });
  assert.equal((await getEffectiveSettings()).agenda.find(entry => entry.id === 'finale').location, 'New venue', 'Finale follows shared venue');
  const draftAgenda = jsonAgenda(); draftAgenda.find(entry => entry.id === 'workshop').published = false;
  await update({ agenda: draftAgenda });
  assert.equal((await getEffectiveSettings()).agenda.length, 10);

  const legacy = new EventSettings({ milestones: { ...DEFAULT_MILESTONES, registrationClosesAt: new Date('2026-11-24T12:00:00+05:30') }, registrationMode: 'force_closed' });
  legacy.save = async () => legacy;
  EventSettings.findById = async () => legacy;
  EventSettings.getOrCreateSingleton = originalGet;
  const extended = await EventSettings.getOrCreateSingleton();
  assert.equal(extended.agenda.length, 11);
  assert.equal(extended.registrationMode, 'force_closed');
  assert.equal(extended.milestones.registrationClosesAt.toISOString(), '2026-11-24T06:30:00.000Z', 'Extension preserves existing database dates');
  console.log('Event content checks passed: proposal dates, linked gates, validation, publication and existing-settings preservation.');
} finally {
  EventSettings.getOrCreateSingleton = originalGet;
  EventSettings.findById = originalFind;
}
