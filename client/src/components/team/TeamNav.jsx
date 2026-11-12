import React from 'react';
import { NavLink } from 'react-router-dom';

const statusBadges = {
  approved: {
    label: 'Registration Confirmed',
    style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  },
  unregistered: {
    label: 'Not Registered',
    style: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  },
};

const pendingConfirmationBadge = {
  label: 'Confirmation Pending',
  style: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
};

export default function TeamNav({ team, user, currentStatus }) {
  const currentBadge = currentStatus
    ? statusBadges[currentStatus] || pendingConfirmationBadge
    : null;

  const links = [
    { to: '/team', label: 'Team Overview', exact: true },
    { to: '/team/submission', label: 'Game Submission' },
  ];

  return (
    <div className="mb-6 font-body">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          {/* Signed-in Account Identifier */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-400">Account:</span>
              <span className="text-white font-mono font-medium">
                {user?.email || 'signed-in account'}
              </span>
            </div>
            {team?.code && (
              <span className="text-xs font-bold tracking-[0.2em] text-neon-cyan uppercase">
                {team.code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              {team?.name || 'Your Team'}
            </h1>
            {currentBadge && (
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold font-body border ${currentBadge.style}`}
              >
                {currentBadge.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-base font-bold font-body transition ${
                isActive
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
