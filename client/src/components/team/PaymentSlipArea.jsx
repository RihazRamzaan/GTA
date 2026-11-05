import React, { useState, useEffect } from 'react';
import { bankDetails } from '../../data/sampleTeamData.js';

export default function PaymentSlipArea({
  registration,
  onSubmitPayment,
  onResetToNew,
}) {
  const payment = registration?.payment || {};
  const status = registration?.status || 'waiting_for_slip';

  // State for the payment form
  const [reference, setReference] = useState(payment.reference || '');
  const [paymentDate, setPaymentDate] = useState(
    payment.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(payment.slipPreviewUrl || null);
  const [errors, setErrors] = useState({});
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Copy button feedback
  const [copied, setCopied] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Sync form if registration changes externally (e.g. preview dropdown)
  useEffect(() => {
    setReference(payment.reference || '');
    setPaymentDate(payment.paymentDate || new Date().toISOString().split('T')[0]);
    setIsEditingExisting(false);
    setErrors({});
  }, [registration?.status, payment.reference, payment.paymentDate]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle bank slip file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: 'File size exceeds 5MB limit.' }));
        return;
      }
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: '' }));

      // Create object URL for instant image preview if it's an image
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // PDF or document
      }
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!reference.trim()) {
      nextErrors.reference = 'Payment reference / transaction ID is required.';
    } else if (reference.trim().length < 4) {
      nextErrors.reference = 'Reference must be at least 4 characters.';
    }

    if (!paymentDate) {
      nextErrors.paymentDate = 'Payment date is required.';
    }

    // A file must be provided either currently selected or existing from previous upload
    const hasExistingFile = Boolean(payment.fileName || payment.reference);
    if (!selectedFile && !hasExistingFile) {
      nextErrors.file = 'Please select a photo or PDF of your bank deposit slip.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fileSizeStr = selectedFile
      ? (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB'
      : payment.fileSize || '1.4 MB';

    const fileNameStr = selectedFile
      ? selectedFile.name
      : payment.fileName || 'boc_transfer_slip.png';

    onSubmitPayment({
      reference: reference.trim().toUpperCase(),
      paymentDate: paymentDate,
      fileName: fileNameStr,
      fileSize: fileSizeStr,
      slipPreviewUrl: previewUrl,
      submittedAt: new Date().toISOString(),
      file: selectedFile,
    });

    setIsEditingExisting(false);
  };

  // Determine whether to show the form or the submitted summary
  // In 'waiting_for_slip' or 'rejected', or when explicitly editing: show form!
  // In 'waiting_for_approval' or 'approved': show summary, with option to edit.
  const showForm =
    status === 'waiting_for_slip' || status === 'rejected' || isEditingExisting;

  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-night-card p-5 sm:p-6 font-body">
      {/* Header with Clear Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Payment & Bank Slip
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Registration Fee: LKR 4,000 per team • Bank of Ceylon Transfer
          </p>
        </div>

        {/* Clear Payment Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'approved' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ✓ Payment Approved & Verified
            </span>
          )}
          {status === 'waiting_for_approval' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ⏳ Waiting for Admin Review
            </span>
          )}
          {status === 'rejected' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              ✕ Slip Rejected
            </span>
          )}
          {status === 'waiting_for_slip' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
              💳 Payment Not Uploaded
            </span>
          )}1
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bank Account Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] font-display">
            Official Bank Account
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
              <span className="text-slate-400">Fee Amount:</span>
              <span className="text-lg font-black text-prize-gold font-display">
                LKR 4,000
              </span>
            </div>
          </div>

          {/* Reference Notice */}
          <div className="p-3.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-sm">
            <p className="font-bold text-neon-cyan">Mandatory Reference Remark:</p>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm">
              In your transfer description, include reference:{' '}
              <strong className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">
                {bankDetails.reference}
              </strong>
            </p>
          </div>
        </div>

        {/* Right Column: Payment Form or Submitted Slip Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] font-display">
              {showForm ? 'Submit Payment Information' : 'Your Submitted Payment'}
            </h3>

            {!showForm && status === 'waiting_for_approval' && (
              <button
                type="button"
                onClick={() => setIsEditingExisting(true)}
                className="text-xs font-bold text-neon-cyan hover:underline font-body"
              >
                ✎ Edit / Replace Slip
              </button>
            )}
          </div>

          {/* Admin Rejection Callout (if rejected) */}
          {status === 'rejected' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-sm">
              <div className="flex items-center gap-2 text-red-400 font-bold font-display text-xs uppercase tracking-wider mb-1">
                <span>⚠️ Reason For Rejection</span>
              </div>
              <p className="text-red-200 text-sm">
                "{payment.rejectionReason || 'The deposit slip was unclear. Please upload a legible receipt.'}"
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Update the reference number, date, or choose a clearer receipt below and resubmit.
              </p>
            </div>
          )}

          {/* 1. EDITABLE PAYMENT FORM (Bank-slip picker, reference, date) */}
          {showForm ? (
            <form
              onSubmit={handleFormSubmit}
              className="rounded-xl bg-night border border-white/10 p-5 space-y-4"
            >
              {/* Bank-Slip Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Bank Deposit Slip / Receipt File <span className="text-neon-pink">*</span>
                </label>

                <div className="relative rounded-xl border-2 border-dashed border-white/20 hover:border-neon-cyan/50 p-4 transition bg-white/[0.01]">
                  <input
                    type="file"
                    id="slip-file-input"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Slip preview"
                          className="w-14 h-14 object-cover rounded-lg border border-neon-cyan/40 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-neon-cyan/15 text-neon-cyan flex items-center justify-center font-bold text-xl shrink-0">
                          📄
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                        </p>
                      </div>
                      <span className="text-xs font-bold text-neon-cyan underline pointer-events-none">
                        Change
                      </span>
                    </div>
                  ) : payment.fileName && !selectedFile ? (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-neon-cyan/15 text-neon-cyan flex items-center justify-center font-bold text-xl shrink-0">
                        📄
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">
                          {payment.fileName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {payment.fileSize || '1.4 MB'} (Current file) • Click to replace
                        </p>
                      </div>
                      <span className="text-xs font-bold text-neon-cyan underline pointer-events-none">
                        Browse New
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-2xl block mb-1">📁</span>
                      <p className="text-sm font-bold text-white">
                        Click or drag to select bank receipt
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Accepts PNG, JPG, or PDF (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                {errors.file && (
                  <p className="text-xs text-red-400 mt-1 font-semibold">{errors.file}</p>
                )}
              </div>

              {/* Payment Reference & Payment Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reference Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bank Reference / TXN ID <span className="text-neon-pink">*</span>
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => {
                      setReference(e.target.value);
                      if (errors.reference) setErrors({ ...errors, reference: '' });
                    }}
                    placeholder="e.g. BOC-TXN-88392019"
                    className="w-full rounded-lg bg-night-card border border-white/15 px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-neon-cyan transition"
                  />
                  {errors.reference && (
                    <p className="text-xs text-red-400 mt-1 font-semibold">
                      {errors.reference}
                    </p>
                  )}
                </div>

                {/* Date Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Payment Date <span className="text-neon-pink">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      if (errors.paymentDate) setErrors({ ...errors, paymentDate: '' });
                    }}
                    className="w-full rounded-lg bg-night-card border border-white/15 px-3.5 py-2 text-white font-body text-sm focus:outline-none focus:border-neon-cyan transition"
                  />
                  {errors.paymentDate && (
                    <p className="text-xs text-red-400 mt-1 font-semibold">
                      {errors.paymentDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {isEditingExisting && (
                  <button
                    type="button"
                    onClick={() => setIsEditingExisting(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Cancel Editing
                  </button>
                )}

                <button
                  type="submit"
                  className="ml-auto px-6 py-2.5 rounded-lg bg-neon-cyan hover:opacity-90 text-black text-sm font-bold font-body transition shadow-sm"
                >
                  {status === 'rejected'
                    ? 'Submit Replacement Slip'
                    : isEditingExisting
                    ? 'Save Updated Payment Info'
                    : 'Submit Payment & Slip'}
                </button>
              </div>
            </form>
          ) : (
            /* 2. SUBMITTED SLIP SUMMARY VIEW (Waiting or Approved) */
            <div className="rounded-xl bg-night border border-white/10 p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-neon-cyan/15 text-neon-cyan flex items-center justify-center font-bold text-2xl shrink-0">
                  📄
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-white truncate">
                    {payment.fileName || 'boc_transfer_slip.png'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400 mt-1">
                    <span>
                      Size: <strong className="text-slate-300">{payment.fileSize || '1.4 MB'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Date Paid: <strong className="text-slate-300 font-mono">{payment.paymentDate || '2026-10-31'}</strong>
                    </span>
                  </div>
                  <p className="text-sm text-neon-cyan font-mono mt-1">
                    Reference: <strong>{payment.reference || 'BOC-TXN-88392019'}</strong>
                  </p>
                </div>
              </div>

              {/* Status details line */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-slate-400">Review Status:</span>
                {status === 'approved' ? (
                  <span className="px-3 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                    ✓ Verified by {payment.reviewedBy || 'Admin'}
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300">
                    ⏳ In Verification Queue (6-12 hrs)
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold font-body transition"
                >
                  View Deposit Slip Receipt
                </button>

                {status === 'waiting_for_approval' && (
                  <button
                    type="button"
                    onClick={() => setIsEditingExisting(true)}
                    className="px-4 py-2 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/40 text-sm font-bold font-body transition"
                  >
                    Edit / Replace
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slip Receipt Modal View */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-night-card border border-white/20 p-6 shadow-2xl font-body">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-white text-base font-display">
                Bank Deposit Slip Receipt
              </h4>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="mt-4 p-4 rounded-xl bg-night border border-white/10 text-sm space-y-2.5 font-mono">
              <div className="text-center pb-2 border-b border-white/10">
                <p className="text-neon-cyan font-bold text-sm font-display">BANK OF CEYLON</p>
                <p className="text-slate-400 text-xs">OFFICIAL DEPOSIT ADVICE</p>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Reference:</span>
                <span className="font-bold text-white">
                  {payment.reference || 'BOC-TXN-88392019'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Date:</span>
                <span className="text-white">{payment.paymentDate || '2026-10-31'}</span>
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
                <span className="text-neon-cyan">{bankDetails.reference}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-white/10 text-base">
                <span className="font-bold">Total Paid:</span>
                <span className="font-bold text-prize-gold font-display">LKR 4,000.00</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
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
