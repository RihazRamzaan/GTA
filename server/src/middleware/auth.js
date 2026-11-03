import User from '../models/User.js';
import { httpError } from './error.js';

// Loads the signed-in account into req.user. Role and teamId always come from the database.
export async function requireAuth(req, _res, next) {
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  if (!user) throw httpError(401, 'UNAUTHENTICATED', 'Please sign in.');
  req.user = user;
  next();
}

// Use after requireAuth. Team routes should only read their team through req.user.teamId.
export function requireTeam(req, _res, next) {
  if (req.user?.role !== 'team' || !req.user.teamId) throw httpError(403, 'FORBIDDEN', 'A team account is required.');
  next();
}
