import mongoose from 'mongoose';
import EventSettings from '../models/EventSettings.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import { validateMilestonesChronology } from '../utils/dates.js';
import { httpError } from '../middleware/error.js';
import { getEffectiveGates } from '../services/gates.js';
import { getSlipPath } from '../services/storage.js';

const ALLOWED_MODES = ['auto', 'force_open', 'force_closed'];

/**
 * Helper to format a populated Registration document consistently
 * for admin consumption (omitting sensitive raw storage keys).
 */
export function formatRegistrationRecord(reg) {
  if (!reg) return null;
  const team = reg.teamId || {};
  const teamMembers = Array.isArray(team.members) ? team.members : [];
  const allMembers = team.leaderName
    ? [{ name: team.leaderName, email: team.leaderEmail, role: 'Team Leader' }, ...teamMembers]
    : teamMembers;

  return {
    id: reg._id,
    _id: reg._id,
    status: reg.status,
    feeAmount: reg.feeAmount,
    teamId: team._id || reg.teamId,
    teamName: team.name || 'Unnamed Team',
    leaderName: team.leaderName || 'Unknown Leader',
    leaderEmail: team.leaderEmail || '',
    members: allMembers,
    membersCount: allMembers.length,
    team: {
      id: team._id,
      name: team.name,
      leaderName: team.leaderName,
      leaderEmail: team.leaderEmail,
      members: allMembers,
      createdAt: team.createdAt,
    },
    payment: {
      reference: reg.payment?.reference || '—',
      date: reg.payment?.date,
      slipMime: reg.payment?.slipMime,
      hasSlip: Boolean(reg.payment?.slipKey),
      submittedAt: reg.payment?.submittedAt,
      reviewedBy: reg.payment?.reviewedBy,
      reviewedAt: reg.payment?.reviewedAt,
      rejectionReason: reg.payment?.rejectionReason,
    },
    createdAt: reg.createdAt,
    updatedAt: reg.updatedAt,
  };
}

/**
 * GET /api/admin/settings
 * Retrieves the raw event settings singleton for the admin dashboard.
 */
export async function getAdminSettings(_req, res, next) {
  try {
    const settings = await EventSettings.getOrCreateSingleton();
    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/settings
 * Updates milestones and/or gate override modes.
 * Validates chronological integrity of milestone dates.
 */
export async function updateAdminSettings(req, res, next) {
  try {
    const { milestones, registrationMode, submissionMode } = req.body || {};

    if (registrationMode !== undefined && !ALLOWED_MODES.includes(registrationMode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GATE_MODE',
          message: `registrationMode must be one of: ${ALLOWED_MODES.join(', ')}`,
        },
      });
    }

    if (submissionMode !== undefined && !ALLOWED_MODES.includes(submissionMode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GATE_MODE',
          message: `submissionMode must be one of: ${ALLOWED_MODES.join(', ')}`,
        },
      });
    }

    const settings = await EventSettings.getOrCreateSingleton();

    if (milestones && typeof milestones === 'object') {
      const mergedCandidate = {
        ...settings.milestones.toObject(),
        ...milestones,
      };

      const validation = validateMilestonesChronology(mergedCandidate);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CHRONOLOGY_VIOLATION',
            message: validation.errors.join(' '),
          },
        });
      }

      // Apply valid parsed dates
      for (const [key, val] of Object.entries(validation.parsed)) {
        settings.milestones[key] = val;
      }
    }

    if (registrationMode !== undefined) {
      settings.registrationMode = registrationMode;
    }

    if (submissionMode !== undefined) {
      settings.submissionMode = submissionMode;
    }

    await settings.save();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/registrations
 * Retrieves all registrations populated with team details.
 * Supports query params:
 *   - status: filter by registration status ('waiting_for_slip', 'waiting_for_approval', 'approved', 'rejected')
 *   - search: query matching team name, leader name, or leader email
 */
export async function getAdminRegistrations(req, res, next) {
  try {
    const { status, search } = req.query || {};

    const query = {};
    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const matchingTeams = await Team.find({
        $or: [{ name: regex }, { leaderName: regex }, { leaderEmail: regex }],
      }).select('_id');

      const teamIds = matchingTeams.map((t) => t._id);
      query.teamId = { $in: teamIds };
    }

    const registrations = await Registration.find(query)
      .populate('teamId')
      .sort({ createdAt: -1 })
      .lean();

    const data = registrations.map(formatRegistrationRecord);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/registrations/:id/review
 * Reviews a registration payment slip.
 * Body:
 *   - status: 'approved' | 'rejected' (or decision: 'approve' | 'reject')
 *   - rejectionReason: string (required if rejected)
 */
export async function reviewAdminRegistration(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid registration ID format.',
        },
      });
    }

    const { status, decision, rejectionReason, reason } = req.body || {};

    let targetStatus = null;
    if (status === 'approved' || decision === 'approve') {
      targetStatus = 'approved';
    } else if (status === 'rejected' || decision === 'reject') {
      targetStatus = 'rejected';
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Review decision must be "approved" or "rejected".',
        },
      });
    }

    const reasonText = (rejectionReason || reason || '').trim();
    if (targetStatus === 'rejected' && !reasonText) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REJECTION_REASON_REQUIRED',
          message: 'A clear reason is required when rejecting a payment slip.',
        },
      });
    }

    const registration = await Registration.findById(id).populate('teamId');
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Registration record not found.',
        },
      });
    }

    if (!registration.payment) {
      registration.payment = {};
    }

    const reviewerId = req.user?._id || req.session?.userId || null;
    const now = new Date();

    registration.status = targetStatus;
    registration.payment.reviewedBy = reviewerId;
    registration.payment.reviewedAt = now;

    if (targetStatus === 'approved') {
      registration.payment.rejectionReason = undefined;
    } else {
      registration.payment.rejectionReason = reasonText;
    }

    await registration.save();

    const populated = await Registration.findById(registration._id).populate('teamId').lean();

    return res.json({
      success: true,
      data: formatRegistrationRecord(populated),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/registrations/:id/slip
 * Retrieves or streams the private bank slip file for admin verification.
 * Protected by requireAuth and requireAdmin. Never exposes private storage keys.
 */
export async function getAdminRegistrationSlip(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid registration ID format.',
        },
      });
    }

    const registration = await Registration.findById(id).populate('teamId');
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Registration record not found.',
        },
      });
    }

    const slipKey = registration.payment?.slipKey;
    if (!slipKey) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SLIP_NOT_FOUND',
          message: 'No payment slip has been uploaded for this team.',
        },
      });
    }

    let filePath;
    try {
      filePath = await getSlipPath(slipKey);
    } catch (err) {
      if (err.errorCode === 'SLIP_NOT_FOUND' || err.status === 404) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SLIP_NOT_FOUND',
            message: err.message || 'Payment slip file was not found.',
          },
        });
      }
      throw err;
    }

    const slipMime = registration.payment?.slipMime || 'image/png';
    if (typeof res.type === 'function') {
      res.type(slipMime);
    } else if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', slipMime);
    }

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}

export const getRegistrationSlip = getAdminRegistrationSlip;

/**
 * GET /api/admin/summary
 * Retrieves dashboard summary counts and event overview:
 * total teams, registration status counts, total submissions, and gates.
 */
export async function getAdminSummary(_req, res, next) {
  try {
    const [totalTeams, statusCounts, totalSubmissions, settings] = await Promise.all([
      Team.countDocuments(),
      Registration.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Submission.countDocuments().catch(() => 0),
      EventSettings.getOrCreateSingleton(),
    ]);

    const counts = {
      waiting_for_slip: 0,
      waiting_for_approval: 0,
      approved: 0,
      rejected: 0,
    };

    for (const item of statusCounts) {
      if (item._id && counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
    }

    const gates = getEffectiveGates(settings, new Date());

    return res.json({
      success: true,
      data: {
        totalTeams,
        totalRegistrations: Object.values(counts).reduce((sum, n) => sum + n, 0),
        waitingForSlip: counts.waiting_for_slip,
        waitingForApproval: counts.waiting_for_approval,
        approved: counts.approved,
        rejected: counts.rejected,
        statusCounts: counts,
        totalSubmissions,
        gates: {
          registrationOpen: gates.registrationOpen,
          submissionOpen: gates.submissionOpen,
          registrationMode: settings.registrationMode,
          submissionMode: settings.submissionMode,
        },
        milestones: settings.milestones,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper to format a populated Submission document consistently
 * for admin gallery consumption.
 */
export function formatSubmissionRecord(sub) {
  if (!sub) return null;
  const team = sub.teamId || {};
  const teamMembers = Array.isArray(team.members) ? team.members : [];
  const allMembers = team.leaderName
    ? [{ name: team.leaderName, email: team.leaderEmail, role: 'Team Leader' }, ...teamMembers]
    : teamMembers;

  return {
    id: sub._id,
    _id: sub._id,
    teamId: team._id || sub.teamId,
    teamName: team.name || 'Unnamed Squad',
    leaderName: team.leaderName || 'Unknown Leader',
    leaderEmail: team.leaderEmail || '',
    members: allMembers,
    membersCount: allMembers.length,
    team: {
      id: team._id,
      name: team.name,
      leaderName: team.leaderName,
      leaderEmail: team.leaderEmail,
      members: allMembers,
    },
    title: sub.title || 'Untitled Project',
    description: sub.description || '',
    repoUrl: sub.repoUrl || '',
    playableUrl: sub.playableUrl || '',
    videoUrl: sub.videoUrl || '',
    submittedAt: sub.submittedAt || sub.createdAt,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
}

/**
 * GET /api/admin/submissions
 * Retrieves all game submissions with populated team details.
 * Supports optional search query (?q= or ?search=).
 * Protected by requireAuth and requireAdmin.
 */
export async function getAdminSubmissions(req, res, next) {
  try {
    const { q, search } = req.query || {};
    const searchTerm = (q || search || '').trim();

    const query = {};
    if (searchTerm) {
      const matchingTeams = await Team.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { leaderName: { $regex: searchTerm, $options: 'i' } },
          { leaderEmail: { $regex: searchTerm, $options: 'i' } },
        ],
      }).select('_id');

      const teamIds = matchingTeams.map((t) => t._id);

      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { teamId: { $in: teamIds } },
      ];
    }

    const submissions = await Submission.find(query)
      .populate('teamId')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const formatted = submissions.map(formatSubmissionRecord);

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

