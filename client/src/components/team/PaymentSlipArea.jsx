import React, { useState } from 'react';
import { bankDetails } from '../../data/sampleTeamData.js';

export default function PaymentSlipArea({ registration, onUploadNewSlip }) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const payment = registration?.payment || {};
  const status = registration?.status || 'waiting_for_slip';
  const hasSlip = Boolean(payment.fileName || payment.reference);

  const handleCopy = () => {
    navigator.clipboard?.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-night-card p-5 sm:p-6 font-body">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
          Payment & Bank Slip
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Registration Fee: LKR 4,000 per team • Transfer to Bank of Ceylon
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Bank Account Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] font-display">
            Bank Details
          </h3>

          <div className="rounded-xl bg-night border border-white/10 p-4 space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Bank:</span>
              <span className="font-bold text-white">{bankDetails.bankName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Account Name:</span>
              <span className="font-semibold text-slate-200">{bankDetails.accountName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-base">
                  {bankDetails.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-neon-cyan transition font-body"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Branch:</span>
              <span className="text-slate-200">{bankDetails.branch}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Amount Due:</span>
              <span className="text-lg font-black text-prize-gold font-display">LKR 4,000</span>
            </div>
          </div>

          {/* Reference Notice */}
          <div className="p-3.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-sm">
            <p className="font-bold text-neon-cyan">Important Deposit Remark:</p>
            <p className="mt-1 text-slate-300">
              When transferring, enter reference <strong className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">{bankDetails.reference}</strong> in the remarks/description so we can match your payment.
            </p>
          </div>
        </div>

        {/* Right: Payment Slip Status or Upload Box */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] font-display">
            Your Payment Slip
          </h3>

          {hasSlip ? (
            <div className="rounded-xl bg-night border border-white/10 p-4 space-y-4">
              {/* Slip Metadata Card */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/15 text-neon-cyan flex items-center justify-center font-bold text-xl shrink-0">
                  📄
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-white truncate">
                    {payment.fileName || 'boc_transfer_slip.png'}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Size: {payment.fileSize || '1.4 MB'} • Ref: <span className="font-mono text-slate-300">{payment.reference}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted: Oct 31, 2026, 2:35 PM
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-slate-400">Verification Status:</span>
                {status === 'approved' ? (
                  <span className="px-3 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                    ✓ Verified & Approved
                  </span>
                ) : status === 'rejected' ? (
                  <span className="px-3 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300">
                    ✕ Rejected
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300">
                    ⏳ Awaiting Admin Review
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold font-body transition"
                >
                  View Receipt
                </button>

                {(status === 'rejected' || status === 'waiting_for_slip') && (
                  <button
                    type="button"
                    onClick={onUploadNewSlip}
                    className="px-4 py-1.5 rounded-lg bg-neon-cyan hover:opacity-90 text-black text-sm font-bold font-body transition"
                  >
                    Upload Replacement
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div className="rounded-xl border-2 border-dashed border-white/20 hover:border-neon-cyan/60 p-6 text-center transition">
              <span className="text-3xl block mb-2">📤</span>
              <p className="text-base font-bold text-white font-display">Upload Payment Slip</p>
              <p className="text-sm text-slate-400 mt-1">
                Drag and drop your bank receipt image or PDF here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Formats: PNG, JPG, PDF (Max 5MB)
              </p>

              <button
                type="button"
                onClick={onUploadNewSlip}
                className="mt-4 px-5 py-2 rounded-lg bg-neon-cyan hover:opacity-90 text-black text-sm font-bold font-body transition"
              >
                Choose File & Upload
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clean Slip Modal Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-night-card border border-white/20 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-white text-base font-display">
                Bank Deposit Slip
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Receipt Preview Details */}
            <div className="mt-4 p-4 rounded-xl bg-night border border-white/10 text-xs sm:text-sm space-y-2 font-mono">
              <div className="text-center pb-2 border-b border-white/10">
                <p className="text-neon-cyan font-bold text-sm font-display">BANK OF CEYLON</p>
                <p className="text-slate-400 text-xs">TRANSACTION RECEIPT</p>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reference:</span>
                <span className="font-bold text-white">{payment.reference || 'BOC-TXN-88392019'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Beneficiary:</span>
                <span>Cyberpunk Buildathon</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Account:</span>
                <span>8942-0192-3850</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Remarks:</span>
                <span className="text-neon-cyan">TEAM-CYBERSYNAPSE</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-white/10 text-sm">
                <span className="font-bold">Amount Paid:</span>
                <span className="font-bold text-prize-gold font-display">LKR 4,000.00</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold font-body"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
