import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav.jsx';

export default function AdminDashboard() {
  // Day 01 Mock Statistics (as per API contract: registration status counts, submission count)
  const [stats] = useState({
    totalTeams: 28,
    waitingForSlip: 3,
    waitingForApproval: 3,
    approved: 20,
    rejected: 2,
    totalSubmissions: 12,
  });

  // Day 01 Mock Gate Statuses
  const [gates] = useState({
    registrationMode: 'auto',
    registrationEffective: true,
    submissionMode: 'auto',
    submissionEffective: false,
    nextMilestoneName: 'Registration Closes',
    nextMilestoneTime: 'Nov 04, 2026 • 23:59 UTC',
  });

  // Day 01 Mock Pending Review Queue
  const [pendingQueue] = useState([
    {
      id: 'reg_101',
      teamName: 'CyberVanguard',
      leaderName: 'Kavindu Perera',
      leaderEmail: 'kavindu@cybervanguard.io',
      bankRef: 'BOC-99281729',
      submittedAt: '12 mins ago',
      amount: 'LKR 4,000',
      slipType: 'image/png',
    },
    {
      id: 'reg_102',
      teamName: 'NexusRebels',
      leaderName: 'Ayesha Senanayake',
      leaderEmail: 'ayesha.s@gmail.com',
      bankRef: 'COMB-44810293',
      submittedAt: '45 mins ago',
      amount: 'LKR 4,000',
      slipType: 'application/pdf',
    },
    {
      id: 'reg_103',
      teamName: 'ZeroLag Collective',
      leaderName: 'Dilan Fonseka',
      leaderEmail: 'dilan@zerolag.dev',
      bankRef: 'HNB-77319940',
      submittedAt: '2 hours ago',
      amount: 'LKR 4,000',
      slipType: 'image/jpeg',
    },
  ]);

  // Day 01 Mock Recent Submissions
  const [recentSubmissions] = useState([
    {
      id: 'sub_001',
      teamName: 'ByteGlitch',
      title: 'Neon Odyssey 2099',
      playableUrl: 'https://byteglitch.itch.io/neon-odyssey',
      repoUrl: 'https://github.com/byteglitch/neon-odyssey',
      submittedAt: 'Today, 14:20',
    },
    {
      id: 'sub_002',
      teamName: 'PixelSyndicate',
      title: 'Chrono Drift',
      playableUrl: 'https://chronodrift.vercel.app',
      repoUrl: 'https://github.com/pixelsyndicate/chrono-drift',
      submittedAt: 'Today, 11:05',
    },
  ]);

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Navigation Bar */}
      <AdminNav activeTab="overview" />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Teams Card */}
        <div className="relative rounded-2xl bg-[#0d0f24]/80 border border-[#00e5ff]/20 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-[#00e5ff]/50 transition-all">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Total Teams</span>
            <span className="p-2 rounded-lg bg-[#00e5ff]/10 text-[#00e5ff]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            {stats.totalTeams}
          </div>
          <div className="mt-2 text-xs text-[#00e5ff] flex items-center gap-1 font-semibold">
            <span>+4 registered in last 24h</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent"></div>
        </div>

        {/* Pending Review Card */}
        <div className="relative rounded-2xl bg-[#0d0f24]/80 border border-[#ff2bd6]/30 p-5 shadow-[0_4px_20px_rgba(255,43,214,0.1)] overflow-hidden group hover:border-[#ff2bd6]/60 transition-all">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Awaiting Approval</span>
            <span className="p-2 rounded-lg bg-[#ff2bd6]/15 text-[#ff2bd6]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#ff2bd6] font-['Orbitron',sans-serif] flex items-baseline gap-2">
            {stats.waitingForApproval}
            <span className="text-xs text-white/70 font-sans font-normal">slips to review</span>
          </div>
          <div className="mt-2 text-xs text-[#ff2bd6]/90 flex items-center gap-1 font-semibold">
            <Link to="/admin/payments" className="hover:underline flex items-center gap-1">
              <span>Open Review Queue</span>
              <span>&rarr;</span>
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2bd6] to-transparent"></div>
        </div>

        {/* Approved Teams Card */}
        <div className="relative rounded-2xl bg-[#0d0f24]/80 border border-emerald-500/20 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Approved Teams</span>
            <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            {stats.approved}
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <span>Verified & Eligible to compete</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
        </div>

        {/* Submissions Card */}
        <div className="relative rounded-2xl bg-[#0d0f24]/80 border border-[#8b3dff]/25 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-[#8b3dff]/50 transition-all">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
            <span>Submissions</span>
            <span className="p-2 rounded-lg bg-[#8b3dff]/15 text-[#8b3dff]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            {stats.totalSubmissions}
          </div>
          <div className="mt-2 text-xs text-[#8b3dff] flex items-center gap-1 font-semibold">
            <span>60% participation rate</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b3dff]/40 to-transparent"></div>
        </div>
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
              <span className={`w-3 h-3 rounded-full ${gates.registrationEffective ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
              <span className="text-lg font-bold text-white tracking-wide font-['Orbitron',sans-serif]">
                {gates.registrationEffective ? 'OPEN' : 'CLOSED'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-[#00e5ff] border border-cyan-500/20 uppercase font-mono">
                mode: {gates.registrationMode}
              </span>
            </div>
            <p className="text-xs text-[#9aa7c1]">New team account creation is currently permitted.</p>
          </div>

          {/* Submission Gate */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5">
            <div className="text-xs text-[#9aa7c1] mb-1 font-['Orbitron',sans-serif] uppercase">Submission Gate</div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${gates.submissionEffective ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
              <span className="text-lg font-bold text-white tracking-wide font-['Orbitron',sans-serif]">
                {gates.submissionEffective ? 'LOCKED (CLOSED)' : 'LOCKED (CLOSED)'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-mono">
                mode: {gates.submissionMode}
              </span>
            </div>
            <p className="text-xs text-[#9aa7c1]">Approved teams cannot submit games until window opens.</p>
          </div>

          {/* Next Milestone */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5">
            <div className="text-xs text-[#9aa7c1] mb-1 font-['Orbitron',sans-serif] uppercase">Next Milestone</div>
            <div className="text-base font-bold text-white tracking-wide font-['Orbitron',sans-serif] mb-1">
              {gates.nextMilestoneName}
            </div>
            <div className="text-xs font-mono text-[#00e5ff] mb-1">
              {gates.nextMilestoneTime}
            </div>
            <p className="text-xs text-[#9aa7c1]">Countdown syncs across public and admin pages.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Reviews + Recent Activity */}
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
                      <div className="text-xs text-[#9aa7c1]">{item.leaderName} • {item.leaderEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs px-2 py-1 rounded bg-[#070714] border border-[#00e5ff]/20 text-[#00e5ff]">
                        {item.bankRef}
                      </span>
                      <span className="ml-2 text-[10px] text-[#9aa7c1] uppercase">{item.slipType.split('/')[1]}</span>
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
        </div>

        {/* Recent Submissions Feed (1 col) */}
        <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                Latest Submissions
              </h2>
              <p className="text-xs text-[#9aa7c1]">Projects submitted by approved teams</p>
            </div>
            <Link
              to="/admin/submissions"
              className="text-xs text-[#00e5ff] hover:text-[#ff2bd6] font-semibold transition-colors"
            >
              All &rarr;
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {recentSubmissions.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-xl bg-[#070714] border border-white/5 hover:border-[#8b3dff]/30 transition-all">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm font-['Orbitron',sans-serif]">{sub.title}</h3>
                  <span className="text-[10px] text-[#9aa7c1] font-mono">{sub.submittedAt}</span>
                </div>
                <div className="text-xs text-[#00e5ff] mb-2">{sub.teamName}</div>
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={sub.playableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff2bd6] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Play Demo</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9aa7c1] hover:text-white flex items-center gap-1"
                  >
                    <span>GitHub</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Quick link button */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <Link
              to="/admin/submissions"
              className="w-full block text-center py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-['Orbitron',sans-serif] font-semibold text-white tracking-wider border border-white/10 transition-colors"
            >
              Browse All Submissions ({stats.totalSubmissions})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
