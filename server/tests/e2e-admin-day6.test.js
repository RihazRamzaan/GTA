import assert from 'node:assert';
import mongoose from 'mongoose';
import {
  getAdminSummary,
  getAdminRegistrations,
  getAdminSubmissions,
  reviewAdminRegistration,
  getAdminRegistrationSlip,
  getAdminSettings,
  updateAdminSettings,
  formatSubmissionRecord,
  formatRegistrationRecord,
} from '../src/controllers/admin.controller.js';
import Submission from '../src/models/Submission.js';
import Registration from '../src/models/Registration.js';
import Team from '../src/models/Team.js';
import EventSettings from '../src/models/EventSettings.js';
import { requireAuth } from '../src/middleware/auth.js';
import { requireAdmin } from '../src/middleware/requireAdmin.js';
import { saveSlip, deleteSlip } from '../src/services/storage.js';

console.log('Running Day 06 End-to-End Unified Admin Workflow Tests...');

const createMockRes = () => ({
  statusCode: 200,
  headers: {},
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = data;
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  },
  type(val) {
    this.headers['Content-Type'] = val;
    return this;
  },
  send(content) {
    this.body = content;
    return this;
  },
  sendFile(path) {
    this.body = { fileSent: path };
    return this;
  },
});

// =========================================================================
// 1. Unified Security & Route Protection
// =========================================================================
console.log('• Testing Unified Security Guards on Day 06 Routes...');

// 1.1 Unauthenticated requests blocked
{
  const req = { session: {} };
  const res = createMockRes();
  await assert.rejects(
    async () => {
      await requireAuth(req, res, () => {});
    },
    (err) => err.status === 401 && err.errorCode === 'UNAUTHENTICATED'
  );
}

// 1.2 Non-admin accounts (team role) blocked with 403 FORBIDDEN
{
  const req = { user: { role: 'team' } };
  const res = createMockRes();
  assert.throws(
    () => {
      requireAdmin(req, res, () => {});
    },
    (err) => err.status === 403 && (err.errorCode === 'FORBIDDEN' || err.code === 'FORBIDDEN')
  );
}

// 1.3 Admin account passes guards
{
  const req = { user: { role: 'admin' } };
  const res = createMockRes();
  let adminNext = false;
  requireAdmin(req, res, () => { adminNext = true; });
  assert.strictEqual(adminNext, true, 'Admin account must pass requireAdmin guard');
}

// =========================================================================
// 2. Submissions Gallery Endpoint (GET /api/admin/submissions)
// =========================================================================
console.log('• Testing Submissions Gallery & Search Telemetry...');

const sampleTeamId = new mongoose.Types.ObjectId();
const sampleSubmissionId = new mongoose.Types.ObjectId();

const sampleSubmission = {
  _id: sampleSubmissionId,
  teamId: {
    _id: sampleTeamId,
    name: 'CyberSyndicate',
    leaderName: 'Amara Weerasinghe',
    leaderEmail: 'amara@cybersyndicate.lk',
    members: [
      { name: 'Kasun Bandara', email: 'kasun@cybersyndicate.lk', role: 'Developer' },
      { name: 'Naveen Silva', email: 'naveen@cybersyndicate.lk', role: 'Artist' },
    ],
  },
  title: 'Neon Glitch 2099',
  description: 'Fast-paced cybernetic hacking platformer with procedural levels.',
  repoUrl: 'https://github.com/cybersyndicate/neon-glitch',
  playableUrl: 'https://neon-glitch.itch.io/demo',
  videoUrl: 'https://youtube.com/watch?v=sampleGlitch',
  submittedAt: new Date('2026-11-01T12:00:00Z'),
  createdAt: new Date('2026-11-01T11:30:00Z'),
  updatedAt: new Date('2026-11-01T12:00:00Z'),
};

// 2.1 Test formatting
const formattedSub = formatSubmissionRecord(sampleSubmission);
assert.strictEqual(formattedSub.id.toString(), sampleSubmissionId.toString());
assert.strictEqual(formattedSub.teamName, 'CyberSyndicate');
assert.strictEqual(formattedSub.leaderName, 'Amara Weerasinghe');
assert.strictEqual(formattedSub.leaderEmail, 'amara@cybersyndicate.lk');
assert.strictEqual(formattedSub.membersCount, 3);
assert.strictEqual(formattedSub.title, 'Neon Glitch 2099');
assert.strictEqual(formattedSub.playableUrl, 'https://neon-glitch.itch.io/demo');
assert.strictEqual(formattedSub.repoUrl, 'https://github.com/cybersyndicate/neon-glitch');
assert.strictEqual(formattedSub.videoUrl, 'https://youtube.com/watch?v=sampleGlitch');

// 2.2 Test Controller getAdminSubmissions
{
  const origFind = Submission.find;
  try {
    Submission.find = () => ({
      populate: () => ({
        sort: () => ({
          lean: async () => [sampleSubmission],
        }),
      }),
    });

    const req = { query: {} };
    const res = createMockRes();
    await getAdminSubmissions(req, res, (err) => { if (err) throw err; });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(Array.isArray(res.body.data), true);
    assert.strictEqual(res.body.data.length, 1);
    assert.strictEqual(res.body.data[0].teamName, 'CyberSyndicate');
  } finally {
    Submission.find = origFind;
  }
}

// =========================================================================
// 3. Event Summary Telemetry (GET /api/admin/summary)
// =========================================================================
console.log('• Testing Unified Event Summary & Status Metrics...');

{
  const origTeamCount = Team.countDocuments;
  const origRegAgg = Registration.aggregate;
  const origSubCount = Submission.countDocuments;
  const origSettings = EventSettings.getOrCreateSingleton;

  try {
    Team.countDocuments = async () => 10;
    Registration.aggregate = async () => [
      { _id: 'approved', count: 5 },
      { _id: 'waiting_for_approval', count: 3 },
      { _id: 'waiting_for_slip', count: 1 },
      { _id: 'rejected', count: 1 },
    ];
    Submission.countDocuments = async () => 4;
    EventSettings.getOrCreateSingleton = async () => ({
      milestones: {
        registrationOpensAt: new Date(Date.now() - 86400000),
        registrationClosesAt: new Date(Date.now() + 86400000),
        buildingStartsAt: new Date(Date.now() + 172800000),
        submissionOpensAt: new Date(Date.now() - 3600000),
        submissionClosesAt: new Date(Date.now() + 86400000),
        resultsAt: new Date(Date.now() + 259200000),
      },
      registrationMode: 'auto',
      submissionMode: 'auto',
    });

    const req = {};
    const res = createMockRes();
    await getAdminSummary(req, res, (err) => { if (err) throw err; });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);

    const d = res.body.data;
    assert.strictEqual(d.totalTeams, 10, 'Total teams should match 10');
    assert.strictEqual(d.approved, 5, 'Approved count should match 5');
    assert.strictEqual(d.waitingForApproval, 3, 'Waiting for approval should match 3');
    assert.strictEqual(d.waitingForSlip, 1, 'Waiting for slip should match 1');
    assert.strictEqual(d.rejected, 1, 'Rejected count should match 1');
    assert.strictEqual(d.totalSubmissions, 4, 'Total submissions should match 4');
    assert.strictEqual(typeof d.gates.registrationOpen, 'boolean');
    assert.strictEqual(typeof d.gates.submissionOpen, 'boolean');
  } finally {
    Team.countDocuments = origTeamCount;
    Registration.aggregate = origRegAgg;
    Submission.countDocuments = origSubCount;
    EventSettings.getOrCreateSingleton = origSettings;
  }
}

// =========================================================================
// 4. Payment Approval & Rejection Flow Verification
// =========================================================================
console.log('• Testing Payment Review Lifecycle...');

const mockRegId = new mongoose.Types.ObjectId();
let testRegDoc = {
  _id: mockRegId,
  status: 'waiting_for_approval',
  feeAmount: 4000,
  teamId: {
    _id: sampleTeamId,
    name: 'CyberSyndicate',
    leaderName: 'Amara Weerasinghe',
    leaderEmail: 'amara@cybersyndicate.lk',
    members: [],
  },
  payment: {
    reference: 'BOC-990011',
    slipKey: 'slips/test_slip.png',
    slipMime: 'image/png',
    submittedAt: new Date(),
  },
  save: async function() { return this; },
};

const makeQuery = (result) => ({
  populate: () => makeQuery(result),
  lean: () => Promise.resolve(result),
  then: (resolve) => resolve(result),
});

{
  const origFindById = Registration.findById;
  try {
    Registration.findById = () => makeQuery(testRegDoc);

    // 4.1 Reject without reason -> 400 REJECTION_REASON_REQUIRED
    {
      const req = {
        params: { id: mockRegId.toString() },
        body: { status: 'rejected', rejectionReason: '   ' },
        user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      };
      const res = createMockRes();
      await reviewAdminRegistration(req, res, (err) => { if (err) throw err; });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error.code, 'REJECTION_REASON_REQUIRED');
    }

    // 4.2 Reject with reason -> 200 with rejected status
    {
      const req = {
        params: { id: mockRegId.toString() },
        body: { status: 'rejected', rejectionReason: 'Deposit slip transaction number is illegible.' },
        user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      };
      const res = createMockRes();
      await reviewAdminRegistration(req, res, (err) => { if (err) throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(testRegDoc.status, 'rejected');
      assert.strictEqual(testRegDoc.payment.rejectionReason, 'Deposit slip transaction number is illegible.');
    }

    // 4.3 Approve -> 200 with approved status and rejection reason cleared
    {
      const req = {
        params: { id: mockRegId.toString() },
        body: { status: 'approved' },
        user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      };
      const res = createMockRes();
      await reviewAdminRegistration(req, res, (err) => { if (err) throw err; });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(testRegDoc.status, 'approved');
      assert.strictEqual(testRegDoc.payment.rejectionReason, undefined);
    }
  } finally {
    Registration.findById = origFindById;
  }
}

// =========================================================================
// 5. Slip Retrieval Endpoint (GET /api/admin/registrations/:id/slip)
// =========================================================================
console.log('• Testing Private Slip Delivery via getSlipPath...');

// 5.1 Missing slip key returns 404 SLIP_NOT_FOUND
{
  const origFindById = Registration.findById;
  try {
    Registration.findById = () => ({
      populate: async () => ({
        ...testRegDoc,
        payment: {},
      }),
    });

    const req = { params: { id: mockRegId.toString() } };
    const res = createMockRes();
    await getAdminRegistrationSlip(req, res, () => {});

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body?.error?.code, 'SLIP_NOT_FOUND');
  } finally {
    Registration.findById = origFindById;
  }
}

// 5.2 Non-existent slip file returns 404 SLIP_NOT_FOUND
{
  const origFindById = Registration.findById;
  try {
    Registration.findById = () => ({
      populate: async () => ({
        ...testRegDoc,
        payment: {
          reference: 'BOC-990011',
          slipKey: 'slip_non_existent_file_123.png',
          slipMime: 'image/png',
          submittedAt: new Date(),
        },
      }),
    });

    const req = { params: { id: mockRegId.toString() } };
    const res = createMockRes();
    await getAdminRegistrationSlip(req, res, () => {});

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body?.error?.code, 'SLIP_NOT_FOUND');
  } finally {
    Registration.findById = origFindById;
  }
}

// 5.3 Actual uploaded slip streamed via getSlipPath and res.sendFile
{
  const testTeamId = new mongoose.Types.ObjectId();
  const mockFile = {
    originalname: 'bank_transfer_receipt.png',
    mimetype: 'image/png',
    buffer: Buffer.from('FAKE_PNG_BINARY_DATA_FOR_VERIFICATION'),
  };
  const saved = await saveSlip(testTeamId, mockFile);

  const origFindById = Registration.findById;
  try {
    Registration.findById = () => ({
      populate: async () => ({
        ...testRegDoc,
        payment: {
          reference: 'BOC-990011',
          slipKey: saved.slipKey,
          slipMime: saved.slipMime,
          submittedAt: new Date(),
        },
      }),
    });

    const req = { params: { id: mockRegId.toString() } };
    const res = createMockRes();
    await getAdminRegistrationSlip(req, res, () => {});

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['Content-Type'], 'image/png');
    assert.ok(res.body?.fileSent?.includes(saved.slipKey), 'Should stream the exact slip path');
  } finally {
    Registration.findById = origFindById;
    await deleteSlip(saved.slipKey);
  }
}

// =========================================================================
// 6. Event Settings Date Chronology Validation
// =========================================================================
console.log('• Testing Event Date Chronology Validation in updateAdminSettings...');

// 6.1 Valid schedule saves successfully
{
  const origGetOrCreate = EventSettings.getOrCreateSingleton;
  try {
    const mockSettingsDoc = {
      milestones: {
        registrationOpensAt: new Date('2026-11-05T00:00:00.000Z'),
        registrationClosesAt: new Date('2026-11-15T23:59:59.000Z'),
        buildingStartsAt: new Date('2026-11-16T09:00:00.000Z'),
        submissionOpensAt: new Date('2026-11-27T12:00:00.000Z'),
        submissionClosesAt: new Date('2026-12-10T18:00:00.000Z'),
        resultsAt: new Date('2026-12-15T15:00:00.000Z'),
        toObject() {
          return {
            registrationOpensAt: this.registrationOpensAt,
            registrationClosesAt: this.registrationClosesAt,
            buildingStartsAt: this.buildingStartsAt,
            submissionOpensAt: this.submissionOpensAt,
            submissionClosesAt: this.submissionClosesAt,
            resultsAt: this.resultsAt,
          };
        },
      },
      registrationMode: 'auto',
      submissionMode: 'auto',
      toObject() { return { milestones: this.milestones.toObject(), registrationMode: this.registrationMode, submissionMode: this.submissionMode }; },
      save: async () => true,
    };
    EventSettings.getOrCreateSingleton = async () => mockSettingsDoc;

    const req = {
      body: {
        milestones: {
          registrationOpensAt: '2026-11-06T00:00:00.000Z',
          registrationClosesAt: '2026-11-16T00:00:00.000Z',
        },
      },
    };
    const res = createMockRes();
    await updateAdminSettings(req, res, (err) => { if (err) throw err; });

    assert.strictEqual(res.statusCode, 200, 'Valid milestone updates must return 200');
    assert.strictEqual(res.body?.success, true);
  } finally {
    EventSettings.getOrCreateSingleton = origGetOrCreate;
  }
}

// 6.2 Invalid schedule (inverted registration dates) rejected with CHRONOLOGY_VIOLATION
{
  const origGetOrCreate = EventSettings.getOrCreateSingleton;
  try {
    const mockSettingsDoc = {
      milestones: {
        registrationOpensAt: new Date('2026-11-05T00:00:00.000Z'),
        registrationClosesAt: new Date('2026-11-15T23:59:59.000Z'),
        buildingStartsAt: new Date('2026-11-16T09:00:00.000Z'),
        submissionOpensAt: new Date('2026-11-27T12:00:00.000Z'),
        submissionClosesAt: new Date('2026-12-10T18:00:00.000Z'),
        resultsAt: new Date('2026-12-15T15:00:00.000Z'),
        toObject() {
          return {
            registrationOpensAt: this.registrationOpensAt,
            registrationClosesAt: this.registrationClosesAt,
            buildingStartsAt: this.buildingStartsAt,
            submissionOpensAt: this.submissionOpensAt,
            submissionClosesAt: this.submissionClosesAt,
            resultsAt: this.resultsAt,
          };
        },
      },
      registrationMode: 'auto',
      submissionMode: 'auto',
      toObject() { return { milestones: this.milestones.toObject(), registrationMode: this.registrationMode, submissionMode: this.submissionMode }; },
      save: async () => true,
    };
    EventSettings.getOrCreateSingleton = async () => mockSettingsDoc;

    const req = {
      body: {
        milestones: {
          registrationOpensAt: '2026-11-25T00:00:00.000Z',
          registrationClosesAt: '2026-11-10T00:00:00.000Z',
        },
      },
    };
    const res = createMockRes();
    await updateAdminSettings(req, res, (err) => { if (err) throw err; });

    assert.strictEqual(res.statusCode, 400, 'Invalid milestone chronology must return 400');
    assert.strictEqual(res.body?.error?.code, 'CHRONOLOGY_VIOLATION');
    assert.ok(res.body?.error?.message?.includes('registrationOpensAt must be before registrationClosesAt'));
  } finally {
    EventSettings.getOrCreateSingleton = origGetOrCreate;
  }
}

console.log('✓ All Day 06 End-to-End Unified Admin Workflow Tests Passed Successfully!');
