import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav.jsx';
import { getAdminSettings, updateAdminSettings } from '../../api/admin.js';

// Helper to format ISO Date string or Date instance into datetime-local format (YYYY-MM-DDTHH:mm)
const formatForInput = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

export default function AgendaPage() {
  // Gate Modes: 'auto' | 'force_open' | 'force_closed'
  const [registrationMode, setRegistrationMode] = useState('auto');
  const [submissionMode, setSubmissionMode] = useState('auto');

  // Milestone Dates
  const [milestones, setMilestones] = useState({
    registrationOpensAt: '2026-11-05T00:00',
    registrationClosesAt: '2026-11-15T23:59',
    buildingStartsAt: '2026-11-16T09:00',
    submissionOpensAt: '2026-11-27T12:00',
    submissionClosesAt: '2026-12-10T18:00',
    resultsAt: '2026-12-15T15:00',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Load current settings from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        setIsLoading(true);
        const res = await getAdminSettings();
        if (res.data?.success && res.data?.data && isMounted) {
          const { registrationMode: regMode, submissionMode: subMode, milestones: ms } = res.data.data;
          if (regMode) setRegistrationMode(regMode);
          if (subMode) setSubmissionMode(subMode);
          if (ms) {
            setMilestones({
              registrationOpensAt: formatForInput(ms.registrationOpensAt),
              registrationClosesAt: formatForInput(ms.registrationClosesAt),
              buildingStartsAt: formatForInput(ms.buildingStartsAt),
              submissionOpensAt: formatForInput(ms.submissionOpensAt),
              submissionClosesAt: formatForInput(ms.submissionClosesAt),
              resultsAt: formatForInput(ms.resultsAt),
            });
          }
        }
      } catch (err) {
        console.warn('Could not load server settings, using defaults.', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to compute effective gate status for visual feedback
  const getEffectiveStatus = (mode, openKey, closeKey) => {
    if (mode === 'force_open') {
      return {
        isOpen: true,
        label: 'FORCE OPEN (OVERRIDE)',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    }
    if (mode === 'force_closed') {
      return {
        isOpen: false,
        label: 'FORCE CLOSED (OVERRIDE)',
        color: 'text-red-400 bg-red-500/10 border-red-500/30',
      };
    }

    // Auto mode evaluated against current client date
    const now = new Date();
    const opens = new Date(milestones[openKey]);
    const closes = new Date(milestones[closeKey]);
    const isAutoOpen = now >= opens && now <= closes;

    return isAutoOpen
      ? {
          isOpen: true,
          label: 'SCHEDULED OPEN (AUTO)',
          color: 'text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/30',
        }
      : {
          isOpen: false,
          label: 'SCHEDULED CLOSED (AUTO)',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
  };

  const regStatus = getEffectiveStatus(registrationMode, 'registrationOpensAt', 'registrationClosesAt');
  const subStatus = getEffectiveStatus(submissionMode, 'submissionOpensAt', 'submissionClosesAt');

  const handleMilestoneChange = (e) => {
    const { name, value } = e.target;
    setMilestones((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    setSaveError(null);

    try {
      // Convert formatted datetime-local strings to ISO UTC Date strings
      const payloadMilestones = {};
      for (const [key, val] of Object.entries(milestones)) {
        if (val) {
          payloadMilestones[key] = new Date(val).toISOString();
        }
      }

      const res = await updateAdminSettings({
        registrationMode,
        submissionMode,
        milestones: payloadMilestones,
      });

      if (res.data?.success) {
        setSaveStatus('Gate overrides and milestone schedule saved successfully to database.');
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveError(res.data?.error?.message || 'Failed to save settings.');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to connect to backend settings endpoint.';
      setSaveError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRegistrationMode('auto');
    setSubmissionMode('auto');
    setMilestones({
      registrationOpensAt: '2026-11-05T00:00',
      registrationClosesAt: '2026-11-15T23:59',
      buildingStartsAt: '2026-11-16T09:00',
      submissionOpensAt: '2026-11-27T12:00',
      submissionClosesAt: '2026-12-10T18:00',
      resultsAt: '2026-12-15T15:00',
    });
    setSaveStatus('Form reset to default schedule. Click "Save Settings" to persist.');
    setSaveError(null);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Nav */}
      <AdminNav activeTab="agenda" />

      {/* Header Info */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8b3dff]/30 bg-[#8b3dff]/10 text-[#8b3dff] text-xs font-semibold tracking-widest uppercase mb-2">
              <span>ADMIN CONTROLS • SYSTEM GATES & TIMELINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
              EVENT GATES & <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">AGENDA</span>
            </h2>
            <p className="text-sm text-[#9aa7c1] mt-1 max-w-2xl">
              Control immediate participant access via instant gate overrides and configure the chronological milestone timeline that powers the public countdown and automated window timers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-semibold tracking-wider transition-all"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b3dff] text-black font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>SAVE SETTINGS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{saveStatus}</span>
          </div>
        )}

        {saveError && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{saveError}</span>
          </div>
        )}

        {isLoading && (
          <div className="mt-2 text-xs text-[#9aa7c1] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping"></span>
            <span>Syncing event settings from backend...</span>
          </div>
        )}
      </div>

      {/* Section 1: Interactive System Gates (FR-03) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Registration Gate Override Card */}
        <div className="rounded-2xl bg-[#0d0f24]/90 border border-[#00e5ff]/25 p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] font-bold">
                Access Gate 01
              </div>
              <h3 className="text-xl font-bold text-white font-['Orbitron',sans-serif]">
                Registration Gate
              </h3>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${regStatus.color} font-mono uppercase`}>
              {regStatus.label}
            </div>
          </div>

          <p className="text-xs text-[#9aa7c1] mb-5">
            Controls whether new participants can register team accounts and submit registration details.
          </p>

          <div className="space-y-3">
            <div className="text-xs font-bold text-white font-['Orbitron',sans-serif] uppercase tracking-wider">
              Select Gate Mode:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: 'AUTO (TIMED)', desc: 'Follows milestone dates' },
                { id: 'force_open', label: 'FORCE OPEN', desc: 'Always allow registration' },
                { id: 'force_closed', label: 'FORCE CLOSED', desc: 'Immediately lock signups' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRegistrationMode(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    registrationMode === opt.id
                      ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-white shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                      : 'bg-[#070714] border-white/10 text-[#9aa7c1] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold font-['Orbitron',sans-serif]">{opt.label}</div>
                  <div className="text-[10px] text-[#9aa7c1] mt-1 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Gate Override Card */}
        <div className="rounded-2xl bg-[#0d0f24]/90 border border-[#8b3dff]/25 p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] font-bold">
                Access Gate 02
              </div>
              <h3 className="text-xl font-bold text-white font-['Orbitron',sans-serif]">
                Submission Gate
              </h3>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${subStatus.color} font-mono uppercase`}>
              {subStatus.label}
            </div>
          </div>

          <p className="text-xs text-[#9aa7c1] mb-5">
            Controls whether approved teams can submit or edit their game titles, repositories, and playable demo links.
          </p>

          <div className="space-y-3">
            <div className="text-xs font-bold text-white font-['Orbitron',sans-serif] uppercase tracking-wider">
              Select Gate Mode:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: 'AUTO (TIMED)', desc: 'Follows milestone dates' },
                { id: 'force_open', label: 'FORCE OPEN', desc: 'Emergency allow submissions' },
                { id: 'force_closed', label: 'FORCE CLOSED', desc: 'Lock & freeze all submissions' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSubmissionMode(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    submissionMode === opt.id
                      ? 'bg-[#8b3dff]/20 border-[#8b3dff] text-white shadow-[0_0_15px_rgba(139,61,255,0.3)]'
                      : 'bg-[#070714] border-white/10 text-[#9aa7c1] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold font-['Orbitron',sans-serif]">{opt.label}</div>
                  <div className="text-[10px] text-[#9aa7c1] mt-1 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Chronological Milestone Dates Editor (EventSettings) */}
      <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-white/5 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
              Chronological Event Milestones
            </h3>
            <p className="text-xs text-[#9aa7c1]">
              Saved timestamps drive the live countdown on the homepage and automate gate window shifts.
            </p>
          </div>
          <div className="text-xs text-[#00e5ff] font-mono px-2.5 py-1 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/20">
            Stored in UTC • Displayed locally
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Milestone 1 */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5 hover:border-[#00e5ff]/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                1
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-white font-['Orbitron',sans-serif]">
                Registration Opens
              </label>
            </div>
            <input
              type="datetime-local"
              name="registrationOpensAt"
              value={milestones.registrationOpensAt}
              onChange={handleMilestoneChange}
              className="w-full px-3 py-2.5 bg-[#0d0f24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#00e5ff] transition-colors"
            />
            <span className="text-[10px] text-[#9aa7c1] mt-1.5 block">Public sign-up opens for all teams</span>
          </div>

          {/* Milestone 2 */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5 hover:border-[#00e5ff]/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                2
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-white font-['Orbitron',sans-serif]">
                Registration Closes
              </label>
            </div>
            <input
              type="datetime-local"
              name="registrationClosesAt"
              value={milestones.registrationClosesAt}
              onChange={handleMilestoneChange}
              className="w-full px-3 py-2.5 bg-[#0d0f24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#00e5ff] transition-colors"
            />
            <span className="text-[10px] text-[#9aa7c1] mt-1.5 block">Hard deadline for registration</span>
          </div>

          {/* Milestone 3 */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5 hover:border-[#00e5ff]/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#ff2bd6]/20 text-[#ff2bd6] font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                3
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-white font-['Orbitron',sans-serif]">
                Building Starts
              </label>
            </div>
            <input
              type="datetime-local"
              name="buildingStartsAt"
              value={milestones.buildingStartsAt}
              onChange={handleMilestoneChange}
              className="w-full px-3 py-2.5 bg-[#0d0f24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#ff2bd6] transition-colors"
            />
            <span className="text-[10px] text-[#9aa7c1] mt-1.5 block">Hackathon theme revealed & dev commences</span>
          </div>

          {/* Milestone 4 */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5 hover:border-[#8b3dff]/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#8b3dff]/20 text-[#8b3dff] font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                4
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-white font-['Orbitron',sans-serif]">
                Submissions Open
              </label>
            </div>
            <input
              type="datetime-local"
              name="submissionOpensAt"
              value={milestones.submissionOpensAt}
              onChange={handleMilestoneChange}
              className="w-full px-3 py-2.5 bg-[#0d0f24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#8b3dff] transition-colors"
            />
            <span className="text-[10px] text-[#9aa7c1] mt-1.5 block">Game submission portal becomes active</span>
          </div>

          {/* Milestone 5 */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5 hover:border-[#8b3dff]/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-[#8b3dff]/20 text-[#8b3dff] font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                5
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-white font-['Orbitron',sans-serif]">
                Submissions Close
              </label>
            </div>
            <input
              type="datetime-local"
              name="submissionClosesAt"
              value={milestones.submissionClosesAt}
              onChange={handleMilestoneChange}
              className="w-full px-3 py-2.5 bg-[#0d0f24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[#8b3dff] transition-colors"
            />
            <span className="text-[10px] text-[#9aa7c1] mt-1.5 block">Final cut-off for project submission</span>
          </div>

          {/* Milestone 6 */}
          <div className="p-4 rounded-xl bg-[#070714] border border-white/5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-['Orbitron',sans-serif]">
                6
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-white font-['Orbitron',sans-serif]">
                Results & Awards
              </label>
            </div>
            <input
              type="datetime-local"
              name="resultsAt"
              value={milestones.resultsAt}
              onChange={handleMilestoneChange}
              className="w-full px-3 py-2.5 bg-[#0d0f24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <span className="text-[10px] text-[#9aa7c1] mt-1.5 block">Winners & closing ceremony</span>
          </div>

          {/* Form Submit Button Row */}
          <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b3dff] text-black font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Commit Schedule to EventSettings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
