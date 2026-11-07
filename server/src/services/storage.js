import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { httpError } from '../middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Private storage directory outside public web root
const STORAGE_DIR = path.resolve(__dirname, '../../storage/slips');

// Ensure directory exists
async function ensureStorageDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function getExtension(filename, mimetype) {
  if (MIME_EXTENSIONS[mimetype]) return MIME_EXTENSIONS[mimetype];
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) return ext;
  return '.bin';
}

/**
 * Saves a payment slip buffer privately to disk.
 * Records only the storage reference (slipKey) with the registration.
 */
export async function saveSlip(teamId, file) {
  if (!file || !file.buffer) {
    throw httpError(400, 'NO_FILE', 'No file was uploaded.');
  }

  await ensureStorageDir();

  const ext = getExtension(file.originalname || '', file.mimetype);
  const safeId = String(teamId).replace(/[^a-zA-Z0-9]/g, '');
  const uniqueSuffix = `${Date.now()}_${randomBytes(8).toString('hex')}`;
  const slipKey = `slip_${safeId}_${uniqueSuffix}${ext}`;
  const filePath = path.join(STORAGE_DIR, slipKey);

  await fs.writeFile(filePath, file.buffer);

  return {
    slipKey,
    slipMime: file.mimetype || 'application/octet-stream',
  };
}

/**
 * Resolves the private absolute path for a slipKey, preventing path traversal.
 */
export async function getSlipPath(slipKey) {
  if (!slipKey || typeof slipKey !== 'string') {
    throw httpError(404, 'SLIP_NOT_FOUND', 'Payment slip was not found.');
  }

  // Prevent path traversal
  const safeKey = path.basename(slipKey);
  const filePath = path.join(STORAGE_DIR, safeKey);

  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    throw httpError(404, 'SLIP_NOT_FOUND', 'Payment slip file was not found.');
  }
}

/**
 * Deletes a previously stored slip file if present (e.g. when replacing a rejected slip).
 */
export async function deleteSlip(slipKey) {
  if (!slipKey || typeof slipKey !== 'string') return;
  try {
    const safeKey = path.basename(slipKey);
    const filePath = path.join(STORAGE_DIR, safeKey);
    await fs.unlink(filePath);
  } catch {
    // Ignore if already deleted or missing
  }
}
