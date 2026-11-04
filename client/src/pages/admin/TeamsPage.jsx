import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav.jsx';
import { getRegistrations } from '../../api/admin.js';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'approved' | 'waiting_for_approval' | 'waiting_for_slip' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getRegistrations();
      if (res.data?.success) {
        const rawList = res.data.data || [];
        const formatted = rawList.map((reg) => {
          const t = reg.team || {};
          const rawMembers =
            Array.isArray(reg.members) && reg.members.length > 0
              ? reg.members
              : Array.isArray(t.members)
              ? t.members
              : [];

          return {
            id: reg.id || reg._id,
            registrationId: reg.id || reg._id,
            name: reg.teamName || t.name || 'Unnamed Squad',
            leaderName: reg.leaderName || t.leaderName || 'Unknown Leader',
            leaderEmail: reg.leaderEmail || t.leaderEmail || '',
            createdAt: reg.createdAt
              ? new Date(reg.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent',
            status: reg.status || 'waiting_for_slip',
            feeAmount: reg.feeAmount ? `LKR ${Number(reg.feeAmount).toLocaleString()}` : 'LKR 4,000',
            paymentRef: reg.payment?.reference || '—',
            paymentDate: reg.payment?.date,
            hasSlip: reg.payment?.hasSlip,
            members:
              rawMembers.length > 0
                ? rawMembers
                : [
                    {
                      name: reg.leaderName || t.leaderName || 'Leader',
                      email: reg.leaderEmail || t.leaderEmail || '',
                      role: 'Team Leader',
                    },
                  ],
          };
        });
        setTeams(formatted);
      }
    } catch (err) {
      console.error('Failed to load registered teams:', err);
      const message =
        err.response?.status === 401 || err.response?.status === 403
          ? 'Admin authorization required. Please sign in with an admin account.'
          : err.response?.data?.error?.message || 'Could not fetch teams from server. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchTeams();
    return () => {
      isMounted = false;
    };
  }, []);

  // Status badge styling helper adhering to agreed reference statuses
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return {
          label: 'APPROVED',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
        };
      case 'waiting_for_approval':
        return {
          label: 'AWAITING APPROVAL',
          classes: 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30',
          dot: 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]',
        };
      case 'waiting_for_slip':
        return {
          label: 'WAITING SLIP',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
        };
      case 'rejected':
        return {
          label: 'REJECTED',
          classes: 'bg-red-500/15 text-red-400 border-red-500/30',
          dot: 'bg-red-400 shadow-[0_0_8px_#f87171]',
        };
      default:
        return {
          label: status,
          classes: 'bg-white/10 text-white/70 border-white/20',
          dot: 'bg-white/50',
        };
    }
  };

  // Filtered teams list based on active tab and search query
  const filteredTeams = teams.filter((team) => {
    const matchesFilter = filter === 'all' || team.status === filter;
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.paymentRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Nav */}
      <AdminNav activeTab="teams" />

      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-semibold tracking-widest uppercase mb-2">
            <span>ADMIN CONTROLS • REGISTERED TEAMS ROSTER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            PARTICIPATING <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">TEAMS</span>
          </h2>
          <p className="text-sm text-[#9aa7c1] mt-1 max-w-2xl">
            Browse all registered Buildathon squads, inspect team leader contact details, track membership rosters, and monitor live registration statuses.
          </p>
        </div>

        {/* Quick Stats & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2.5 rounded-xl bg-[#0d0f24] border border-white/10 text-xs">
            <span className="text-[#9aa7c1]">Total Squads: </span>
            <span className="font-bold text-white font-mono text-sm ml-1">{teams.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-[#0d0f24] border border-emerald-500/20 text-xs">
            <span className="text-emerald-400 font-semibold">Approved: </span>
            <span className="font-bold text-white font-mono text-sm ml-1">
              {teams.filter((t) => t.status === 'approved').length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchTeams}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#0d0f24] border border-white/10 hover:border-[#00e5ff]/40 text-[#9aa7c1] hover:text-white transition-all disabled:opacity-50"
            title="Refresh Teams List"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00e5ff]' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchTeams}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold uppercase transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'ALL TEAMS' },
            { id: 'approved', label: 'APPROVED' },
            { id: 'waiting_for_approval', label: 'AWAITING APPROVAL' },
            { id: 'waiting_for_slip', label: 'WAITING SLIP' },
            { id: 'rejected', label: 'REJECTED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-[#00e5ff] to-[#8b3dff] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] font-["Orbitron",sans-serif]'
                  : 'bg-[#0d0f24] border border-white/10 text-[#9aa7c1] hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search squad, leader, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 pl-9 bg-[#0d0f24] border border-white/10 rounded-xl text-white text-xs placeholder-[#9aa7c1]/60 focus:outline-none focus:border-[#00e5ff] transition-colors"
          />
          <svg
            className="w-4 h-4 text-[#9aa7c1] absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Teams Grid / Table Container */}
      <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070714] text-[#9aa7c1] uppercase font-['Orbitron',sans-serif] tracking-wider text-[11px]">
                <th className="py-4 px-4 font-bold">Team Squad</th>
                <th className="py-4 px-4 font-bold">Team Leader</th>
                <th className="py-4 px-4 font-bold text-center">Roster</th>
                <th className="py-4 px-4 font-bold">Payment Ref</th>
                <th className="py-4 px-4 font-bold text-center">Reg Status</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && teams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#9aa7c1]">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#00e5ff] animate-ping"></span>
                      <span className="text-sm">Loading registered squads from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#9aa7c1]">
                    {teams.length === 0 ? (
                      <div>
                        <svg className="w-10 h-10 mx-auto text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-white">No teams registered yet.</p>
                        <p className="text-xs text-[#9aa7c1] mt-1">Teams will appear here once participants sign up through the registration portal.</p>
                      </div>
                    ) : (
                      <p className="text-sm">No squads match your search query or selected filter tab.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => {
                  const badge = getStatusBadge(team.status);
                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Team Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm font-['Orbitron',sans-serif] group-hover:text-[#00e5ff] transition-colors">
                          {team.name}
                        </div>
                        <div className="text-[10px] text-[#9aa7c1] mt-0.5">
                          Registered: {team.createdAt}
                        </div>
                      </td>

                      {/* Team Leader */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{team.leaderName}</div>
                        <div className="text-[#9aa7c1] text-[11px] font-mono">{team.leaderEmail}</div>
                      </td>

                      {/* Roster count */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#8b3dff]/15 border border-[#8b3dff]/30 text-[#8b3dff] font-bold font-mono text-[11px]">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {team.members.length} members
                        </span>
                      </td>

                      {/* Payment Ref */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-[#00e5ff]">{team.paymentRef}</div>
                        <div className="text-[10px] text-[#9aa7c1]">{team.feeAmount}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider font-mono ${badge.classes}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTeam(team)}
                          className="px-3 py-1.5 rounded-lg border border-[#00e5ff]/40 bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff]/20 text-xs font-semibold tracking-wider transition-all inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Squad</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal (Dossier) */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0d0f24] border border-[#00e5ff]/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] text-[#00e5ff] uppercase tracking-widest font-bold font-['Orbitron',sans-serif]">
                  Squad Dossier
                </span>
                <h3 className="text-2xl font-bold text-white font-['Orbitron',sans-serif] mt-0.5">
                  {selectedTeam.name}
                </h3>
                <div className="text-xs text-[#9aa7c1] mt-1">
                  Registered: {selectedTeam.createdAt} • Ref:{' '}
                  <span className="font-mono text-cyan-400">{selectedTeam.paymentRef}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="p-1 rounded-lg text-[#9aa7c1] hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Team Leader Card */}
            <div className="my-5 p-4 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#9aa7c1] font-bold">
                  Designated Team Leader
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedTeam.leaderName}
                </div>
                <div className="text-xs font-mono text-[#00e5ff]">{selectedTeam.leaderEmail}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-[#9aa7c1] font-bold">
                  Registration Status
                </div>
                <span
                  className={`mt-1 inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono ${
                    getStatusBadge(selectedTeam.status).classes
                  }`}
                >
                  {getStatusBadge(selectedTeam.status).label}
                </span>
              </div>
            </div>

            {/* Member Roster List */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-white font-['Orbitron',sans-serif] font-bold flex items-center justify-between">
                <span>Roster Members ({selectedTeam.members.length})</span>
                <span className="text-[10px] text-[#9aa7c1] font-normal font-sans">
                  Squad Roster
                </span>
              </div>

              <div className="space-y-2">
                {selectedTeam.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#070714] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#8b3dff]/20 text-[#8b3dff] flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{member.name}</div>
                        <div className="text-[11px] text-[#9aa7c1] font-mono">{member.email}</div>
                      </div>
                    </div>
                    {member.role && (
                      <span className="text-[11px] text-[#00e5ff] font-medium bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/20">
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
