
import { Router } from 'express';
import { getMyTeam, updateMyTeam } from '../controllers/team.controller.js';
import { requireAuth, requireTeam } from '../middleware/auth.js';
import { loadRegistration } from '../middleware/loadRegistration.js';

import {
  getSubmission,
  saveSubmission
} from '../controllers/submission.controller.js';

const router = Router();

// Authentication and team verification
router.use(requireAuth, requireTeam, loadRegistration);

// Team routes
router.get('/me', getMyTeam);
router.patch('/me', updateMyTeam);

// Payment route – implementation pending
router.post('/payment', (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Payment feature is not implemented yet.'
    }
  });
});

// Game submission routes – Tharushi
router.get('/submission', getSubmission);
router.put('/submission', saveSubmission);

export default router;
