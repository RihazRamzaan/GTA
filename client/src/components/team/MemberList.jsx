import React, { useEffect, useState } from 'react';
import { formatColombo } from '../../utils/dates.js';
import MemberModal from './MemberModal.jsx';
import TeamInfoModal from './TeamInfoModal.jsx';

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function MemberList({
  team,
  canEditTeam = false,
  registrationClosesAt = null,
  onUpdateTeam,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) {
  const leader = team?.leader || {
    name: team?.leaderName || 'Team Leader',
    email: team?.leaderEmail || '',
  };

  const members = Array.isArray(team?.members) ? team.members : [];
  const totalCount = 1 + members.length;
  const maxMembers = team.maxMembers;
  const minMembers = team.minMembers;
  const slotsRemaining = Math.max(0, maxMembers - totalCount);
  const canDelete = canEditTeam && totalCount > minMembers;

  // Modal & action state
  const [isTeamInfoOpen, setIsTeamInfoOpen] = useState(false);
  const [memberModal, setMemberModal] = useState({ isOpen: false, member: null, index: null });
  const [deletingIndex, setDeletingIndex] = useState(null);

  // Close open edit modals immediately if registration cutoff passes
  useEffect(() => {
    if (!canEditTeam) {
      setIsTeamInfoOpen(false);
      setMemberModal({ isOpen: false, member: null, index: null });
    }
  }, [canEditTeam]);

  // List of existing emails to prevent duplicate member entries
  const existingEmails = [
    leader?.email ? leader.email.toLowerCase() : '',
    ...members.map((m) => (m?.email ? m.email.toLowerCase() : '')),
  ].filter(Boolean);

  const handleDeleteClick = async (member, index) => {
    if (!canDelete || deletingIndex !== null) return;
    if (!window.confirm(`Remove ${member.name} from your team?`)) return;

    setDeletingIndex(index);
    try {
      await onDeleteMember(index);
    } catch {
      // Parent handler surfaces toast / lock state on API failure
    } finally {
      setDeletingIndex(null);
    }
  };

  const formattedCutoff =
    registrationClosesAt && !Number.isNaN(Date.parse(registrationClosesAt))
      ? formatColombo(registrationClosesAt)
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 sm:p-8 shadow-xl backdrop-blur-md font-body">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#f6f4fc] font-display">
              Team Members &amp; Roster
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-[#f6f4fc] border border-white/15">
              {totalCount} / {maxMembers}
            </span>
            {!canEditTeam && (
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                🔒 Roster Locked
              </span>
            )}
          </div>
          <p className="text-sm text-[#a7a6b8] mt-1">
            Teams must have between {minMembers} and {maxMembers} members, including the team leader.
            {canEditTeam && formattedCutoff && (
              <span className="text-[#cac7e0]">
                {' '}Roster edits close on {formattedCutoff} (Sri Lanka time).
              </span>
            )}
          </p>
        </div>

        {canEditTeam && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsTeamInfoOpen(true)}
              className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[#f6f4fc] text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <span>✎ Edit Team Info</span>
            </button>

            {slotsRemaining > 0 && (
              <button
                type="button"
                onClick={() => setMemberModal({ isOpen: true, member: null, index: null })}
                className="px-5 py-2 rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] text-xs font-bold uppercase tracking-wider transition shadow-[0_0_16px_rgba(255,43,214,0.35)] flex items-center gap-1.5"
              >
                <span>+ Add Member</span>
                <span className="text-[10px] opacity-80">({slotsRemaining} left)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cutoff Lock Notice */}
      {!canEditTeam && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex items-start gap-2.5"
        >
          <span className="mt-0.5">🔒</span>
          <p>
            <strong>Roster editing is locked.</strong> Team name, leader name, and member details can only be changed while registration is open
            {formattedCutoff ? ` (closed ${formattedCutoff})` : ''}.
          </p>
        </div>
      )}

      {/* Members List */}
      <div className="mt-4 divide-y divide-white/5">
        {/* Team Leader Row */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00e5ff]/15 text-[#00e5ff] font-bold border border-[#00e5ff]/30 flex items-center justify-center font-display text-sm shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              {getInitials(leader.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-[#f6f4fc]">{leader.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 tracking-wide">
                  Team Leader
                </span>
              </div>
              <p className="text-sm text-[#a7a6b8]">Primary contact &amp; account owner</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#cac7e0] font-mono sm:text-right pl-13 sm:pl-0">
            <p>{leader.email}</p>
            {canEditTeam && (
              <button
                type="button"
                onClick={() => setIsTeamInfoOpen(true)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-[#f6f4fc] hover:bg-white/10 transition font-body shrink-0"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Regular Members Rows */}
        {members.map((member, index) => (
          <div
            key={member.email || index}
            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 text-[#f6f4fc] font-bold border border-white/10 flex items-center justify-center font-display text-sm shrink-0">
                {getInitials(member.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-[#f6f4fc]">{member.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-[#cac7e0] border border-white/15">
                    Member #{index + 2}
                  </span>
                </div>
                <p className="text-sm text-[#a7a6b8]">Registered team member</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-[#cac7e0] font-mono sm:text-right pl-13 sm:pl-0">
              <p>{member.email}</p>
              {canEditTeam && (
                <div className="flex items-center gap-2 shrink-0 font-body text-xs">
                  <button
                    type="button"
                    onClick={() => setMemberModal({ isOpen: true, member, index })}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-[#f6f4fc] hover:bg-white/10 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={!canDelete || deletingIndex === index}
                    onClick={() => handleDeleteClick(member, index)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      canDelete && deletingIndex !== index
                        ? 'border-red-400/30 text-red-300 hover:bg-red-500/10 hover:border-red-400'
                        : 'border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                    title={
                      totalCount <= minMembers
                        ? `Cannot remove: Team must have at least ${minMembers} members`
                        : 'Remove member'
                    }
                  >
                    {deletingIndex === index ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty Slot Placeholder (only when editable and slots remain) */}
        {canEditTeam && slotsRemaining > 0 && (
          <div className="py-4 flex items-center justify-between gap-3 text-[#a7a6b8] text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[#a7a6b8] font-bold font-display">
                +
              </div>
              <div>
                <p className="font-semibold text-[#cac7e0]">Open Team Slot</p>
                <p className="text-xs text-[#a7a6b8]">
                  You can add {slotsRemaining} more member{slotsRemaining === 1 ? '' : 's'} to your team
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMemberModal({ isOpen: true, member: null, index: null })}
              className="rounded-full border border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff] px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[#00e5ff]/20 hover:border-[#00e5ff] transition"
            >
              + Add
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <TeamInfoModal
        isOpen={isTeamInfoOpen}
        onClose={() => setIsTeamInfoOpen(false)}
        onSave={(data) => onUpdateTeam(data)}
        team={team}
      />

      <MemberModal
        isOpen={memberModal.isOpen}
        onClose={() => setMemberModal({ isOpen: false, member: null, index: null })}
        member={memberModal.member}
        memberIndex={memberModal.index}
        canDelete={canDelete}
        minMembers={minMembers}
        existingEmails={existingEmails}
        onSave={(savedMember) => {
          if (memberModal.index !== null) {
            return onUpdateMember(savedMember, memberModal.index);
          }
          return onAddMember(savedMember);
        }}
        onDelete={() => onDeleteMember(memberModal.index)}
      />
    </div>
  );
}
