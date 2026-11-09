import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../../components/admin/AdminNav.jsx';
import { getAdminSubmissions, getAdminSummary } from '../../api/admin.js';
import { Link } from 'react-router-dom';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const fetchSubmissionsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [subsRes, summaryRes] = await Promise.all([
        getAdminSubmissions().catch((err) => {
          console.error('Failed to fetch admin submissions:', err);
          return { data: { success: false, data: [] } };
        }),
        getAdminSummary().catch((err) => {
          console.error('Failed to fetch admin summary:', err);
          return { data: { success: false, data: {} } };
        }),
      ]);

      if (subsRes.data?.success) {
        setSubmissions(subsRes.data.data || []);
      } else {
        setError(subsRes.data?.error?.message || 'Could not load submissions.');
      }

      if (summaryRes.data?.success) {
        setSummaryData(summaryRes.data.data || {});
      }
    } catch (err) {
      console.error('Error loading submissions page data:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to connect to submissions service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissionsData();
  }, [fetchSubmissionsData]);

  // Search filtering logic
  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const titleMatch = (sub.title || '').toLowerCase().includes(q);
    const teamMatch = (sub.teamName || '').toLowerCase().includes(q);
    const leaderMatch = (sub.leaderName || '').toLowerCase().includes(q);
    const emailMatch = (sub.leaderEmail || '').toLowerCase().includes(q);
    const descMatch = (sub.description || '').toLowerCase().includes(q);

    return titleMatch || teamMatch || leaderMatch || emailMatch || descMatch;
  });

  const isSubmissionWindowOpen = Boolean(summaryData?.gates?.submissionOpen);
  const submissionOpensAt = summaryData?.milestones?.submissionOpensAt;
  const submissionClosesAt = summaryData?.milestones?.submissionClosesAt;

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Nav */}
      <AdminNav activeTab="submissions" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-white/5 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-semibold tracking-widest uppercase mb-2">
            <span>PROJECT REPOSITORY • LIVE AUDIT GALLERY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            SUBMISSIONS <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">GALLERY</span>
          </h2>
          <p className="text-sm text-[#9aa7c1] mt-1">
            Browse verified team projects, test playable demonstrations, and audit repository codebases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Submission Gate Status Badge */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wide ${
              isSubmissionWindowOpen
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSubmissionWindowOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {isSubmissionWindowOpen ? 'SUBMISSIONS OPEN' : 'SUBMISSIONS CLOSED'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchSubmissionsData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#0d0f24] border border-white/10 hover:border-[#00e5ff]/40 text-[#9aa7c1] hover:text-white transition-all disabled:opacity-50"
            title="Refresh Submissions"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00e5ff]' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-300 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchSubmissionsData}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-bold font-mono uppercase"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[#0d0f24] border border-white/5">
          <div className="text-xs uppercase text-[#9aa7c1] font-['Orbitron',sans-serif]">Total Submissions</div>
          <div className="text-2xl font-bold text-white font-['Orbitron',sans-serif] mt-1">{submissions.length}</div>
          <div className="text-[11px] text-[#00e5ff] mt-0.5">Live database entries</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0f24] border border-white/5">
          <div className="text-xs uppercase text-[#9aa7c1] font-['Orbitron',sans-serif]">Live Demos</div>
          <div className="text-2xl font-bold text-emerald-400 font-['Orbitron',sans-serif] mt-1">
            {submissions.filter((s) => s.playableUrl).length}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Playable game builds</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0f24] border border-white/5">
          <div className="text-xs uppercase text-[#9aa7c1] font-['Orbitron',sans-serif]">Repos Audited</div>
          <div className="text-2xl font-bold text-[#8b3dff] font-['Orbitron',sans-serif] mt-1">
            {submissions.filter((s) => s.repoUrl).length}
          </div>
          <div className="text-[11px] text-[#8b3dff]/80 mt-0.5">GitHub source links</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0d0f24] border border-white/5">
          <div className="text-xs uppercase text-[#9aa7c1] font-['Orbitron',sans-serif]">Video Previews</div>
          <div className="text-2xl font-bold text-[#ff2bd6] font-['Orbitron',sans-serif] mt-1">
            {submissions.filter((s) => s.videoUrl).length}
          </div>
          <div className="text-[11px] text-[#ff2bd6]/80 mt-0.5">Gameplay walkthroughs</div>
        </div>
      </div>

      {/* Search Bar & Layout Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9aa7c1]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, team, leader or description..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#070714] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9aa7c1] hover:text-white"
            >
              &times;
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#070714] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
                : 'text-[#9aa7c1] hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
                : 'text-[#9aa7c1] hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-[#0d0f24]/50 border border-white/5 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/5 rounded w-1/4" />
              </div>
              <div className="h-6 bg-white/10 rounded w-3/4" />
              <div className="h-16 bg-white/5 rounded w-full" />
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div className="h-8 bg-white/10 rounded w-1/4" />
                <div className="h-4 bg-white/5 rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        /* Helpful Empty States when no submissions exist */
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0d0f24] border border-white/10 text-center max-w-2xl mx-auto my-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center mx-auto mb-4 text-[#00e5ff]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>

          {!isSubmissionWindowOpen ? (
            <>
              <h3 className="text-xl font-bold text-white font-['Orbitron',sans-serif] mb-2">
                SUBMISSIONS WINDOW IS CLOSED
              </h3>
              <p className="text-sm text-[#9aa7c1] mb-6 max-w-lg mx-auto">
                Game project submissions are currently locked by event gate controls. Once the submission milestone opens
                {submissionOpensAt ? ` (${new Date(submissionOpensAt).toLocaleDateString()})` : ''}, approved squads will be able to upload game builds and repositories here.
              </p>
              <Link
                to="/admin/agenda"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 border border-[#00e5ff]/40 text-[#00e5ff] text-xs font-bold tracking-wider font-mono uppercase transition-colors"
              >
                <span>Inspect Event Milestones & Controls</span>
                <span>&rarr;</span>
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white font-['Orbitron',sans-serif] mb-2">
                NO TRANSMISSIONS RECEIVED YET
              </h3>
              <p className="text-sm text-[#9aa7c1] mb-6 max-w-lg mx-auto">
                The submission window is open, but no approved squads have submitted their final game projects yet.
                Completed entries will appear here automatically in real time.
              </p>
              <button
                type="button"
                onClick={fetchSubmissionsData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold tracking-wider font-mono uppercase transition-colors"
              >
                <span>Check for New Submissions</span>
              </button>
            </>
          )}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        /* Empty State for Search Filter with 0 matches */
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0d0f24] border border-white/10 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-[#9aa7c1]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-white font-['Orbitron',sans-serif] mb-1">
            NO MATCHING TRANSMISSIONS
          </h4>
          <p className="text-xs text-[#9aa7c1] mb-4">
            No submissions matched your search query "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-1.5 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-bold hover:bg-[#00e5ff]/25 transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id || sub._id}
              className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 p-6 shadow-lg hover:border-[#00e5ff]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Bar: Team & Date */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs">
                  <span className="text-[#00e5ff] font-bold font-['Orbitron',sans-serif]">
                    {sub.teamName}
                  </span>
                  <span className="text-[#9aa7c1] font-mono text-[11px]">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Pending'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white font-['Orbitron',sans-serif] group-hover:text-[#00e5ff] transition-colors mb-2">
                  {sub.title}
                </h3>

                {/* Description preview */}
                <p className="text-xs text-[#9aa7c1]/90 mb-5 line-clamp-3 leading-relaxed">
                  {sub.description}
                </p>

                {/* Squad Members preview pill */}
                <div className="text-[11px] text-[#9aa7c1] font-mono mb-4 flex items-center gap-2">
                  <span className="text-white/60">Leader:</span>
                  <span className="text-white font-semibold">{sub.leaderName || 'Unknown'}</span>
                  {sub.membersCount > 1 && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                      +{sub.membersCount - 1} members
                    </span>
                  )}
                </div>
              </div>

              {/* Action Links & Dossier Button */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {sub.playableUrl && (
                    <a
                      href={sub.playableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[#ff2bd6]/15 hover:bg-[#ff2bd6]/25 border border-[#ff2bd6]/40 text-[#ff2bd6] text-xs font-bold tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      <span>Play Demo</span>
                    </a>
                  )}
                  {sub.repoUrl && (
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>GitHub</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(sub)}
                  className="text-xs text-[#00e5ff] hover:underline font-bold flex items-center gap-1 font-['Orbitron',sans-serif]"
                >
                  <span>Full Dossier</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-[#9aa7c1] uppercase font-['Orbitron',sans-serif] bg-white/[0.02] border-b border-white/10">
                  <th className="py-3.5 px-4">Project & Team</th>
                  <th className="py-3.5 px-4">Playable Demo</th>
                  <th className="py-3.5 px-4">Repository</th>
                  <th className="py-3.5 px-4">Video Link</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id || sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-base">{sub.title}</div>
                      <div className="text-xs text-[#00e5ff] font-semibold">{sub.teamName}</div>
                      <div className="text-[11px] text-[#9aa7c1]">{sub.leaderEmail}</div>
                    </td>
                    <td className="py-4 px-4">
                      {sub.playableUrl ? (
                        <a
                          href={sub.playableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#ff2bd6] hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>Open Link</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-[#9aa7c1]">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {sub.repoUrl ? (
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00e5ff] hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>GitHub Repo</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-[#9aa7c1]">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {sub.videoUrl ? (
                        <a
                          href={sub.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#8b3dff] hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>Watch</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-[#9aa7c1] italic">No video</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-[#9aa7c1]">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Dossier Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl rounded-2xl bg-[#0d0f24] border border-[#00e5ff]/40 shadow-[0_0_50px_rgba(0,229,255,0.2)] p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#00e5ff] font-['Orbitron',sans-serif] font-bold">
                  Team Project Dossier • {selectedSubmission.teamName}
                </div>
                <h3 className="text-2xl font-bold text-white font-['Orbitron',sans-serif] mt-1">
                  {selectedSubmission.title}
                </h3>
                <div className="text-xs text-[#9aa7c1] mt-0.5">
                  Leader: {selectedSubmission.leaderName} ({selectedSubmission.leaderEmail})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-[#9aa7c1] hover:text-white p-1 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6">
              {/* Synopsis & Full Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
                  Project Description
                </h4>
                <div className="p-4 rounded-xl bg-[#070714] border border-white/5 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {selectedSubmission.description}
                </div>
              </div>

              {/* Team Members List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
                  Registered Team Roster ({selectedSubmission.members?.length || selectedSubmission.membersCount || 1} members)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedSubmission.members || []).map((member, i) => {
                    const memberLabel =
                      typeof member === 'object' && member !== null
                        ? `${member.name}${member.role ? ` (${member.role})` : ''}`
                        : String(member);
                    return (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white font-semibold"
                      >
                        {memberLabel}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Links Resource Block */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif] mb-2">
                  Project Artifacts & Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedSubmission.playableUrl ? (
                    <a
                      href={selectedSubmission.playableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#ff2bd6]/10 border border-[#ff2bd6]/30 hover:border-[#ff2bd6] text-[#ff2bd6] block transition-all"
                    >
                      <div className="text-[10px] uppercase font-bold text-[#9aa7c1]">Playable Build</div>
                      <div className="text-sm font-bold truncate mt-0.5">Live Demo &rarr;</div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[#9aa7c1] block">
                      <div className="text-[10px] uppercase font-bold">Playable Build</div>
                      <div className="text-xs italic mt-0.5">None provided</div>
                    </div>
                  )}

                  {selectedSubmission.repoUrl ? (
                    <a
                      href={selectedSubmission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 hover:border-[#00e5ff] text-[#00e5ff] block transition-all"
                    >
                      <div className="text-[10px] uppercase font-bold text-[#9aa7c1]">Source Code</div>
                      <div className="text-sm font-bold truncate mt-0.5">GitHub Repo &rarr;</div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[#9aa7c1] block">
                      <div className="text-[10px] uppercase font-bold">Source Code</div>
                      <div className="text-xs italic mt-0.5">None provided</div>
                    </div>
                  )}

                  {selectedSubmission.videoUrl ? (
                    <a
                      href={selectedSubmission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#8b3dff]/10 border border-[#8b3dff]/30 hover:border-[#8b3dff] text-[#8b3dff] block transition-all"
                    >
                      <div className="text-[10px] uppercase font-bold text-[#9aa7c1]">Walkthrough</div>
                      <div className="text-sm font-bold truncate mt-0.5">Video Link &rarr;</div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[#9aa7c1] block">
                      <div className="text-[10px] uppercase font-bold">Walkthrough</div>
                      <div className="text-xs italic mt-0.5">No video supplied</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex items-center justify-between text-xs text-[#9aa7c1] pt-4 border-t border-white/10 font-mono">
                <span>Submitted: {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toUTCString() : '—'}</span>
                <span>Last Updated: {selectedSubmission.updatedAt ? new Date(selectedSubmission.updatedAt).toUTCString() : '—'}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
