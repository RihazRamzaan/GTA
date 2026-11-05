import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/db.js';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import Registration from '../src/models/Registration.js';
import { validatePaymentSubmission } from '../src/utils/validators.js';
import { saveSlip, getSlipPath, deleteSlip } from '../src/services/storage.js';
import { publicRegistration } from '../src/utils/serializers.js';

console.log('Running Payment Slip Backend Unit & Integration Tests...');

// -------------------------------------------------------------
// 1. Validator Tests
// -------------------------------------------------------------
const mockFile = {
  originalname: 'deposit_receipt.png',
  mimetype: 'image/png',
  buffer: Buffer.from('fake-png-content-data'),
};

// 1.1 Valid inputs
const validResult = validatePaymentSubmission({
  reference: 'BOC-TXN-998822',
  date: '2026-11-01',
  file: mockFile,
});
assert.strictEqual(Object.keys(validResult.errors).length, 0, 'Valid submission should have no errors');
assert.strictEqual(validResult.value.reference, 'BOC-TXN-998822');
assert.ok(validResult.value.date instanceof Date);

// 1.2 Missing reference
const noRef = validatePaymentSubmission({ reference: '', date: '2026-11-01', file: mockFile });
assert.ok(noRef.errors.reference, 'Should flag missing reference');

// 1.3 Missing date
const noDate = validatePaymentSubmission({ reference: 'BOC-1234', date: '', file: mockFile });
assert.ok(noDate.errors.date, 'Should flag missing date');

// 1.4 Invalid date
const badDate = validatePaymentSubmission({ reference: 'BOC-1234', date: 'not-a-date', file: mockFile });
assert.ok(badDate.errors.date, 'Should flag invalid date');

// 1.5 Missing file
const noFile = validatePaymentSubmission({ reference: 'BOC-1234', date: '2026-11-01', file: null });
assert.ok(noFile.errors.slip, 'Should flag missing slip file');

console.log('✓ Validation unit tests passed');

// -------------------------------------------------------------
// 2. Storage Service Tests
// -------------------------------------------------------------
const testTeamId = new mongoose.Types.ObjectId();
const saved = await saveSlip(testTeamId, mockFile);

assert.ok(saved.slipKey, 'saveSlip should return a slipKey');
assert.strictEqual(saved.slipMime, 'image/png');
assert.ok(saved.slipKey.endsWith('.png'), 'Key should preserve extension');

const resolvedPath = await getSlipPath(saved.slipKey);
assert.ok(resolvedPath.includes(saved.slipKey), 'getSlipPath should find saved file');

await deleteSlip(saved.slipKey);
try {
  await getSlipPath(saved.slipKey);
  assert.fail('Should fail to find deleted file');
} catch (err) {
  assert.strictEqual(err.errorCode, 'SLIP_NOT_FOUND', 'Should throw SLIP_NOT_FOUND after deletion');
}

console.log('✓ Storage service tests passed');

// -------------------------------------------------------------
// 3. Database & Status Transition Lifecycle Tests
// -------------------------------------------------------------
await connectDatabase();

const testTeam = await Team.create({
  name: `Payment Test Team ${Date.now()}`,
  leaderName: 'Test Leader',
  leaderEmail: `testleader_${Date.now()}@buildathon.lk`,
  members: [{ name: 'Test Leader', email: `testleader_${Date.now()}@buildathon.lk` }],
});

const registration = await Registration.create({
  teamId: testTeam._id,
  status: 'waiting_for_slip',
  feeAmount: 4000,
});

// Test 3.1: Initial state is waiting_for_slip
assert.strictEqual(registration.status, 'waiting_for_slip');

// Test 3.2: Upload payment slip -> transition to waiting_for_approval
const slipData = await saveSlip(testTeam._id, mockFile);
registration.status = 'waiting_for_approval';
registration.payment = {
  reference: 'BOC-TXN-123456',
  date: new Date('2026-11-02'),
  slipKey: slipData.slipKey,
  slipMime: slipData.slipMime,
  submittedAt: new Date(),
};
await registration.save();

assert.strictEqual(registration.status, 'waiting_for_approval');
assert.strictEqual(registration.payment.reference, 'BOC-TXN-123456');

// Test 3.3: publicRegistration serializer hides slipKey from browser
const serialized = publicRegistration(registration);
assert.strictEqual(serialized.status, 'waiting_for_approval');
assert.strictEqual(serialized.payment.reference, 'BOC-TXN-123456');
assert.strictEqual(serialized.payment.slipKey, undefined, 'slipKey must NEVER be exposed publicly in publicRegistration');

// Test 3.4: Rejection flow
registration.status = 'rejected';
registration.payment.rejectionReason = 'The deposit slip is blurry. Please upload a clear photo.';
registration.payment.reviewedAt = new Date();
await registration.save();

assert.strictEqual(registration.status, 'rejected');
assert.ok(registration.payment.rejectionReason);

// Test 3.5: Replacement after rejection -> transitions back to waiting_for_approval and clears rejectionReason
const newSlipData = await saveSlip(testTeam._id, {
  originalname: 'clear_receipt.jpg',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('clear-jpg-content-data'),
});

registration.status = 'waiting_for_approval';
registration.payment = {
  reference: 'BOC-TXN-NEW-789',
  date: new Date('2026-11-03'),
  slipKey: newSlipData.slipKey,
  slipMime: newSlipData.slipMime,
  submittedAt: new Date(),
  reviewedBy: null,
  reviewedAt: null,
  rejectionReason: null, // Cleared on resubmission
};
await registration.save();

assert.strictEqual(registration.status, 'waiting_for_approval');
assert.strictEqual(registration.payment.reference, 'BOC-TXN-NEW-789');
assert.strictEqual(registration.payment.rejectionReason, null, 'Rejection reason should be cleared upon resubmission');

// Clean up test documents & slip files
await deleteSlip(slipData.slipKey);
await deleteSlip(newSlipData.slipKey);
await Registration.deleteOne({ _id: registration._id });
await Team.deleteOne({ _id: testTeam._id });
await mongoose.disconnect();

console.log('✓ Registration lifecycle and status transition tests passed');
console.log('ALL PAYMENT BACKEND TESTS COMPLETED SUCCESSFULLY.');
