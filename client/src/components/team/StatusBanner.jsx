import React from 'react';
import { Link } from 'react-router-dom';

export default function StatusBanner({ registration, submission }) {
  // No registration found for this account
  if (!registration || registration.status === 'unregistered') {
    return (
      <div className="rounded-xl border border-neon-pink/50 bg-gradient-to-r from-neon-pink/15 via-neon-purple/15 to-transparent p-5 text-slate-200 font-body shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">🚀</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white font-display tracking-wide">
                  No Team Registration Found
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-neon-pink/20 text-neon-pink border border-neon-pink/40">
                  Not Registered
                </span>
              </div>
              <p className="mt-1 text-base text-slate-300 max-w-2xl">
                Your account is signed in, but no registered team is linked yet. Register your team (2–4 members, free entry) to compete and unlock game submissions.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-neon-cyan hover:bg-neon-cyan/90 text-black text-base font-bold shadow-lg shadow-neon-cyan/20 transition transform hover:-translate-y-0.5 text-center"
          >
            <span>Register Team Now</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  // Confirmed free registration
  if (registration.status === 'approved') {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-slate-200 font-body">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5 text-emerald-300">✓</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white font-display tracking-wide">
                  Registration Confirmed
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Officially Registered
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                  Free Entry
                </span>
              </div>
              <p className="mt-1 text-base text-slate-300 max-w-2xl">
                Your team is <strong className="text-emerald-300">officially registered</strong> for the Cyberpunk Game Buildathon. Registration is completely free — no payment is required. Keep your roster up to date before registration closes, then submit your game when ready.
              </p>
            </div>
          </div>
          <Link
            to="/team/submission"
            className="shrink-0 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-base font-bold transition text-center whitespace-nowrap"
          >
            {submission ? 'View Game Submission →' : 'Go to Game Submission →'}
          </Link>
        </div>
      </div>
    );
  }

  // Fallback for any pre-migration record from earlier database state
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-slate-200 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="text-2xl mt-0.5">⏳</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white font-display tracking-wide">
                Registration Confirmation Pending
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Free Event
              </span>
            </div>
            <p className="mt-1 text-base text-slate-300 max-w-2xl">
              Registration for the Cyberpunk Game Buildathon is free — no payment or slip upload is needed. Your team record is queued for confirmation by the organizers; your roster details remain visible below.
            </p>
          </div>
        </div>
        <Link
          to="/team/submission"
          className="shrink-0 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-base font-bold transition text-center whitespace-nowrap"
        >
          Game Submission →
        </Link>
      </div>
    </div>
  );
}
