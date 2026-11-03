import React, { useState } from 'react';
import { sampleTeam, sampleStates } from '../../data/sampleTeamData.js';
import TeamNav from '../../components/team/TeamNav.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import PaymentSlipArea from '../../components/team/PaymentSlipArea.jsx';

export default function PaymentPage() {
  const [team] = useState(sampleTeam);
  const [statusKey, setStatusKey] = useState('pending_review');
  const [registration, setRegistration] = useState(sampleStates.pending_review);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = (newKey) => {
    setStatusKey(newKey);
    setRegistration(sampleStates[newKey] || sampleStates.pending_review);
    const labels = {
      pending_payment: 'Not Uploaded',
      pending_review: 'Waiting for Approval',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    showToast(`Status switched to: ${labels[newKey] || newKey}`);
  };

  const handleSubmitPayment = (paymentData) => {
    const updated = {
      ...registration,
      status: 'pending_review',
      payment: {
        ...registration.payment,
        reference: paymentData.reference,
        paymentDate: paymentData.paymentDate,
        fileName: paymentData.fileName,
        fileSize: paymentData.fileSize,
        slipPreviewUrl: paymentData.slipPreviewUrl,
        submittedAt: paymentData.submittedAt,
        rejectionReason: null,
      },
    };
    setStatusKey('pending_review');
    setRegistration(updated);
    showToast('Payment slip submitted successfully! Registration is now waiting for review.');
  };

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
        team={team}
        currentStatus={statusKey}
        onStatusChange={handleStatusChange}
      />

      {/* Status Notice */}
      <StatusBanner registration={registration} />

      {/* Bank-Slip Picker, Payment Reference, and Payment Date */}
      <PaymentSlipArea
        registration={registration}
        onSubmitPayment={handleSubmitPayment}
      />
    </div>
  );
}
