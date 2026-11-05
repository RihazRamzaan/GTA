import { Router } from 'express';
import { getPublicSettings } from '../controllers/public.controller.js';

const router = Router();

// Public event settings endpoint (Rihaz / Yuwandhi)
router.get('/settings', getPublicSettings);

export default router;
