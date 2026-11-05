import { Router } from 'express';
import { getMyTeam, updateMyTeam, submitPayment, getMyPaymentSlip } from '../controllers/team.controller.js';
import { requireAuth, requireTeam } from '../middleware/auth.js';
import { loadRegistration } from '../middleware/loadRegistration.js';
import { handleSlipUpload } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth, requireTeam, loadRegistration);
router.get('/me', getMyTeam);
router.patch('/me', updateMyTeam);

// Bank-transfer slip upload & viewing
router.post('/payment', handleSlipUpload, submitPayment);
router.get('/payment/slip', getMyPaymentSlip);

for (const [method, path] of [['get', '/submission'], ['put', '/submission']]) router[method](path, (_req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Team features are not implemented yet.' } }));
export default router;
