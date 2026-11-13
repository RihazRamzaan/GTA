import { getEffectiveSettings } from '../services/gates.js';

/**
 * GET /api/public/settings
 * Public endpoint providing active event milestones, gate evaluations, and server time.
 * Consumed by Yuwandhi's public countdown, agenda, and team registration gates.
 */
export async function getPublicSettings(_req, res, next) {
  try {
    const settings = await getEffectiveSettings();
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}
