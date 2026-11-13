import { Link, useLocation } from 'react-router-dom';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';
import { eventContent } from '../../data/eventContent.js';
import useEventSettings from '../../hooks/useEventSettings.js';
import RegisterButton from '../event/RegisterButton.jsx';

export default function Dock() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { settings } = useEventSettings();
  const name = settings?.event?.name || eventContent.name;

  return (
    <nav className="home-dock" aria-label="Account navigation">
      <Link to="/" aria-label={`${name} home`} className="home-brand">
        <img src="/Logo-white.png" alt={name} />
      </Link>
      <div className="dock-actions">
        {user ? (
          <Link className="home-login" to={homePathFor(user)}>
            {user.role === 'admin' ? 'Admin dashboard' : 'My team'} ↗
          </Link>
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

