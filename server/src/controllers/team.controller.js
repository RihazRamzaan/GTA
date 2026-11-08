// Team controller ownership: Akindu (team details), Thanish (payment).
// Handlers only use req.user.teamId, so a team can never name another team in a request.
import { env } from '../config/env.js';
import { httpError } from '../middleware/error.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import { saveSlip, getSlipPath, deleteSlip } from '../services/storage.js';
import { publicRegistration, publicTeam } from '../utils/serializers.js';
import { validateTeamUpdate, validatePaymentSubmission } from '../utils/validators.js';

async function loadOwnTeam(req) {
  const team = await Team.findById(req.user.teamId);
  if (!team) throw httpError(404, 'TEAM_NOT_FOUND', 'Your team was not found.');
  return team;
}

export async function getMyTeam(req, res) {
  const [team, submission] = await Promise.all([loadOwnTeam(req), Submission.findOne({ teamId: req.user.teamId })]);
  res.json({
    success: true,
    data: {
      team: publicTeam(team),
      registration: publicRegistration(req.registration),
      submission: submission && { id: submission.id, title: submission.title, submittedAt: submission.submittedAt, updatedAt: submission.updatedAt },
    },
  });
}

export async function updateMyTeam(req, res) {
  if (req.registration.status === 'approved') throw httpError(403, 'TEAM_LOCKED', 'Team details cannot be changed after approval.');

  const team = await loadOwnTeam(req);
  const { errors, value } = validateTeamUpdate(req.body, team, { minSize: env.teamMinSize, maxSize: env.teamMaxSize });
  if (Object.keys(errors).length) throw httpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', errors);

  team.set(value);
  try {
    await team.save();
  } catch (error) {
    if (error.code === 11000) throw httpError(409, 'DUPLICATE_TEAM_NAME', 'That team name is already taken.', { teamName: 'That team name is already taken.' });
    throw error;
  }
  res.json({ success: true, data: { team: publicTeam(team) } });
}

/**
 * Upload bank-transfer slip with reference number and payment date.
 * - Saves the file privately and records only its storage reference with registration.
 * - Changes registration status to waiting_for_approval after upload.
 * - Allows replacement after rejection, but not while already waiting for approval.
 */
export async function submitPayment(req, res) {
  const { registration } = req;
  if (!registration) {
    throw httpError(404, 'REGISTRATION_NOT_FOUND', 'No registration was found for your team.');
  }

  // Allow replacement after rejection, but not while already waiting for approval.
  if (registration.status === 'waiting_for_approval') {
    throw httpError(
      409,
      'PAYMENT_UNDER_REVIEW',
      'Your payment slip is already waiting for approval. You cannot submit a replacement while under review.'
    );
  }

  if (registration.status === 'approved') {
    throw httpError(
      409,
      'PAYMENT_ALREADY_APPROVED',
      'Your registration payment has already been approved.'
    );
  }

  // Validate reference, payment date, and attached slip file
  const { errors, value } = validatePaymentSubmission({
    reference: req.body?.reference,
    date: req.body?.date,
    file: req.file,
  });

  if (Object.keys(errors).length) {
    throw httpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', errors);
  }

  // If replacing an existing rejected slip, remove the old file from private storage
  if (registration.payment?.slipKey) {
    await deleteSlip(registration.payment.slipKey);
  }

  // Save the file privately and record only its storage reference
  const { slipKey, slipMime } = await saveSlip(req.user.teamId, req.file);

  // Update status to waiting_for_approval and update payment record
  registration.status = 'waiting_for_approval';
  registration.payment = {
    reference: value.reference,
    date: value.date,
    slipKey,
    slipMime,
    submittedAt: new Date(),
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
  };

  await registration.save();

  res.status(200).json({
    success: true,
    data: {
      registration: publicRegistration(registration),
    },
  });
}

/**
 * Team leader views their own uploaded slip file securely.
 */
export async function getMyPaymentSlip(req, res) {
  const { registration } = req;
  const slipKey = registration?.payment?.slipKey;
  if (!slipKey) {
    throw httpError(404, 'SLIP_NOT_FOUND', 'No payment slip has been uploaded yet.');
  }

  const filePath = await getSlipPath(slipKey);
  if (registration.payment.slipMime) {
    res.type(registration.payment.slipMime);
  }
  res.sendFile(filePath);
}
