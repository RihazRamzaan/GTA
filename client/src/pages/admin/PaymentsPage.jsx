import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav.jsx';
import {
  getRegistrations,
  reviewRegistration,
  getRegistrationSlipUrl,
} from '../../api/admin.js';

export default function PaymentsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'waiting_for_approval' | 'approved' | 'rejected' | 'waiting_for_slip'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionAlert, setActionAlert] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getRegistrations();
      if (res.data?.success) {
        const rawList = res.data.data || [];
        const formatted = rawList.map((reg) => {
          const t = reg.team || {};
          const p = reg.payment || {};
          const membersCount =
            Array.isArray(reg.members) && reg.members.length > 0
              ? reg.members.length
              : Array.isArray(t.members) && t.members.length > 0
              ? t.members.length + 1
              : 1;

          return {
            id: reg.id || reg._id,
            teamId: reg.teamId || t.id || t._id,
            teamName: reg.teamName || t.name || 'Unnamed Squad',
            leaderName: reg.leaderName || t.leaderName || 'Unknown Leader',
            leaderEmail: reg.leaderEmail || t.leaderEmail || '',
            membersCount,
            feeAmount: reg.feeAmount ? `LKR ${Number(reg.feeAmount).toLocaleString()}` : 'LKR 4,000',
            status: reg.status || 'waiting_for_slip',
            createdAt: reg.createdAt
              ? new Date(reg.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent',
            payment:
              p.reference && p.reference !== '—'
                ? {
                    reference: p.reference,
                    date: p.date
                      ? new Date(p.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—',
                    submittedAt: p.submittedAt
                      ? new Date(p.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Submitted',
                    slipMime: p.slipMime || 'image/png',
                    slipFileName:
                      p.slipMime === 'application/pdf'
                        ? 'payment_receipt.pdf'
                        : 'payment_slip.png',
                    bankName: p.bankName || 'Bank Transfer',
                    senderAccount: p.senderAccount || '—',
                    hasSlip: Boolean(p.hasSlip),
                    reviewedAt: p.reviewedAt,
                    reviewedBy: p.reviewedBy,
                    rejectionReason: p.rejectionReason,
                  }
                : null,
          };
        });
        setRegistrations(formatted);
      }
    } catch (err) {
      console.error('Failed to load payment registrations:', err);
      const message =
        err.response?.status === 401 || err.response?.status === 403
          ? 'Admin authorization required. Please sign in with an admin account.'
          : err.response?.data?.error?.message || 'Could not fetch payments from server.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchRegistrations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Actions
  const handleApprove = async (regId) => {
    setIsProcessing(true);
    try {
      // Attempt backend review API call (wired for Day 5)
      await reviewRegistration(regId, { status: 'approved' });
      triggerAlert('Payment approved! Registration is now verified in database.', 'success');
      fetchRegistrations();
    } catch (err) {
      // On Day 04, if review mutation returns 501 NOT_IMPLEMENTED, handle gracefully
      if (err.response?.status === 501) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === regId
              ? {
                  ...reg,
                  status: 'approved',
                  payment: reg.payment
                    ? {
                        ...reg.payment,
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: 'Admin (Rihaz)',
                        rejectionReason: null,
                      }
                    : null,
                }
              : reg
          )
        );
        const team = registrations.find((r) => r.id === regId);
        triggerAlert(
          `Payment verified for ${team ? team.teamName : 'Team'} (Day 04 UI preview). Permanent review backend hooks will merge on Day 05.`,
          'success'
        );
      } else {
        triggerAlert(err.response?.data?.error?.message || 'Failed to approve payment.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setSelectedSlip(null);
    }
  };

  const handleOpenRejectModal = (reg) => {
    setRejectingItem(reg);
    setRejectionReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setIsProcessing(true);
    const regId = rejectingItem.id;
    const teamName = rejectingItem.teamName;
    const reasonText = rejectionReason.trim();

    try {
      await reviewRegistration(regId, {
        status: 'rejected',
        rejectionReason: reasonText,
      });
      triggerAlert(`Payment rejected for ${teamName}. Team may re-upload a corrected slip.`, 'error');
      fetchRegistrations();
    } catch (err) {
      if (err.response?.status === 501) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === regId
              ? {
                  ...reg,
                  status: 'rejected',
                  payment: reg.payment
                    ? {
                        ...reg.payment,
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: 'Admin (Rihaz)',
                        rejectionReason: reasonText,
                      }
                    : null,
                }
              : reg
          )
        );
        triggerAlert(
          `Payment marked rejected for ${teamName} (Day 04 UI preview). Reason logged.`,
          'error'
        );
      } else {
        triggerAlert(err.response?.data?.error?.message || 'Failed to reject payment.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setRejectingItem(null);
      setSelectedSlip(null);
    }
  };

  const triggerAlert = (message, type) => {
    setActionAlert({ message, type });
    setTimeout(() => setActionAlert(null), 4000);
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesFilter = filter === 'all' || reg.status === filter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      reg.teamName.toLowerCase().includes(query) ||
      reg.leaderName.toLowerCase().includes(query) ||
      reg.leaderEmail.toLowerCase().includes(query) ||
      (reg.payment && reg.payment.reference.toLowerCase().includes(query));
    return matchesFilter && matchesQuery;
  });

  const pendingCount = registrations.filter((r) => r.status === 'waiting_for_approval').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const waitingSlipCount = registrations.filter((r) => r.status === 'waiting_for_slip').length;

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Nav */}
      <AdminNav activeTab="payments" />

      {/* Action Toast Feedback Alert */}
      {actionAlert && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 ${
              actionAlert.type === 'success'
                ? 'bg-[#071d15] border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.3)]'
                : 'bg-[#220a0d] border-red-500/50 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
            }`}
          >
            <span className="text-lg">
              {actionAlert.type === 'success' ? '✓' : '⚠'}
            </span>
            <span className="text-xs font-semibold font-mono tracking-wide">
              {actionAlert.message}
            </span>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff2bd6]/30 bg-[#ff2bd6]/10 text-[#ff2bd6] text-xs font-semibold tracking-widest uppercase mb-2">
            <span>ADMIN CONTROLS • PAYMENT AUDIT & SLIPS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            PAYMENT <span className="text-[#ff2bd6] drop-shadow-[0_0_10px_rgba(255,43,214,0.6)]">VERIFICATION</span>
          </h2>
          <p className="text-sm text-[#9aa7c1] mt-1 max-w-2xl">
            Audit team registration fees, inspect uploaded bank deposit slips and transaction references, and prepare team verifications for competition access.
          </p>
        </div>

        {/* Quick Stats Banner & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0d0f24] border border-white/10">
            <div className="px-3 py-1.5 rounded-xl bg-[#ff2bd6]/10 border border-[#ff2bd6]/30 text-xs">
              <span className="text-[#ff2bd6] font-bold">Pending: </span>
              <span className="font-bold text-white font-mono">{pendingCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <span className="text-emerald-400 font-bold">Approved: </span>
              <span className="font-bold text-white font-mono">{approvedCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <span className="text-amber-400 font-bold">Awaiting Slip: </span>
              <span className="font-bold text-white font-mono">{waitingSlipCount}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchRegistrations}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#0d0f24] border border-white/10 hover:border-[#ff2bd6]/40 text-[#9aa7c1] hover:text-white transition-all disabled:opacity-50"
            title="Refresh Payments"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#ff2bd6]' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchRegistrations}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold uppercase transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'ALL PAYMENTS' },
            { id: 'waiting_for_approval', label: 'PENDING REVIEW' },
            { id: 'approved', label: 'APPROVED' },
            { id: 'rejected', label: 'REJECTED' },
            { id: 'waiting_for_slip', label: 'NO SLIP YET' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all uppercase whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-[#ff2bd6] to-[#8b3dff] text-white shadow-[0_0_15px_rgba(255,43,214,0.3)] font-["Orbitron",sans-serif]'
                  : 'bg-[#0d0f24] border border-white/10 text-[#9aa7c1] hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search team, leader, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 pl-9 bg-[#0d0f24] border border-white/10 rounded-xl text-white text-xs placeholder-[#9aa7c1]/60 focus:outline-none focus:border-[#ff2bd6] transition-colors"
          />
          <svg
            className="w-4 h-4 text-[#9aa7c1] absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Payment Audit Table */}
      <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070714] text-[#9aa7c1] uppercase font-['Orbitron',sans-serif] tracking-wider text-[11px]">
                <th className="py-4 px-4 font-bold">Squad & Leader</th>
                <th className="py-4 px-4 font-bold">Bank Reference</th>
                <th className="py-4 px-4 font-bold">Fee Amount</th>
                <th className="py-4 px-4 font-bold text-center">Slip Evidence</th>
                <th className="py-4 px-4 font-bold text-center">Status</th>
                <th className="py-4 px-4 font-bold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && registrations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#9aa7c1]">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#ff2bd6] animate-ping"></span>
                      <span className="text-sm">Loading payment registrations from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#9aa7c1]">
                    {registrations.length === 0 ? (
                      <div>
                        <svg className="w-10 h-10 mx-auto text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-semibold text-white">No payment registrations recorded yet.</p>
                        <p className="text-xs text-[#9aa7c1] mt-1">Registrations will appear here as teams register and submit payment slips.</p>
                      </div>
                    ) : (
                      <p className="text-sm">No payment records match your filter criteria.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Team & Leader */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-base">{reg.teamName}</div>
                      <div className="text-xs text-[#9aa7c1] mt-0.5">
                        {reg.leaderName} • <span className="font-mono text-white/70">{reg.leaderEmail}</span>
                      </div>
                      <div className="text-[10px] text-[#00e5ff] mt-0.5 font-mono">
                        {reg.membersCount} Members Registered
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="py-4 px-4">
                      {reg.payment ? (
                        <div>
                          <div className="font-mono font-bold text-white text-sm">
                            {reg.payment.reference}
                          </div>
                          <div className="text-[11px] text-[#9aa7c1]">
                            {reg.payment.bankName}
                          </div>
                          <div className="text-[10px] text-[#00e5ff] font-mono mt-0.5">
                            Paid: {reg.payment.date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#9aa7c1] font-mono italic">No reference submitted</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white font-mono">{reg.feeAmount}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Standard Reg Fee</div>
                    </td>

                    {/* Evidence Document */}
                    <td className="py-4 px-4 text-center">
                      {reg.payment ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlip(reg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 text-xs font-semibold transition-all group"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Evidence</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#9aa7c1] font-mono italic">
                          Slip pending
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      {reg.status === 'waiting_for_approval' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono bg-[#ff2bd6]/15 text-[#ff2bd6] border-[#ff2bd6]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2bd6] shadow-[0_0_8px_#ff2bd6]"></span>
                          WAITING APPROVAL
                        </span>
                      )}
                      {reg.status === 'approved' && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                            VERIFIED
                          </span>
                          {reg.payment && reg.payment.reviewedBy && (
                            <div className="text-[9px] text-[#9aa7c1] mt-0.5">
                              By {reg.payment.reviewedBy}
                            </div>
                          )}
                        </div>
                      )}
                      {reg.status === 'rejected' && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono bg-red-500/15 text-red-400 border-red-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]"></span>
                            REJECTED
                          </span>
                          {reg.payment && reg.payment.rejectionReason && (
                            <div className="text-[10px] text-red-300/80 mt-1 max-w-[200px] truncate" title={reg.payment.rejectionReason}>
                              {reg.payment.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}
                      {reg.status === 'waiting_for_slip' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
                          AWAITING SLIP
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {reg.status === 'waiting_for_approval' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(reg.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleOpenRejectModal(reg)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : reg.status === 'rejected' ? (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(reg.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          Override Approve
                        </button>
                      ) : (
                        <span className="text-xs text-[#9aa7c1] font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Evidence Inspection Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0d0f24] border border-[#00e5ff]/40 shadow-[0_0_50px_rgba(0,229,255,0.2)] p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#00e5ff] font-['Orbitron',sans-serif] font-bold">
                  Payment Verification Dossier
                </div>
                <h3 className="text-xl font-bold text-white font-['Orbitron',sans-serif]">
                  {selectedSlip.teamName}
                </h3>
                <div className="text-xs text-[#9aa7c1]">
                  Leader: {selectedSlip.leaderName} ({selectedSlip.leaderEmail})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="text-[#9aa7c1] hover:text-white p-1 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Evidence Card */}
            <div className="bg-[#070714] rounded-xl p-5 border border-white/10 mb-6">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs">
                <span className="text-[#9aa7c1]">Slip Document:</span>
                <span className="font-mono text-[#00e5ff]">{selectedSlip.payment.slipFileName}</span>
              </div>

              {/* Bank Slip Visual Card */}
              <div className="relative rounded-lg border-2 border-dashed border-[#00e5ff]/30 bg-[#0b1020] p-6 text-center my-4">
                <div className="w-12 h-12 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-white font-['Orbitron',sans-serif] mb-1">
                  OFFICIAL BANK TRANSFER SLIP
                </div>
                <div className="text-xs text-[#9aa7c1] max-w-sm mx-auto space-y-1 font-mono">
                  <div>Bank: <span className="text-white">{selectedSlip.payment.bankName}</span></div>
                  <div>Transaction Reference: <span className="text-[#00e5ff] font-bold">{selectedSlip.payment.reference}</span></div>
                  <div>Amount: <span className="text-emerald-400 font-bold">{selectedSlip.feeAmount}</span></div>
                  <div>Payment Date: <span className="text-white">{selectedSlip.payment.date}</span></div>
                </div>

                {/* Secure Slip Stream Link (ready for Day 5) */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <a
                    href={getRegistrationSlipUrl(selectedSlip.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#00e5ff] hover:text-white font-bold tracking-wide underline transition-colors"
                  >
                    <span>View / Download Uploaded Slip Evidence</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {selectedSlip.payment.rejectionReason && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <span className="font-bold">Prior Rejection Reason: </span>
                  {selectedSlip.payment.rejectionReason}
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#9aa7c1]">
                Status: <span className="uppercase text-white font-bold">{selectedSlip.status}</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                >
                  Close
                </button>
                {selectedSlip.status === 'waiting_for_approval' && (
                  <>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleOpenRejectModal(selectedSlip)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-xs font-bold font-['Orbitron',sans-serif] disabled:opacity-50"
                    >
                      Reject Slip
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(selectedSlip.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(52,211,153,0.4)] disabled:opacity-50"
                    >
                      Approve & Verify
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Slip Reason Modal (FR-05) */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-[#0d0f24] border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2)] p-6">
            <h3 className="text-lg font-bold text-white font-['Orbitron',sans-serif] mb-2">
              Reject Payment Evidence
            </h3>
            <p className="text-xs text-[#9aa7c1] mb-4">
              Please state why this slip was rejected for <span className="text-white font-bold">{rejectingItem.teamName}</span>. This reason will be displayed on their team dashboard so they can upload a replacement slip.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9aa7c1] mb-2 font-['Orbitron',sans-serif]">
                  Rejection Reason
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Transaction reference is blurred or illegible. Please upload a clear photo of the deposit slip."
                  required
                  className="w-full p-3 bg-[#070714] border border-red-500/30 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                ></textarea>
              </div>

              {/* Preset quick reasons */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#9aa7c1] font-bold">Quick Select:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Reference number unreadable',
                    'Amount does not match fee',
                    'Slip image cut off or blurry',
                    'Duplicate transaction reference',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
