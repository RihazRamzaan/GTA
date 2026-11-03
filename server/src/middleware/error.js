const defaultCodes = { 400: 'VALIDATION_ERROR', 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'FILE_TOO_LARGE', 429: 'TOO_MANY_REQUESTS' };

// Use this in controllers: throw httpError(403, 'REGISTRATION_CLOSED', 'Registration is closed.');
// `fields` is optional and maps a form field to its error message.
export function httpError(status, code, message, fields) {
  const error = new Error(message);
  error.status = status;
  error.errorCode = code;
  error.fields = fields;
  return error;
}

function statusFor(error) {
  if (error.code === 11000) return 409;
  if (error.name === 'MulterError') return error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  if (error.name === 'ValidationError' || error.name === 'CastError') return 400;
  return error.status || 500;
}

export function notFound(req, _res, next) { next(httpError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`)); }

export function errorHandler(error, _req, res, _next) {
  const status = statusFor(error);
  if (status === 500) console.error(error);
  const isDuplicate = error.code === 11000;
  res.status(status).json({
    success: false,
    error: {
      code: status === 500 ? 'INTERNAL_ERROR' : error.errorCode || defaultCodes[status] || 'REQUEST_ERROR',
      message: status === 500 ? 'Unexpected server error' : isDuplicate ? 'That record already exists.' : error.message,
      ...(error.fields && { fields: error.fields }),
    },
  });
}
