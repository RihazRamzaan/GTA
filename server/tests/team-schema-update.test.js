import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRegistration, validateTeamUpdate } from '../src/utils/validators.js';
import { publicTeam } from '../src/utils/serializers.js';
import Team from '../src/models/Team.js';

test('validateRegistration: requires university and contactNumber for leader and all members', () => {
  const baseValid = {
    email: 'leader@example.com',
    password: 'password123',
    team: {
      name: 'Alpha Team',
      leaderName: 'Leader Person',
      university: 'University of Colombo',
      contactNumber: '+94 77 123 4567',
      members: [
        { name: 'Member Two', email: 'two@example.com', contactNumber: '0719876543' },
      ],
    },
  };

  const validResult = validateRegistration(baseValid, { minSize: 1, maxSize: 4 });
  assert.equal(Object.keys(validResult.errors).length, 0);
  assert.equal(validResult.value.team.university, 'University of Colombo');
  assert.equal(validResult.value.team.contactNumber, '+94 77 123 4567');
  assert.equal(validResult.value.team.members.length, 2);
  assert.equal(validResult.value.team.members[0].contactNumber, '+94 77 123 4567');
  assert.equal(validResult.value.team.members[1].contactNumber, '0719876543');

  // Missing member contact number
  const missingMemberPhone = validateRegistration(
    {
      ...baseValid,
      team: {
        ...baseValid.team,
        members: [{ name: 'Member Two', email: 'two@example.com', contactNumber: '' }],
      },
    },
    { minSize: 1, maxSize: 4 }
  );
  assert.ok(missingMemberPhone.errors.members, 'Should reject member missing contact number');

  // Missing university
  const missingUni = validateRegistration({ ...baseValid, team: { ...baseValid.team, university: '' } }, { minSize: 1, maxSize: 4 });
  assert.ok(missingUni.errors.university, 'Should require university');

  // Missing leader contact number
  const missingPhone = validateRegistration({ ...baseValid, team: { ...baseValid.team, contactNumber: '' } }, { minSize: 1, maxSize: 4 });
  assert.ok(missingPhone.errors.contactNumber, 'Should require contactNumber');

  // Invalid contact number
  const invalidPhone = validateRegistration({ ...baseValid, team: { ...baseValid.team, contactNumber: 'abc' } }, { minSize: 1, maxSize: 4 });
  assert.ok(invalidPhone.errors.contactNumber, 'Should reject invalid phone format');
});

test('validateTeamUpdate: allows updating university and contactNumber, and does not require them for existing teams', () => {
  const legacyTeam = {
    name: 'Legacy Squad',
    leaderName: 'Old Leader',
    leaderEmail: 'leader@example.com',
    members: [{ name: 'Old Leader', email: 'leader@example.com' }],
  };

  // Legacy team updating only members without touching university/contactNumber
  const updateMembersOnly = validateTeamUpdate(
    { members: [{ name: 'Old Leader', email: 'leader@example.com' }, { name: 'Member 2', email: 'm2@example.com' }] },
    legacyTeam,
    { minSize: 1, maxSize: 4 }
  );
  assert.equal(Object.keys(updateMembersOnly.errors).length, 0);
  assert.equal(updateMembersOnly.value.university, undefined);
  assert.equal(updateMembersOnly.value.contactNumber, undefined);

  // Updating university and contactNumber on team and members
  const updateDetails = validateTeamUpdate(
    {
      teamName: 'Updated Squad',
      leaderName: 'New Leader',
      university: 'University of Kelaniya',
      contactNumber: '0712345678',
      members: [
        { name: 'New Leader', email: 'leader@example.com', contactNumber: '0712345678' },
        { name: 'Member Two', email: 'two@example.com', contactNumber: '0779998877' },
      ],
    },
    legacyTeam,
    { minSize: 1, maxSize: 4 }
  );
  assert.equal(Object.keys(updateDetails.errors).length, 0);
  assert.equal(updateDetails.value.university, 'University of Kelaniya');
  assert.equal(updateDetails.value.contactNumber, '0712345678');
  assert.equal(updateDetails.value.members[1].contactNumber, '0779998877');
});

test('publicTeam: includes university and contactNumber on team and members with empty string fallback', () => {
  const serializedEmpty = publicTeam({
    id: 'team123',
    name: 'Test Team',
    leaderName: 'Leader',
    leaderEmail: 'leader@example.com',
    members: [{ name: 'Member 1', email: 'm1@example.com' }],
  });
  assert.equal(serializedEmpty.university, '');
  assert.equal(serializedEmpty.contactNumber, '');
  assert.equal(serializedEmpty.members[0].contactNumber, '');

  const serializedFull = publicTeam({
    id: 'team123',
    name: 'Test Team',
    leaderName: 'Leader',
    leaderEmail: 'leader@example.com',
    university: 'SLIIT',
    contactNumber: '+94770001122',
    members: [{ name: 'Member 1', email: 'm1@example.com', contactNumber: '0712345678' }],
  });
  assert.equal(serializedFull.university, 'SLIIT');
  assert.equal(serializedFull.contactNumber, '+94770001122');
  assert.equal(serializedFull.members[0].contactNumber, '0712345678');
});
