import { Navigate, useLocation } from 'react-router-dom';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';

// Keeps people on the right pages. The server still checks every request.
export default function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="font-body text-lg text-slate-400">Checking your account...</p>;
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  if (user.role !== role) return <Navigate to={homePathFor(user)} replace />;
  return children;
}
