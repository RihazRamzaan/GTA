import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminNav({ activeTab = 'overview' }) {
  const { logout } = useAuth();
  const navItems = [
    {
      to: '/admin',
      label: 'Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      exact: true,
    },
    {
      to: '/admin/agenda',
      label: 'Event Controls & Gates',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/admin/payments',
      label: 'Payment Reviews',
      badge: '3 Pending',
      badgeColor: 'bg-[#ff2bd6]/20 text-[#ff2bd6] border-[#ff2bd6]/40',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/admin/submissions',
      label: 'Submissions',
      badge: '12 Entries',
      badgeColor: 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/40',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-8 font-['Rajdhani',sans-serif]">
      {/* Top Bar with Overseer status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#00e5ff]/15 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-[#00e5ff] font-['Orbitron',sans-serif] font-bold">
              Command Nexus • Admin Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white font-['Orbitron',sans-serif]">
            EVENT <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]">OVERSEER</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[#9aa7c1]">System Time (Asia/Colombo)</div>
            <div className="text-sm font-semibold font-mono text-cyan-300">
              {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit' })} LK
            </div>
          </div>

          <Link
            to="/admin/login"
            onClick={logout}
            className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold tracking-wider transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Exit Portal</span>
          </Link>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#00e5ff]/20 to-[#8b3dff]/20 text-white border border-[#00e5ff]/50 shadow-[0_0_15px_rgba(0,229,255,0.2)] font-semibold'
                  : 'text-[#9aa7c1] hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor} font-bold`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
