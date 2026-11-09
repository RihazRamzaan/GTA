
import { Router } from 'express';
import { getMyTeam, updateMyTeam, submitPayment, getMyPaymentSlip } from '../controllers/team.controller.js';
import { requireAuth, requireTeam } from '../middleware/auth.js';
import { loadRegistration } from '../middleware/loadRegistration.js';
import { paymentsRetired } from '../middleware/paymentsRetired.js';
import { handleSlipUpload } from '../middleware/upload.js';

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

// Bank-transfer slip upload & viewing. Uploads are retired because registration is free;
// paymentsRetired runs first so no file is accepted. Teams can still view an old slip.
router.post('/payment', paymentsRetired, handleSlipUpload, submitPayment);
router.get('/payment/slip', getMyPaymentSlip);

// Game submission routes
router.get('/submission', getSubmission);
router.put('/submission', saveSubmission);
export default router;

