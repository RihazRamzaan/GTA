import { eventContent } from '../../data/eventContent.js';
import { formatColombo } from '../../utils/dates.js';
import useNow from '../../hooks/useNow.js';
import Icon from '../ui/Icon.jsx';

const stepIcons = {
  registrationOpensAt: 'document',
  registrationClosesAt: 'lock',
  buildingStartsAt: 'play',
  submissionOpensAt: 'upload',
  submissionClosesAt: 'timer',
  resultsAt: 'trophy',
};

export default function Agenda({ settings, status }) {
  const now = useNow(settings?.offsetMs ?? 0);

  if (status === 'loading') {
    return <p className="font-body text-lg text-slate-400">Loading agenda...</p>;
  }
    // The countdown card above already shows the error message
  if (status === 'error') return null;

  const steps = eventContent.agendaSteps.map((step) => {
    const iso = settings.milestones?.[step.key];
    const time = iso ? Date.parse(iso) : NaN;
    return { ...step, iso, time };
  });
  const nextIndex = steps.findIndex((s) => !Number.isNaN(s.time) && s.time > now);

  return (
    <section aria-label="Agenda">
      <ol className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        {steps.map((step, i) => {
          const hasDate = !Number.isNaN(step.time);
          const isDone = hasDate && step.time <= now;
          const isNext = i === nextIndex;

          const box = isNext
            ? 'border-neon-pink shadow-[0_0_22px_rgba(255,43,214,0.35)]'
            : isDone
              ? 'border-neon-cyan/40 opacity-70'
              : 'border-neon-purple/30';
          const ring = isNext
            ? 'border-neon-pink text-neon-pink'
            : isDone
              ? 'border-neon-cyan/50 text-neon-cyan'
              : 'border-neon-purple/60 text-[#b07bff]';
          const badge = isNext ? 'UP NEXT' : isDone ? 'COMPLETED' : hasDate ? 'UPCOMING' : 'TO BE ANNOUNCED';

          return (
            <li key={step.key} className={`rounded-lg border bg-night-card p-3 text-center sm:p-4 ${box}`}>
              <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 ${ring}`}>
                <Icon name={stepIcons[step.key]} size={26} glow={!isDone} />
              </span>
              <h3 className="mt-3 font-body text-base font-bold text-white sm:text-lg">{step.label}</h3>
              <p className="mt-1 font-body text-sm text-slate-400">
                {hasDate ? formatColombo(step.iso) : 'Date to be announced'}
              </p>
              <p className={`mt-3 font-body text-xs font-bold tracking-widest ${isNext ? 'text-neon-pink' : 'text-neon-cyan'}`}>
                {badge}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}