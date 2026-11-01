import React from 'react';

export default function MemberList({ team, onAddMemberClick }) {
  const leader = team?.leader || {
    name: 'Thanish Ahamed',
    email: 'thanish@example.com',
    role: 'Leader & Developer',
    university: 'Faculty of Information Technology',
  };

  const members = team?.members || [];
  const totalCount = 1 + members.length;
  const maxMembers = team?.maxMembers || 4;
  const minMembers = team?.minMembers || 2;
  const slotsRemaining = Math.max(0, maxMembers - totalCount);

  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-night-card p-5 sm:p-6 font-body">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Team Members
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalCount} of {maxMembers} members registered (Minimum {minMembers} required)
          </p>
        </div>

        {slotsRemaining > 0 && (
          <button
            type="button"
            onClick={onAddMemberClick}
            className="px-4 py-1.5 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/40 text-sm font-bold font-body transition flex items-center gap-1.5 w-fit"
          >
            <span>+ Add Member</span>
            <span className="text-xs text-slate-400">({slotsRemaining} slot left)</span>
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="mt-4 divide-y divide-white/5">
        {/* Team Leader Row */}
        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 text-neon-cyan font-bold flex items-center justify-center font-display text-sm shrink-0">
              {leader.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{leader.name}</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                  Team Leader
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {leader.role} • {leader.university}
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-300 font-mono sm:text-right pl-13 sm:pl-0">
            {leader.email}
          </div>
        </div>

        {/* Regular Members Rows */}
        {members.map((member, index) => (
          <div
            key={member.id || member.email || index}
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neon-purple/20 text-[#b07bff] font-bold flex items-center justify-center font-display text-sm shrink-0">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{member.name}</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-white/10 text-slate-300">
                    Member #{index + 2}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {member.role} • {member.university}
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-300 font-mono sm:text-right pl-13 sm:pl-0">
              {member.email}
            </div>
          </div>
        ))}

        {/* Empty Slot Placeholder */}
        {slotsRemaining > 0 && (
          <div className="py-3.5 flex items-center justify-between gap-3 text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-slate-400 font-bold font-display">
                +
              </div>
              <div>
                <p className="text-slate-300 font-bold">Slot {totalCount + 1}: Available</p>
                <p className="text-slate-400 text-xs">You can add 1 more member to your team</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAddMemberClick}
              className="text-neon-cyan hover:underline text-sm font-bold font-body"
            >
              Add teammate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
