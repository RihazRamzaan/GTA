import { Router } from 'express';
import { getAdminSettings, updateAdminSettings } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Protect all admin endpoints with requireAdmin middleware (coordinated with Akindu)
router.use(requireAdmin);

// Day 02/03 Event Settings endpoints (Rihaz)
router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

// Placeholder endpoints for Days 3-5
const unimplementedRoutes = [
  ['get', '/summary'],
  ['get', '/registrations'],
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
