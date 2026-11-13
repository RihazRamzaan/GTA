import React from 'react';
import { Link } from 'react-router-dom';

export default function StatusBanner({ registration, submission }) {
  // No registration found for this account
  if (!registration || registration.status === 'unregistered') {
    return (
      <div className="rounded-2xl border border-neon-pink/40 bg-gradient-to-r from-neon-pink/15 via-[#141025]/85 to-[#0c0b19]/95 p-6 text-[#cac7e0] font-body shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">🚀</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-[#f6f4fc] font-display tracking-wide">
                  No Team Registration Found
                </h3>
                <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-neon-pink/20 text-neon-pink border border-neon-pink/40 tracking-wider uppercase">
                  Not Registered
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#a7a6b8] max-w-2xl leading-relaxed">
                Your account is signed in, but no registered team is linked yet. Register your team (2–4 members, free entry) to compete and unlock game submissions.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] text-sm font-bold uppercase tracking-wider shadow-lg shadow-neon-pink/25 transition transform hover:-translate-y-0.5 text-center"
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
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-[#141025]/85 to-[#0c0b19]/95 p-6 text-[#cac7e0] font-body shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5 text-emerald-400 font-bold">✓</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-[#f6f4fc] font-display tracking-wide">
                  Registration Confirmed
                </h3>
                <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide">
                  Officially Registered
                </span>
                <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 tracking-wide">
                  Free Entry
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#a7a6b8] max-w-2xl leading-relaxed">
                Your team is <strong className="text-emerald-300 font-semibold">officially registered</strong> for the Game Buildathon. Registration is completely free — no payment is required. Keep your roster up to date before registration closes, then submit your game when ready.
              </p>
            </div>
          </div>
          <Link
            to="/team/submission"
            className="shrink-0 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#070714] text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition text-center whitespace-nowrap"
          >
            {submission ? 'View Game Submission →' : 'Go to Game Submission →'}
          </Link>
        </div>
      </div>
    );
  }

  // Fallback for any pre-migration record from earlier database state
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#141025]/85 to-[#0c0b19]/95 p-6 text-[#cac7e0] font-body shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="text-2xl mt-0.5">⏳</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-[#f6f4fc] font-display tracking-wide">
                Registration Confirmation Pending
              </h3>
              <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wide">
                Free Event
              </span>
            </div>
            <p className="mt-1.5 text-sm text-[#a7a6b8] max-w-2xl leading-relaxed">
              Registration for the Game Buildathon is free — no payment or slip upload is needed. Your team record is queued for confirmation by the organizers; your roster details remain visible below.
            </p>
          </div>
        </div>
        <Link
          to="/team/submission"
          className="shrink-0 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition text-center whitespace-nowrap"
        >
          Game Submission →
        </Link>
      </div>
    </div>
  );
}
