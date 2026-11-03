import Registration from '../models/Registration.js';
import { httpError } from './error.js';

// Use after requireAuth and requireTeam. Team routes read the status from req.registration.
export async function loadRegistration(req, _res, next) {
  req.registration = await Registration.findOne({ teamId: req.user.teamId });
  if (!req.registration) throw httpError(404, 'REGISTRATION_NOT_FOUND', 'No registration was found for your team.');
  next();
}
