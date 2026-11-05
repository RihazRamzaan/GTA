import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { sampleTeam, sampleStates } from '../../data/sampleTeamData.js';
import TeamNav from '../../components/team/TeamNav.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import PaymentSlipArea from '../../components/team/PaymentSlipArea.jsx';
import { teamApi } from '../../api/team.js';

export default function PaymentPage() {
  const { user, team: authTeam, registration: authRegistration, loading } = useAuth();

  const mergedTeam = useMemo(() => {
    if (!authTeam) {
      return {
        ...sampleTeam,
        leader: {
          ...sampleTeam.leader,
          email: user?.email || sampleTeam.leader.email,
        },
      };
    }
    return {
      ...sampleTeam,
      id: authTeam.id || sampleTeam.id,
      name: authTeam.name || sampleTeam.name,
      code: authTeam.id ? `TEAM-${String(authTeam.id).slice(-4).toUpperCase()}` : sampleTeam.code,
      leader: {
        ...sampleTeam.leader,
        name: authTeam.leaderName || sampleTeam.leader.name,
        email: user?.email || authTeam.leaderEmail || sampleTeam.leader.email,
      },
    };
  }, [authTeam, user]);

  const initialStatus = authRegistration?.status || (authTeam ? 'waiting_for_slip' : 'waiting_for_approval');
  const [statusKey, setStatusKey] = useState(initialStatus);
  const [registration, setRegistration] = useState(
    authRegistration || sampleStates[initialStatus] || sampleStates.waiting_for_approval
  );
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (authRegistration) {
      setStatusKey(authRegistration.status);
      setRegistration(authRegistration);
    }
  }, [authRegistration]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

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
          showToast('Payment slip submitted successfully! Registration is now waiting for review.');
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
        fileName: paymentData.fileName,
        fileSize: paymentData.fileSize,
        slipPreviewUrl: paymentData.slipPreviewUrl,
        submittedAt: paymentData.submittedAt,
        rejectionReason: null,
      },
    };
    setStatusKey('waiting_for_approval');
    setRegistration(updated);
    showToast('Payment slip submitted successfully! Registration is now waiting for review.');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center font-body">
        <div className="inline-block w-10 h-10 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-bold text-white font-display">Checking Account Data...</p>
        <p className="text-sm text-slate-400 mt-1">Connecting to your signed-in profile</p>
      </div>
    );
  }

  const isUnregistered =
    (!user?.teamId && !authTeam && !authRegistration && statusKey === 'unregistered') ||
    statusKey === 'unregistered' ||
    (!user?.teamId && !authTeam && !authRegistration);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-4 py-2.5 rounded-xl font-bold font-body text-sm bg-neon-cyan text-black shadow-xl flex items-center gap-2">
            <span>✓</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <TeamNav
        team={isUnregistered ? null : mergedTeam}
        user={user}
        currentStatus={isUnregistered ? 'unregistered' : statusKey}
        onStatusChange={handleStatusChange}
      />

      {/* Status Notice */}
      <StatusBanner registration={isUnregistered ? null : registration} />

      {/* Unregistered Callout */}
      {isUnregistered ? (
        <div className="rounded-2xl border border-white/10 bg-night-card/80 backdrop-blur p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-3xl">
            💳
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Team Registration Required
            </h2>
            <p className="mt-2 text-slate-300 font-body text-base">
              You must register your team before submitting payment verification slips.
            </p>
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
              onClick={() => handleStatusChange('waiting_for_slip')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 text-slate-300 hover:text-white font-bold text-sm transition"
            >
              Preview Payment Slip Form
            </button>
          </div>
        </div>
      ) : (
        /* Bank-Slip Picker, Payment Reference, and Payment Date */
        <PaymentSlipArea
          registration={registration}
          onSubmitPayment={handleSubmitPayment}
        />
      )}
    </div>
  );
}
