import React, { useState } from 'react';
import AdminNav from '../../components/admin/AdminNav.jsx';

export default function PaymentsPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'waiting_for_approval' | 'approved' | 'rejected' | 'waiting_for_slip'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionAlert, setActionAlert] = useState(null);

  // Day 01 Mock Registrations & Payment Evidence
  const [registrations, setRegistrations] = useState([
    {
      id: 'reg_01',
      teamId: 'team_01',
      teamName: 'CyberVanguard',
      leaderName: 'Kavindu Perera',
      leaderEmail: 'kavindu@cybervanguard.io',
      membersCount: 4,
      feeAmount: 'LKR 4,000',
      status: 'waiting_for_approval',
      payment: {
        reference: 'BOC-99281729',
        date: '2026-10-31',
        submittedAt: 'Today, 14:15',
        slipMime: 'image/png',
        slipFileName: 'boc_transfer_receipt_99281.png',
        bankName: 'Bank of Ceylon (BOC)',
        senderAccount: '•••• 4921',
      },
    },
    {
      id: 'reg_02',
      teamId: 'team_02',
      teamName: 'NexusRebels',
      leaderName: 'Ayesha Senanayake',
      leaderEmail: 'ayesha.s@gmail.com',
      membersCount: 3,
      feeAmount: 'LKR 4,000',
      status: 'waiting_for_approval',
      payment: {
        reference: 'COMB-44810293',
        date: '2026-10-31',
        submittedAt: 'Today, 13:40',
        slipMime: 'application/pdf',
        slipFileName: 'commercial_bank_slip.pdf',
        bankName: 'Commercial Bank of Ceylon',
        senderAccount: '•••• 1109',
      },
    },
    {
      id: 'reg_03',
      teamId: 'team_03',
      teamName: 'ZeroLag Collective',
      leaderName: 'Dilan Fonseka',
      leaderEmail: 'dilan@zerolag.dev',
      membersCount: 4,
      feeAmount: 'LKR 4,000',
      status: 'waiting_for_approval',
      payment: {
        reference: 'HNB-77319940',
        date: '2026-10-31',
        submittedAt: 'Today, 11:22',
        slipMime: 'image/jpeg',
        slipFileName: 'hnb_online_transfer.jpg',
        bankName: 'Hatton National Bank (HNB)',
        senderAccount: '•••• 8832',
      },
    },
    {
      id: 'reg_04',
      teamId: 'team_04',
      teamName: 'NeonDrifters',
      leaderName: 'Sachini Wickramasinghe',
      leaderEmail: 'sachini@drifters.lk',
      membersCount: 4,
      feeAmount: 'LKR 4,000',
      status: 'approved',
      payment: {
        reference: 'SAMP-10293847',
        date: '2026-10-30',
        submittedAt: 'Yesterday, 16:50',
        slipMime: 'image/png',
        slipFileName: 'sampath_receipt.png',
        bankName: 'Sampath Bank PLC',
        senderAccount: '•••• 7741',
        reviewedAt: '2026-10-30T17:10:00Z',
        reviewedBy: 'Admin (Rihaz)',
      },
    },
    {
      id: 'reg_05',
      teamId: 'team_05',
      teamName: 'PixelSyndicate',
      leaderName: 'Nuwan Alwis',
      leaderEmail: 'nuwan.a@pixelsyndicate.dev',
      membersCount: 3,
      feeAmount: 'LKR 4,000',
      status: 'approved',
      payment: {
        reference: 'BOC-33829104',
        date: '2026-10-30',
        submittedAt: 'Yesterday, 12:05',
        slipMime: 'image/jpeg',
        slipFileName: 'deposit_slip_boc.jpg',
        bankName: 'Bank of Ceylon',
        senderAccount: '•••• 3390',
        reviewedAt: '2026-10-30T13:00:00Z',
        reviewedBy: 'Admin (Rihaz)',
      },
    },
    {
      id: 'reg_06',
      teamId: 'team_06',
      teamName: 'QuantumGlitchers',
      leaderName: 'Tharindu Gamage',
      leaderEmail: 'tharindu@glitchers.com',
      membersCount: 4,
      feeAmount: 'LKR 4,000',
      status: 'rejected',
      payment: {
        reference: 'COMB-00192837',
        date: '2026-10-29',
        submittedAt: '2 days ago',
        slipMime: 'image/png',
        slipFileName: 'invalid_receipt_scan.png',
        bankName: 'Commercial Bank',
        senderAccount: '•••• 6620',
        reviewedAt: '2026-10-29T18:30:00Z',
        reviewedBy: 'Admin (Rihaz)',
        rejectionReason: 'Bank transfer reference number is unreadable on the uploaded image. Please re-upload a clear photograph of the deposit receipt.',
      },
    },
    {
      id: 'reg_07',
      teamId: 'team_07',
      teamName: 'AeroForge Games',
      leaderName: 'Rashmika Bandara',
      leaderEmail: 'rashmika@aeroforge.io',
      membersCount: 2,
      feeAmount: 'LKR 4,000',
      status: 'waiting_for_slip',
      payment: null,
    },
  ]);

  // Actions
  const handleApprove = (regId) => {
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
    setSelectedSlip(null);
    const team = registrations.find((r) => r.id === regId);
    triggerAlert(`Payment approved for ${team ? team.teamName : 'Team'}! Registration is now verified.`, 'success');
  };

  const handleOpenRejectModal = (reg) => {
    setRejectingItem(reg);
    setRejectionReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === rejectingItem.id
          ? {
              ...reg,
              status: 'rejected',
              payment: reg.payment
                ? {
                    ...reg.payment,
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: 'Admin (Rihaz)',
                    rejectionReason: rejectionReason.trim(),
                  }
                : null,
            }
          : reg
      )
    );

    const teamName = rejectingItem.teamName;
    setRejectingItem(null);
    setSelectedSlip(null);
    triggerAlert(`Payment rejected for ${teamName}. Team may re-upload a corrected slip.`, 'error');
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

  const counts = {
    all: registrations.length,
    waiting_for_approval: registrations.filter((r) => r.status === 'waiting_for_approval').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
    waiting_for_slip: registrations.filter((r) => r.status === 'waiting_for_slip').length,
  };

  return (
    <div className="pb-16 font-['Rajdhani',sans-serif]">
      {/* Admin Nav */}
      <AdminNav activeTab="payments" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-white/5 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff2bd6]/30 bg-[#ff2bd6]/10 text-[#ff2bd6] text-xs font-semibold tracking-widest uppercase mb-2">
            <span>FINANCIAL VERIFICATION • FR-05 / FR-09</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',sans-serif]">
            PAYMENT <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">REVIEWS</span>
          </h2>
          <p className="text-sm text-[#9aa7c1] mt-1">
            Review submitted bank transfer slips, audit transaction references, and approve team eligibility to compete.
          </p>
        </div>

        {/* Global Security Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto px-3.5 py-2 rounded-xl bg-[#070714] border border-[#00e5ff]/20 text-xs text-[#00e5ff] font-mono">
          <svg className="w-4 h-4 text-[#00e5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Private Object Storage • Protected Access</span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-fadeIn border ${
            actionAlert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {actionAlert.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{actionAlert.message}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', label: 'All Teams', count: counts.all },
            { id: 'waiting_for_approval', label: 'Awaiting Review', count: counts.waiting_for_approval, highlight: true },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'waiting_for_slip', label: 'No Slip Yet', count: counts.waiting_for_slip },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-['Orbitron',sans-serif] tracking-wider transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'bg-[#0d0f24] text-[#9aa7c1] hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === tab.id
                    ? 'bg-black text-white'
                    : tab.highlight && tab.count > 0
                    ? 'bg-[#ff2bd6] text-white'
                    : 'bg-white/10 text-[#9aa7c1]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9aa7c1]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team, leader or reference..."
            className="w-full pl-10 pr-4 py-2 bg-[#070714] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] transition-colors"
          />
        </div>
      </div>

      {/* Registrations & Payment Evidence Table */}
      <div className="rounded-2xl bg-[#0d0f24]/90 border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-[#9aa7c1] uppercase font-['Orbitron',sans-serif] bg-white/[0.02] border-b border-white/10">
                <th className="py-3.5 px-4">Team & Leader</th>
                <th className="py-3.5 px-4">Bank Reference</th>
                <th className="py-3.5 px-4">Fee Amount</th>
                <th className="py-3.5 px-4">Slip Evidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#9aa7c1]">
                    No registrations found matching the selected filter or query.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Team Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-base">{reg.teamName}</div>
                      <div className="text-xs text-[#9aa7c1]">
                        {reg.leaderName} • <span className="font-mono text-white/70">{reg.leaderEmail}</span>
                      </div>
                      <div className="text-[11px] text-[#00e5ff]/80 mt-0.5">
                        {reg.membersCount} Members Registered
                      </div>
                    </td>

                    {/* Bank Reference */}
                    <td className="py-4 px-4">
                      {reg.payment ? (
                        <div>
                          <div className="font-mono text-xs text-[#00e5ff] bg-[#070714] px-2.5 py-1 rounded border border-[#00e5ff]/20 inline-block font-bold">
                            {reg.payment.reference}
                          </div>
                          <div className="text-[11px] text-[#9aa7c1] mt-1">
                            {reg.payment.bankName}
                          </div>
                          <div className="text-[10px] text-[#9aa7c1]/70 font-mono">
                            Paid: {reg.payment.date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9aa7c1] italic">No transaction details</span>
                      )}
                    </td>

                    {/* Fee Amount */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white font-mono">{reg.feeAmount}</div>
                      <span className="text-[10px] text-[#9aa7c1]">Standard Team Fee</span>
                    </td>

                    {/* Slip Evidence */}
                    <td className="py-4 px-4">
                      {reg.payment ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlip(reg)}
                          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-semibold transition-all"
                        >
                          <svg className="w-4 h-4 text-[#00e5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Inspect Evidence</span>
                        </button>
                      ) : (
                        <span className="text-xs text-amber-400/80 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                          Awaiting Slip
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {reg.status === 'waiting_for_approval' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ff2bd6]/15 text-[#ff2bd6] border border-[#ff2bd6]/30 font-['Orbitron',sans-serif]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2bd6] animate-pulse"></span>
                          <span>Pending Review</span>
                        </span>
                      )}
                      {reg.status === 'approved' && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-['Orbitron',sans-serif]">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Approved</span>
                          </span>
                          {reg.payment && reg.payment.reviewedBy && (
                            <div className="text-[10px] text-[#9aa7c1] mt-1">
                              By {reg.payment.reviewedBy}
                            </div>
                          )}
                        </div>
                      )}
                      {reg.status === 'rejected' && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 font-['Orbitron',sans-serif]">
                            <span>Rejected</span>
                          </span>
                          {reg.payment && reg.payment.rejectionReason && (
                            <div className="text-[10px] text-red-300/80 mt-1 max-w-[200px] truncate" title={reg.payment.rejectionReason}>
                              {reg.payment.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}
                      {reg.status === 'waiting_for_slip' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-['Orbitron',sans-serif]">
                          <span>Pending Slip</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {reg.status === 'waiting_for_approval' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(reg.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-['Orbitron',sans-serif] tracking-wider transition-all"
                          >
                            APPROVE
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(reg)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-xs font-bold font-['Orbitron',sans-serif] tracking-wider transition-all"
                          >
                            REJECT
                          </button>
                        </div>
                      ) : reg.status === 'rejected' ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(reg.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-semibold transition-all"
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
          <div className="w-full max-w-2xl rounded-2xl bg-[#0d0f24] border border-[#00e5ff]/40 shadow-[0_0_50px_rgba(0,229,255,0.2)] p-6 relative">
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

            {/* Evidence Card Simulation */}
            <div className="bg-[#070714] rounded-xl p-5 border border-white/10 mb-6">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs">
                <span className="text-[#9aa7c1]">Slip Document:</span>
                <span className="font-mono text-[#00e5ff]">{selectedSlip.payment.slipFileName}</span>
              </div>

              {/* Mock Bank Slip Visual Preview */}
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
                  <div>Account: <span className="text-white">{selectedSlip.payment.senderAccount}</span></div>
                  <div>Amount Verified: <span className="text-emerald-400 font-bold">{selectedSlip.feeAmount}</span></div>
                  <div>Date: <span className="text-white">{selectedSlip.payment.date}</span></div>
                </div>
                <div className="mt-4 text-[11px] text-[#00e5ff] underline cursor-pointer hover:text-white">
                  [Simulate High-Res Original Download]
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
                      onClick={() => handleOpenRejectModal(selectedSlip)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-xs font-bold font-['Orbitron',sans-serif]"
                    >
                      Reject Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedSlip.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
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
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-['Orbitron',sans-serif] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)]"
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
