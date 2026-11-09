import React from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav.jsx';

/**
 * PaymentsPage (Retired for Free Registration)
 * Handles legacy navigation to /admin/payments with a clear explanation
 * that event registration is free and payment approval workflows are retired.
 */
export default function PaymentsPage() {
  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      <AdminNav activeTab="teams" />

      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-[#0d0f24] border border-[#00e5ff]/30 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] font-['Orbitron',sans-serif]">
          FREE REGISTRATION ACTIVE • EVENT REVISION
        </span>
        <h2 className="text-2xl font-black text-white font-['Orbitron',sans-serif] mt-2 mb-3">
          Payment Reviews Retired
        </h2>

        <p className="text-sm text-[#9aa7c1] leading-relaxed mb-6">
          Registration for the Cyberpunk Game Buildathon is completely free of charge (LKR 0). All participating teams are now automatically confirmed upon registration without requiring bank transfer deposit slips, manual slip verification, or administrative payment approvals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/admin/teams"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b3dff] text-black font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
          >
            View Confirmed Squads Roster &rarr;
          </Link>
          <Link
            to="/admin"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-['Orbitron',sans-serif] text-xs font-semibold tracking-wider transition-all"
          >
            Command Center Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
