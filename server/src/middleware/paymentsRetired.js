import { httpError } from './error.js';

// Registration is free for this event, so payment uploads and reviews are switched off on the server.
// Old slips and payment details stay stored and can still be viewed.
export function paymentsRetired(_req, _res, next) {
  next(httpError(410, 'PAYMENTS_RETIRED', 'Registration is free, so payments are no longer accepted or reviewed.'));
}
