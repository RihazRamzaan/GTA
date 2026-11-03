import assert from 'node:assert';
import { isGateOpen, evaluateGateStatuses, requireRegistrationOpen, requireSubmissionOpen } from '../src/services/gates.js';
import { validateMilestonesChronology } from '../src/utils/dates.js';
import { requireAdmin } from '../src/middleware/requireAdmin.js';
import { requireAuth } from '../src/middleware/auth.js';

console.log('Running Gates, Auth & Settings Unit Tests...');

// 1. Gate Logic Tests
const opensAt = '2026-11-05T00:00:00.000Z';
const closesAt = '2026-11-15T23:59:59.000Z';

assert.strictEqual(
  isGateOpen('force_open', opensAt, closesAt, new Date('2026-11-01T00:00:00.000Z')),
  true,
  'force_open should always return true'
);

assert.strictEqual(
  isGateOpen('force_closed', opensAt, closesAt, new Date('2026-11-10T00:00:00.000Z')),
  false,
  'force_closed should always return false'
);

assert.strictEqual(
  isGateOpen('auto', opensAt, closesAt, new Date('2026-11-04T23:59:59.000Z')),
  false,
  'auto mode before opensAt should return false'
);

assert.strictEqual(
  isGateOpen('auto', opensAt, closesAt, new Date('2026-11-10T12:00:00.000Z')),
  true,
  'auto mode between opensAt and closesAt should return true'
);

assert.strictEqual(
  isGateOpen('auto', opensAt, closesAt, new Date('2026-11-16T00:00:00.000Z')),
  false,
  'auto mode after closesAt should return false'
);

// 2. Chronology Validation Tests
const validMilestones = {
  registrationOpensAt: '2026-11-05T00:00:00.000Z',
  registrationClosesAt: '2026-11-15T23:59:59.000Z',
  buildingStartsAt: '2026-11-16T09:00:00.000Z',
  submissionOpensAt: '2026-11-27T12:00:00.000Z',
  submissionClosesAt: '2026-12-10T18:00:00.000Z',
  resultsAt: '2026-12-15T15:00:00.000Z',
};

const validResult = validateMilestonesChronology(validMilestones);
assert.strictEqual(validResult.valid, true, 'Valid milestones should pass');

const invalidRegDates = {
  ...validMilestones,
  registrationOpensAt: '2026-11-20T00:00:00.000Z',
  registrationClosesAt: '2026-11-10T00:00:00.000Z',
};
const invalidRegResult = validateMilestonesChronology(invalidRegDates);
assert.strictEqual(invalidRegResult.valid, false, 'Invalid registration date order should fail');

// 3. Effective Status Evaluation Test
const mockSettings = {
  milestones: validMilestones,
  registrationMode: 'auto',
  submissionMode: 'force_closed',
};

const evaluation = evaluateGateStatuses(mockSettings, new Date('2026-11-10T00:00:00.000Z'));
assert.strictEqual(evaluation.registrationOpen, true, 'Registration should be evaluated as open');
assert.strictEqual(evaluation.submissionOpen, false, 'Submission should be evaluated as force closed');
assert.ok(evaluation.serverTime, 'serverTime should be provided');

// 4. Admin Middleware Protection Tests
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

// 4a. Unauthenticated admin request -> 401
const unauthRes = createMockRes();
let unauthNextCalled = false;
requireAdmin({ session: null }, unauthRes, () => { unauthNextCalled = true; });
assert.strictEqual(unauthRes.statusCode, 401, 'Unauthenticated admin request should return 401');
assert.strictEqual(unauthRes.body?.error?.code, 'UNAUTHORIZED');
assert.strictEqual(unauthNextCalled, false, 'next() should not be called when unauthenticated');

// 4b. Non-admin user request -> 403
const forbiddenRes = createMockRes();
let forbiddenNextCalled = false;
requireAdmin({ session: { user: { role: 'team' } } }, forbiddenRes, () => { forbiddenNextCalled = true; });
assert.strictEqual(forbiddenRes.statusCode, 403, 'Non-admin request should return 403');
assert.strictEqual(forbiddenRes.body?.error?.code, 'FORBIDDEN');
assert.strictEqual(forbiddenNextCalled, false, 'next() should not be called for non-admin');

// 4c. Authenticated admin request -> next() called
const authAdminRes = createMockRes();
let authAdminNextCalled = false;
requireAdmin({ session: { user: { role: 'admin' } } }, authAdminRes, () => { authAdminNextCalled = true; });
assert.strictEqual(authAdminNextCalled, true, 'next() should be called for authenticated admin');

// 4d. requireAuth tests
const noAuthRes = createMockRes();
let noAuthNextCalled = false;
requireAuth({ session: {} }, noAuthRes, () => { noAuthNextCalled = true; });
assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated requireAuth should return 401');

const validAuthRes = createMockRes();
let validAuthNextCalled = false;
requireAuth({ session: { user: { role: 'team' } } }, validAuthRes, () => { validAuthNextCalled = true; });
assert.strictEqual(validAuthNextCalled, true, 'Authenticated requireAuth should proceed');

console.log('All Gates, Auth & Settings Unit Tests Passed Successfully!');
