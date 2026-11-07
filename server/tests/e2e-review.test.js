import assert from 'node:assert';
import mongoose from 'mongoose';
import {
  formatRegistrationRecord,
  reviewAdminRegistration,
  getAdminRegistrationSlip,
} from '../src/controllers/admin.controller.js';
import { requireAdmin } from '../src/middleware/requireAdmin.js';
import { requireAuth } from '../src/middleware/auth.js';

console.log('Running End-to-End Review, Slip & Auth Verification Tests...');

// Helper to create mock Express response object
const createMockRes = () => {
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

// =========================================================================
// 1. Auth Guard Verification
// =========================================================================
console.log('• Testing Auth & Admin Role Guards...');

// 1.1 Unauthenticated Request (async middleware)
{
  const req = { session: {} };
  const res = createMockRes();
  let nextCalled = false;
  await assert.rejects(
    async () => {
      await requireAuth(req, res, () => { nextCalled = true; });
    },
    (err) => {
      assert.strictEqual(err.status, 401, 'Unauthenticated access should throw 401');
      assert.strictEqual(err.errorCode, 'UNAUTHENTICATED');
      return true;
    }
  );
  assert.strictEqual(nextCalled, false, 'Next should not be called when unauthenticated');
}

// 1.2 Non-Admin (Team account) trying to access Admin endpoint
{
  const req = { user: { role: 'team' } };
  const res = createMockRes();
  let nextCalled = false;
  try {
    requireAdmin(req, res, () => { nextCalled = true; });
  } catch (err) {
    assert.strictEqual(err.statusCode || err.status, 403, 'Non-admin access should throw 403');
    assert.strictEqual(err.errorCode, 'FORBIDDEN');
  }
  assert.strictEqual(nextCalled, false, 'Next should not be called for non-admin');
}

// 1.3 Valid Admin User Passes
{
  const req = { user: { role: 'admin' } };
  const res = createMockRes();
  let nextCalled = false;
  requireAdmin(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, 'Admin user must pass requireAdmin guard');
}

// =========================================================================
// 2. Slip Retrieval Security & Delivery
// =========================================================================
console.log('• Testing Slip Retrieval Endpoint & Security...');

// 2.1 Invalid ObjectId Format
{
  const req = { params: { id: 'not-a-valid-id' } };
  const res = createMockRes();
  await getAdminRegistrationSlip(req, res, () => {});
  assert.strictEqual(res.statusCode, 400, 'Invalid ObjectId should return 400');
  assert.strictEqual(res.body?.error?.code, 'INVALID_ID');
}

// 2.2 Private slipKey Masking Verification
{
  const mockDoc = {
    _id: new mongoose.Types.ObjectId(),
    status: 'approved',
    feeAmount: 4000,
    teamId: {
      _id: new mongoose.Types.ObjectId(),
      name: 'CyberVanguard',
      leaderName: 'Kavindu Perera',
      leaderEmail: 'kavindu@cybervanguard.io',
      members: [],
    },
    payment: {
      reference: 'BOC-99281729',
      slipKey: 'super_secret_private_storage_key_123.png',
      slipMime: 'image/png',
      hasSlip: true,
    },
  };

  const formatted = formatRegistrationRecord(mockDoc);
  assert.strictEqual(formatted.payment.hasSlip, true);
  assert.strictEqual(formatted.payment.slipKey, undefined, 'Private slipKey must NEVER be exposed in JSON output');
  assert.strictEqual(formatted.teamName, 'CyberVanguard');
}

// =========================================================================
// 3. Review Validation Logic
// =========================================================================
console.log('• Testing Review Decision Validations...');

// 3.1 Invalid ID
{
  const req = { params: { id: 'bad-id' }, body: { status: 'approved' } };
  const res = createMockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body?.error?.code, 'INVALID_ID');
}

// 3.2 Invalid Review Decision
{
  const validId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: validId }, body: { status: 'unknown_action' } };
  const res = createMockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body?.error?.code, 'INVALID_STATUS');
}

// 3.3 Rejection Requires Non-Empty Reason
{
  const validId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: validId }, body: { status: 'rejected', rejectionReason: '   ' } };
  const res = createMockRes();
  await reviewAdminRegistration(req, res, () => {});
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body?.error?.code, 'REJECTION_REASON_REQUIRED');
}

console.log('✓ All End-to-End Review, Slip & Auth Verification Tests Passed Successfully!');
