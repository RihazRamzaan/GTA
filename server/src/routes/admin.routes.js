import { Router } from 'express';
import { getAdminSettings, updateAdminSettings } from '../controllers/admin.controller.js';

const router = Router();

// Day 02 Event Settings endpoints (Rihaz)
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
