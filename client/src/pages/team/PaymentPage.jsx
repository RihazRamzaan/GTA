import React from 'react';
import { Link } from 'react-router-dom';
import Dock from '../../components/layout/Dock.jsx';
import TeamNav from '../../components/team/TeamNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useEventSettings from '../../hooks/useEventSettings.js';

export default function PaymentPage() {
  const { user, team, registration } = useAuth();
  const { settings } = useEventSettings();

  const navTeam = team
    ? {
        id: team.id,
        name: team.name,
        code: team.id ? `TEAM-${String(team.id).slice(-4).toUpperCase()}` : null,
      }
    : null;

  return (
    <div className="relative min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36 font-body text-[#cac7e0] bg-[#070714] space-y-8">
      {/* Subtle atmospheric ambient glow matching Home art direction */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[360px] w-[580px] max-w-full rounded-full bg-gradient-to-b from-[#8b3dff]/15 via-[#00e5ff]/5 to-transparent blur-3xl" />

      <TeamNav
        team={navTeam}
        user={user}
        currentStatus={registration?.status}
      />

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6 shadow-xl backdrop-blur-md">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
          Registration Is Free
        </span>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#f6f4fc] font-display">
            No Payment Required
          </h2>
          <p className="mt-3 text-[#a7a6b8] text-base leading-relaxed">
            Participation in the Cyberpunk Game Buildathon is completely free. Bank-slip uploads and entry fees have been retired, so this payment page is no longer needed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/team"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(255,43,214,0.45)] text-center"
          >
            Go to Team Dashboard →
          </Link>
          <Link
            to="/team/submission"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-[#070714] font-bold text-xs uppercase tracking-wider transition text-center"
          >
            Go to Game Submission
          </Link>
        </div>
      </div>

      {/* Clean inline footer matching Register/Login/Team */}
      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-body text-xs text-[#a7a6b8]">
        <a href="https://www.sesa.lk" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#f6f4fc]">SESA × IEEE SB UOK ↗</a>
        <span>© {new Date().getFullYear()} {settings?.event?.name || 'Cyberpunk Game Buildathon'}</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition hover:text-[#f6f4fc]">Back to top ↑</button>
      </footer>

      {/* Floating Home Dock */}
      <Dock />
    </div>
  );
}
