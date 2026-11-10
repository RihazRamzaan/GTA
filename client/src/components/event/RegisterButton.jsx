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
        className={`group inline-flex items-center justify-center rounded bg-neon-pink font-body font-bold text-white shadow-[0_0_16px_rgba(255,43,214,0.45)] transition-all duration-200 hover:scale-[1.03] hover:brightness-110 hover:shadow-[0_0_28px_rgba(255,43,214,0.85)] active:scale-[0.98] ${className}`}
      >
        <span>Register Now</span>
        {arrow && (
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            &nbsp;→
          </span>
        )}
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
