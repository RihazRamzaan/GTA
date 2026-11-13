import AdminNav from '../../components/admin/AdminNav.jsx';
import useAdminEventSettings from '../../hooks/useAdminEventSettings.js';
import { toColomboInput, fromColomboInput } from '../../utils/eventAgenda.js';

const field = 'mt-1 w-full rounded-lg border border-white/20 bg-night px-3 py-2 font-body text-lg text-white';
const button = 'rounded-lg border border-neon-cyan/40 px-4 py-2 font-body font-bold text-neon-cyan disabled:opacity-40';

export default function AgendaPage() {
  const { settings, setSettings, loading, saving, error, notice, setNotice, save, reload } = useAdminEventSettings();
  const updateEntry = (id, patch) => setSettings(current => ({ ...current, agenda: current.agenda.map(entry => entry.id === id ? { ...entry, ...patch } : entry) }));
  function move(index, delta) {
    setSettings(current => {
      const agenda = [...current.agenda];
      [agenda[index], agenda[index + delta]] = [agenda[index + delta], agenda[index]];
      return { ...current, agenda };
    });
  }
  function loadProposal() {
    if (!window.confirm('Replace the draft schedule with the proposal dates? This changes registration and submission deadlines only when you save. Sponsors and gate override modes will be kept.')) return;
    const defaults = settings.proposalDefaults;
    setSettings(current => ({ ...current, agenda: structuredClone(defaults.agenda), milestones: { ...defaults.milestones }, event: { ...defaults.event } }));
    setNotice('Proposal dates loaded into the form. Review all times and select Save agenda to apply them.');
  }
  async function submit(event) {
    event.preventDefault();
    await save({ agenda: settings.agenda, submissionOpensAt: settings.milestones.submissionOpensAt,
      event: settings.event, registrationMode: settings.registrationMode, submissionMode: settings.submissionMode });
  }
  return (
    <div className="pb-16 font-body text-white">
      <AdminNav activeTab="agenda" />
      <h2 className="font-display text-2xl">Event agenda and controls</h2>
      <p className="mt-3 text-lg text-slate-300">All input times are Sri Lanka time (Asia/Colombo). The homepage, countdown and participant deadlines use these saved values.</p>
      {error && <div role="alert" className="my-4 rounded-lg border border-red-400 p-4 text-red-200">{error} {!settings && <button type="button" onClick={reload} className={button}>Retry</button>}</div>}
      {notice && <p role="status" className="my-4 text-neon-cyan">{notice}</p>}
      {loading ? <p className="py-8">Loading saved settings…</p> : settings && (
        <form onSubmit={submit} className="mt-6 space-y-6">
          <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
            <div className="grid gap-4 rounded-xl border border-white/20 bg-night-card p-5 md:grid-cols-2">
              <label>Event name<input required maxLength={100} className={field} value={settings.event?.name || ''} onChange={e => setSettings({ ...settings, event: { ...settings.event, name: e.target.value } })} /></label>
              <label>Venue<input required maxLength={200} className={field} value={settings.event?.venue || ''} onChange={e => setSettings({ ...settings, event: { ...settings.event, venue: e.target.value } })} /></label>
              {[['registrationMode', 'Registration gate'], ['submissionMode', 'Submission gate']].map(([key, label]) => <label key={key}>{label}<select className={field} value={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.value })}><option value="auto">Automatic dates</option><option value="force_open">Force open</option><option value="force_closed">Force closed</option></select></label>)}
              <label>Submission saving opens<input type="datetime-local" required className={field} value={toColomboInput(settings.milestones.submissionOpensAt)} onChange={e => setSettings({ ...settings, milestones: { ...settings.milestones, submissionOpensAt: fromColomboInput(e.target.value) } })} /><span className="mt-1 block text-sm text-slate-300">The proposal gives no separate opening time; its default is topic release. This setting controls when saving is accepted.</span></label>
              <div className="self-center"><button type="button" onClick={loadProposal} className={button}>Load proposal schedule</button><p className="mt-2 text-sm text-slate-300">Proposal: workshop 28 Nov at 7 AM; submission deadline 10 Dec at midnight (start of day). Review before saving.</p></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-xl">Agenda entries</h3><button type="button" className={button} onClick={() => setSettings({ ...settings, agenda: [...settings.agenda, { id: crypto.randomUUID(), title: '', description: '', startsAt: '', endsAt: '', location: '', url: '', published: false }] })}>Add agenda entry</button></div>
            {settings.agenda.map((entry, index) => (
              <section key={entry.id} className="rounded-xl border border-neon-purple/40 bg-night-card p-5" aria-label={`Agenda entry ${index + 1}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-neon-cyan">{index + 1}. {entry.title || 'New entry'}{entry.milestoneKey && <span className="ml-2 text-sm text-slate-300">Linked to event controls</span>}</p>
                  <div className="flex flex-wrap gap-2"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} className={button} aria-label={`Move ${entry.title || 'entry'} up`}>Up</button><button type="button" disabled={index === settings.agenda.length - 1} onClick={() => move(index, 1)} className={button} aria-label={`Move ${entry.title || 'entry'} down`}>Down</button>{!entry.milestoneKey && <button type="button" className={button} onClick={() => { if (window.confirm('Remove this entry from the draft agenda?')) setSettings({ ...settings, agenda: settings.agenda.filter(item => item.id !== entry.id) }); }}>Remove</button>}</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label>Title<input required maxLength={160} className={field} value={entry.title} onChange={e => updateEntry(entry.id, { title: e.target.value })} /></label>
                  <label>Location or format<input maxLength={200} className={field} readOnly={entry.id === 'finale'} value={entry.id === 'finale' ? settings.event.venue : entry.location || ''} onChange={e => updateEntry(entry.id, { location: e.target.value })} />{entry.id === 'finale' && <span className="mt-1 block text-sm text-slate-300">Uses the shared venue above.</span>}</label>
                  <label>Starts at<input required type="datetime-local" className={field} value={toColomboInput(entry.startsAt)} onChange={e => updateEntry(entry.id, { startsAt: fromColomboInput(e.target.value) })} /></label>
                  <label>Ends at (optional)<input type="datetime-local" className={field} value={toColomboInput(entry.endsAt)} onChange={e => updateEntry(entry.id, { endsAt: fromColomboInput(e.target.value) })} /></label>
                  <label>Description<textarea maxLength={1000} className={field} value={entry.description || ''} onChange={e => updateEntry(entry.id, { description: e.target.value })} /></label>
                  <label>Session or video URL (optional)<input type="url" className={field} value={entry.url || ''} onChange={e => updateEntry(entry.id, { url: e.target.value })} /></label>
                </div>
                <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={entry.published} onChange={e => updateEntry(entry.id, { published: e.target.checked })} />Published on the website</label>
              </section>
            ))}
            <p className="text-slate-300">Required gate-linked entries cannot be deleted. Hiding an entry only hides its card; it does not disable the corresponding gate. Cards are shown by date; ordering controls entries at the same time.</p>
            <button className="rounded-lg bg-neon-cyan px-6 py-3 font-bold text-black" type="submit">{saving ? 'Saving…' : 'Save agenda'}</button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
