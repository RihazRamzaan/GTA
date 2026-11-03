/**
 * Session authentication middleware (coordinated with Akindu's auth specification).
 * Verifies that the requester has an active session.
 */
export function requireAuth(req, res, next) {
  const user = req.session?.user || req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.',
      },
    });
  }

  next();
}

export default requireAuth;
