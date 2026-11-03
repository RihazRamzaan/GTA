/**
 * Sample Team & Registration Data (Day 2)
 * Clean, standard data conforming to Team.js and Registration.js models
 */

export const bankDetails = {
  bankName: 'Bank of Ceylon (BOC)',
  accountName: 'Cyberpunk Buildathon Committee',
  accountNumber: '8942-0192-3850',
  branch: 'Colombo Corporate Branch',
  feeAmount: 4000,
  reference: 'TEAM-CYBERSYNAPSE',
  instructions: [
    'Transfer LKR 4,000 using online banking or an ATM/CDM deposit.',
    'Use reference: TEAM-CYBERSYNAPSE in the remarks.',
    'Upload a clear photo or PDF receipt of your deposit below.',
    'Approval takes 6 to 12 hours once submitted.',
  ],
};

export const sampleTeam = {
  name: 'Cyber Synapse',
  code: 'TEAM-24',
  leader: {
    name: 'Thanish Ahamed',
    email: 'thanish@example.com',
    role: 'Leader & Developer',
    university: 'Faculty of Information Technology',
    phone: '+94 77 123 4567',
  },
  members: [
    {
      id: 'm1',
      name: 'Akindu Fernando',
      email: 'akindu@example.com',
      role: 'Backend Developer',
      university: 'Faculty of Computing',
    },
    {
      id: 'm2',
      name: 'Yuwandhi Senaratne',
      email: 'yuwandhi@example.com',
      role: 'Frontend & UI Designer',
      university: 'Faculty of Design',
    },
  ],
  maxMembers: 4,
  minMembers: 2,
};

// 4 clear registration states:
// 1. not uploaded ('pending_payment')
// 2. waiting ('pending_review')
// 3. approved ('approved')
// 4. rejected ('rejected')
export const sampleStates = {
  // 1. Not uploaded / Pending Payment (new registration, not yet paid)
  pending_payment: {
    status: 'pending_payment',
    feeAmount: 4000,
    payment: {
      reference: '',
      paymentDate: '',
      submittedAt: null,
      fileName: null,
      fileSize: null,
      slipPreviewUrl: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
    },
  },

  // 2. Waiting for admin approval ('pending_review')
  pending_review: {
    status: 'pending_review',
    feeAmount: 4000,
    payment: {
      reference: 'BOC-TXN-88392019',
      paymentDate: '2026-10-31',
      submittedAt: '2026-10-31T14:35:00.000Z',
      fileName: 'boc_transfer_slip.png',
      fileSize: '1.4 MB',
      slipPreviewUrl: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
    },
  },

  // 3. Approved by admin
  approved: {
    status: 'approved',
    feeAmount: 4000,
    payment: {
      reference: 'BOC-TXN-88392019',
      paymentDate: '2026-10-31',
      submittedAt: '2026-10-31T14:35:00.000Z',
      fileName: 'boc_transfer_slip.png',
      fileSize: '1.4 MB',
      slipPreviewUrl: null,
      reviewedBy: 'Admin Overseer',
      reviewedAt: '2026-11-01T08:15:00.000Z',
      rejectionReason: null,
    },
  },

  // 4. Rejected by admin with clear reason
  rejected: {
    status: 'rejected',
    feeAmount: 4000,
    payment: {
      reference: 'BOC-TXN-88392019',
      paymentDate: '2026-10-31',
      submittedAt: '2026-10-31T14:35:00.000Z',
      fileName: 'boc_transfer_slip.png',
      fileSize: '1.4 MB',
      slipPreviewUrl: null,
      reviewedBy: 'Admin Overseer',
      reviewedAt: '2026-11-01T09:00:00.000Z',
      rejectionReason:
        'The deposit slip photo is blurry and the transaction number is unreadable. Please upload a clear photo or digital banking PDF receipt.',
    },
  },
};
