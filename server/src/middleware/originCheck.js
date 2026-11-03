import { env } from '../config/env.js';
import { httpError } from './error.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

// CSRF defense for cookie auth: browsers send Origin on cross-site writes, so reject any other site.
export function originCheck(req, _res, next) {
  const origin = req.get('origin');
  if (!safeMethods.has(req.method) && origin && origin !== env.clientOrigin) throw httpError(403, 'FORBIDDEN_ORIGIN', 'This request is not allowed from that website.');
  next();
}
