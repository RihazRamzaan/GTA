import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';
import { eventContent } from '../../data/eventContent.js';
import RegisterButton from '../event/RegisterButton.jsx';
import Logo from '../ui/Logo.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    // Leave first, otherwise the page guard sends the person to the login page.
    navigate('/');
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neon-purple/30 bg-night/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" aria-label={`${eventContent.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 font-body text-lg font-semibold lg:flex">
          {eventContent.navLinks.map((link) => (
            <a key={link.label} href={`/${link.href}`} className="text-slate-200 transition hover:text-neon-cyan">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to={homePathFor(user)} className="hidden font-body text-lg font-semibold text-neon-cyan hover:underline sm:block">
                {user.role === 'admin' ? 'Admin' : 'My Team'}
              </Link>
              <button type="button" onClick={handleLogout} className="hidden font-body text-lg font-semibold text-slate-200 hover:text-neon-pink sm:block">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden font-body text-lg font-semibold text-neon-cyan hover:underline sm:block">
                Login
              </Link>
              <RegisterButton className="hidden px-4 py-2 text-base sm:block" />
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded border border-neon-purple/60 px-3 py-1 text-2xl text-white lg:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile navigation" className="border-t border-neon-purple/30 bg-night px-4 pb-5 pt-3 lg:hidden">
          <div className="flex flex-col gap-3 font-body text-xl font-semibold">
            {eventContent.navLinks.map((link) => (
              <a key={link.label} href={`/${link.href}`} onClick={close} className="text-slate-200">
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <Link to={homePathFor(user)} onClick={close} className="text-neon-cyan">
                  {user.role === 'admin' ? 'Admin' : 'My Team'}
                </Link>
                <button type="button" onClick={handleLogout} className="w-fit text-slate-200">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close} className="text-neon-cyan">
                  Login
                </Link>
                <RegisterButton onClick={close} className="w-fit px-5 py-2 text-lg" />
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}