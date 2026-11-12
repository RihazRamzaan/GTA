import { getAgenda } from '../../utils/eventAgenda.js';
import { formatColombo, splitDuration } from '../../utils/dates.js';
import useNow from '../../hooks/useNow.js';

export default function Countdown({ settings, status }) {
  const now = useNow(settings?.offsetMs ?? 0);
  if (status === 'loading') return <p className="font-body text-lg text-slate-300">Loading event agenda…</p>;
  if (status === 'error') return <p role="alert" className="font-body text-lg text-neon-pink">We could not load the latest event dates. We will retry automatically.</p>;
  const agenda = getAgenda(settings);
  const active = agenda.filter(entry => entry.time <= now && entry.endTime > now).sort((a, b) => a.endTime - b.endTime)[0];
  const next = agenda.find(entry => entry.time > now);
  const target = active || next;
  if (!target) return <div className="font-body text-xl text-white">{agenda.length ? 'Event timeline completed. Thank you for joining us!' : 'The event agenda will be announced soon.'}</div>;
  const duration = splitDuration((active ? target.endTime : target.time) - now);
  return (
    <div className="mb-8 rounded-xl border border-neon-cyan/30 bg-night-card p-5 sm:p-8">
      <p className="font-body text-sm font-bold tracking-widest text-neon-cyan">{active ? 'IN PROGRESS' : 'UP NEXT'}</p>
      <h3 className="mt-2 font-display text-xl text-white sm:text-2xl">{target.title} {active ? 'ends in' : 'starts in'}</h3>
      <p className="mt-2 font-body text-base text-slate-300">{formatColombo(active ? target.endsAt : target.startsAt)} · Sri Lanka time</p>
      <div className="mt-5 grid grid-cols-4 gap-2 sm:max-w-lg sm:gap-4" aria-label="Countdown">
        {Object.entries(duration).map(([label, value]) => <div key={label} className="rounded-lg border border-neon-purple/40 p-2 text-center sm:p-4"><p className="font-display text-xl text-white sm:text-3xl">{String(value).padStart(2, '0')}</p><p className="font-body text-sm capitalize text-slate-300">{label}</p></div>)}
      </div>
      <p className="mt-4 font-body text-base text-slate-300">Registration is {settings.registrationOpen ? 'open' : 'closed'}. Game submissions are {settings.submissionOpen ? 'open' : 'closed'}.</p>
    </div>
  );
}
