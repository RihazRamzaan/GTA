import { Router } from 'express';
import { getPublicSettings } from '../controllers/public.controller.js';

const router = Router();

router.get('/settings', getPublicSettings);

export default router;
