/**
 * Admin authorization middleware (coordinated with Akindu's auth specification).
 * Verifies that the requester has an active session with role: 'admin'.
 *
 * Rules (SRS Section 4 & Day 01 Reference Sheet):
 * - Checks req.session.user (or req.user)
 * - Returns 401 UNAUTHORIZED if not authenticated
 * - Returns 403 FORBIDDEN if authenticated user is not an administrator
 */
export function requireAdmin(req, res, next) {
  const user = req.session?.user || req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in as an administrator.',
      },
    });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin authorization required.',
      },
    });
  }

  next();
}

export default requireAdmin;
