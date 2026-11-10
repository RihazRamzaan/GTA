
import Submission from '../models/Submission.js';

import Registration from '../models/Registration.js';
import EventSettings from '../models/EventSettings.js';

// Get the logged-in team's submission
export async function getSubmission(req, res, next) {
  try {
    const teamId = req.user?.teamId;

    if (!teamId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'No team is associated with this account.'
        }
      });
    }

    const submission = await Submission.findOne({ teamId });

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
}

// Create or update the team's submission
export async function saveSubmission(req, res, next) {
  try {
    const teamId = req.user?.teamId;

    if (!teamId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'No team is associated with this account.'
        }
      });
    }

    const registration = await Registration.findOne({ teamId });

    if (!registration || registration.status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REGISTRATION_NOT_APPROVED',
          message: 'Your team must be approved before submitting a game.'
        }
      });
    }

    const settings = await EventSettings.findById('current');

    if (!settings) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUBMISSION_CLOSED',
          message: 'Submission settings are not available.'
        }
      });
    }

    const now = new Date();
    const mode = settings.submissionMode;

    const opensAt = settings.milestones?.submissionOpensAt;
const closesAt = settings.milestones?.submissionClosesAt;

          const isOpen =
     mode === 'force_open' ||
  (mode === 'auto' &&
    opensAt &&
    closesAt &&
    new Date(opensAt) <= now &&
    new Date(closesAt) > now);

    if (!isOpen || mode === 'force_closed') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUBMISSION_CLOSED',
          message: 'The game submission period is closed.'
        }
      });
    }
      const { title, description, repoUrl, playableUrl, videoUrl } = req.body;
    // Check required fields
    if (!title?.trim() || !description?.trim() || !repoUrl?.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title, description and GitHub repository URL are required.'
        }
      });
    }

    // Validate GitHub repository URL
    let parsedRepoUrl;

    try {
      parsedRepoUrl = new URL(repoUrl.trim());
    } catch {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GITHUB_URL',
          message: 'Please provide a valid GitHub repository URL.'
        }
      });
    }

    if (
      !['http:', 'https:'].includes(parsedRepoUrl.protocol) ||
      parsedRepoUrl.hostname !== 'github.com' ||
      parsedRepoUrl.pathname.split('/').filter(Boolean).length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_GITHUB_URL',
          message: 'Please provide a valid GitHub repository URL.'
        }
      });
    }
    const submission = await Submission.findOneAndUpdate(
      { teamId },
      {
        $set: {
          title,
          description,
          repoUrl,
          playableUrl,
          videoUrl,
          submittedAt: now
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Game submission saved successfully.',
      data: submission
    });
  } catch (error) {
    next(error);
  }
}
