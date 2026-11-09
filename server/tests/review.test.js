import assert from 'node:assert';
import mongoose from 'mongoose';
import {
  formatRegistrationRecord,
  reviewAdminRegistration,
  getAdminRegistrationSlip,
} from '../src/controllers/admin.controller.js';

console.log('Running Payment Review & Slip Retrieval Unit Tests...');

// 1. Format Registration Record Unit Tests
const mockRegistration = {
  _id: new mongoose.Types.ObjectId(),
  status: 'waiting_for_approval',
  feeAmount: 4000,
  teamId: {
    _id: new mongoose.Types.ObjectId(),
    name: 'CyberVanguard',
    leaderName: 'Kavindu Perera',
    leaderEmail: 'kavindu@cybervanguard.io',
    members: [
      { name: 'Ravindu Silva', email: 'ravindu@cybervanguard.io' },
    ],
    createdAt: new Date(),
  },
  payment: {
    reference: 'BOC-99281729',
    date: new Date(),
    slipKey: 'private/slips/slip_123.png',
    slipMime: 'image/png',
    submittedAt: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const formatted = formatRegistrationRecord(mockRegistration);
assert.strictEqual(formatted.teamName, 'CyberVanguard', 'Should format team name correctly');
assert.strictEqual(formatted.leaderName, 'Kavindu Perera', 'Should format leader name');
assert.strictEqual(formatted.membersCount, 2, 'Should include leader + members in count');
assert.strictEqual(formatted.payment.hasSlip, true, 'hasSlip should be true');
assert.strictEqual(formatted.payment.slipKey, undefined, 'slipKey must NOT be exposed in formatted output');

// 2. Controller Validation Logic Tests
const mockRes = () => {
  const res = {
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
    send(content) {
      this.body = content;
      return this;
    },
  };
  return res;
};

// Test 2.1: Invalid MongoDB ObjectId for review
{
  const req = { params: { id: 'invalid-id-123' }, body: { status: 'approved' } };
  const res = mockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400, 'Invalid ID should return 400');
  assert.strictEqual(res.body?.error?.code, 'INVALID_ID');
}

// Test 2.2: Invalid Review Status
{
  const validId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: validId }, body: { status: 'unknown_status' } };
  const res = mockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400, 'Invalid status should return 400');
  assert.strictEqual(res.body?.error?.code, 'INVALID_STATUS');
}

// Test 2.3: Rejection without a Reason
{
  const validId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: validId }, body: { status: 'rejected', rejectionReason: '   ' } };
  const res = mockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400, 'Missing rejection reason should return 400');
  assert.strictEqual(res.body?.error?.code, 'REJECTION_REASON_REQUIRED');
}

// Test 2.4: Decision alias ('reject' without reason)
{
  const validId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: validId }, body: { decision: 'reject', reason: '' } };
  const res = mockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400, 'Missing reason for decision: reject should return 400');
  assert.strictEqual(res.body?.error?.code, 'REJECTION_REASON_REQUIRED');
}

// Test 2.5: Slip Retrieval Invalid MongoDB ObjectId
{
  const req = { params: { id: 'invalid-id-456' } };
  const res = mockRes();
  await getAdminRegistrationSlip(req, res, () => {});
  assert.strictEqual(res.statusCode, 400, 'Invalid slip registration ID should return 400');
  assert.strictEqual(res.body?.error?.code, 'INVALID_ID');
}

console.log('✓ All Payment Review & Slip Retrieval Unit Tests Passed Successfully!');
