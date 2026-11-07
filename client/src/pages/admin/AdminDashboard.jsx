import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav.jsx';
import { getAdminSummary, getRegistrations } from '../../api/admin.js';

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

// Milestone keys in chronological order
const MILESTONE_ORDER = [
  { key: 'registrationOpensAt', label: 'Registration Opens' },
  { key: 'registrationClosesAt', label: 'Registration Closes' },
  { key: 'buildingStartsAt', label: 'Hackathon Starts' },
  { key: 'submissionOpensAt', label: 'Submissions Open' },
  { key: 'submissionClosesAt', label: 'Submissions Close' },
  { key: 'resultsAt', label: 'Results Announcement' },
];

const computeNextMilestone = (milestones) => {
  if (!milestones) return { name: 'Agenda Configured', time: 'Active' };
  const now = Date.now();
  for (const item of MILESTONE_ORDER) {
    const val = milestones[item.key];
    if (val) {
      const ms = new Date(val).getTime();
      if (!Number.isNaN(ms) && ms > now) {
        return {
          name: item.label,
          time: formatColomboDate(val),
        };
      }
    }
  }
  const lastVal = milestones.resultsAt;
  return {
    name: 'Event Concluded',
    time: lastVal ? formatColomboDate(lastVal) : 'All milestones passed',
  };
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

  const [pendingQueue, setPendingQueue] = useState([]);
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

      const [summaryRes, pendingRes] = await Promise.all([
        getAdminSummary(),
        getRegistrations({ status: 'waiting_for_approval' }),
      ]);

      if (summaryRes.data?.success) {
        const sum = summaryRes.data.data || {};
        setStats({
          totalTeams: sum.totalTeams ?? 0,
          waitingForSlip: sum.waitingForSlip ?? (sum.statusCounts?.waiting_for_slip || 0),
          waitingForApproval: sum.waitingForApproval ?? (sum.statusCounts?.waiting_for_approval || 0),
          approved: sum.approved ?? (sum.statusCounts?.approved || 0),
          rejected: sum.rejected ?? (sum.statusCounts?.rejected || 0),
          totalSubmissions: sum.totalSubmissions ?? 0,
        });

        const nextMile = computeNextMilestone(sum.milestones);
        setGates({
          registrationMode: sum.gates?.registrationMode || 'auto',
          registrationEffective: Boolean(sum.gates?.registrationOpen),
          submissionMode: sum.gates?.submissionMode || 'auto',
          submissionEffective: Boolean(sum.gates?.submissionOpen),
          nextMilestoneName: nextMile.name,
          nextMilestoneTime: nextMile.time,
        });
      }

      if (pendingRes.data?.success) {
        const rawList = pendingRes.data.data || [];
        const formatted = rawList.map((reg) => {
          const t = reg.team || {};
          const p = reg.payment || {};
          return {
            id: reg.id || reg._id,
            teamName: reg.teamName || t.name || 'Unnamed Squad',
            leaderName: reg.leaderName || t.leaderName || 'Unknown Leader',
            leaderEmail: reg.leaderEmail || t.leaderEmail || '',
            bankRef: p.reference && p.reference !== '—' ? p.reference : 'Slip Attached',
            submittedAt: formatRelativeOrDate(p.submittedAt || reg.updatedAt || reg.createdAt),
            amount: reg.feeAmount ? `LKR ${Number(reg.feeAmount).toLocaleString()}` : 'LKR 4,000',
            slipType: p.slipMime ? (p.slipMime.split('/')[1] || p.slipMime).toUpperCase() : (p.hasSlip ? 'FILE' : 'NONE'),
            hasSlip: Boolean(p.hasSlip),
          };
        });
        setPendingQueue(formatted);
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
      <AdminNav activeTab="overview" />

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
        {/* Total Teams Card */}
        <Link
          to="/admin/teams"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-[#00e5ff]/20 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-[#00e5ff]/50 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Total Teams</span>
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
              stats.totalTeams
            )}
          </div>
          <div className="mt-2 text-xs text-[#00e5ff] flex items-center gap-1 font-semibold">
            <span>View All Registered Squads &rarr;</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent"></div>
        </Link>

        {/* Pending Review Card */}
        <Link
          to="/admin/payments"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-[#ff2bd6]/30 p-5 shadow-[0_4px_20px_rgba(255,43,214,0.1)] overflow-hidden group hover:border-[#ff2bd6]/60 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Awaiting Approval</span>
            <span className="p-2 rounded-lg bg-[#ff2bd6]/15 text-[#ff2bd6]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#ff2bd6] font-['Orbitron',sans-serif] flex items-baseline gap-2">
            {isLoading ? (
              <span className="inline-block w-12 h-8 bg-white/10 rounded animate-pulse"></span>
            ) : (
              stats.waitingForApproval
            )}
            <span className="text-xs text-white/70 font-sans font-normal">slips to review</span>
          </div>
          <div className="mt-2 text-xs text-[#ff2bd6]/90 flex items-center gap-1 font-semibold">
            <span>Open Review Queue &rarr;</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2bd6] to-transparent"></div>
        </Link>

        {/* Approved Teams Card */}
        <Link
          to="/admin/teams"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-emerald-500/20 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-emerald-500/40 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Approved Teams</span>
            <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <span>Verified & Eligible to compete</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
        </Link>

        {/* Submissions Card */}
        <Link
          to="/admin/submissions"
          className="relative block rounded-2xl bg-[#0d0f24]/80 border border-[#8b3dff]/25 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-[#8b3dff]/50 hover:bg-[#0d0f24] transition-all"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Submissions</span>
            <span className="p-2 rounded-lg bg-[#8b3dff]/15 text-[#8b3dff]">
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
          <div className="mt-2 text-xs text-[#8b3dff] flex items-center gap-1 font-semibold">
            <span>
              {stats.approved > 0
                ? `${Math.round((stats.totalSubmissions / stats.approved) * 100)}% approved team turnover`
                : 'Awaiting team submissions'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b3dff]/40 to-transparent"></div>
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

      {/* Main Grid: Pending Reviews + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Review Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white font-['Orbitron',sans-serif] flex items-center gap-2">
                <span>Pending Payment Reviews</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-[#ff2bd6]/20 text-[#ff2bd6] border border-[#ff2bd6]/30">
                  {pendingQueue.length}
                </span>
              </h2>
              <p className="text-xs text-[#9aa7c1]">Bank transfers awaiting verification before team activation</p>
            </div>
            <Link
              to="/admin/payments"
              className="text-xs text-[#00e5ff] hover:text-[#ff2bd6] font-semibold tracking-wide transition-colors"
            >
              View All Slips &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#00e5ff] border-t-transparent animate-spin"></div>
              <span className="text-xs text-[#9aa7c1] font-['Orbitron',sans-serif]">
                Loading pending approval queue...
              </span>
            </div>
          ) : pendingQueue.length === 0 ? (
            <div className="py-12 text-center border border-white/5 rounded-xl bg-[#070714]/60">
              <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white font-['Orbitron',sans-serif]">All Slips Reviewed</h3>
              <p className="text-xs text-[#9aa7c1] max-w-sm mx-auto mt-1">
                There are no pending payment slips awaiting admin review right now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-[#9aa7c1] uppercase font-['Orbitron',sans-serif] border-b border-white/5">
                    <th className="py-3 px-3">Team & Leader</th>
                    <th className="py-3 px-3">Reference / Slip</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Uploaded</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{item.teamName}</div>
                        <div className="text-xs text-[#9aa7c1]">
                          {item.leaderName} {item.leaderEmail ? `• ${item.leaderEmail}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs px-2 py-1 rounded bg-[#070714] border border-[#00e5ff]/20 text-[#00e5ff]">
                          {item.bankRef}
                        </span>
                        <span className="ml-2 text-[10px] text-[#9aa7c1] uppercase font-mono">
                          {item.slipType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {item.amount}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#9aa7c1]">
                        {item.submittedAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to="/admin/payments"
                          className="inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00e5ff]/20 to-[#8b3dff]/20 hover:from-[#00e5ff]/30 hover:to-[#8b3dff]/30 text-[#00e5ff] border border-[#00e5ff]/40 text-xs font-bold font-['Orbitron',sans-serif] tracking-wider transition-all"
                        >
                          REVIEW
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
                  Registration Breakdown
                </h2>
                <p className="text-xs text-[#9aa7c1]">Team pipeline status summary</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-semibold text-white">Approved & Verified</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-400">{stats.approved}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff2bd6]"></span>
                  <span className="text-xs font-semibold text-white">Pending Slip Review</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#ff2bd6]">{stats.waitingForApproval}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-xs font-semibold text-white">Awaiting Bank Slip</span>
                </div>
                <span className="font-mono font-bold text-sm text-amber-400">{stats.waitingForSlip}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-semibold text-white">Rejected Slips</span>
                </div>
                <span className="font-mono font-bold text-sm text-rose-400">{stats.rejected}</span>
              </div>
            </div>
          </div>

          {/* Quick link button */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <Link
              to="/admin/teams"
              className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-xs font-['Orbitron',sans-serif] font-bold text-[#00e5ff] tracking-wider border border-[#00e5ff]/30 transition-colors"
            >
              Open Squad Management Roster &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
