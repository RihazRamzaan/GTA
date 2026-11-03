// Creates the single admin from ADMIN_EMAIL and ADMIN_PASSWORD in server/.env. Safe to run twice.
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import { isEmail, isValidPassword, normalizeEmail } from '../utils/validators.js';

const { ADMIN_EMAIL: adminEmail, ADMIN_PASSWORD: adminPassword } = process.env;

async function seedAdmin() {
  if (await User.exists({ role: 'admin' })) return console.log('An admin already exists. Nothing was changed.');
  if (!isEmail(adminEmail) || !isValidPassword(adminPassword)) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of 8 to 72 characters in server/.env.');

  const email = normalizeEmail(adminEmail);
  if (await User.exists({ email })) throw new Error('That email already belongs to a team account.');

  await User.create({ email, passwordHash: await bcrypt.hash(adminPassword, 12), role: 'admin', teamId: null });
  console.log(`Admin created for ${email}. Remove ADMIN_PASSWORD from server/.env now.`);
}

try {
  await connectDatabase();
  await seedAdmin();
} catch (error) {
  console.error('Admin seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
