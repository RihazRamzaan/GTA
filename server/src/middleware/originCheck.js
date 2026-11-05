import { env } from '../config/env.js';
import { httpError } from './error.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

// CSRF defense for cookie auth: browsers send Origin on cross-site writes, so reject any other site.
export function originCheck(req, _res, next) {
  const origin = req.get('origin');
  const isAllowedDev = env.nodeEnv !== 'production' && origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (!safeMethods.has(req.method) && origin && origin !== env.clientOrigin && !isAllowedDev) {
    throw httpError(403, 'FORBIDDEN_ORIGIN', 'This request is not allowed from that website.');
  }
  next();
}
