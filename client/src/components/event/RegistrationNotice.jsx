import { Link } from 'react-router-dom';
import useEventSettings from '../../hooks/useEventSettings.js';
import { formatColombo } from '../../utils/dates.js';

export default function RegistrationNotice() {
  const { status, settings } = useEventSettings();

  if (status === 'loading') return null;

  let text;
  let tone = 'text-slate-300';
  let showLogin = false;

  if (status === 'error') {
    text = 'We could not check the registration status right now. Please refresh the page in a moment.';
    tone = 'text-neon-pink';
  } else if (settings.registrationOpen) {
    const closesAt = settings.milestones?.registrationClosesAt;
    text = closesAt
      ? `Registration is open until ${formatColombo(closesAt)} (Sri Lanka time).`
      : 'Registration is open now.';
    tone = 'text-neon-cyan';
  } else {
    const nowMs = Date.now() + (settings.offsetMs || 0);
    const opensAt = settings.milestones?.registrationOpensAt;
    const resultsAt = Date.parse(settings.milestones?.resultsAt);
    if (opensAt && nowMs < Date.parse(opensAt)) {
      text = `Registration opens on ${formatColombo(opensAt)} (Sri Lanka time). See you then!`;
    } else if (!Number.isNaN(resultsAt) && nowMs >= resultsAt) {
      // The whole timeline is finished, so no login question here. Team Login is still in the menu.
      text = 'The event has ended. Thank you to everyone who took part!';
    } else {
      text = 'Registration is closed. Thank you for your interest!';
      showLogin = true;
    }
  }

  return (
    <p aria-live="polite" className={`mt-5 max-w-xl font-body text-lg ${tone}`}>
      {text}
      {showLogin && (
        <>
          {' '}
          Already registered?{' '}
          <Link to="/login" className="font-bold text-neon-cyan underline">
            Log in to see your team.
          </Link>
        </>
      )}
    </p>
  );
}