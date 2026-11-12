import { eventContent } from '../../data/eventContent.js';

export default function Sponsors() {
  return (
    <section id="sponsors" className="bg-night py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">SPONSORS</p>
        <h2 className="font-display text-4xl font-black text-white md:text-5xl">
          POWERED <span className="text-neon-cyan">BY</span>
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {eventContent.sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex h-28 items-center justify-center rounded-lg border border-neon-purple/40 bg-night-card p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-cyan hover:shadow-[0_0_18px_rgba(0,229,255,0.2)]"
            >
              {sponsor.logo ? (
                <img src={sponsor.logo} alt={sponsor.name} className="max-h-full w-full object-contain" />
              ) : (
                <span className="font-display text-sm font-bold tracking-wider text-slate-300">{sponsor.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
