import React from 'react';
import { NavLink } from 'react-router-dom';

const statusBadges = {
  waiting_for_slip: {
    label: 'Not Uploaded',
    style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
  },
  waiting_for_approval: {
    label: 'Waiting for Approval',
    style: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  },
  approved: {
    label: 'Approved',
    style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  },
  rejected: {
    label: 'Action Required',
    style: 'bg-red-500/15 text-red-300 border-red-500/40',
  },
  unregistered: {
    label: 'Not Registered',
    style: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  },
};

export default function TeamNav({ team, user, currentStatus = 'waiting_for_approval', onStatusChange }) {
  const currentBadge = statusBadges[currentStatus] || statusBadges.waiting_for_approval;

  const links = [
    { to: '/team', label: 'Team Overview', exact: true },
    { to: '/team/payment', label: 'Payment & Slip' },
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Account:</span>
              <span className="text-white font-mono font-medium">{user?.email || 'signed-in user'}</span>
            </div>
            {team?.code && (
              <span className="text-xs font-bold tracking-[0.2em] text-neon-cyan uppercase">
                {team.code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              {team?.name || 'Cyber Synapse'}
            </h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold font-body border ${currentBadge.style}`}
            >
              {currentBadge.label}
            </span>
          </div>
        </div>

        {/* Clean, discreet state selector to preview and test each state */}
        {onStatusChange && (
          <div className="flex items-center gap-2 text-sm font-body">
            <span className="text-slate-400 hidden sm:inline">Preview Status:</span>
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-night-card border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-semibold font-body focus:outline-none focus:border-neon-cyan transition"
              aria-label="Preview registration status"
            >
              <option value="waiting_for_approval">⏳ Waiting for Review</option>
              <option value="approved">✓ Approved</option>
              <option value="rejected">✕ Rejected</option>
              <option value="waiting_for_slip">💳 Not Uploaded</option>
              <option value="unregistered">📝 Not Registered (Preview)</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-4">
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
