import multer from 'multer';
import { httpError } from './error.js';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, callback) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(httpError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, WEBP images or PDF files are accepted.', {
        slip: 'Only JPG, PNG, WEBP images or PDF files are accepted.',
      }));
    }
  },
});

export const uploadPlaceholder = upload;

export const uploadSlip = upload.single('slip');

/**
 * Express middleware for single slip upload.
 * Maps Multer errors to standardized HTTP error responses.
 */
export function handleSlipUpload(req, res, next) {
  uploadSlip(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(httpError(413, 'FILE_TOO_LARGE', 'The uploaded file exceeds the 5MB size limit.', {
          slip: 'File exceeds 5MB limit.',
        }));
      }
      return next(httpError(400, 'UPLOAD_ERROR', err.message, { slip: err.message }));
    }
    if (err) return next(err);
    next();
  });
}
