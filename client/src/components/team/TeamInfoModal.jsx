import React, { useState, useEffect } from 'react';

export default function TeamInfoModal({ isOpen, onClose, onSave, team }) {
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    leaderUniversity: '',
    leaderRole: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (team) {
      setFormData({
        teamName: team.name || '',
        leaderName: team.leader?.name || '',
        leaderEmail: team.leader?.email || '',
        leaderPhone: team.leader?.phone || '',
        leaderUniversity: team.leader?.university || '',
        leaderRole: team.leader?.role || 'Leader & Developer',
      });
    }
    setErrors({});
  }, [team, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    if (!formData.teamName.trim()) {
      nextErrors.teamName = 'Team name is required.';
    } else if (formData.teamName.trim().length < 2) {
      nextErrors.teamName = 'Team name must be at least 2 characters.';
    }

    if (!formData.leaderName.trim()) {
      nextErrors.leaderName = 'Team leader name is required.';
    }

    if (!formData.leaderEmail.trim()) {
      nextErrors.leaderEmail = 'Leader email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail.trim())) {
      nextErrors.leaderEmail = 'Please enter a valid email address.';
    }

    if (!formData.leaderUniversity.trim()) {
      nextErrors.leaderUniversity = 'Leader university / institution is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: formData.teamName.trim(),
      leader: {
        name: formData.leaderName.trim(),
        email: formData.leaderEmail.trim().toLowerCase(),
        phone: formData.leaderPhone.trim(),
        university: formData.leaderUniversity.trim(),
        role: formData.leaderRole.trim() || 'Leader & Developer',
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-night-card border border-white/20 p-6 shadow-2xl font-body text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-xl font-bold text-white font-display">
            Edit Team & Leader Contact Info
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
          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Team Name <span className="text-neon-pink">*</span>
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              placeholder="e.g. Cyber Synapse"
              className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
            />
            {errors.teamName && (
              <p className="text-xs text-red-400 mt-1 font-semibold">{errors.teamName}</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neon-cyan mb-3 font-display">
              Team Leader / Primary Contact
            </h4>

            {/* Leader Name */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Leader Full Name <span className="text-neon-pink">*</span>
                </label>
                <input
                  type="text"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  placeholder="e.g. Thanish Ahamed"
                  className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
                />
                {errors.leaderName && (
                  <p className="text-xs text-red-400 mt-1 font-semibold">{errors.leaderName}</p>
                )}
              </div>

              {/* Leader Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Leader Email Address <span className="text-neon-pink">*</span>
                </label>
                <input
                  type="email"
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData({ ...formData, leaderEmail: e.target.value })}
                  placeholder="e.g. leader@university.edu"
                  className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
                />
                {errors.leaderEmail && (
                  <p className="text-xs text-red-400 mt-1 font-semibold">{errors.leaderEmail}</p>
                )}
              </div>

              {/* Leader Phone & Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.leaderPhone}
                    onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Leader Role
                  </label>
                  <input
                    type="text"
                    value={formData.leaderRole}
                    onChange={(e) => setFormData({ ...formData, leaderRole: e.target.value })}
                    placeholder="e.g. Leader & Lead Developer"
                    className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
                  />
                </div>
              </div>

              {/* Leader University */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  University / Faculty <span className="text-neon-pink">*</span>
                </label>
                <input
                  type="text"
                  value={formData.leaderUniversity}
                  onChange={(e) => setFormData({ ...formData, leaderUniversity: e.target.value })}
                  placeholder="e.g. Faculty of Information Technology"
                  className="w-full rounded-lg bg-night border border-white/15 px-3.5 py-2 text-white font-body focus:outline-none focus:border-neon-cyan transition"
                />
                {errors.leaderUniversity && (
                  <p className="text-xs text-red-400 mt-1 font-semibold">
                    {errors.leaderUniversity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
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
              Save Team Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
