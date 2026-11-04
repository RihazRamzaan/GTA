// Auth controller ownership: Akindu.
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { httpError } from '../middleware/error.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { getCurrentGates } from '../services/gates.js';
import { publicRegistration, publicTeam, publicUser } from '../utils/serializers.js';
import { isEmail, normalizeEmail, validateRegistration } from '../utils/validators.js';

const HASH_COST = 12;
// Compared when the email is unknown, so both failures take about the same time.
const unknownUserHash = bcrypt.hashSync(randomBytes(32).toString('hex'), HASH_COST);

// A new session ID on every sign-in prevents session fixation.
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);
      req.session.userId = String(userId);
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
    });
  });
}

function duplicateError(error) {
  if (error.keyPattern?.name) return httpError(409, 'DUPLICATE_TEAM_NAME', 'That team name is already taken.', { teamName: 'That team name is already taken.' });
  return httpError(409, 'DUPLICATE_EMAIL', 'That email is already registered.', { email: 'That email is already registered.' });
}

export async function register(req, res) {
  const { registrationOpen } = await getCurrentGates();
  if (!registrationOpen) throw httpError(403, 'REGISTRATION_CLOSED', 'Registration is closed.');
  if (req.session.userId) throw httpError(409, 'ALREADY_SIGNED_IN', 'You are already signed in. Log out to register another team.');

  const { errors, value } = validateRegistration(req.body, { minSize: env.teamMinSize, maxSize: env.teamMaxSize });
  if (Object.keys(errors).length) throw httpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', errors);

  const passwordHash = await bcrypt.hash(value.password, HASH_COST);

  // Standalone MongoDB has no transactions, so undo earlier writes if a later one fails.
  // The unique indexes settle two people registering at the same moment.
  let team;
  let user;
  let registration;
  try {
    team = await Team.create(value.team);
    user = await User.create({ email: value.email, passwordHash, role: 'team', teamId: team._id });
    registration = await Registration.create({ teamId: team._id, status: 'waiting_for_slip', feeAmount: env.registrationFee });
  } catch (error) {
    await Promise.allSettled([user && User.deleteOne({ _id: user._id }), team && Team.deleteOne({ _id: team._id })]);
    throw error.code === 11000 ? duplicateError(error) : error;
  }

  await startSession(req, user._id);
  res.status(201).json({ success: true, data: { user: publicUser(user), team: publicTeam(team), registration: publicRegistration(registration) } });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  const user = isEmail(email) && typeof password === 'string' ? await User.findOne({ email: normalizeEmail(email) }) : null;
  const matches = await bcrypt.compare(typeof password === 'string' ? password : '', user?.passwordHash ?? unknownUserHash);
  if (!user || !matches) throw httpError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');

  await startSession(req, user._id);
  res.json({ success: true, data: { user: publicUser(user) } });
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.json({ success: true, data: { loggedOut: true } });
  });
}

export async function me(req, res) {
  const { user } = req;
  const [team, registration] = user.teamId ? await Promise.all([Team.findById(user.teamId), Registration.findOne({ teamId: user.teamId })]) : [null, null];
  res.json({ success: true, data: { user: publicUser(user), team: publicTeam(team), registration: publicRegistration(registration) } });
}
