import { httpError } from './error.js';

// Use after requireAuth.
export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') throw httpError(403, 'FORBIDDEN', 'An admin account is required.');
  next();
}
