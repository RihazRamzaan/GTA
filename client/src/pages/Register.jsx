import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/http.js';
import TextField from '../components/ui/TextField.jsx';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';
import useEventSettings from '../hooks/useEventSettings.js';

const emptyMember = { name: '', email: '' };

function Notice({ title, children }) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-neon-purple/40 bg-night-card p-6 text-center">
      <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 font-body text-lg text-slate-300">{children}</p>
    </div>
  );
}

export default function Register() {
  const { user, loading, register } = useAuth();
  const { status, settings } = useEventSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ teamName: '', leaderName: '', email: '', password: '', confirmPassword: '' });
  const [members, setMembers] = useState([{ ...emptyMember }]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && !submitting) return <Navigate to={homePathFor(user)} replace />;
  if (status === 'loading') return <p className="font-body text-lg text-slate-400">Checking registration...</p>;
  if (status === 'error') return <Notice title="Registration status unavailable">We could not check whether registration is open. Please try again soon.</Notice>;
  if (!settings.registrationOpen) return <Notice title="Registration is closed">Check the <Link to="/#timeline" className="text-neon-cyan hover:underline">event timeline</Link> for the dates.</Notice>;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const updateMember = (index, field, value) => setMembers((prev) => prev.map((member, i) => (i === index ? { ...member, [field]: value } : member)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const localErrors = {};
    if (form.password !== form.confirmPassword) localErrors.confirmPassword = 'The passwords do not match.';
    if (!consent) localErrors.consent = 'Please confirm to continue.';

    setErrors(localErrors);
    setFormError(Object.keys(localErrors).length ? 'Please check the highlighted fields.' : '');
    if (Object.keys(localErrors).length) return;

    setSubmitting(true);
    try {
      const signedIn = await register({
        email: form.email,
        password: form.password,
        team: { name: form.teamName, leaderName: form.leaderName, members },
      });
      navigate(homePathFor(signedIn), { replace: true });
    } catch (err) {
      const { message, fields } = getApiError(err);
      setErrors(fields);
      setFormError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <p className="mb-2 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">TEAM REGISTRATION</p>
      <h1 className="mb-6 font-display text-3xl font-black text-white md:text-4xl">
        JOIN THE <span className="text-neon-cyan">BUILDATHON</span>
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-8 rounded-xl border border-neon-purple/40 bg-night-card p-6">
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Team leader</h2>
          <TextField id="teamName" label="Team name" autoComplete="off" required value={form.teamName} onChange={handleChange} error={errors.teamName} />
          <TextField id="leaderName" label="Your full name" autoComplete="name" required value={form.leaderName} onChange={handleChange} error={errors.leaderName} />
          <TextField id="email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} error={errors.email} hint="You will use this to log in." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="password" label="Password" type="password" autoComplete="new-password" required value={form.password} onChange={handleChange} error={errors.password} hint="8 to 72 characters." />
            <TextField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Other team members</h2>
            <p className="font-body text-base text-slate-400">You are already counted as a member, so only add the others.</p>
          </div>

          {members.map((member, index) => (
            <fieldset key={index} className="grid gap-3 rounded-lg border border-neon-purple/30 p-4 sm:grid-cols-2">
              <legend className="px-2 font-body text-base font-semibold text-neon-cyan">Member {index + 1}</legend>
              <TextField id={`member-${index}-name`} label="Full name" autoComplete="off" value={member.name} onChange={(e) => updateMember(index, 'name', e.target.value)} />
              <TextField id={`member-${index}-email`} label="Email" type="email" autoComplete="off" value={member.email} onChange={(e) => updateMember(index, 'email', e.target.value)} />
              <button type="button" onClick={() => setMembers((prev) => prev.filter((_, i) => i !== index))} className="w-fit font-body text-base font-semibold text-slate-300 hover:text-neon-pink hover:underline">
                Remove member {index + 1}
              </button>
            </fieldset>
          ))}

          {errors.members && <p role="alert" className="font-body text-base text-red-300">{errors.members}</p>}

          <button type="button" onClick={() => setMembers((prev) => [...prev, { ...emptyMember }])} className="rounded border border-neon-cyan/60 px-4 py-2 font-body text-base font-semibold text-neon-cyan transition hover:bg-neon-cyan/10">
            Add member
          </button>
        </section>

        <div>
          <label className="flex items-start gap-3 font-body text-lg text-slate-200">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5 h-4 w-4 accent-neon-pink" />
            <span>I confirm these details are correct and my team agrees to the event rules.</span>
          </label>
          {errors.consent && <p role="alert" className="mt-1 font-body text-base text-red-300">{errors.consent}</p>}
        </div>

        {/* Next to the button, because the field with the problem may be scrolled out of view. */}
        {formError && <p role="alert" className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 font-body text-base text-red-300">{formError}</p>}

        <button type="submit" disabled={submitting} className="w-full rounded bg-neon-pink px-5 py-3 font-body text-lg font-bold text-white shadow-[0_0_18px_rgba(255,43,214,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Creating your team...' : 'Create team account'}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-lg text-slate-300">
        Already registered? <Link to="/login" className="font-semibold text-neon-cyan hover:underline">Log in</Link>
      </p>
    </div>
  );
}
