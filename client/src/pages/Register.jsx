import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/http.js';
import TextField from '../components/ui/TextField.jsx';
import Dock from '../components/layout/Dock.jsx';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';
import { eventContent } from '../data/eventContent.js';
import useEventSettings, { refreshEventSettings } from '../hooks/useEventSettings.js';

const newMember = () => ({ id: crypto.randomUUID(), name: '', email: '' });
const validEmail = value => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const normalizedEmail = value => value.trim().toLowerCase();
const memberField = (member, field) => `member-${member.id}-${field}`;

function validateForm(form, members, consent, min, max) {
  const errors = {};
  if (!form.teamName.trim() || form.teamName.trim().length > 100) errors.teamName = 'Enter a team name of up to 100 characters.';
  if (!form.leaderName.trim() || form.leaderName.trim().length > 100) errors.leaderName = 'Enter your full name, up to 100 characters.';
  if (!validEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (form.password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (new TextEncoder().encode(form.password).length > 72) errors.password = 'This password is too long. Use fewer characters.';
  if (!form.confirmPassword || form.password !== form.confirmPassword) errors.confirmPassword = 'The passwords do not match.';
  const count = members.length + 1;
  if (count < min || count > max) errors.members = `Your team needs ${min}–${max} members, including you as the leader.`;
  const emails = members.map(member => normalizedEmail(member.email));
  members.forEach((member, index) => {
    if (!member.name.trim() || member.name.trim().length > 100) errors[memberField(member, 'name')] = 'Enter a name (up to 100 characters).';
    if (!validEmail(member.email)) errors[memberField(member, 'email')] = 'Enter a valid email address.';
    else if (emails[index] === normalizedEmail(form.email)) errors[memberField(member, 'email')] = 'Leader already counted. Use another email.';
    else if (emails.some((email, otherIndex) => otherIndex !== index && email === emails[index])) errors[memberField(member, 'email')] = 'This email is already on your team.';
  });
  if (!consent) errors.consent = 'Please confirm your team agrees to the event rules.';
  return errors;
}

function rosterHint(count, min, max) {
  if (count > max) return `Remove ${count - max} member${count - max === 1 ? '' : 's'} to meet the updated team-size limit.`;
  if (count < min) return `Add ${min - count} more member${min - count === 1 ? '' : 's'} before registering.`;
  if (count === max) return 'Your team is full. Remove a member if you want to add someone else.';
  return `You can add ${max - count} more member${max - count === 1 ? '' : 's'}.`;
}

function Notice({ title, children }) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col justify-between px-4 pt-20 pb-36">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <h1 className="font-display text-2xl font-bold text-[#f6f4fc]">{title}</h1>
        <p className="mt-3 font-body text-base leading-relaxed text-[#a7a6b8]">{children}</p>
      </div>
      <Dock />
    </div>
  );
}

export default function Register() {
  const { user, loading } = useAuth();
  const { status, settings } = useEventSettings({ fresh: true });
  if (loading || status === 'loading') {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col justify-between px-4 pt-24 pb-36">
        <p className="text-center font-body text-base text-[#a7a6b8]">Checking registration...</p>
        <Dock />
      </div>
    );
  }
  if (user) return <Navigate to={homePathFor(user)} replace />;
  if (status === 'error') return <Notice title="Registration status unavailable">We could not check whether registration is open. Please try again soon.</Notice>;
  if (!settings.registrationOpen) return <Notice title="Registration is closed">Check the <Link to="/#timeline" className="text-[#00e5ff] hover:underline">event timeline ↗</Link> for the dates.</Notice>;
  const { min, max } = settings.teamSize || {};
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min) return <Notice title="Team size unavailable">We could not load the team-size requirements. Please try again soon.</Notice>;
  return <RegistrationForm min={min} max={max} settings={settings} />;
}

function RegistrationForm({ min, max, settings }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const name = settings?.event?.name || eventContent.name;
  const [form, setForm] = useState({ teamName: '', leaderName: '', email: '', password: '', confirmPassword: '' });
  const [members, setMembers] = useState(() => Array.from({ length: min - 1 }, newMember));
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const count = members.length + 1;
  const full = count >= max;
  const validSize = count >= min && count <= max;
  const validation = validateForm(form, members, consent, min, max);
  const errorFor = key => serverErrors[key] || ((attempted || touched[key]) ? validation[key] : undefined);
  const touch = key => setTouched(current => ({ ...current, [key]: true }));
  function clearServerError(key) {
    setServerErrors(current => ({ ...current, [key]: undefined, members: undefined }));
    setFormError('');
  }
  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    clearServerError(name);
  }
  function updateMember(id, field, value) {
    setMembers(current => current.map(member => member.id === id ? { ...member, [field]: value } : member));
    clearServerError(`member-${id}-${field}`);
  }
  function focusField(id) {
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  }
  function addMember() {
    if (full || submitting) return;
    const member = newMember();
    setMembers(current => [...current, member]);
    clearServerError('members');
    focusField(memberField(member, 'name'));
  }
  function removeMember(id) {
    if (submitting) return;
    const index = members.findIndex(member => member.id === id);
    const remaining = members.filter(member => member.id !== id);
    setMembers(remaining);
    clearServerError('members');
    const next = remaining[Math.min(index, remaining.length - 1)];
    focusField(next ? memberField(next, 'name') : 'add-member');
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setServerErrors({});
    if (Object.keys(validation).length) {
      setFormError('Please correct the highlighted fields before creating your team.');
      const first = Object.keys(validation)[0];
      focusField(first === 'members' ? 'roster' : first);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const signedIn = await register({ email: normalizedEmail(form.email), password: form.password,
        team: { name: form.teamName.trim(), leaderName: form.leaderName.trim(), members: members.map(member => ({ name: member.name.trim(), email: normalizedEmail(member.email) })) } });
      navigate(homePathFor(signedIn), { replace: true });
    } catch (error) {
      const { code, message, fields } = getApiError(error);
      setServerErrors(fields);
      setFormError(message);
      setSubmitting(false);
      const first = Object.keys(fields)[0];
      focusField(first === 'members' ? 'roster' : first || 'registration-error');
      if (code === 'REGISTRATION_CLOSED') refreshEventSettings();
    }
  }

  const rosterMessage = rosterHint(count, min, max);

  return (
    <div className="relative mx-auto w-full max-w-2xl py-8 sm:py-12">
      {/* Subtle atmospheric ambient glow matching Home art direction */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[340px] w-[560px] max-w-full rounded-full bg-gradient-to-b from-[#8b3dff]/15 via-[#00e5ff]/5 to-transparent blur-3xl" />

      <div className="relative">
        <p className="mb-3 font-body text-xs font-bold tracking-[0.22em] text-[#a7a6b8] uppercase">TEAM REGISTRATION</p>
        <h1 className="mb-8 font-display text-3xl font-black tracking-tight text-[#f6f4fc] sm:text-4xl md:text-5xl">
          JOIN THE <span className="text-[#00e5ff]">BUILDATHON.</span>
        </h1>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md sm:p-8">
          <fieldset disabled={submitting} className="min-w-0 space-y-8 disabled:opacity-70">
            <section className="space-y-4" aria-labelledby="leader-title">
              <div>
                <span className="font-body text-xs font-bold tracking-[0.18em] text-[#00e5ff] uppercase">01 / Leader</span>
                <h2 id="leader-title" className="mt-1 font-display text-lg font-bold text-[#f6f4fc] sm:text-xl">Team leader · Member 1</h2>
              </div>
              <TextField reserveFeedback id="teamName" label="Team name" maxLength={100} autoComplete="off" required value={form.teamName} onChange={handleChange} onBlur={() => touch('teamName')} error={errorFor('teamName')} />
              <TextField reserveFeedback id="leaderName" label="Your full name" maxLength={100} autoComplete="name" required value={form.leaderName} onChange={handleChange} onBlur={() => touch('leaderName')} error={errorFor('leaderName')} />
              <TextField reserveFeedback id="email" label="Email" type="email" maxLength={254} autoComplete="email" required value={form.email} onChange={handleChange} onBlur={() => touch('email')} error={errorFor('email')} hint="You will use this to log in." />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField reserveFeedback id="password" label="Password" type="password" autoComplete="new-password" required value={form.password} onChange={handleChange} onBlur={() => touch('password')} error={errorFor('password')} hint="Use at least 8 characters." />
                <TextField reserveFeedback id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={handleChange} onBlur={() => touch('confirmPassword')} error={errorFor('confirmPassword')} />
              </div>
            </section>

            <section id="roster" tabIndex={-1} className="space-y-5 focus:outline-none" aria-labelledby="roster-title" aria-describedby="roster-status">
              <div>
                <span className="font-body text-xs font-bold tracking-[0.18em] text-[#00e5ff] uppercase">02 / Roster</span>
                <h2 id="roster-title" className="mt-1 font-display text-lg font-bold text-[#f6f4fc] sm:text-xl">Other team members</h2>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <p className="font-body text-base font-bold text-[#f6f4fc]">Teams need {min}–{max} members, including the leader.</p>
                <p className="mt-1 font-body text-sm text-[#a7a6b8]">You are Member 1. Only add your other team members below.</p>
                <p id="roster-status" role="status" aria-live="polite" aria-atomic="true" className={`mt-3 font-body text-sm font-semibold tracking-wide ${validSize ? 'text-[#00e5ff]' : 'text-amber-300'}`}>{count} / {max} members, including you. {rosterMessage}</p>
              </div>
              {members.map((member, index) => <fieldset key={member.id} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <legend className="px-1 font-display text-xs font-bold tracking-[0.18em] uppercase text-[#00e5ff]">Member {index + 2}</legend>
                  <button type="button" onClick={() => removeMember(member.id)} aria-label={`Remove member ${index + 2}`} className="rounded-full border border-red-400/30 px-3.5 py-1 font-body text-xs font-semibold tracking-wider text-red-300 transition hover:border-red-400 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-[#00e5ff]">Remove</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField reserveFeedback id={memberField(member, 'name')} label="Full name" maxLength={100} autoComplete="off" required value={member.name} onChange={e => updateMember(member.id, 'name', e.target.value)} onBlur={() => touch(memberField(member, 'name'))} error={errorFor(memberField(member, 'name'))} />
                  <TextField reserveFeedback id={memberField(member, 'email')} label="Email" type="email" maxLength={254} autoComplete="off" required value={member.email} onChange={e => updateMember(member.id, 'email', e.target.value)} onBlur={() => touch(memberField(member, 'email'))} error={errorFor(memberField(member, 'email'))} />
                </div>
              </fieldset>)}
              {serverErrors.members && <p role="alert" className="font-body text-sm text-red-300">{serverErrors.members}</p>}
              <button id="add-member" type="button" onClick={addMember} disabled={full} aria-describedby="roster-status" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#00e5ff]/50 px-5 py-2 font-body text-sm font-semibold tracking-wider text-[#00e5ff] transition hover:border-[#00e5ff] hover:bg-[#00e5ff]/10 hover:shadow-[0_0_16px_rgba(0,229,255,0.2)] disabled:cursor-not-allowed disabled:border-white/10 disabled:text-[#8e8ca0] disabled:hover:bg-transparent disabled:hover:shadow-none">{full ? 'Team is full' : '+ Add member'}</button>
            </section>

            <div><label htmlFor="consent" className="flex cursor-pointer items-start gap-3 font-body text-base text-[#cac7e0]"><input id="consent" type="checkbox" checked={consent} aria-invalid={Boolean(errorFor('consent'))} aria-describedby={errorFor('consent') ? 'consent-error' : undefined} onChange={e => { setConsent(e.target.checked); touch('consent'); clearServerError('consent'); }} className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#ff2bd6]" /><span>I confirm these details are correct and my team agrees to the event rules.</span></label>{errorFor('consent') && <p id="consent-error" role="alert" className="mt-1.5 font-body text-sm text-red-300">{errorFor('consent')}</p>}</div>
            {formError && <p id="registration-error" tabIndex={-1} role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 font-body text-sm text-red-300">{formError}</p>}
            <button type="submit" disabled={submitting || !validSize} aria-describedby={!validSize ? 'roster-status' : undefined} className="w-full rounded-full bg-[#ff2bd6] px-6 py-3.5 font-body text-base font-bold uppercase tracking-wider text-[#070714] transition hover:brightness-110 hover:shadow-[0_0_24px_rgba(255,43,214,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none">{submitting ? 'Creating your team...' : 'Create team account'}</button>
          </fieldset>
        </form>
        <p className="mt-6 text-center font-body text-sm text-[#a7a6b8]">Already registered? <Link to="/login" className="font-semibold text-[#00e5ff] hover:underline">Log in ↗</Link></p>
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-body text-xs text-[#a7a6b8]">
          <a href="https://www.sesa.lk" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#f6f4fc]">SESA × IEEE SB UOK ↗</a>
          <span>© {new Date().getFullYear()} {name}</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition hover:text-[#f6f4fc]">Back to top ↑</button>
        </footer>
      </div>
      <Dock />
    </div>
  );
}
