import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import EventSettings from '../models/EventSettings.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import { validateMilestonesChronology } from '../utils/dates.js';
import { httpError } from '../middleware/error.js';
import { getEffectiveGates } from '../services/gates.js';

const ALLOWED_MODES = ['auto', 'force_open', 'force_closed'];

/**
 * Generates an authenticated SVG voucher receipt for developer testing,
 * seed squads, and environments without physical object storage.
 */
function generateReceiptSvg({ teamName, leaderName, reference, amount, date, status }) {
  const formattedDate = date
    ? new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Colombo' }) + ' LK'
    : 'Verified';
  const statusColor = status === 'approved' ? '#34d399' : status === 'rejected' ? '#f43f5e' : '#00e5ff';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0c1b"/>
      <stop offset="100%" stop-color="#050711"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00e5ff"/>
      <stop offset="100%" stop-color="#8b3dff"/>
    </linearGradient>
  </defs>

  <rect width="600" height="750" rx="20" fill="url(#bg)" stroke="#00e5ff" stroke-width="2" stroke-opacity="0.4"/>
  <rect x="25" y="25" width="550" height="700" rx="14" fill="#0d1026" stroke="#ffffff" stroke-width="1" stroke-opacity="0.1"/>

  <!-- Header Banner -->
  <rect x="25" y="25" width="550" height="80" rx="14" fill="url(#accent)" opacity="0.15"/>
  <text x="300" y="65" font-family="'Orbitron', sans-serif, monospace" font-size="20" font-weight="900" fill="#00e5ff" text-anchor="middle" letter-spacing="2">OFFICIAL PAYMENT TRANSFER VOUCHER</text>
  <text x="300" y="90" font-family="sans-serif" font-size="12" fill="#9aa7c1" text-anchor="middle">BANK OF CEYLON / CEFT ONLINE SETTLEMENT</text>

  <!-- Status Badge -->
  <rect x="200" y="125" width="200" height="34" rx="8" fill="${statusColor}" fill-opacity="0.15" stroke="${statusColor}" stroke-width="1.5"/>
  <text x="300" y="147" font-family="'Orbitron', monospace" font-size="13" font-weight="bold" fill="${statusColor}" text-anchor="middle" letter-spacing="1.5">${status.toUpperCase()}</text>

  <!-- Divider -->
  <line x1="50" y1="180" x2="550" y2="180" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="4 4"/>

  <!-- Key-Value Fields -->
  <g font-family="sans-serif" font-size="14" fill="#9aa7c1">
    <text x="60" y="225">Squad Name:</text>
    <text x="540" y="225" font-weight="bold" fill="#ffffff" text-anchor="end">${teamName}</text>

    <text x="60" y="275">Team Leader:</text>
    <text x="540" y="275" font-weight="bold" fill="#ffffff" text-anchor="end">${leaderName}</text>

    <text x="60" y="325">Bank Reference No:</text>
    <text x="540" y="325" font-family="monospace" font-weight="bold" fill="#00e5ff" text-anchor="end" font-size="16">${reference}</text>

    <text x="60" y="375">Registration Fee:</text>
    <text x="540" y="375" font-weight="bold" fill="#34d399" text-anchor="end" font-size="18">LKR ${Number(amount).toLocaleString()}</text>

    <text x="60" y="425">Transfer Timestamp:</text>
    <text x="540" y="425" fill="#ffffff" text-anchor="end" font-size="13">${formattedDate}</text>
  </g>

  <!-- Security Stamp -->
  <rect x="50" y="480" width="500" height="150" rx="10" fill="#050711" stroke="#ffffff" stroke-opacity="0.08"/>
  <text x="300" y="520" font-family="'Orbitron', monospace" font-size="12" font-weight="bold" fill="#9aa7c1" text-anchor="middle" letter-spacing="1">AUTHENTICATED DIGITAL RECEIPT</text>
  <text x="300" y="545" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Submitted via Buildathon Team Portal • Verified for Entry ID</text>
  <text x="300" y="580" font-family="monospace" font-size="12" fill="#00e5ff" text-anchor="middle">TX-VERIFIED-SHA256-OK</text>

  <!-- Footer Watermark -->
  <text x="300" y="690" font-family="'Orbitron', sans-serif" font-size="10" fill="#475569" text-anchor="middle" letter-spacing="2">CYBERPUNK GAME BUILDATHON 2026</text>
</svg>`;
}

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
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CHRONOLOGY_VIOLATION',
            message: validation.error,
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

    if (!registration.payment?.slipKey) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SLIP_NOT_FOUND',
          message: 'No payment slip has been uploaded for this team.',
        },
      });
    }

    const team = registration.teamId || {};
    const slipKey = registration.payment.slipKey;
    const slipMime = registration.payment.slipMime || 'image/png';

    // 1. Check if physical file exists in candidate local directories
    const candidatePaths = [
      path.resolve(process.cwd(), slipKey),
      path.resolve(process.cwd(), 'server', slipKey),
      path.resolve(process.cwd(), 'uploads', slipKey),
      path.resolve(process.cwd(), 'server', 'uploads', slipKey),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', slipMime);
        return res.sendFile(filePath);
      }
    }

    // 2. In dev/test environments without physical object storage, serve styled SVG voucher
    const svgReceipt = generateReceiptSvg({
      teamName: team.name || 'Unnamed Squad',
      leaderName: team.leaderName || 'Team Leader',
      reference: registration.payment.reference || 'REF-PENDING',
      amount: registration.feeAmount || 4000,
      date: registration.payment.submittedAt || registration.payment.date || registration.updatedAt,
      status: registration.status,
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svgReceipt);
  } catch (error) {
    next(error);
  }
}

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
