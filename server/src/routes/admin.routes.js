import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getAdminSettings,
  updateAdminSettings,
  getAdminRegistrations,
  getAdminSummary,
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin endpoints with requireAuth and requireAdmin middleware
router.use(requireAuth, requireAdmin);

// Day 02: Event Settings endpoints (Rihaz)
router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

// Day 04: Registrations & Dashboard Summary (Rihaz)
router.get('/summary', getAdminSummary);
router.get('/registrations', getAdminRegistrations);

// Placeholder endpoints for Days 4-5
const unimplementedRoutes = [
  ['patch', '/registrations/:id/review'],
  ['get', '/registrations/:id/slip'],
  ['get', '/submissions'],
];

for (const [method, path] of unimplementedRoutes) {
  router[method](path, (_req, res) =>
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Admin features are not implemented yet.',
      },
    })
  );
}

export default router;
