import { Link } from 'react-router-dom';
import { eventContent } from '../../data/eventContent.js';
import Logo from '../ui/Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-neon-purple/30 bg-night">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <Link to="/" aria-label={`${eventContent.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 font-body text-lg">
          {eventContent.navLinks.map((link) => (
            <a key={link.label} href={`/${link.href}`} className="text-slate-300 transition hover:text-neon-cyan">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="font-body text-sm text-slate-400">
          <p>© {new Date().getFullYear()} {eventContent.name} • SESA & IEEE SB UOK</p>
          <a
            href={eventContent.contact?.website || 'https://www.sesa.lk'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:underline"
          >
            www.sesa.lk
          </a>
        </div>
      </div>
    </footer>
  );
}
