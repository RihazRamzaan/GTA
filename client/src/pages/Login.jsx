import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/http.js';
import TextField from '../components/ui/TextField.jsx';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, loading, login } = useAuth();
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
    <div className="mx-auto w-full max-w-md py-6">
      <p className="mb-2 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">TEAM LOGIN</p>
      <h1 className="mb-6 font-display text-3xl font-black text-white md:text-4xl">
        WELCOME <span className="text-neon-cyan">BACK</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-neon-purple/40 bg-night-card p-6">
        {error && <p role="alert" className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 font-body text-base text-red-300">{error}</p>}
        <TextField id="email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} />
        <TextField id="password" label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} />
        <button type="submit" disabled={submitting} className="w-full rounded bg-neon-pink px-5 py-3 font-body text-lg font-bold text-white shadow-[0_0_18px_rgba(255,43,214,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-lg text-slate-300">
        No team account yet? <Link to="/register" className="font-semibold text-neon-cyan hover:underline">Register your team</Link>
      </p>
    </div>
  );
}
