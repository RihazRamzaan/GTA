import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getAdminSettings,
  updateAdminSettings,
  getAdminRegistrations,
  getAdminSummary,
  reviewAdminRegistration,
  getAdminRegistrationSlip,
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

// Day 05: Payment reviews and slip retrieval (Rihaz)
router.patch('/registrations/:id/review', reviewAdminRegistration);
router.get('/registrations/:id/slip', getAdminRegistrationSlip);

// Placeholder endpoints for Days 4-5
const unimplementedRoutes = [
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
