import { Link } from 'react-router-dom';
import useEventSettings from '../../hooks/useEventSettings.js';

// Shows a working link ONLY when the server says registration is open.
// If the settings API fails, it displays 'Status unavailable' to avoid misleading visitors.
export default function RegisterButton({ className = '', arrow = false, onClick }) {
  const { status, settings } = useEventSettings();

  if (status === 'ready' && settings?.registrationOpen) {
    return (
      <Link
        to="/register"
        onClick={onClick}
        className={`glow-pulse rounded bg-neon-pink font-body font-bold text-white shadow-[0_0_18px_rgba(255,43,214,0.55)] transition hover:brightness-110 ${className}`}
      >
        Register Now{arrow ? ' →' : ''}
      </Link>
    );
  }

  let label = 'Checking registration...';
  if (status === 'error') {
    label = 'Status unavailable';
  } else if (status === 'ready') {
    const nowMs = Date.now() + (settings?.offsetMs || 0);
    const opensAt = Date.parse(settings?.milestones?.registrationOpensAt);
    label = !Number.isNaN(opensAt) && nowMs < opensAt ? 'Registration Opens Soon' : 'Registration Closed';
  }

  return (
    <span
      aria-disabled="true"
      className={`cursor-not-allowed rounded border border-slate-600 bg-slate-800 font-body font-bold text-slate-400 ${className}`}
    >
      {label}
    </span>
  );
}
