import React, { useState } from 'react';
import AdminNav from '../../components/admin/AdminNav.jsx';

export default function TeamsPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'approved' | 'waiting_for_approval' | 'waiting_for_slip' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Day 01 Mock Teams Data adhering to Day 01 Reference Sheet & Architecture
  const [teams] = useState([
    {
      id: 'team_01',
      name: 'CyberVanguard',
      leaderName: 'Kavindu Perera',
      leaderEmail: 'kavindu@cybervanguard.io',
      createdAt: '2026-10-28',
      status: 'waiting_for_approval',
      feeAmount: 'LKR 4,000',
      paymentRef: 'BOC-99281729',
      members: [
        { name: 'Kavindu Perera', email: 'kavindu@cybervanguard.io', role: 'Team Leader / Lead Dev' },
        { name: 'Ravindu Silva', email: 'ravindu@cybervanguard.io', role: 'Gameplay Engineer' },
        { name: 'Dinuka Bandara', email: 'dinuka@cybervanguard.io', role: '3D Artist' },
        { name: 'Senali Wickrama', email: 'senali@cybervanguard.io', role: 'Sound Designer' },
      ],
    },
    {
      id: 'team_02',
      name: 'NexusRebels',
      leaderName: 'Ayesha Senanayake',
      leaderEmail: 'ayesha.s@gmail.com',
      createdAt: '2026-10-29',
      status: 'waiting_for_approval',
      feeAmount: 'LKR 4,000',
      paymentRef: 'COMB-44810293',
      members: [
        { name: 'Ayesha Senanayake', email: 'ayesha.s@gmail.com', role: 'Team Leader / Producer' },
        { name: 'Malik Fernando', email: 'malik.f@gmail.com', role: 'Programmer' },
        { name: 'Shenaya Peiris', email: 'shenaya.p@gmail.com', role: 'UI/UX Artist' },
      ],
    },
    {
      id: 'team_03',
      name: 'ZeroLag Collective',
      leaderName: 'Dilan Fonseka',
      leaderEmail: 'dilan@zerolag.dev',
      createdAt: '2026-10-29',
      status: 'approved',
      feeAmount: 'LKR 4,000',
      paymentRef: 'HNB-77319940',
      members: [
        { name: 'Dilan Fonseka', email: 'dilan@zerolag.dev', role: 'Team Leader / Full-Stack' },
        { name: 'Nuwan Jayawardena', email: 'nuwan@zerolag.dev', role: 'Shader Artist' },
        { name: 'Charith Alwis', email: 'charith@zerolag.dev', role: 'Level Designer' },
        { name: 'Oshada Gamage', email: 'oshada@zerolag.dev', role: 'Mechanics Dev' },
      ],
    },
    {
      id: 'team_04',
      name: 'NeonDrifters',
      leaderName: 'Sachini Wickramasinghe',
      leaderEmail: 'sachini@drifters.lk',
      createdAt: '2026-10-30',
      status: 'approved',
      feeAmount: 'LKR 4,000',
      paymentRef: 'SAMPATH-11209384',
      members: [
        { name: 'Sachini Wickramasinghe', email: 'sachini@drifters.lk', role: 'Team Leader / Creative Lead' },
        { name: 'Tharindu Rathnayake', email: 'tharindu@drifters.lk', role: 'Unity Engineer' },
        { name: 'Akila Karunaratne', email: 'akila@drifters.lk', role: 'Animator' },
      ],
    },
    {
      id: 'team_05',
      name: 'GlitchRunners',
      leaderName: 'Hasitha Jayasuriya',
      leaderEmail: 'hasitha@glitchrunners.org',
      createdAt: '2026-10-30',
      status: 'waiting_for_slip',
      feeAmount: 'LKR 4,000',
      paymentRef: 'ΓÇö',
      members: [
        { name: 'Hasitha Jayasuriya', email: 'hasitha@glitchrunners.org', role: 'Team Leader / Developer' },
        { name: 'Chathura Pathirana', email: 'chathura@glitchrunners.org', role: 'Sound & Music' },
      ],
    },
    {
      id: 'team_06',
      name: 'QuantumShifters',
      leaderName: 'Nipuna De Silva',
      leaderEmail: 'nipuna@quantumshifters.io',
      createdAt: '2026-10-31',
      status: 'rejected',
      feeAmount: 'LKR 4,000',
      paymentRef: 'PEOPLES-00294811',
      members: [
        { name: 'Nipuna De Silva', email: 'nipuna@quantumshifters.io', role: 'Team Leader' },
        { name: 'Praveen Mendis', email: 'praveen@quantumshifters.io', role: 'Technical Artist' },
        { name: 'Lahiru Perera', email: 'lahiru@quantumshifters.io', role: 'Game Designer' },
      ],
    },
  ]);

  // Status badge styling helper adhering to Day 01 Reference Sheet statuses
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return {
          label: 'APPROVED',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'waiting_for_approval':
        return {
          label: 'WAITING APPROVAL',
          classes: 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30',
          dot: 'bg-[#00e5ff]',
        };
      case 'waiting_for_slip':
        return {
          label: 'WAITING SLIP',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'rejected':
        return {
          label: 'REJECTED',
          classes: 'bg-red-500/15 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
        };
      default:
        return {
          label: status,
          classes: 'bg-white/10 text-white/70 border-white/20',
          dot: 'bg-white/50',
        };
    }
  };

  // Filtered teams list
  const filteredTeams = teams.filter((team) => {
    const matchesFilter = filter === 'all' || team.status === filter;
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase());
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
            <span>ADMIN CONTROLS ΓÇó REGISTERED TEAMS ROSTER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            PARTICIPATING <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">TEAMS</span>
          </h2>
          <p className="text-sm text-[#9aa7c1] mt-1 max-w-2xl">
            Review all registered Buildathon squads, inspect team leader contact details, track membership rosters, and monitor registration statuses.
          </p>
        </div>

        {/* Quick Stats Pill */}
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
        </div>
      </div>

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
            placeholder="Search squad, leader, or email..."
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
              {filteredTeams.map((team) => {
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
                        Registered on {team.createdAt}
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
              })}

              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#9aa7c1]">
                    No teams found matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Details Modal */}
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
                  Registered: {selectedTeam.createdAt} ΓÇó Ref: <span className="font-mono text-cyan-400">{selectedTeam.paymentRef}</span>
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
                  Max 4 members per team
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
                    <span className="text-[11px] text-[#00e5ff] font-medium bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/20">
                      {member.role}
                    </span>
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
