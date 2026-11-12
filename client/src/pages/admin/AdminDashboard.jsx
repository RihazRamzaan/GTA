import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav.jsx';
import { getAdminSummary, getRegistrations, getAdminSubmissions } from '../../api/admin.js';
import { getAgenda } from '../../utils/eventAgenda.js';

// Helper to format Colombo Sri Lankan time for display
const formatColomboDate = (dateVal) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '—';
  return (
    d.toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' LK'
  );
};

// Helper to calculate human-friendly relative time
const formatRelativeOrDate = (dateVal) => {
  if (!dateVal) return 'Recently';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return 'Recently';
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const computeNextMilestone = (settings) => {
  const now = Date.now();
  const agenda = getAgenda(settings);
  const active = agenda.find(entry => entry.time <= now && entry.endTime > now);
  const next = active || agenda.find(entry => entry.time > now);
  return next ? { name: `${next.title}${active ? ' (in progress)' : ''}`, time: formatColomboDate(active ? next.endsAt : next.startsAt) }
    : { name: agenda.length ? 'Event Concluded' : 'Agenda pending', time: 'No upcoming entries' };
};

// Helper for registration status badges reflecting real saved statuses
const getStatusBadge = (status) => {
  switch (status) {
    case 'approved':
    case 'confirmed':
      return {
        label: 'CONFIRMED',
        classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      };
    case 'waiting_for_slip':
      return {
        label: 'WAITING FOR SLIP',
        classes: 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30',
        dot: 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]',
      };
    case 'waiting_for_approval':
      return {
        label: 'WAITING FOR APPROVAL',
        classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
      };
    case 'rejected':
      return {
        label: 'REJECTED',
        classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
      };
    default:
      return {
        label: status ? String(status).toUpperCase() : 'PENDING',
        classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400',
      };
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    waitingForSlip: 0,
    waitingForApproval: 0,
    approved: 0,
    rejected: 0,
    totalSubmissions: 0,
  });

  const [gates, setGates] = useState({
    registrationMode: 'auto',
    registrationEffective: false,
    submissionMode: 'auto',
    submissionEffective: false,
    nextMilestoneName: 'Calculating...',
    nextMilestoneTime: '—',
  });

  const [recentTeams, setRecentTeams] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const [summaryRes, teamsRes, subsRes] = await Promise.all([
        getAdminSummary(),
        getRegistrations(),
        getAdminSubmissions().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (summaryRes.data?.success) {
        const sum = summaryRes.data.data || {};
        setStats({
          totalTeams: sum.totalTeams ?? 0,
          waitingForSlip: sum.waitingForSlip ?? (sum.statusCounts?.waiting_for_slip || 0),
          waitingForApproval: sum.waitingForApproval ?? (sum.statusCounts?.waiting_for_approval || 0),
          approved: typeof sum.approved === 'number' ? sum.approved : (sum.statusCounts?.approved ?? 0),
          rejected: sum.rejected ?? (sum.statusCounts?.rejected || 0),
          totalSubmissions: sum.totalSubmissions ?? 0,
        });

        const nextMile = computeNextMilestone(sum);
        setGates({
          registrationMode: sum.gates?.registrationMode || 'auto',
          registrationEffective: Boolean(sum.gates?.registrationOpen),
          submissionMode: sum.gates?.submissionMode || 'auto',
          submissionEffective: Boolean(sum.gates?.submissionOpen),
          nextMilestoneName: nextMile.name,
          nextMilestoneTime: nextMile.time,
        });
      }

      if (teamsRes.data?.success) {
        const rawList = teamsRes.data.data || [];
        const formatted = rawList.slice(0, 5).map((reg) => {
          const t = reg.team || {};
          const members =
            Array.isArray(reg.members) && reg.members.length > 0
              ? reg.members
              : Array.isArray(t.members) && t.members.length > 0
              ? t.members
              : [];
          return {
            id: reg.id || reg._id,
            teamName: reg.teamName || t.name || 'Unnamed Squad',
            leaderName: reg.leaderName || t.leaderName || 'Unknown Leader',
            leaderEmail: reg.leaderEmail || t.leaderEmail || '',
            membersCount: members.length > 0 ? members.length : 1,
            registeredAt: formatRelativeOrDate(reg.createdAt || reg.updatedAt),
            status: reg.status || 'pending',
          };
        });
        setRecentTeams(formatted);
      }

      if (subsRes.data?.success) {
        const rawSubs = subsRes.data.data || [];
        setRecentSubmissions(rawSubs.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard summary:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to connect to admin dashboard service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Navigation Bar */}
      <AdminNav
        activeTab="overview"
        badgeCounts={{
          totalTeams: stats.totalTeams,
          approved: stats.approved,
          totalSubmissions: stats.totalSubmissions,
          registrationOpen: gates.registrationEffective,
          submissionOpen: gates.submissionEffective,
        }}
      />

      {/* Header Bar with Live Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white font-['Orbitron',sans-serif] tracking-wide flex items-center gap-2">
            <span>OPERATIONS COMMAND CENTER</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]"></span>
          </h1>
          <p className="text-xs text-[#9aa7c1] mt-0.5">
            Realtime event pulse, registration gates & verification metrics
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(false)}
          disabled={isLoading || isRefreshing}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0d0f24] hover:bg-[#141836] border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all font-['Orbitron',sans-serif] disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{isRefreshing ? 'Syncing...' : 'Live Refresh'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-red-200">System Connection Error</p>
              <p className="text-xs text-red-300/80">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold font-['Orbitron',sans-serif] tracking-wider border border-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Confirmed Teams Card */}
        <Link
          to="/admin/teams"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-[#00e5ff]/20 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-[#00e5ff]/50 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Confirmed Squads</span>
            <span className="p-2 rounded-lg bg-[#00e5ff]/10 text-[#00e5ff]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            {isLoading ? (
              <span className="inline-block w-12 h-8 bg-white/10 rounded animate-pulse"></span>
            ) : (
              stats.approved
            )}
          </div>
          <div className="mt-2 text-xs text-[#00e5ff] flex items-center gap-1 font-semibold">
            <span>View All Registered Squads ({stats.totalTeams} Total) &rarr;</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent"></div>
        </Link>

        {/* Registration Gate Card */}
        <Link
          to="/admin/agenda"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-emerald-500/25 p-5 shadow-[0_4px_20px_rgba(52,211,153,0.1)] overflow-hidden group hover:border-emerald-500/50 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Registration Gate</span>
            <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </span>
          </div>
          <div className={`text-3xl font-extrabold font-['Orbitron',sans-serif] ${gates.registrationEffective ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isLoading ? (
              <span className="inline-block w-12 h-8 bg-white/10 rounded animate-pulse"></span>
            ) : gates.registrationEffective ? (
              'OPEN'
            ) : (
              'CLOSED'
            )}
          </div>
          <div className="mt-2 text-xs text-white/70 flex items-center gap-1 font-mono">
            <span>Mode: {gates.registrationMode} • Free Entry</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
        </Link>

        {/* Submission Gate Card */}
        <Link
          to="/admin/agenda"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-[#8b3dff]/25 p-5 shadow-[0_4px_20px_rgba(139,61,255,0.1)] overflow-hidden group hover:border-[#8b3dff]/50 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Submission Gate</span>
            <span className="p-2 rounded-lg bg-[#8b3dff]/15 text-[#8b3dff]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
          <div className={`text-3xl font-extrabold font-['Orbitron',sans-serif] ${gates.submissionEffective ? 'text-emerald-400' : 'text-purple-300'}`}>
            {isLoading ? (
              <span className="inline-block w-12 h-8 bg-white/10 rounded animate-pulse"></span>
            ) : gates.submissionEffective ? (
              'OPEN'
            ) : (
              'LOCKED'
            )}
          </div>
          <div className="mt-2 text-xs text-white/70 flex items-center gap-1 font-mono">
            <span>Mode: {gates.submissionMode} • Repositories</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b3dff]/40 to-transparent"></div>
        </Link>

        {/* Submissions Received Card */}
        <Link
          to="/admin/submissions"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-[#00e5ff]/20 p-5 shadow-[0_4px_20px_rgba(0,229,255,0.1)] overflow-hidden group hover:border-[#00e5ff]/50 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Game Submissions</span>
            <span className="p-2 rounded-lg bg-[#00e5ff]/15 text-[#00e5ff]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            {isLoading ? (
              <span className="inline-block w-12 h-8 bg-white/10 rounded animate-pulse"></span>
            ) : (
              stats.totalSubmissions
            )}
          </div>
          <div className="mt-2 text-xs text-[#00e5ff] flex items-center gap-1 font-semibold">
            <span>
              {stats.totalTeams > 0
                ? `${Math.round((stats.totalSubmissions / stats.totalTeams) * 100)}% squad turnout`
                : 'Awaiting team submissions'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent"></div>
        </Link>
      </div>

      {/* Gates & Quick Event Status */}
      <div className="rounded-2xl bg-[#0d0f24]/90 border border-[#00e5ff]/20 p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/5">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#00e5ff] font-['Orbitron',sans-serif] font-bold">
              Realtime Event Gates
            </div>
            <div className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
              System Access & Overrides
            </div>
          </div>
          <Link
            to="/admin/agenda"
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/40 text-[#00e5ff] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all font-['Orbitron',sans-serif]"
          >
            <span>Configure Agenda & Gate Modes</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Registration Gate */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5">
            <div className="text-xs text-[#9aa7c1] mb-1 font-['Orbitron',sans-serif] uppercase">Registration Gate</div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  gates.registrationEffective
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                }`}
              ></span>
              <span className="text-lg font-bold text-white tracking-wide font-['Orbitron',sans-serif]">
                {gates.registrationEffective ? 'OPEN' : 'CLOSED'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-[#00e5ff] border border-cyan-500/20 uppercase font-mono">
                mode: {gates.registrationMode}
              </span>
            </div>
            <p className="text-xs text-[#9aa7c1]">
              {gates.registrationEffective
                ? 'New team registration & account creation permitted.'
                : 'Registration window is locked.'}
            </p>
          </div>

          {/* Submission Gate */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5">
            <div className="text-xs text-[#9aa7c1] mb-1 font-['Orbitron',sans-serif] uppercase">Submission Gate</div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  gates.submissionEffective
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                }`}
              ></span>
              <span className="text-lg font-bold text-white tracking-wide font-['Orbitron',sans-serif]">
                {gates.submissionEffective ? 'OPEN' : 'LOCKED (CLOSED)'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-mono">
                mode: {gates.submissionMode}
              </span>
            </div>
            <p className="text-xs text-[#9aa7c1]">
              {gates.submissionEffective
                ? 'Approved teams can submit game project repositories.'
                : 'Project submission portal is closed until hackathon window.'}
            </p>
          </div>

          {/* Next Milestone */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5">
            <div className="text-xs text-[#9aa7c1] mb-1 font-['Orbitron',sans-serif] uppercase">Next Milestone</div>
            <div className="text-base font-bold text-white tracking-wide font-['Orbitron',sans-serif] mb-1 truncate">
              {gates.nextMilestoneName}
            </div>
            <div className="text-xs font-mono text-[#00e5ff] mb-1">
              {gates.nextMilestoneTime}
            </div>
            <p className="text-xs text-[#9aa7c1]">Target milestone based on event schedule.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Confirmed Squads + Free Event Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Confirmed Squads Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white font-['Orbitron',sans-serif] flex items-center gap-2">
                <span>Recent Squads</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30">
                  {recentTeams.length} Recent
                </span>
              </h2>
              <p className="text-xs text-[#9aa7c1]">Registered squads for the Buildathon and their saved status</p>
            </div>
            <Link
              to="/admin/teams"
              className="text-xs text-[#00e5ff] hover:text-white font-semibold tracking-wide transition-colors"
            >
              View Full Roster &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#00e5ff] border-t-transparent animate-spin"></div>
              <span className="text-xs text-[#9aa7c1] font-['Orbitron',sans-serif]">
                Loading registered squads...
              </span>
            </div>
          ) : recentTeams.length === 0 ? (
            <div className="py-12 text-center border border-white/5 rounded-xl bg-[#070714]/60">
              <div className="inline-flex p-3 rounded-xl bg-white/5 text-[#9aa7c1] mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white font-['Orbitron',sans-serif]">No Squads Registered Yet</h3>
              <p className="text-xs text-[#9aa7c1] max-w-sm mx-auto mt-1">
                Teams registering while the registration gate is open will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-[#9aa7c1] uppercase font-['Orbitron',sans-serif] border-b border-white/5">
                    <th className="py-3 px-3">Squad & Leader</th>
                    <th className="py-3 px-3">Roster</th>
                    <th className="py-3 px-3">Registered</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTeams.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{item.teamName}</div>
                        <div className="text-xs text-[#9aa7c1]">
                          {item.leaderName} {item.leaderEmail ? `• ${item.leaderEmail}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs px-2 py-1 rounded bg-[#070714] border border-[#8b3dff]/30 text-[#8b3dff]">
                          {item.membersCount} members
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#9aa7c1]">
                        {item.registeredAt}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {(() => {
                          const badge = getStatusBadge(item.status);
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono tracking-wider ${badge.classes}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to="/admin/teams"
                          className="inline-block px-3 py-1.5 rounded-lg bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 text-xs font-bold font-['Orbitron',sans-serif] tracking-wider transition-all"
                        >
                          VIEW
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations & Status Overview (1 col) */}
        <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                  Event Governance
                </h2>
                <p className="text-xs text-[#9aa7c1]">Free registration rules & gate controls</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-white">Entry Fee</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">FREE (LKR 0)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]"></span>
                  <span className="font-semibold text-white">Confirmation</span>
                </div>
                <span className="font-mono font-bold text-[#00e5ff]">AUTO-CONFIRMED</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b3dff]"></span>
                  <span className="font-semibold text-white">Roster Edit Cutoff</span>
                </div>
                <span className="font-mono font-bold text-[#8b3dff]">At Reg Closes</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-semibold text-white">Project Repo</span>
                </div>
                <span className="font-mono font-bold text-amber-400">GitHub Validated</span>
              </div>
            </div>
          </div>

          {/* Quick link buttons */}
          <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
            <Link
              to="/admin/agenda"
              className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-xs font-['Orbitron',sans-serif] font-bold text-[#00e5ff] tracking-wider border border-[#00e5ff]/30 transition-colors"
            >
              Configure Agenda & Gates &rarr;
            </Link>
            <Link
              to="/admin/teams"
              className="w-full block text-center py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-['Orbitron',sans-serif] font-semibold text-white/80 hover:text-white transition-colors"
            >
              View Full Squads Roster &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Day 06: Live Game Submissions Activity */}
      <div className="mt-8 rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/5 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8b3dff] shadow-[0_0_8px_#8b3dff]" />
              <h2 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                Game Submissions Transmissions
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs bg-[#8b3dff]/20 text-[#8b3dff] border border-[#8b3dff]/30 font-mono">
                {stats.totalSubmissions} Received
              </span>
            </div>
            <p className="text-xs text-[#9aa7c1] mt-0.5">
              Live game project builds and code repositories uploaded by verified squads
            </p>
          </div>

          <Link
            to="/admin/submissions"
            className="self-start sm:self-auto text-xs text-[#00e5ff] hover:text-[#8b3dff] font-semibold tracking-wide transition-colors flex items-center gap-1 font-['Orbitron',sans-serif]"
          >
            <span>Open Gallery Dossier</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#9aa7c1] font-mono animate-pulse">
            Querying transmission registry...
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="py-10 text-center border border-white/5 rounded-xl bg-[#070714]/60">
            <div className="inline-flex p-3 rounded-xl bg-[#8b3dff]/10 text-[#8b3dff] mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            {!gates.submissionEffective ? (
              <>
                <h3 className="text-sm font-bold text-white font-['Orbitron',sans-serif]">Submissions Window Locked</h3>
                <p className="text-xs text-[#9aa7c1] max-w-md mx-auto mt-1">
                  The submission window is currently closed. Verified squads will be able to upload playable links and GitHub repos once the submission milestone opens.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-white font-['Orbitron',sans-serif]">Awaiting Squad Submissions</h3>
                <p className="text-xs text-[#9aa7c1] max-w-md mx-auto mt-1">
                  The submissions window is live! As approved squads finalize their projects and submit playable builds, their entries will stream here in real time.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.id || sub._id}
                className="rounded-xl bg-[#070714] border border-white/5 p-4 flex flex-col justify-between hover:border-[#8b3dff]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-[#00e5ff] font-bold font-['Orbitron',sans-serif] truncate">
                      {sub.teamName}
                    </span>
                    <span className="text-[#9aa7c1] font-mono text-[10px]">
                      {sub.submittedAt ? formatRelativeOrDate(sub.submittedAt) : 'Pending'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-['Orbitron',sans-serif] group-hover:text-[#8b3dff] transition-colors line-clamp-1 mb-1">
                    {sub.title}
                  </h3>

                  <p className="text-xs text-[#9aa7c1] line-clamp-2 mb-3">
                    {sub.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sub.playableUrl && (
                      <span className="px-2 py-0.5 rounded bg-[#ff2bd6]/15 text-[#ff2bd6] text-[10px] font-bold font-mono">
                        DEMO
                      </span>
                    )}
                    {sub.repoUrl && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono">
                        GIT
                      </span>
                    )}
                  </div>
                  <Link
                    to="/admin/submissions"
                    className="text-[11px] text-[#00e5ff] hover:underline font-bold"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
