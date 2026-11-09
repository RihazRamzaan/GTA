// One-time move of existing registrations to free registration. Run from the server folder.
// Nothing changes unless --apply is given.
//
//   node src/scripts/migrateFreeRegistration.js                        preview what would change
//   node src/scripts/migrateFreeRegistration.js --include-rejected     preview, rejected records included
//   node src/scripts/migrateFreeRegistration.js --apply [--include-rejected] [--backup-dir backups]
//   node src/scripts/migrateFreeRegistration.js --rollback <backup file> [--apply]
//
// --apply writes a full backup of the registrations collection before changing anything.
// Only status and feeAmount change. Payment details and uploaded slips are never touched.
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

const { EJSON } = mongoose.mongo.BSON;
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const includeRejected = args.includes('--include-rejected');
const valueOf = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const rollbackFile = valueOf('--rollback');
const backupDir = path.resolve(valueOf('--backup-dir') ?? 'backups');

// Statuses that only waited on payment, so they become confirmed.
const PAYMENT_ONLY = ['waiting_for_slip', 'waiting_for_approval'];
const KNOWN = [...PAYMENT_ONLY, 'approved', 'rejected'];

function table(rows) {
  if (!rows.length) return '  (none)';
  return rows.map((row) => `  - ${Object.entries(row).map(([key, value]) => `${key}: ${value ?? '-'}`).join(' | ')}`).join('\n');
}

async function classify() {
  const [registrations, teams, teamUsers] = await Promise.all([
    Registration.find().lean(),
    Team.find().lean(),
    User.find({ role: 'team' }).lean(),
  ]);
  const teamsById = new Map(teams.map((team) => [String(team._id), team]));
  const loginTeamIds = new Set(teamUsers.map((user) => String(user.teamId)));
  const registeredTeamIds = new Set(registrations.map((registration) => String(registration.teamId)));

  const result = { registrations, migrate: [], confirmed: [], exceptions: [] };
  for (const registration of registrations) {
    const team = teamsById.get(String(registration.teamId));
    const row = {
      registration: String(registration._id),
      team: team?.name,
      leader: team?.leaderEmail,
      status: registration.status,
      fee: registration.feeAmount,
      slip: registration.payment?.slipKey ? 'yes' : 'no',
      rejectionReason: registration.payment?.rejectionReason,
    };

    if (!team) result.exceptions.push({ ...row, why: 'team record is missing' });
    else if (!loginTeamIds.has(String(team._id))) result.exceptions.push({ ...row, why: 'team has no login account' });
    else if (!KNOWN.includes(registration.status)) result.exceptions.push({ ...row, why: 'unknown status' });
    else if (registration.status === 'approved') result.confirmed.push(row);
    else if (PAYMENT_ONLY.includes(registration.status) || (registration.status === 'rejected' && includeRejected)) result.migrate.push({ ...row, original: registration });
    else result.exceptions.push({ ...row, why: 'rejected: needs a supervisor decision (rerun with --include-rejected)' });
  }
  for (const team of teams) {
    if (!registeredTeamIds.has(String(team._id))) result.exceptions.push({ team: team.name, leader: team.leaderEmail, why: 'team has no registration' });
  }
  return result;
}

function printSummary({ registrations, migrate, confirmed, exceptions }) {
  const counts = registrations.reduce((all, { status }) => ({ ...all, [status]: (all[status] ?? 0) + 1 }), {});
  console.log(`\nDatabase: ${mongoose.connection.name} on ${mongoose.connection.host}`);
  console.log(`Registrations: ${registrations.length} ${JSON.stringify(counts)}`);
  console.log(`\nWill become approved with feeAmount 0: ${migrate.length}`);
  console.log(table(migrate.map(({ original, ...row }) => row)));
  console.log(`\nAlready approved, left unchanged (fee kept as recorded): ${confirmed.length}`);
  console.log(`  of which have a nonzero fee: ${confirmed.filter((row) => row.fee).length}`);
  console.log(`\nExceptions to inspect, left unchanged: ${exceptions.length}`);
  console.log(table(exceptions));
}

async function migrate() {
  const plan = await classify();
  printSummary(plan);
  if (!apply) return console.log('\nPreview only. Nothing was changed. Add --apply to run it.');
  if (!plan.migrate.length) return console.log('\nNothing to migrate.');

  // Back up the whole collection before the first write.
  await fs.mkdir(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `free-registration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  const backup = {
    createdAt: new Date(),
    database: mongoose.connection.name,
    includeRejected,
    migrated: plan.migrate.map(({ original }) => ({ _id: original._id, status: original.status, feeAmount: original.feeAmount })),
    registrations: plan.registrations,
  };
  await fs.writeFile(backupFile, EJSON.stringify(backup, null, 2));
  console.log(`\nBackup written: ${backupFile}`);

  // Each update only matches the status seen in the preview, so a record that changed since is skipped.
  let changed = 0;
  const skipped = [];
  for (const { original, team } of plan.migrate) {
    const { modifiedCount } = await Registration.collection.updateOne(
      { _id: original._id, status: original.status },
      { $set: { status: 'approved', feeAmount: 0 } },
    );
    if (modifiedCount) changed += 1;
    else skipped.push({ registration: String(original._id), team, why: 'changed since the preview' });
  }
  console.log(`\nMigrated: ${changed}. Skipped: ${skipped.length}`);
  console.log(table(skipped));
  console.log(`\nTo undo: node src/scripts/migrateFreeRegistration.js --rollback "${backupFile}" --apply`);
}

async function rollback() {
  const backup = EJSON.parse(await fs.readFile(path.resolve(rollbackFile), 'utf8'));
  console.log(`\nDatabase: ${mongoose.connection.name} on ${mongoose.connection.host}`);
  console.log(`Backup from ${new Date(backup.createdAt).toISOString()} for database ${backup.database}: ${backup.migrated.length} migrated records`);
  if (backup.database !== mongoose.connection.name) throw new Error('This backup was made for a different database.');

  // Only records still in their migrated state are restored, so later changes are never overwritten.
  let restored = 0;
  const skipped = [];
  for (const record of backup.migrated) {
    const filter = { _id: record._id, status: 'approved', feeAmount: 0 };
    const restore = { $set: { status: record.status, feeAmount: record.feeAmount } };
    const eligible = apply ? (await Registration.collection.updateOne(filter, restore)).modifiedCount : await Registration.collection.countDocuments(filter);
    if (eligible) restored += 1;
    else skipped.push({ registration: String(record._id), why: 'changed since the migration' });
  }
  console.log(`${apply ? 'Restored' : 'Would restore'}: ${restored}. Skipped: ${skipped.length}`);
  console.log(table(skipped));
  if (!apply) console.log('\nPreview only. Nothing was changed. Add --apply to run it.');
}

try {
  await connectDatabase();
  await (rollbackFile ? rollback() : migrate());
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
