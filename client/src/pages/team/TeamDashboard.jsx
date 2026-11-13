import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiError } from '../../api/http.js';
import { teamApi } from '../../api/team.js';
import MemberList from '../../components/team/MemberList.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import TeamNav from '../../components/team/TeamNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useEventSettings from '../../hooks/useEventSettings.js';
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
    maxMembers: 4,
    minMembers: 2,
  };
}

export default function TeamDashboard() {
  const { user, loading: authLoading, refresh } = useAuth();
  const { status: settingsStatus, settings } = useEventSettings();

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
    const maxMembers = dashboard.team?.maxMembers || 4;
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
    const minMembers = dashboard.team?.minMembers || 2;
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
      <div className="max-w-5xl mx-auto py-24 text-center font-body">
        <div className="inline-block w-10 h-10 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold text-white font-display">Loading Team Details...</p>
        <p className="text-sm text-slate-400 mt-1">
          Fetching your registration and roster from the server
        </p>
      </div>
    );
  }

  // Real error state (never falls back to sample team data)
  if (fetchError) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body">
        <TeamNav team={null} user={user} currentStatus={null} />

        <div
          role="alert"
          className="rounded-2xl border border-red-500/40 bg-night-card p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xl"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Unable to Load Team Details
          </h2>
          <p className="text-slate-300 text-base">{fetchError.message}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => loadTeam()}
              className="px-6 py-2.5 rounded-xl bg-neon-cyan hover:opacity-90 text-black font-bold text-sm transition"
            >
              Try Again
            </button>
            {fetchError.code === 'UNAUTHENTICATED' && (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-bold text-sm transition"
              >
                Log In Again
              </Link>
            )}
          </div>
        </div>
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
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body">
      {/* Toast Notification */}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-2.5 rounded-xl font-bold font-body text-sm shadow-xl flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-neon-cyan text-black'
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
        <div className="rounded-2xl border border-white/10 bg-night-card/80 backdrop-blur p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-3xl">
            🎮
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Register Your Team to Begin
            </h2>
            <p className="mt-2 text-slate-300 font-body text-base">
              Welcome, <span className="text-neon-cyan font-mono font-medium">{user?.email}</span>. Your account is signed in, but no team registration was found for it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                Team Size
              </span>
              <span className="text-white font-semibold">2 – 4 Members</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                Entry Fee
              </span>
              <span className="text-emerald-300 font-semibold">Free Registration</span>
            </div>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold font-display tracking-wider text-sm shadow-lg shadow-neon-cyan/20 transition transform hover:-translate-y-0.5 text-center"
            >
              REGISTER TEAM NOW →
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Key Journey Summary & Game Submission Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-night-card p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Registration
              </span>
              <p className="mt-1 text-lg font-bold text-white font-display">
                {registration?.status === 'approved' ? 'Confirmed' : 'Pending'}
              </p>
              <p className="mt-1 text-sm text-emerald-300 font-semibold">
                Free entry — no payment required
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-night-card p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Roster Editing
              </span>
              <p className="mt-1 text-lg font-bold text-white font-display">
                {canEditTeam ? 'Open' : 'Locked'}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {canEditTeam
                  ? 'You can edit team & member details until registration closes.'
                  : 'Registration has closed; roster changes are locked.'}
              </p>
            </div>

            <div className="rounded-2xl border border-neon-cyan/30 bg-night-card p-5 flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Game Submission
                </span>
                {submission ? (
                  <>
                    <p className="mt-1 text-lg font-bold text-emerald-300 font-display truncate">
                      ✓ {submission.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formattedSubmissionTime
                        ? `Updated ${formattedSubmissionTime}`
                        : 'Saved to your team'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-lg font-bold text-white font-display">
                      Not Submitted Yet
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Submit your game title, description, and GitHub repository. Playable and video links are optional.
                    </p>
                  </>
                )}
              </div>

              <Link
                to="/team/submission"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/40 text-sm font-bold transition"
              >
                {submission ? 'Manage Submission →' : 'Go to Game Submission →'}
              </Link>
            </div>
          </div>

          {/* Editable Team Members & Info Section */}
          <MemberList
            team={team}
            canEditTeam={canEditTeam}
            registrationClosesAt={registrationClosesAt}
            onUpdateTeam={handleUpdateTeam}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        </>
      )}
    </div>
  );
}
