import { rateLimit } from 'express-rate-limit';
import { httpError } from './error.js';

const windowMs = 15 * 60 * 1000;
const handler = (_req, _res, next) => next(httpError(429, 'TOO_MANY_REQUESTS', 'Too many attempts. Please try again in 15 minutes.'));

// Limits are per IP and many students may share one campus address, so only failed logins count.
export const loginLimiter = rateLimit({ windowMs, limit: 20, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false, handler });
export const registerLimiter = rateLimit({ windowMs, limit: 30, standardHeaders: true, legacyHeaders: false, handler });
