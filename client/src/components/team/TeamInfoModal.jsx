import React, { useState, useEffect } from 'react';
import { getApiError } from '../../api/http.js';

export default function TeamInfoModal({ isOpen, onClose, onSave, team }) {
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        teamName: team.name || '',
        leaderName: team.leader?.name || '',
      });
    }
    setErrors({});
    setFormError('');
    setSaving(false);
  }, [team, isOpen]);

  if (!isOpen) return null;

  const leaderEmail = team?.leader?.email || '';

  const validate = () => {
    const nextErrors = {};
    const trimmedTeamName = formData.teamName.trim();
    const trimmedLeaderName = formData.leaderName.trim();

    if (!trimmedTeamName) {
      nextErrors.teamName = 'Enter a team name of up to 100 characters.';
    } else if (trimmedTeamName.length > 100) {
      nextErrors.teamName = 'Team name must be 100 characters or fewer.';
    }

    if (!trimmedLeaderName) {
      nextErrors.leaderName = "Enter the leader's name.";
    } else if (trimmedLeaderName.length > 100) {
      nextErrors.leaderName = "Leader's name must be 100 characters or fewer.";
    }

    setErrors(nextErrors);
    setFormError(Object.keys(nextErrors).length ? 'Please check the highlighted fields.' : '');
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);
    setFormError('');
    setErrors({});
    try {
      await onSave({
        teamName: formData.teamName.trim(),
        leaderName: formData.leaderName.trim(),
      });
      onClose();
    } catch (err) {
      const apiErr = getApiError(err);
      setErrors(apiErr.fields || {});
      setFormError(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-info-modal-title"
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#141025] to-[#0c0b19] border border-white/15 p-6 sm:p-8 shadow-2xl font-body text-[#cac7e0] backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 id="team-info-modal-title" className="text-xl font-bold text-[#f6f4fc] font-display">
            Edit Team &amp; Leader Details
          </h3>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#a7a6b8] hover:text-white text-lg font-bold p-1 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-300 font-semibold"
            >
              {formError}
            </p>
          )}

          {/* Team Name */}
          <div>
            <label
              htmlFor="edit-team-name"
              className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
            >
              Team Name <span className="text-[#ff2bd6]">*</span>
            </label>
            <input
              id="edit-team-name"
              type="text"
              maxLength={100}
              value={formData.teamName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, teamName: e.target.value }));
                if (errors.teamName) setErrors((prev) => ({ ...prev, teamName: '' }));
              }}
              placeholder="e.g. Neon Runners"
              className="w-full rounded-lg bg-[#070714] border border-white/15 px-3.5 py-2.5 text-white font-body focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 transition"
            />
            {errors.teamName && (
              <p className="text-xs text-red-400 mt-1 font-semibold">{errors.teamName}</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e5ff] font-display">
              Team Leader
            </h4>

            {/* Leader Name */}
            <div>
              <label
                htmlFor="edit-leader-name"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
              >
                Leader Full Name <span className="text-[#ff2bd6]">*</span>
              </label>
              <input
                id="edit-leader-name"
                type="text"
                maxLength={100}
                value={formData.leaderName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, leaderName: e.target.value }));
                  if (errors.leaderName) setErrors((prev) => ({ ...prev, leaderName: '' }));
                }}
                placeholder="e.g. Example Leader"
                className="w-full rounded-lg bg-[#070714] border border-white/15 px-3.5 py-2.5 text-white font-body focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 transition"
              />
              {errors.leaderName && (
                <p className="text-xs text-red-400 mt-1 font-semibold">{errors.leaderName}</p>
              )}
            </div>

            {/* Leader Email (Read-only login ID) */}
            <div>
              <label
                htmlFor="edit-leader-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
              >
                Leader Email (Account Login)
              </label>
              <input
                id="edit-leader-email"
                type="email"
                value={leaderEmail}
                readOnly
                disabled
                className="w-full rounded-lg bg-[#070714]/60 border border-white/10 px-3.5 py-2.5 text-[#a7a6b8] font-mono cursor-not-allowed"
              />
              <p className="text-xs text-[#a7a6b8] mt-1">
                This email is your team login ID and cannot be changed here.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-5 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] text-xs font-bold uppercase tracking-wider font-body transition shadow-[0_0_16px_rgba(255,43,214,0.35)] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Team Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
