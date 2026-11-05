import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getAdminSettings, updateAdminSettings, getRegistrationSlip } from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin endpoints with requireAuth and requireAdmin middleware
router.use(requireAuth, requireAdmin);

// Day 02: Event Settings endpoints (Rihaz)
router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

// Slip inspection endpoint
router.get('/registrations/:id/slip', getRegistrationSlip);

// Placeholder endpoints for Days 4-5
const unimplementedRoutes = [
  ['get', '/summary'],
  ['get', '/registrations'],
  ['patch', '/registrations/:id/review'],
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
