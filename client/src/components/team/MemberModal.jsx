import React, { useState, useEffect } from 'react';
import { getApiError } from '../../api/http.js';

export default function MemberModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  member = null,
  memberIndex = null,
  canDelete = false,
  existingEmails = [],
}) {
  const isEditing = memberIndex !== null && member !== null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
      });
    }
    setErrors({});
    setFormError('');
    setSaving(false);
  }, [member, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedName) {
      nextErrors.name = 'Member name is required.';
    } else if (trimmedName.length > 100) {
      nextErrors.name = 'Name must be 100 characters or fewer.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Email address is required.';
    } else if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    } else {
      const currentEmail = member?.email?.trim().toLowerCase();
      if (trimmedEmail !== currentEmail && existingEmails.includes(trimmedEmail)) {
        nextErrors.email = 'Each member needs a different email address (already used on this team).';
      }
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
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      onClose();
    } catch (err) {
      const apiErr = getApiError(err);
      setErrors(apiErr.fields || {});
      setFormError(apiErr.fields?.members || apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || !onDelete || saving) return;
    if (!window.confirm(`Are you sure you want to remove ${formData.name || 'this member'}?`)) {
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onDelete();
      onClose();
    } catch (err) {
      const apiErr = getApiError(err);
      setFormError(apiErr.fields?.members || apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
        className="w-full max-w-lg rounded-2xl bg-night-card border border-white/20 p-6 shadow-2xl font-body text-slate-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 id="member-modal-title" className="text-xl font-bold text-white font-display">
            {isEditing ? 'Edit Team Member' : 'Add Team Member'}
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

          {/* Full Name */}
          <div>
            <label
              htmlFor="member-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1"
            >
              Full Name <span className="text-neon-pink">*</span>
            </label>
            <input
              id="member-name"
              type="text"
              maxLength={100}
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Akindu Fernando"
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="member-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1"
            >
              Email Address <span className="text-neon-pink">*</span>
            </label>
            <input
              id="member-email"
              type="email"
              maxLength={254}
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="e.g. member@university.edu"
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1 font-semibold">{errors.email}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  disabled={!canDelete || saving}
                  onClick={handleDelete}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                    canDelete && !saving
                      ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'border-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                  title={!canDelete ? 'Teams must have at least 2 members' : 'Remove member'}
                >
                  Remove Member
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
