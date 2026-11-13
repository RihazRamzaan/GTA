import { Link, useLocation, useNavigate } from 'react-router-dom';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';
import { eventContent } from '../../data/eventContent.js';
import useEventSettings from '../../hooks/useEventSettings.js';
import RegisterButton from '../event/RegisterButton.jsx';

export default function Dock() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { settings } = useEventSettings();
  const name = settings?.event?.name || eventContent.name;

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  const isPortal = pathname.startsWith('/team') || pathname.startsWith('/admin');

  return (
    <nav className="home-dock" aria-label="Account navigation">
      <Link to="/" aria-label={`${name} home`} className="home-brand">
        <img src="/Logo-white.png" alt={name} />
      </Link>
      <div className="dock-actions">
        {user ? (
          <>
            {isPortal ? (
              <Link className="home-login" to="/">
                Home ↗
              </Link>
            ) : (
              <Link className="home-login" to={homePathFor(user)}>
                {user.role === 'admin' ? 'Admin dashboard' : 'My team'} ↗
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="home-logout"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            {pathname !== '/' && (
              <Link className="home-login" to="/">
                Home ↗
              </Link>
            )}
            {pathname !== '/register' && (
              <RegisterButton className="home-register" />
            )}
            {pathname !== '/login' && (
              <Link className="home-login" to="/login">
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
