import { eventContent } from '../../data/eventContent.js';
import useEventSettings from '../../hooks/useEventSettings.js';
import { resolveEventText } from '../../utils/eventAgenda.js';

export default function Faq() {
  const { settings } = useEventSettings();
  return (
    <section id="faq" className="bg-night py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-cyan">FAQ</p>
        <h2 className="font-display text-4xl font-black text-white md:text-5xl">
          GOT <span className="text-neon-pink">QUESTIONS?</span>
        </h2>

        <div className="mt-8 space-y-3">
          {eventContent.faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-neon-purple/40 bg-night-card p-5 transition-all duration-300 open:border-neon-cyan open:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-body text-xl font-bold text-white transition-colors hover:text-neon-cyan">
                {item.q}
                <span className="text-2xl text-neon-pink transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 font-body text-lg text-slate-300">{resolveEventText(item.a, settings)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
