import { getEffectiveSettings } from '../services/gates.js';

/**
 * GET /api/public/settings
 * Provides public event settings, milestones, evaluated gate states, and server time.
 * Consumed by Yuwandhi on Day 3 for the homepage countdown and agenda.
 */
export async function getPublicSettings(_req, res, next) {
  try {
    const data = await getEffectiveSettings();
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
