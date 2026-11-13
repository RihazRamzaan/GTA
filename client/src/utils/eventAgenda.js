import { eventContent } from '../data/eventContent.js';
import { formatColombo } from './dates.js';

export function getAgenda(settings) {
  const entries = settings?.agenda ?? eventContent.agendaSteps.map(step => ({
    id: step.key, title: step.label, milestoneKey: step.key, startsAt: settings?.milestones?.[step.key], published: true,
  }));
  return entries.filter(entry => entry.published !== false && Number.isFinite(Date.parse(entry.startsAt)))
    .map(entry => ({ ...entry, time: Date.parse(entry.startsAt), endTime: Date.parse(entry.endsAt) }))
    .sort((a, b) => a.time - b.time || (a.order ?? 0) - (b.order ?? 0));
}

export function hasSponsors(settings) { return Boolean(settings?.sponsors?.length); }
export function eventEnd(settings) {
  const agenda = getAgenda(settings);
  return agenda.length ? Math.max(...agenda.map(entry => Number.isFinite(entry.endTime) ? entry.endTime : entry.time)) : NaN;
}

export function resolveEventText(text, settings) {
  const agenda = getAgenda(settings);
  const at = key => settings?.milestones?.[key];
  const date = value => value && Number.isFinite(Date.parse(value)) ? `${formatColombo(value)} (Sri Lanka time)` : 'date to be announced';
  const values = {
    registrationClose: date(at('registrationClosesAt')), round1Start: date(at('buildingStartsAt')), round1Deadline: date(at('submissionClosesAt')),
    finalists: date(agenda.find(entry => entry.id === 'finalists')?.startsAt),
    finale: date(agenda.find(entry => entry.id === 'finale')?.startsAt ?? at('resultsAt')),
    finaleEnd: date(agenda.find(entry => entry.id === 'finale')?.endsAt), venue: settings?.event?.venue || 'venue to be announced',
    teamMin: settings?.teamSize?.min ?? 'published minimum', teamMax: settings?.teamSize?.max ?? 'published maximum',
  };
  return text.replace(/\{\{(\w+)\}\}/g, (token, key) => values[key] ?? token);
}

// All admin inputs represent Sri Lanka time regardless of the computer's timezone.
export function toColomboInput(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
export function fromColomboInput(value) { return value ? new Date(`${value}:00+05:30`).toISOString() : ''; }
