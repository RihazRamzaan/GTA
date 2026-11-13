import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/http.js';
import TextField from '../components/ui/TextField.jsx';
import Dock from '../components/layout/Dock.jsx';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';
import { eventContent } from '../data/eventContent.js';
import useEventSettings from '../hooks/useEventSettings.js';

export default function Login() {
  const { user, loading, login } = useAuth();
  const { settings } = useEventSettings();
  const name = settings?.event?.name || eventContent.name;
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Skipped while submitting so the redirect below can use the page the person came from.
  if (!loading && user && !submitting) return <Navigate to={homePathFor(user)} replace />;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const signedIn = await login(form);
      navigate(location.state?.from || homePathFor(signedIn), { replace: true });
    } catch (err) {
      setError(getApiError(err).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page min-h-screen bg-[#070714] text-[#f6f4fc] font-body relative overflow-x-hidden">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-4 pt-14 pb-36 sm:pt-20">
        {/* Subtle atmospheric ambient glow matching Home art direction */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-[280px] w-[420px] max-w-full rounded-full bg-gradient-to-b from-[#8b3dff]/15 via-[#00e5ff]/5 to-transparent blur-3xl" />

        <div className="relative">
          <p className="mb-3 font-body text-xs font-bold tracking-[0.22em] text-[#a7a6b8] uppercase">TEAM LOGIN</p>
          <h1 className="mb-8 font-display text-3xl font-black tracking-tight text-[#f6f4fc] sm:text-4xl">
            WELCOME <span className="text-[#00e5ff]">BACK.</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md sm:p-8">
            {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 font-body text-sm text-red-300">{error}</p>}
            <TextField id="email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} />
            <TextField id="password" label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} />
            <button type="submit" disabled={submitting} className="w-full rounded-full bg-[#ff2bd6] px-6 py-3.5 font-body text-base font-bold uppercase tracking-wider text-[#070714] transition hover:brightness-110 hover:shadow-[0_0_24px_rgba(255,43,214,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none">
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-[#a7a6b8]">
            No team account yet? <Link to="/register" className="font-semibold text-[#00e5ff] hover:underline">Register your team ↗</Link>
          </p>

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-body text-xs text-[#a7a6b8]">
            <a href="https://www.sesa.lk" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#f6f4fc]">SESA × IEEE SB UOK ↗</a>
            <span>© {new Date().getFullYear()} {name}</span>
          </footer>
        </div>

        <Dock />
      </div>
    </div>
  );
}
