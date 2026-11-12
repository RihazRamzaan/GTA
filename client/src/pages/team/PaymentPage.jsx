import React from 'react';
import { Link } from 'react-router-dom';
import TeamNav from '../../components/team/TeamNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PaymentPage() {
  const { user, team, registration } = useAuth();

  const navTeam = team
    ? {
        id: team.id,
        name: team.name,
        code: team.id ? `TEAM-${String(team.id).slice(-4).toUpperCase()}` : null,
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body">
      <TeamNav
        team={navTeam}
        user={user}
        currentStatus={registration?.status}
      />

      <div className="rounded-2xl border border-emerald-500/40 bg-night-card p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6 shadow-xl">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          Registration Is Free
        </span>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            No Payment Required
          </h2>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            Participation in the Cyberpunk Game Buildathon is completely free. Bank-slip uploads and entry fees have been retired, so this payment page is no longer needed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/team"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold font-display tracking-wider text-sm shadow-lg shadow-neon-cyan/20 transition text-center"
          >
            Go to Team Dashboard →
          </Link>
          <Link
            to="/team/submission"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 text-slate-200 hover:text-white font-bold text-sm transition text-center"
          >
            Go to Game Submission
          </Link>
        </div>
      </div>
    </div>
  );
}
