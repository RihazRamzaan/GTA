import React, { useState } from 'react';
import { sampleTeam, sampleStates } from '../../data/sampleTeamData.js';
import TeamNav from '../../components/team/TeamNav.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import MemberList from '../../components/team/MemberList.jsx';
import PaymentSlipArea from '../../components/team/PaymentSlipArea.jsx';

export default function TeamDashboard() {
  // Team state (editable name, leader contact, and members roster)
  const [team, setTeam] = useState(sampleTeam);

  // Active registration scenario (defaults to 'pending_review' / Waiting)
  const [statusKey, setStatusKey] = useState('pending_review');
  const [registration, setRegistration] = useState(sampleStates.pending_review);

  // Feedback toast banner
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch status for previewing all 4 states: not uploaded, waiting, approved, rejected
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

  // Update team name and leader contact info
  const handleUpdateTeam = (updatedData) => {
    setTeam((prev) => ({
      ...prev,
      name: updatedData.name || prev.name,
      leader: {
        ...prev.leader,
        ...updatedData.leader,
      },
    }));
    showToast('Team and leader contact details updated successfully.');
  };

  // Add a new member
  const handleAddMember = (newMember) => {
    if (team.members.length + 1 >= team.maxMembers) {
      showToast('Maximum team size reached (4 members max).', 'error');
      return;
    }
    setTeam((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    showToast(`Added ${newMember.name} to the team roster.`);
  };

  // Update an existing member
  const handleUpdateMember = (updatedMember) => {
    setTeam((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === updatedMember.id ? updatedMember : m
      ),
    }));
    showToast(`Updated details for ${updatedMember.name}.`);
  };

  // Remove a member
  const handleDeleteMember = (memberId) => {
    if (team.members.length + 1 <= team.minMembers) {
      showToast('Cannot remove: Teams must have at least 2 members.', 'error');
      return;
    }
    const memberToRemove = team.members.find((m) => m.id === memberId);
    setTeam((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
    showToast(`Removed ${memberToRemove?.name || 'member'} from the team.`);
  };

  // Handle payment form submission (slip file, reference, date)
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
        team={team}
        currentStatus={statusKey}
        onStatusChange={handleStatusChange}
      />

      {/* Registration Status Banner (Not Uploaded, Waiting, Approved, or Rejected) */}
      <StatusBanner registration={registration} />

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
    </div>
  );
}
