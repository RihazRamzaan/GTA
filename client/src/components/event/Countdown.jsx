import { eventContent } from '../../data/eventContent.js';
import { formatColombo, splitDuration } from '../../utils/dates.js';
import useNow from '../../hooks/useNow.js';

const pad = (n) => String(n).padStart(2, '0');

// A short sentence about where the event is right now.
// It follows the server's open/closed answer, so it always agrees with the Register button.
function phaseNote(key, settings) {
  const registrationOpen = Boolean(settings.registrationOpen);
  const submissionOpen = Boolean(settings.submissionOpen);

  switch (key) {
    case 'registrationOpensAt':
      return registrationOpen
        ? 'Registration is already open. Register your team now!'
        : 'Get your team ready. Registration has not opened yet.';
    case 'registrationClosesAt':
      return registrationOpen
        ? 'Registration is open. Register your team before time runs out!'
        : 'Registration is currently closed.';
    case 'buildingStartsAt':
      return registrationOpen
        ? 'Registration is still open. Building starts soon.'
        : 'Registration is closed. Get ready to build your game!';
    case 'submissionOpensAt':
      return submissionOpen ? 'Submissions are already open.' : 'The building has started. Good luck!';
    case 'submissionClosesAt':
      return submissionOpen
        ? 'Submissions are open. Submit your game before the deadline.'
        : 'Submissions are currently closed.';
    case 'resultsAt':
      return 'Submissions are closed. Results are coming soon.';
    default:
      return '';
  }
}

export default function Countdown({ settings, status }) {
  const now = useNow(settings?.offsetMs ?? 0);

  let body;

  if (status === 'loading') {
    body = <p className="font-body text-lg text-slate-400">Loading event timeline...</p>;
  } else if (status === 'error') {
    body = (
      <p className="font-body text-lg text-neon-pink">
          We could not load the latest event dates. We will try again automatically.
      </p>
    );
  } else {
    // The nearest milestone that is still in the future
    const next = eventContent.agendaSteps
      .map((step) => ({ ...step, time: Date.parse(settings.milestones?.[step.key]) }))
      .filter((s) => !Number.isNaN(s.time) && s.time > now)
      .sort((a, b) => a.time - b.time)[0];

    if (!next) {
      body = (
        <>
          <p className="font-display text-2xl font-bold text-neon-cyan">Event timeline completed</p>
          <p className="mt-1 font-body text-lg text-slate-300">Thank you for joining us!</p>
        </>
      );
    } else {
      const t = splitDuration(next.time - now);
      const boxes = [
        ['Days', t.days],
        ['Hours', t.hours],
        ['Minutes', t.minutes],
        ['Seconds', t.seconds],
      ];
      body = (
        <>
          <p className="font-body text-sm font-bold tracking-[0.3em] text-neon-cyan">NEXT MILESTONE</p>
          <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{next.countdownTitle}</h3>
          <p className="mt-1 font-body text-lg text-slate-200">{phaseNote(next.key, settings)}</p>
          <p className="font-body text-base text-slate-400">
            {next.label}: {formatColombo(new Date(next.time).toISOString())} (Sri Lanka time)
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2 sm:max-w-xl sm:gap-3">
            {boxes.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-neon-purple/40 bg-night p-2 text-center sm:p-3">
                <p className="font-display text-2xl font-black text-neon-pink sm:text-4xl">{pad(value)}</p>
                <p className="font-body text-[10px] tracking-wider text-slate-400 sm:text-xs sm:tracking-widest">
                  {label.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </>
      );
    }
  }

  return (
    <section aria-label="Countdown" className="mb-10 rounded-xl border border-neon-purple/40 bg-night-card p-4 sm:p-6">
      {body}
    </section>
  );
}