import React from 'react';
import { Link } from 'react-router-dom';

export default function StatusBanner({ registration }) {
  const status = registration?.status || 'pending_payment';
  const payment = registration?.payment || {};

  // 1. WAITING / PENDING REVIEW
  if (status === 'pending_review') {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">⏳</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                  Payment Slip Under Review
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Waiting for Approval
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Your payment slip for <strong className="text-white">LKR 4,000</strong> (Ref:{' '}
                <span className="font-mono text-amber-300 font-semibold">{payment.reference || 'BOC-TXN-88392019'}</span>) has been submitted. The organizers are verifying your deposit. Verification normally takes <strong>6 to 12 hours</strong>.
              </p>
            </div>
          </div>
          <Link
            to="/team/payment"
            className="shrink-0 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition text-center"
          >
            View Payment Details
          </Link>
        </div>
      </div>
    );
  }

  // 2. APPROVED
  if (status === 'approved') {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">✓</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                  Registration Approved
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Team
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Your team registration and payment of <strong className="text-white">LKR 4,000</strong> have been approved by the organizers. Your slot is confirmed and you are ready for the buildathon.
              </p>
            </div>
          </div>
          <Link
            to="/team/submission"
            className="shrink-0 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition text-center"
          >
            Go to Submissions
          </Link>
        </div>
      </div>
    );
  }

  // 3. REJECTED
  if (status === 'rejected') {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-5 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                  Action Required: Payment Slip Rejected
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  Rejected
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Your payment slip could not be verified by the admin team. Please review the reason below and upload a clear receipt.
              </p>

              {/* Admin Reason Callout */}
              <div className="mt-3 p-3 rounded-lg bg-black/40 border border-red-500/30 text-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-0.5">
                  Reason for Rejection:
                </span>
                <p className="text-red-100">
                  "{payment.rejectionReason || 'The deposit slip photo is blurry and the reference number is unreadable. Please upload a clear photo or online banking PDF.'}"
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/team/payment"
            className="shrink-0 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition text-center"
          >
            Upload New Slip
          </Link>
        </div>
      </div>
    );
  }

  // 4. PENDING PAYMENT
  return (
    <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-5 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="text-2xl mt-0.5">💳</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                Payment Required
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LKR 4,000 Due
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Your team profile is registered, but your spot is tentative. Please transfer the <strong className="text-white">LKR 4,000</strong> entry fee to Bank of Ceylon and upload your receipt to confirm your registration.
            </p>
          </div>
        </div>
        <Link
          to="/team/payment"
          className="shrink-0 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold transition text-center"
        >
          Pay & Upload Slip
        </Link>
      </div>
    </div>
  );
}
