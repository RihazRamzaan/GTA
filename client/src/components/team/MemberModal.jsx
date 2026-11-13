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
  minMembers,
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
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#141025] to-[#0c0b19] border border-white/15 p-6 sm:p-8 shadow-2xl font-body text-[#cac7e0] backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 id="member-modal-title" className="text-xl font-bold text-[#f6f4fc] font-display">
            {isEditing ? 'Edit Team Member' : 'Add Team Member'}
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

          {/* Full Name */}
          <div>
            <label
              htmlFor="member-name"
              className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
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
              className="w-full rounded-lg bg-[#070714] border border-white/15 px-3.5 py-2.5 text-white font-body focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 transition"
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
              className="w-full rounded-lg bg-[#070714] border border-white/15 px-3.5 py-2.5 text-white font-body focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 transition"
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1 font-semibold">{errors.email}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  disabled={!canDelete || saving}
                  onClick={handleDelete}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition ${
                    canDelete && !saving
                      ? 'border-red-400/40 text-red-300 hover:bg-red-500/10 hover:border-red-400'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                  title={!canDelete ? `Teams must have at least ${minMembers} members` : 'Remove member'}
                >
                  Remove Member
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
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
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
