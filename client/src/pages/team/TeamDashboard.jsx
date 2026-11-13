import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiError } from '../../api/http.js';
import { teamApi } from '../../api/team.js';
import MemberList from '../../components/team/MemberList.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import TeamNav from '../../components/team/TeamNav.jsx';
import Dock from '../../components/layout/Dock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useEventSettings, { refreshEventSettings } from '../../hooks/useEventSettings.js';
import { formatColombo } from '../../utils/dates.js';

// Formats the backend team payload returned by GET/PATCH /api/team/me for display.
function formatTeamFromBackend(backendTeam, fallbackEmail) {
  if (!backendTeam) return null;

  const leaderEmail = backendTeam.leaderEmail || fallbackEmail || '';
  const leaderName = backendTeam.leaderName || 'Team Leader';
  const normalizedLeaderEmail = leaderEmail.toLowerCase().trim();

  // Filter out the leader row so the leader and additional members stay clearly separated.
  const rawMembers = Array.isArray(backendTeam.members) ? backendTeam.members : [];
  const otherMembers = rawMembers
    .filter((m) => m.email?.toLowerCase().trim() !== normalizedLeaderEmail)
    .map((m) => ({
      name: m.name || '',
      email: m.email || '',
    }));

  return {
    id: backendTeam.id,
    name: backendTeam.name,
    code: backendTeam.id ? `TEAM-${String(backendTeam.id).slice(-4).toUpperCase()}` : null,
    leader: {
      name: leaderName,
      email: leaderEmail,
    },
    members: otherMembers,
  };
}

export default function TeamDashboard() {
  const { user, loading: authLoading, refresh } = useAuth();
  const { status: settingsStatus, settings } = useEventSettings();
  const teamSize = settings?.teamSize;
  const validTeamSize = settingsStatus === 'ready' && Number.isInteger(teamSize?.min) && Number.isInteger(teamSize?.max) && teamSize.min >= 1 && teamSize.max >= teamSize.min;

  const [dashboard, setDashboard] = useState({
    team: null,
    registration: null,
    submission: null,
    canEditTeam: false,
  });
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);

  const toastTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const lastRegistrationOpenRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 4000);
  }, []);

  const loadTeam = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?.teamId) {
        if (isMountedRef.current) {
          setDashboard({
            team: null,
            registration: null,
            submission: null,
            canEditTeam: false,
          });
          setFetchError(null);
          setFetching(false);
        }
        return;
      }

      if (!silent && isMountedRef.current) {
        setFetching(true);
        setFetchError(null);
      }

      try {
        const data = await teamApi.getMyTeam();
        if (!isMountedRef.current) return;

        hasLoadedRef.current = true;
        setDashboard({
          team: formatTeamFromBackend(data?.team, user?.email),
          registration: data?.registration || null,
          submission: data?.submission || null,
          canEditTeam: Boolean(data?.canEditTeam),
        });
        setFetchError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const apiError = getApiError(err);
        if (!silent) {
          setFetchError(apiError);
        } else {
          showToast(apiError.message, 'error');
        }
      } finally {
        if (isMountedRef.current && !silent) {
          setFetching(false);
        }
      }
    },
    [user?.teamId, user?.email, showToast]
  );

  // Load real team & registration details whenever signed-in user finishes loading
  useEffect(() => {
    if (authLoading) return;
    loadTeam();
  }, [authLoading, loadTeam]);

  // Re-check server canEditTeam automatically if live public registration gate flips
  useEffect(() => {
    if (settingsStatus !== 'ready' || !settings) return;
    const currentOpen = Boolean(settings.registrationOpen);
    if (
      hasLoadedRef.current &&
      lastRegistrationOpenRef.current !== null &&
      lastRegistrationOpenRef.current !== currentOpen
    ) {
      loadTeam({ silent: true });
    }
    lastRegistrationOpenRef.current = currentOpen;
  }, [settingsStatus, settings?.registrationOpen, loadTeam]);

  // Centralized save helper for PATCH /api/team/me
  const saveTeamPatch = async (payload, successMessage) => {
    if (!dashboard.canEditTeam) {
      const lockedErr = {
        response: {
          data: {
            error: {
              code: 'TEAM_LOCKED',
              message: 'Team details cannot be changed after registration closes.',
            },
          },
        },
      };
      showToast('Team details cannot be changed after registration closes.', 'error');
      throw lockedErr;
    }

    try {
      const res = await teamApi.updateMyTeam(payload);
      if (res?.team && isMountedRef.current) {
        setDashboard((prev) => ({
          ...prev,
          team: formatTeamFromBackend(res.team, user?.email),
        }));
      }
      showToast(successMessage);
      refresh().catch(() => {});
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.code === 'TEAM_LOCKED') {
        if (isMountedRef.current) {
          setDashboard((prev) => ({ ...prev, canEditTeam: false }));
        }
        loadTeam({ silent: true });
      }
      showToast(apiError.message, 'error');
      throw err;
    }
  };

  // Update team name and leader name
  const handleUpdateTeam = async ({ teamName, leaderName }) => {
    await saveTeamPatch(
      { teamName, leaderName },
      'Team details updated successfully.'
    );
  };

  // Add a new member
  const handleAddMember = async (newMember) => {
    const currentMembers = dashboard.team?.members || [];
    if (!validTeamSize) throw new Error('Team-size requirements are unavailable. Please retry.');
    const maxMembers = teamSize.max;
    if (1 + currentMembers.length >= maxMembers) {
      const msg = `Maximum team size reached (${maxMembers} members max).`;
      showToast(msg, 'error');
      throw new Error(msg);
    }

    const updatedMembers = [
      ...currentMembers.map((m) => ({ name: m.name, email: m.email })),
      { name: newMember.name, email: newMember.email },
    ];
    await saveTeamPatch(
      { members: updatedMembers },
      `Added ${newMember.name} to the team roster.`
    );
  };

  // Update an existing member by roster index
  const handleUpdateMember = async (updatedMember, memberIndex) => {
    const currentMembers = dashboard.team?.members || [];
    const updatedMembers = currentMembers.map((m, idx) =>
      idx === memberIndex
        ? { name: updatedMember.name, email: updatedMember.email }
        : { name: m.name, email: m.email }
    );
    await saveTeamPatch(
      { members: updatedMembers },
      `Updated details for ${updatedMember.name}.`
    );
  };

  // Remove a member by roster index
  const handleDeleteMember = async (memberIndex) => {
    const currentMembers = dashboard.team?.members || [];
    if (!validTeamSize) throw new Error('Team-size requirements are unavailable. Please retry.');
    const minMembers = teamSize.min;
    if (1 + currentMembers.length <= minMembers) {
      const msg = `Cannot remove: Teams must have at least ${minMembers} members.`;
      showToast(msg, 'error');
      return;
    }

    const memberToRemove = currentMembers[memberIndex];
    const updatedMembers = currentMembers
      .filter((_, idx) => idx !== memberIndex)
      .map((m) => ({ name: m.name, email: m.email }));

    await saveTeamPatch(
      { members: updatedMembers },
      `Removed ${memberToRemove?.name || 'member'} from the team.`
    );
  };

  // Loading state
  if (authLoading || fetching) {
    return (
      <div className="relative min-h-screen max-w-5xl mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-24 pb-36 text-center font-body text-[#cac7e0] bg-[#070714]">
        <div>
          <div className="inline-block w-10 h-10 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold text-white font-display">Loading Team Details...</p>
          <p className="text-sm text-[#a7a6b8] mt-1">
            Fetching your registration and roster from the server
          </p>
        </div>
        <Dock />
      </div>
    );
  }

  // Real error state (never falls back to sample team data)
  if (fetchError) {
    return (
      <div className="relative min-h-screen max-w-5xl mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-8 pb-36 font-body text-[#cac7e0] bg-[#070714] space-y-8">
        <div className="space-y-6">
          <TeamNav team={null} user={user} currentStatus={null} />

          <div
            role="alert"
            className="rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#141025] to-[#0c0b19] p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xl backdrop-blur-md"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              Unable to Load Team Details
            </h2>
            <p className="text-[#cac7e0] text-base leading-relaxed">{fetchError.message}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => loadTeam()}
                className="px-6 py-2.5 rounded-full bg-[#00e5ff] hover:brightness-110 text-[#070714] font-bold text-xs uppercase tracking-wider transition"
              >
                Try Again
              </button>
              {fetchError.code === 'UNAUTHENTICATED' && (
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Log In Again
                </Link>
              )}
            </div>
          </div>
        </div>
        <Dock />
      </div>
    );
  }

  const { team, registration, submission, canEditTeam } = dashboard;
  const isUnregistered = !user?.teamId || !team;
  const registrationClosesAt =
    settingsStatus === 'ready' ? settings?.milestones?.registrationClosesAt : null;

  const submissionTimestamp = submission?.updatedAt || submission?.submittedAt;
  const formattedSubmissionTime =
    submissionTimestamp && !Number.isNaN(Date.parse(submissionTimestamp))
      ? formatColombo(submissionTimestamp)
      : null;

  return (
    <div className="relative min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36 font-body text-[#cac7e0] bg-[#070714] space-y-8">
      {/* Subtle atmospheric ambient glow matching Home art direction */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[360px] w-[580px] max-w-full rounded-full bg-gradient-to-b from-[#8b3dff]/15 via-[#00e5ff]/5 to-transparent blur-3xl" />

      {/* Toast Notification */}
      {toast && (
        <div role="status" className="fixed bottom-24 right-6 z-50">
          <div
            className={`px-5 py-3 rounded-full font-bold font-body text-sm shadow-xl flex items-center gap-2 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white border border-red-400/50'
                : 'bg-emerald-500/90 text-[#070714] border border-emerald-400/50'
            }`}
          >
            <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Team Header & Navigation */}
      <TeamNav
        team={isUnregistered ? null : team}
        user={user}
        currentStatus={isUnregistered ? 'unregistered' : registration?.status}
      />

      {/* Registration Status Banner */}
      <StatusBanner
        registration={isUnregistered ? null : registration}
        submission={submission}
      />

      {isUnregistered ? (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 backdrop-blur-md p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-3xl">
            🎮
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f6f4fc] font-display">
              Register Your Team to Begin
            </h2>
            <p className="mt-2 text-[#a7a6b8] font-body text-base">
              Welcome, <span className="text-[#00e5ff] font-mono font-medium">{user?.email}</span>. Your account is signed in, but no team registration was found for it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-5 rounded-xl bg-white/[0.03] border border-white/10 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#a7a6b8] font-bold block">
                Team Size
              </span>
              <span className="text-[#f6f4fc] font-semibold">{validTeamSize ? `${teamSize.min} – ${teamSize.max} Members` : 'Team size unavailable'}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#a7a6b8] font-bold block">
                Entry Fee
              </span>
              <span className="text-emerald-300 font-semibold">Free Registration</span>
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] font-bold font-body uppercase tracking-wider text-sm shadow-lg shadow-neon-pink/25 transition transform hover:-translate-y-0.5 text-center"
            >
              REGISTER TEAM NOW →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Journey Summary & Game Submission Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 shadow-xl backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a7a6b8] block">
                Registration
              </span>
              <p className="mt-2 text-xl font-bold text-[#f6f4fc] font-display">
                {registration?.status === 'approved' ? 'Confirmed' : 'Pending'}
              </p>
              <p className="mt-2 text-sm text-emerald-300 font-semibold">
                Free entry — no payment required
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 shadow-xl backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a7a6b8] block">
                Roster Editing
              </span>
              <p className="mt-2 text-xl font-bold text-[#f6f4fc] font-display">
                {canEditTeam ? 'Open' : 'Locked'}
              </p>
              <p className="mt-2 text-sm text-[#cac7e0] leading-relaxed">
                {canEditTeam
                  ? 'You can edit team & member details until registration closes.'
                  : 'Registration has closed; roster changes are locked.'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#00e5ff]/35 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between gap-4 hover:border-[#00e5ff]/60 hover:shadow-[0_0_24px_rgba(0,229,255,0.15)] transition">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#a7a6b8] block">
                  Game Submission
                </span>
                {submission ? (
                  <>
                    <p className="mt-2 text-xl font-bold text-emerald-300 font-display truncate">
                      ✓ {submission.title}
                    </p>
                    <p className="mt-1 text-xs text-[#a7a6b8]">
                      {formattedSubmissionTime
                        ? `Updated ${formattedSubmissionTime}`
                        : 'Saved to your team'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-xl font-bold text-[#f6f4fc] font-display">
                      Not Submitted Yet
                    </p>
                    <p className="mt-1 text-sm text-[#cac7e0] leading-relaxed">
                      Submit your game title, description, and GitHub repository.
                    </p>
                  </>
                )}
              </div>

              <Link
                to="/team/submission"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#00e5ff]/10 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-[#070714] border border-[#00e5ff]/40 text-xs font-bold uppercase tracking-wider transition"
              >
                {submission ? 'Manage Submission →' : 'Go to Game Submission →'}
              </Link>
            </div>
          </div>

          {/* Editable Team Members & Info Section */}
          {validTeamSize ? <MemberList
            team={{ ...team, minMembers: teamSize.min, maxMembers: teamSize.max }}
            canEditTeam={canEditTeam}
            registrationClosesAt={registrationClosesAt}
            onUpdateTeam={handleUpdateTeam}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          /> : <section role={settingsStatus === 'loading' ? 'status' : 'alert'} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-xl text-[#f6f4fc] font-bold">Team roster</h2>
            <p className="mt-2 text-[#a7a6b8]">{settingsStatus === 'loading' ? 'Loading team-size requirements…' : 'We could not load the team-size requirements. Retry to manage your roster.'}</p>
            {settingsStatus !== 'loading' && <button type="button" onClick={() => refreshEventSettings()} className="mt-4 rounded-full border border-[#00e5ff]/60 px-5 py-2 font-bold text-xs uppercase tracking-wider text-[#00e5ff] hover:bg-[#00e5ff]/10 transition">Retry team-size requirements</button>}
          </section>}
        </div>
      )}

      {/* Clean inline footer matching Register/Login */}
      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-body text-xs text-[#a7a6b8]">
        <a href="https://www.sesa.lk" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#f6f4fc]">SESA × IEEE SB UOK ↗</a>
        <span>© {new Date().getFullYear()} {settings?.event?.name || 'Cyberpunk Game Buildathon'}</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition hover:text-[#f6f4fc]">Back to top ↑</button>
      </footer>

      {/* Floating Home Dock */}
      <Dock />
    </div>
  );
}
