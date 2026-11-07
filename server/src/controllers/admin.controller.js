import EventSettings from '../models/EventSettings.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import { validateMilestonesChronology } from '../utils/dates.js';
import { httpError } from '../middleware/error.js';
import { getEffectiveGates } from '../services/gates.js';

const ALLOWED_MODES = ['auto', 'force_open', 'force_closed'];

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

    // Validate registrationMode if provided
    if (registrationMode !== undefined && !ALLOWED_MODES.includes(registrationMode)) {
      throw httpError(
        400,
        'INVALID_GATE_MODE',
        `registrationMode must be one of: ${ALLOWED_MODES.join(', ')}`
      );
    }

    // Validate submissionMode if provided
    if (submissionMode !== undefined && !ALLOWED_MODES.includes(submissionMode)) {
      throw httpError(
        400,
        'INVALID_GATE_MODE',
        `submissionMode must be one of: ${ALLOWED_MODES.join(', ')}`
      );
    }

    const settings = await EventSettings.getOrCreateSingleton();

    // If milestones are being updated, merge with existing milestones to validate chronology
    if (milestones !== undefined) {
      if (typeof milestones !== 'object' || milestones === null) {
        throw httpError(400, 'INVALID_MILESTONES', 'Milestones must be an object with date values.');
      }

      const mergedMilestones = {
        ...settings.milestones.toObject(),
        ...milestones,
      };

      const validation = validateMilestonesChronology(mergedMilestones);
      if (!validation.valid) {
        throw httpError(400, 'INVALID_CHRONOLOGY', validation.errors.join(' '));
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

    const data = registrations.map((reg) => {
      const team = reg.teamId || {};
      const teamMembers = Array.isArray(team.members) ? team.members : [];
      // Include the leader in the members roster if available
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
    });

    return res.json({
      success: true,
      data,
    });
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
