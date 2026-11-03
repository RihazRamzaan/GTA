import React, { useState, useEffect } from 'react';

export default function MemberModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  member = null,
  canDelete = false,
  existingEmails = [],
}) {
  const isEditing = Boolean(member?.id || member?.email);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Developer',
    university: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        role: member.role || 'Developer',
        university: member.university || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Developer',
        university: '',
      });
    }
    setErrors({});
  }, [member, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Member name is required.';
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    } else {
      // Check if duplicate email (excluding current member's email when editing)
      const currentEmail = member?.email?.toLowerCase();
      const enteredEmail = formData.email.trim().toLowerCase();
      if (enteredEmail !== currentEmail && existingEmails.includes(enteredEmail)) {
        nextErrors.email = 'This email is already registered to a team member.';
      }
    }

    if (!formData.university.trim()) {
      nextErrors.university = 'University / Institution is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: member?.id || 'm_' + Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role.trim(),
      university: formData.university.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-night-card border border-white/20 p-6 shadow-2xl font-body text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-xl font-bold text-white font-display">
            {isEditing ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Full Name <span className="text-neon-pink">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Akindu Fernando"
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Email Address <span className="text-neon-pink">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. member@university.edu"
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1 font-semibold">{errors.email}</p>}
          </div>

          {/* Role / Specialization */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Role in Team
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            >
              <option value="Gameplay Developer">Gameplay Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Frontend & UI Designer">Frontend & UI Designer</option>
              <option value="3D / 2D Artist">3D / 2D Artist</option>
              <option value="Sound & Audio Designer">Sound & Audio Designer</option>
              <option value="Game & Level Designer">Game & Level Designer</option>
            </select>
          </div>

          {/* University / Department */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              University / Faculty <span className="text-neon-pink">*</span>
            </label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              placeholder="e.g. Faculty of Information Technology"
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.university && (
              <p className="text-xs text-red-400 mt-1 font-semibold">{errors.university}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${formData.name || 'this member'}?`)) {
                      onDelete(member.id);
                      onClose();
                    }
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                    canDelete
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
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-neon-cyan hover:opacity-90 text-black text-xs font-bold font-body transition shadow-sm"
              >
                {isEditing ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
