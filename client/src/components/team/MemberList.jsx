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
  const maxMembers = team?.maxMembers || 4;
  const minMembers = team?.minMembers || 2;
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
    <div className="rounded-2xl border border-neon-purple/30 bg-night-card p-5 sm:p-6 font-body">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Team Members &amp; Roster
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-slate-300">
              {totalCount} / {maxMembers}
            </span>
            {!canEditTeam && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                🔒 Roster Locked
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Teams must have between {minMembers} and {maxMembers} members, including the team leader.
            {canEditTeam && formattedCutoff && (
              <span className="text-slate-300">
                {' '}Roster edits close on {formattedCutoff} (Sri Lanka time).
              </span>
            )}
          </p>
        </div>

        {canEditTeam && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsTeamInfoOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>✎ Edit Team Info</span>
            </button>

            {slotsRemaining > 0 && (
              <button
                type="button"
                onClick={() => setMemberModal({ isOpen: true, member: null, index: null })}
                className="px-3.5 py-1.5 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>+ Add Member</span>
                <span className="text-[10px] text-slate-300">({slotsRemaining} left)</span>
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
        <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 text-neon-cyan font-bold flex items-center justify-center font-display text-sm shrink-0">
              {getInitials(leader.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-white">{leader.name}</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                  Team Leader
                </span>
              </div>
              <p className="text-sm text-slate-400">Primary contact &amp; account owner</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-300 font-mono sm:text-right pl-13 sm:pl-0">
            <p>{leader.email}</p>
            {canEditTeam && (
              <button
                type="button"
                onClick={() => setIsTeamInfoOpen(true)}
                className="text-xs font-bold text-neon-cyan hover:underline font-body shrink-0"
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
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neon-purple/20 text-[#b07bff] font-bold flex items-center justify-center font-display text-sm shrink-0">
                {getInitials(member.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-white">{member.name}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-slate-300">
                    Member #{index + 2}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Registered team member</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-300 font-mono sm:text-right pl-13 sm:pl-0">
              <p>{member.email}</p>
              {canEditTeam && (
                <div className="flex items-center gap-2 shrink-0 font-body text-xs">
                  <button
                    type="button"
                    onClick={() => setMemberModal({ isOpen: true, member, index })}
                    className="font-bold text-neon-cyan hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    disabled={!canDelete || deletingIndex === index}
                    onClick={() => handleDeleteClick(member, index)}
                    className={`font-bold transition ${
                      canDelete && deletingIndex !== index
                        ? 'text-red-400 hover:underline'
                        : 'text-slate-600 cursor-not-allowed'
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
          <div className="py-3.5 flex items-center justify-between gap-3 text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-slate-400 font-bold font-display">
                +
              </div>
              <div>
                <p className="text-slate-300 font-bold">Slot {totalCount + 1}: Available</p>
                <p className="text-slate-400 text-xs">
                  {slotsRemaining === 1
                    ? 'Last slot available for your team'
                    : `${slotsRemaining} slots remaining`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMemberModal({ isOpen: true, member: null, index: null })}
              className="text-neon-cyan hover:underline text-sm font-bold font-body"
            >
              + Add Member
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
