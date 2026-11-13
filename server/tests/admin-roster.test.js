import assert from 'node:assert/strict';
import test from 'node:test';
import { formatRegistrationRecord, formatSubmissionRecord } from '../src/controllers/admin.controller.js';

const leader = { name: 'Leader', email: 'leader@example.com' };
const member = { name: 'Member', email: 'member@example.com' };
const team = members => ({ _id: 'team', name: 'Team', leaderName: leader.name, leaderEmail: leader.email, members });

for (const [label, serialize] of [['registration', formatRegistrationRecord], ['submission', formatSubmissionRecord]]) {
  test(`${label}: stored leader-inclusive roster has the correct count and one leader`, () => {
    const storedTeam = team([leader, member]);
    const original = structuredClone(storedTeam);
    const result = serialize({ _id: 'record', teamId: storedTeam });
    assert.equal(result.membersCount, 2);
    assert.equal(result.members.length, 2);
    assert.equal(result.team.members.length, 2);
    assert.deepEqual(result.members[0], { ...leader, role: 'Team Leader' });
    assert.deepEqual(result.members[1], member);
    assert.deepEqual(storedTeam, original, 'Formatting must not mutate database roster data');
  });
  test(`${label}: legacy leader-excluded roster still includes the leader`, () => {
    const result = serialize({ teamId: team([member]) });
    assert.equal(result.membersCount, 2);
    assert.deepEqual(result.members.map(entry => entry.email), [leader.email, member.email]);
  });
  test(`${label}: duplicate leader rows with case or whitespace differences are removed`, () => {
    const result = serialize({ teamId: team([leader, { name: 'Old leader name', email: ' LEADER@example.com ' }, member]) });
    assert.equal(result.membersCount, 2);
    assert.equal(result.members.filter(entry => entry.role === 'Team Leader').length, 1);
    assert.deepEqual(result.members[1], member);
  });
}
