import React, { useState } from 'react';
import { sampleTeam, sampleStates } from '../../data/sampleTeamData.js';
import TeamNav from '../../components/team/TeamNav.jsx';
import StatusBanner from '../../components/team/StatusBanner.jsx';
import MemberList from '../../components/team/MemberList.jsx';
import PaymentSlipArea from '../../components/team/PaymentSlipArea.jsx';

export default function TeamDashboard() {
  const [team] = useState(sampleTeam);

  // Active status key defaults to 'waiting_for_approval' (Waiting for approval)
  const [statusKey, setStatusKey] = useState('waiting_for_approval');
  const [registration, setRegistration] = useState(sampleStates.waiting_for_approval);

  // Switch status for previewing
  const handleStatusChange = (newKey) => {
    setStatusKey(newKey);
    setRegistration(sampleStates[newKey] || sampleStates.waiting_for_approval);
  };

  const handleUploadNewSlip = () => {
    const updated = {
      ...registration,
      status: 'waiting_for_approval',
      payment: {
        reference: 'BOC-TXN-' + Math.floor(10000000 + Math.random() * 90000000),
        submittedAt: new Date().toISOString(),
        fileName: 'boc_transfer_slip_uploaded.png',
        fileSize: '1.4 MB',
        rejectionReason: null,
      },
    };
    setStatusKey('waiting_for_approval');
    setRegistration(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-body">
      {/* Team Header & Navigation */}
      <TeamNav
        team={team}
        currentStatus={statusKey}
        onStatusChange={handleStatusChange}
      />

      {/* Registration Status Banner (Waiting, Approved, Rejected, or Needs Payment) */}
      <StatusBanner registration={registration} />

      {/* Team Members Section */}
      <MemberList
        team={team}
        onAddMemberClick={() => alert('Member addition inputs will be added next.')}
      />

      {/* Payment & Bank Slip Section */}
      <PaymentSlipArea
        registration={registration}
        onUploadNewSlip={handleUploadNewSlip}
      />
    </div>
  );
}
