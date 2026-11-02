import assert from 'node:assert';
import { isGateOpen, evaluateGateStatuses } from '../src/services/gates.js';
import { validateMilestonesChronology } from '../src/utils/dates.js';

console.log('Running Gates & Settings Unit Tests...');

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

console.log('All Gates & Settings Unit Tests Passed Successfully!');
