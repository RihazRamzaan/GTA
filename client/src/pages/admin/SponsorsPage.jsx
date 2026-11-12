import AdminNav from '../../components/admin/AdminNav.jsx';
import useAdminEventSettings from '../../hooks/useAdminEventSettings.js';

const field = 'mt-1 w-full rounded-lg border border-white/20 bg-night px-3 py-2 text-lg text-white';
const button = 'rounded-lg border border-neon-cyan/40 px-4 py-2 text-neon-cyan disabled:opacity-40';
const categories = ['Title Partner', 'Gold Partner', 'Silver Partner', 'Bronze Partner', 'Banner Partner', 'Cloud and Computing Infrastructure Partner', 'Gaming Hardware Partner', 'Computer Hardware Partner', 'Connectivity Partner', 'Hospitality Partner', 'Apparel Partner', 'Merchandise and Printing Partner', 'Media Partner', 'Knowledge Partner', 'Gift Partner'];

export default function SponsorsPage() {
  const { settings, setSettings, loading, saving, error, notice, save, reload } = useAdminEventSettings();
  const update = (id, patch) => setSettings(current => ({ ...current, sponsors: current.sponsors.map(sponsor => sponsor.id === id ? { ...sponsor, ...patch } : sponsor) }));
  function move(index, delta) {
    const sponsors = [...settings.sponsors];
    [sponsors[index], sponsors[index + delta]] = [sponsors[index + delta], sponsors[index]];
    setSettings({ ...settings, sponsors });
  }
  return (
    <div className="pb-16 font-body text-white">
      <AdminNav activeTab="sponsors" />
      <h2 className="font-display text-2xl">Sponsors and partners</h2>
      <p className="mt-3 text-lg text-slate-300">Add confirmed companies here. Only published sponsors appear publicly. With none published, the section and its navigation links are hidden.</p>
      <p className="mt-2 text-slate-300">Use a logo hosted at a durable public image URL (your media storage or the sponsor’s approved asset URL). Images are not uploaded to the server’s temporary filesystem.</p>
      {error && <p role="alert" className="my-4 text-red-300">{error} {!settings && <button className={button} onClick={reload}>Retry</button>}</p>}
      {notice && <p role="status" className="my-4 text-neon-cyan">{notice}</p>}
      {loading ? <p className="py-8">Loading sponsors…</p> : settings && (
        <form className="mt-6" onSubmit={async event => { event.preventDefault(); await save({ sponsors: settings.sponsors }); }}>
          <fieldset disabled={saving} className="space-y-5 disabled:opacity-60">
            <button type="button" className={button} onClick={() => setSettings({ ...settings, sponsors: [...settings.sponsors, { id: crypto.randomUUID(), name: '', category: 'Gold Partner', logoUrl: '', websiteUrl: '', published: false }] })}>Add sponsor</button>
            {!settings.sponsors.length && <p className="rounded-xl border border-white/20 p-6">No sponsors added. The public Sponsors section is hidden.</p>}
            {settings.sponsors.map((sponsor, index) => <section aria-label={`Sponsor ${index + 1}`} key={sponsor.id} className="rounded-xl border border-neon-purple/40 bg-night-card p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label>Company name<input required maxLength={160} className={field} value={sponsor.name} onChange={e => update(sponsor.id, { name: e.target.value })} /></label>
                <label>Partnership category<input required list="sponsor-categories" maxLength={120} className={field} value={sponsor.category} onChange={e => update(sponsor.id, { category: e.target.value })} /></label>
                <label>Logo URL<input required type="url" className={field} value={sponsor.logoUrl} onChange={e => update(sponsor.id, { logoUrl: e.target.value })} /></label>
                <label>Company website (optional)<input type="url" className={field} value={sponsor.websiteUrl} onChange={e => update(sponsor.id, { websiteUrl: e.target.value })} /></label>
              </div>
              <label className="my-4 flex items-center gap-3"><input type="checkbox" checked={sponsor.published} onChange={e => update(sponsor.id, { published: e.target.checked })} />Published</label>
              <div className="flex flex-wrap gap-3"><button className={button} type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button><button className={button} type="button" disabled={index === settings.sponsors.length - 1} onClick={() => move(index, 1)}>Move down</button><button className={button} type="button" onClick={() => { if (window.confirm('Remove this sponsor from the draft list?')) setSettings({ ...settings, sponsors: settings.sponsors.filter(item => item.id !== sponsor.id) }); }}>Remove sponsor</button></div>
            </section>)}
            <datalist id="sponsor-categories">{categories.map(category => <option key={category} value={category} />)}</datalist>
            <button type="submit" className="rounded-lg bg-neon-cyan px-6 py-3 font-bold text-black">{saving ? 'Saving…' : 'Save sponsors'}</button>
          </fieldset>
        </form>
      )}
    </div>
  );
}
