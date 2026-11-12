import { DEFAULT_AGENDA, REQUIRED_AGENDA } from '../config/eventDefaults.js';
import { httpError } from '../middleware/error.js';

export function resolveAgenda(settings, publicOnly = false) {
  const entries = settings.agenda ?? DEFAULT_AGENDA;
  return entries.map(entry => {
    const value = typeof entry.toObject === 'function' ? entry.toObject() : { ...entry };
    return { ...value, startsAt: value.milestoneKey ? settings.milestones?.[value.milestoneKey] : value.startsAt,
      location: value.id === 'finale' ? settings.event?.venue || value.location : value.location };
  }).filter(entry => !publicOnly || entry.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function text(value, name, max, required = false) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) {
    throw httpError(400, 'INVALID_CONTENT', `${name} must be ${required ? 'non-empty text' : 'text'} up to ${max} characters.`);
  }
  return value.trim();
}

export function webUrl(value, name, required = false) {
  const url = text(value, name, 2048, required);
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
  } catch { throw httpError(400, 'INVALID_CONTENT', `${name} must be an HTTP or HTTPS URL without embedded credentials.`); }
  return url;
}

function date(value, name) {
  if (typeof value !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw httpError(400, 'INVALID_CONTENT', `${name} requires a valid date with a timezone.`);
  }
  return new Date(value);
}

export function validateAgenda(input, milestones) {
  if (!Array.isArray(input) || input.length > 100) throw httpError(400, 'INVALID_CONTENT', 'Agenda must contain at most 100 entries.');
  const ids = new Set();
  const nextMilestones = { ...milestones };
  const agenda = input.map((entry, order) => {
    if (!entry || typeof entry !== 'object') throw httpError(400, 'INVALID_CONTENT', 'Invalid agenda entry.');
    const id = text(entry.id, 'Agenda ID', 80, true);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) throw httpError(400, 'INVALID_CONTENT', 'Agenda IDs must be unique and contain only letters, numbers, hyphens or underscores.');
    ids.add(id);
    const milestoneKey = REQUIRED_AGENDA[id];
    if (entry.milestoneKey && entry.milestoneKey !== milestoneKey) throw httpError(400, 'INVALID_CONTENT', 'Linked milestone IDs cannot be changed or duplicated.');
    if (typeof entry.published !== 'boolean') throw httpError(400, 'INVALID_CONTENT', 'Choose whether each agenda entry is published.');
    const startsAt = date(entry.startsAt, 'Start time');
    const endsAt = entry.endsAt ? date(entry.endsAt, 'End time') : null;
    if (endsAt && endsAt <= startsAt) throw httpError(400, 'INVALID_CONTENT', 'An event must end after it starts.');
    if (milestoneKey) nextMilestones[milestoneKey] = startsAt;
    return { id, title: text(entry.title, 'Title', 160, true), description: text(entry.description, 'Description', 1000),
      location: text(entry.location, 'Location', 200), url: webUrl(entry.url, 'Event link'), published: entry.published,
      order, milestoneKey, startsAt: milestoneKey ? undefined : startsAt, endsAt };
  });
  for (const id of Object.keys(REQUIRED_AGENDA)) if (!ids.has(id)) throw httpError(400, 'INVALID_CONTENT', 'Registration, Round 1 and finale entries cannot be deleted.');
  return { agenda, milestones: nextMilestones };
}

export function validateSponsors(input) {
  if (!Array.isArray(input) || input.length > 50) throw httpError(400, 'INVALID_CONTENT', 'At most 50 sponsors are supported.');
  const ids = new Set();
  return input.map((sponsor, order) => {
    if (!sponsor || typeof sponsor !== 'object') throw httpError(400, 'INVALID_CONTENT', 'Invalid sponsor.');
    const id = text(sponsor.id, 'Sponsor ID', 80, true);
    if (ids.has(id)) throw httpError(400, 'INVALID_CONTENT', 'Sponsor IDs must be unique.');
    ids.add(id);
    if (typeof sponsor.published !== 'boolean') throw httpError(400, 'INVALID_CONTENT', 'Choose whether each sponsor is published.');
    return { id, name: text(sponsor.name, 'Sponsor name', 160, true), category: text(sponsor.category, 'Partnership category', 120, true),
      logoUrl: webUrl(sponsor.logoUrl, 'Logo URL', true), websiteUrl: webUrl(sponsor.websiteUrl, 'Website URL'), published: sponsor.published, order };
  });
}

export function validateEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw httpError(400, 'INVALID_CONTENT', 'Event details must be an object.');
  return { name: text(input.name, 'Event name', 100, true), venue: text(input.venue, 'Venue', 200, true) };
}
