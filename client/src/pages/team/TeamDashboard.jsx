import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { sampleTeam, sampleStates } from '../../data/sampleTeamData.js';
import TeamNav from '../../components/team/TeamNav.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import MemberList from '../../components/team/MemberList.jsx';
import PaymentSlipArea from '../../components/team/PaymentSlipArea.jsx';
import { teamApi } from '../../api/team.js';

// Helper to format backend team data into the shape expected by TeamDashboard
function formatTeamFromBackend(backendTeam, userEmail) {
  if (!backendTeam) return null;

  const leaderEmail = backendTeam.leaderEmail || userEmail;
  const leaderName = backendTeam.leaderName || 'Team Leader';

  // Filter out any member matching leaderEmail so the leader is only shown in the leader row
  const rawMembers = Array.isArray(backendTeam.members) ? backendTeam.members : [];
  const otherMembers = rawMembers.filter(
    (m) => m.email?.toLowerCase().trim() !== leaderEmail?.toLowerCase().trim()
  );

  const formattedMembers = otherMembers.map((m, idx) => ({
    id: m.id || m._id || `m-${idx + 1}`,
    name: m.name,
    email: m.email,
    role: m.role || (idx === 0 ? 'Lead Developer' : 'Developer & Designer'),
    university: m.university || 'University Student',
    phone: m.phone || '',
  }));

  return {
    id: backendTeam.id,
    name: backendTeam.name,
    code: backendTeam.id ? `TEAM-${String(backendTeam.id).slice(-4).toUpperCase()}` : 'TEAM-24',
    leader: {
      name: leaderName,
      email: leaderEmail,
      role: 'Team Leader',
      university: 'University Student',
      phone: '',
    },
    members: formattedMembers,
    maxMembers: 4,
    minMembers: 2,
  };
}

export default function TeamDashboard() {
  const { user, team: authTeam, registration: authRegistration, loading } = useAuth();

  // Team state (starts from authContext if available, never falls back to sampleTeam if authenticated)
  const [team, setTeam] = useState(() => {
    if (authTeam) {
      return formatTeamFromBackend(authTeam, user?.email);
    }
    return user?.teamId ? null : sampleTeam;
  });

  // Initial status based on real account registration, or sample if none
  const initialStatus = authRegistration?.status || (user?.teamId ? 'waiting_for_slip' : 'waiting_for_approval');
  const [statusKey, setStatusKey] = useState(initialStatus);
  const [registration, setRegistration] = useState(
    authRegistration || (user?.teamId ? null : sampleStates[initialStatus] || sampleStates.waiting_for_approval)
  );

  const [fetchingTeam, setFetchingTeam] = useState(Boolean(user?.teamId));

  // Fetch authoritative saved team & payment registration from /api/team/me
  useEffect(() => {
    let isMounted = true;
    if (user?.teamId) {
      setFetchingTeam(true);
      teamApi
        .getMyTeam()
        .then((data) => {
          if (!isMounted) return;
          if (data?.team) {
            setTeam(formatTeamFromBackend(data.team, user?.email));
          }
          if (data?.registration) {
            setStatusKey(data.registration.status);
            setRegistration(data.registration);
          }
        })
        .catch((err) => {
          console.warn('Could not load /api/team/me:', err);
          if (authTeam) {
            setTeam(formatTeamFromBackend(authTeam, user?.email));
          }
          if (authRegistration) {
            setStatusKey(authRegistration.status);
            setRegistration(authRegistration);
          }
        })
        .finally(() => {
          if (isMounted) setFetchingTeam(false);
        });
    } else {
      setFetchingTeam(false);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.teamId, user?.email]);

  // Feedback toast banner
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch status for previewing all states: not uploaded, waiting, approved, rejected, unregistered
  const handleStatusChange = (newKey) => {
    setStatusKey(newKey);
    if (newKey === 'unregistered') {
      setRegistration(null);
    } else {
      setRegistration(sampleStates[newKey] || sampleStates.waiting_for_approval);
    }
    const labels = {
      waiting_for_slip: 'Not Uploaded',
      waiting_for_approval: 'Waiting for Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      unregistered: 'Not Registered',
    };
    showToast(`Status switched to: ${labels[newKey] || newKey}`);
  };

  // Update team name and leader contact info (persisted to /api/team/me)
  const handleUpdateTeam = async (updatedData) => {
    const newName = updatedData.name || team?.name;
    const newLeader = updatedData.leader?.name || team?.leader?.name;
    if (user?.teamId) {
      try {
        const res = await teamApi.updateMyTeam({
          teamName: newName,
          leaderName: newLeader,
        });
        if (res?.team) {
          setTeam(formatTeamFromBackend(res.team, user?.email));
          showToast('Team details updated successfully.');
          return;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || 'Failed to update team details.';
        showToast(msg, 'error');
        return;
      }
    }
    setTeam((prev) => ({
      ...prev,
      name: newName,
      leader: {
        ...prev.leader,
        ...updatedData.leader,
      },
    }));
    showToast('Team and leader contact details updated successfully.');
  };

  // Add a new member (persisted to /api/team/me)
  const handleAddMember = async (newMember) => {
    if ((team?.members?.length || 0) + 1 >= (team?.maxMembers || 4)) {
      showToast('Maximum team size reached (4 members max).', 'error');
      return;
    }
    const updatedMembers = [...(team?.members || []), newMember];
    if (user?.teamId) {
      try {
        const res = await teamApi.updateMyTeam({
          members: updatedMembers.map((m) => ({ name: m.name, email: m.email })),
        });
        if (res?.team) {
          setTeam(formatTeamFromBackend(res.team, user?.email));
          showToast(`Added ${newMember.name} to the team roster.`);
          return;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || 'Failed to add member.';
        showToast(msg, 'error');
        return;
      }
    }
    setTeam((prev) => ({
      ...prev,
      members: updatedMembers,
    }));
    showToast(`Added ${newMember.name} to the team roster.`);
  };

  // Update an existing member (persisted to /api/team/me)
  const handleUpdateMember = async (updatedMember) => {
    const updatedMembers = (team?.members || []).map((m) =>
      m.id === updatedMember.id ? updatedMember : m
    );
    if (user?.teamId) {
      try {
        const res = await teamApi.updateMyTeam({
          members: updatedMembers.map((m) => ({ name: m.name, email: m.email })),
        });
        if (res?.team) {
          setTeam(formatTeamFromBackend(res.team, user?.email));
          showToast(`Updated details for ${updatedMember.name}.`);
          return;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || 'Failed to update member.';
        showToast(msg, 'error');
        return;
      }
    }
    setTeam((prev) => ({
      ...prev,
      members: updatedMembers,
    }));
    showToast(`Updated details for ${updatedMember.name}.`);
  };

  // Remove a member (persisted to /api/team/me)
  const handleDeleteMember = async (memberId) => {
    if ((team?.members?.length || 0) + 1 <= (team?.minMembers || 2)) {
      showToast('Cannot remove: Teams must have at least 2 members.', 'error');
      return;
    }
    const memberToRemove = team?.members?.find((m) => m.id === memberId);
    const updatedMembers = (team?.members || []).filter((m) => m.id !== memberId);
    if (user?.teamId) {
      try {
        const res = await teamApi.updateMyTeam({
          members: updatedMembers.map((m) => ({ name: m.name, email: m.email })),
        });
        if (res?.team) {
          setTeam(formatTeamFromBackend(res.team, user?.email));
          showToast(`Removed ${memberToRemove?.name || 'member'} from the team.`);
          return;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || 'Failed to remove member.';
        showToast(msg, 'error');
        return;
      }
    }
    setTeam((prev) => ({
      ...prev,
      members: updatedMembers,
    }));
    showToast(`Removed ${memberToRemove?.name || 'member'} from the team.`);
  };

  // Handle payment form submission (slip file, reference, date)
  const handleSubmitPayment = async (paymentData) => {
    // If authenticated team and real file attached, send to backend API
    if (user?.teamId && paymentData.file) {
      try {
        const formData = new FormData();
        formData.append('reference', paymentData.reference);
        formData.append('date', paymentData.paymentDate);
        formData.append('slip', paymentData.file);

        const res = await teamApi.submitPayment(formData);
        if (res?.registration) {
          setStatusKey(res.registration.status);
          setRegistration({
            ...res.registration,
            payment: {
              ...res.registration.payment,
              fileName: paymentData.fileName,
              fileSize: paymentData.fileSize,
              slipPreviewUrl: paymentData.slipPreviewUrl,
            },
          });
          const successMsg =
            statusKey === 'rejected'
              ? 'Replacement payment slip submitted successfully! Registration is now waiting for review.'
              : 'Payment slip submitted successfully! Registration is now waiting for review.';
          showToast(successMsg);
          return;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || 'Payment submission failed.';
        showToast(msg, 'error');
        return;
      }
    }

    // Client-side state fallback (e.g. preview mode)
    const updated = {
      ...(registration || sampleStates.waiting_for_slip),
      status: 'waiting_for_approval',
      payment: {
        ...(registration?.payment || {}),
        reference: paymentData.reference,
        paymentDate: paymentData.paymentDate,
        date: paymentData.paymentDate,
        fileName: paymentData.fileName,
        fileSize: paymentData.fileSize,
        slipPreviewUrl: paymentData.slipPreviewUrl,
        submittedAt: paymentData.submittedAt,
        rejectionReason: null,
      },
    };

    setStatusKey('waiting_for_approval');
    setRegistration(updated);
    const successMsg =
      statusKey === 'rejected'
        ? 'Replacement payment slip submitted successfully! Registration is now waiting for review.'
        : 'Payment slip submitted successfully! Registration is now waiting for review.';
    showToast(successMsg);
  };

  // Loading state
  if (loading || (user?.teamId && fetchingTeam && !team)) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center font-body">
        <div className="inline-block w-10 h-10 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold text-white font-display">Loading Team Details...</p>
        <p className="text-sm text-slate-400 mt-1">Connecting to your registered team</p>
      </div>
    );
  }

  // Account has no registration check
  const isUnregistered =
    (!user?.teamId && !authTeam && !team?.id && statusKey === 'unregistered') ||
    statusKey === 'unregistered' ||
    (!user?.teamId && !authTeam && !team?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
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
        currentStatus={isUnregistered ? 'unregistered' : statusKey}
        onStatusChange={handleStatusChange}
      />

      {/* Registration Status Banner (Unregistered, Not Uploaded, Waiting, Approved, or Rejected) */}
      <StatusBanner registration={isUnregistered ? null : registration} />

      {/* If account has no registration yet, show clear Register call-to-action */}
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
              Welcome, <span className="text-neon-cyan font-mono font-medium">{user?.email}</span>. Your account is verified, but you have not registered a team for the Cyberpunk Game Buildathon yet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Team Size</span>
              <span className="text-white font-semibold">2 – 4 Developers</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Entry Fee</span>
              <span className="text-white font-semibold">LKR 4,000 / Team</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold font-display tracking-wider text-sm shadow-lg shadow-neon-cyan/20 transition transform hover:-translate-y-0.5 text-center"
            >
              REGISTER TEAM NOW →
            </Link>
            <button
              type="button"
              onClick={() => handleStatusChange('waiting_for_approval')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 text-slate-300 hover:text-white font-bold text-sm transition"
            >
              Preview Example Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Editable Team Members & Contact Details Section */}
          <MemberList
            team={team}
            onUpdateTeam={handleUpdateTeam}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />

          {/* Bank-Slip Picker, Payment Reference, and Payment Date Section */}
          <PaymentSlipArea
            registration={registration}
            onSubmitPayment={handleSubmitPayment}
          />
        </>
      )}
    </div>
  );
}
