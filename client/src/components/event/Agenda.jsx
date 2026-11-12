import { getAgenda } from '../../utils/eventAgenda.js';
import { formatColombo } from '../../utils/dates.js';
import useNow from '../../hooks/useNow.js';

export default function Agenda({ settings, status }) {
  const now = useNow(settings?.offsetMs ?? 0);
  if (status !== 'ready') return null;
  const entries = getAgenda(settings);
  if (!entries.length) return <p className="font-body text-lg text-slate-300">The event agenda will be announced soon.</p>;
  const next = entries.find(entry => entry.time > now);
  return (
    <ol aria-label="Event agenda" className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map(entry => {
        const active = entry.time <= now && entry.endTime > now;
        const done = (Number.isFinite(entry.endTime) ? entry.endTime : entry.time) <= now;
        const label = active ? 'IN PROGRESS' : entry.id === next?.id ? 'UP NEXT' : done ? 'COMPLETED' : 'UPCOMING';
        return (
          <li key={entry.id} className={`rounded-xl border bg-night-card p-5 ${active || entry.id === next?.id ? 'border-neon-pink' : 'border-neon-purple/40'}`}>
            <p className="font-body text-xs font-bold tracking-widest text-neon-cyan">{label}</p>
            <h3 className="mt-2 font-display text-lg text-white">{entry.title}</h3>
            <p className="mt-3 font-body text-base text-slate-200"><time dateTime={entry.startsAt}>{formatColombo(entry.startsAt)}</time>{Number.isFinite(entry.endTime) && <> — <time dateTime={entry.endsAt}>{formatColombo(entry.endsAt)}</time></>}</p>
            {entry.description && <p className="mt-2 font-body text-base text-slate-300">{entry.description}</p>}
            {entry.location && <p className="mt-2 font-body text-sm text-slate-300">{entry.location}</p>}
            {entry.url && <a href={entry.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-body text-neon-cyan underline">Open session link</a>}
          </li>
        );
      })}
    </ol>
  );
}
