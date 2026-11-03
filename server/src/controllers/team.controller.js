// Team controller ownership: Akindu (team details), Thanish (payment).
// Handlers only use req.user.teamId, so a team can never name another team in a request.
import { env } from '../config/env.js';
import { httpError } from '../middleware/error.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import { publicRegistration, publicTeam } from '../utils/serializers.js';
import { validateTeamUpdate } from '../utils/validators.js';

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
