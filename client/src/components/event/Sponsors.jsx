import useEventSettings from '../../hooks/useEventSettings.js';

export default function Sponsors() {
  const { settings } = useEventSettings();
  const sponsors = settings?.sponsors || [];
  if (!sponsors.length) return null;
  return (
    <section id="sponsors" className="bg-night py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">SPONSORS</p>
        <h2 className="font-display text-4xl font-black text-white md:text-5xl">
          POWERED <span className="text-neon-cyan">BY</span>
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex flex-col items-center justify-center gap-3 rounded-lg border border-neon-purple/40 bg-night-card p-5 text-center transition-all duration-300 hover:border-neon-cyan"
            >
              <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} loading="lazy" className="h-20 w-full object-contain" />
              <p className="font-body text-sm text-neon-cyan">{sponsor.category}</p>
              {sponsor.websiteUrl ? <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-display text-sm text-white underline">{sponsor.name}</a> : <p className="font-display text-sm text-white">{sponsor.name}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
