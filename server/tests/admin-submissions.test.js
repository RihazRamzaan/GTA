import assert from 'node:assert';
import mongoose from 'mongoose';
import {
  formatSubmissionRecord,
  getAdminSubmissions,
} from '../src/controllers/admin.controller.js';
import Submission from '../src/models/Submission.js';
import { requireAdmin } from '../src/middleware/requireAdmin.js';

console.log('Running Admin Submissions Backend Unit Tests...');

// 1. Format Submission Record Unit Tests
const mockTeamId = new mongoose.Types.ObjectId();
const mockSubmissionId = new mongoose.Types.ObjectId();

const mockSubmission = {
  _id: mockSubmissionId,
  title: 'Neon Odyssey 2099',
  description: 'Cyberpunk racing arcade game with synthwave tracks',
  repoUrl: 'https://github.com/cybervanguard/neon-odyssey-2099',
  playableUrl: 'https://cybervanguard.itch.io/neon-odyssey',
  videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
  submittedAt: new Date('2026-10-31T14:20:00Z'),
  createdAt: new Date('2026-10-31T14:00:00Z'),
  updatedAt: new Date('2026-10-31T14:20:00Z'),
  teamId: {
    _id: mockTeamId,
    name: 'CyberVanguard',
    leaderName: 'Kavindu Perera',
    leaderEmail: 'kavindu@cybervanguard.io',
    members: [
      { name: 'Ravindu Silva', email: 'ravindu@cybervanguard.io' },
      { name: 'Shenal Fernando', email: 'shenal@cybervanguard.io' },
    ],
  },
};

const formatted = formatSubmissionRecord(mockSubmission);
assert.strictEqual(formatted.id.toString(), mockSubmissionId.toString(), 'Should format id');
assert.strictEqual(formatted.title, 'Neon Odyssey 2099', 'Should format project title');
assert.strictEqual(formatted.teamName, 'CyberVanguard', 'Should format team name');
assert.strictEqual(formatted.leaderName, 'Kavindu Perera', 'Should format leader name');
assert.strictEqual(formatted.leaderEmail, 'kavindu@cybervanguard.io', 'Should format leader email');
assert.strictEqual(formatted.membersCount, 3, 'Should include leader + members in count');
assert.strictEqual(formatted.repoUrl, 'https://github.com/cybervanguard/neon-odyssey-2099', 'Should format repoUrl');
assert.strictEqual(formatted.playableUrl, 'https://cybervanguard.itch.io/neon-odyssey', 'Should format playableUrl');
assert.strictEqual(formatted.videoUrl, 'https://youtu.be/dQw4w9WgXcQ', 'Should format videoUrl');
assert(formatted.submittedAt, 'Should have submittedAt timestamp');

// Test fallback for submission with minimal/unpopulated data
const minimalFormatted = formatSubmissionRecord({
  _id: new mongoose.Types.ObjectId(),
  title: 'Glitch Runner',
  repoUrl: 'https://github.com/example/glitch',
});
assert.strictEqual(minimalFormatted.title, 'Glitch Runner', 'Should format title');
assert.strictEqual(minimalFormatted.teamName, 'Unnamed Squad', 'Fallback team name');
assert.strictEqual(minimalFormatted.membersCount, 0, 'Fallback member count');

// 2. Test Role Guard (requireAdmin)
const createMockRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = data;
    return this;
  },
});

// Admin role allowed
let adminNextCalled = false;
requireAdmin(
  { user: { role: 'admin' } },
  createMockRes(),
  () => { adminNextCalled = true; }
);
assert.strictEqual(adminNextCalled, true, 'Admin role should pass requireAdmin middleware');

// Non-admin / Team role blocked
assert.throws(
  () => {
    requireAdmin(
      { user: { role: 'team' } },
      createMockRes(),
      () => {}
    );
  },
  (err) => err.status === 403 && (err.errorCode === 'FORBIDDEN' || err.code === 'FORBIDDEN'),
  'Team role should be blocked with 403 FORBIDDEN by requireAdmin'
);

// 3. Test getAdminSubmissions Controller with stubbed Submission model
const originalFind = Submission.find;
try {
  let queriedWith = null;
  Submission.find = (q) => {
    queriedWith = q;
    return {
      populate: () => ({
        sort: () => ({
          lean: async () => [mockSubmission],
        }),
      }),
    };
  };

  const req = { query: {} };
  const res = createMockRes();

  await getAdminSubmissions(req, res, (err) => { if (err) throw err; });

  assert.strictEqual(res.statusCode, 200, 'Should return HTTP 200');
  assert.strictEqual(res.body.success, true, 'Response envelope success should be true');
  assert.strictEqual(Array.isArray(res.body.data), true, 'Response data should be an array');
  assert.strictEqual(res.body.data.length, 1, 'Should contain 1 formatted submission');
  assert.strictEqual(res.body.data[0].title, 'Neon Odyssey 2099', 'First item title should match');
  assert.strictEqual(res.body.data[0].teamName, 'CyberVanguard', 'Team name should match');
} finally {
  Submission.find = originalFind;
}

console.log('✓ All Admin Submissions Backend Unit Tests Passed Successfully!');
