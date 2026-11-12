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
        className="w-full max-w-lg rounded-2xl bg-night-card border border-white/20 p-6 shadow-2xl font-body text-slate-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 id="team-info-modal-title" className="text-xl font-bold text-white font-display">
            Edit Team &amp; Leader Details
          </h3>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white text-lg font-bold p-1 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-300 font-semibold"
            >
              {formError}
            </p>
          )}

          {/* Team Name */}
          <div>
            <label
              htmlFor="edit-team-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1"
            >
              Team Name <span className="text-neon-pink">*</span>
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
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.teamName && (
              <p className="text-xs text-red-400 mt-1 font-semibold">{errors.teamName}</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neon-cyan font-display">
              Team Leader
            </h4>

            {/* Leader Name */}
            <div>
              <label
                htmlFor="edit-leader-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                Leader Full Name <span className="text-neon-pink">*</span>
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
                className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
              />
              {errors.leaderName && (
                <p className="text-xs text-red-400 mt-1 font-semibold">{errors.leaderName}</p>
              )}
            </div>

            {/* Leader Email (Read-only login ID) */}
            <div>
              <label
                htmlFor="edit-leader-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1"
              >
                Leader Email (Account Login)
              </label>
              <input
                id="edit-leader-email"
                type="email"
                value={leaderEmail}
                readOnly
                disabled
                className="w-full rounded-lg bg-night/60 border border-white/10 px-3.5 py-2 text-slate-400 font-mono cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">
                This email is your team login ID and cannot be changed here.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-neon-cyan hover:opacity-90 text-black text-xs font-bold font-body transition shadow-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Team Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
