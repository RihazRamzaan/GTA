import { eventContent } from '../../data/eventContent.js';

export default function Rules() {
  return (
    <section id="rules" className="bg-night py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-cyan">HACKATHON GUIDELINES</p>
            <h2 className="font-display text-4xl font-black text-white md:text-5xl">
              RULES & <span className="text-neon-pink">FAIR PLAY</span>
            </h2>
          </div>
          <p className="max-w-md font-body text-lg text-slate-300">
            Official guidelines approved by event organizers. All registered teams must adhere to these policies throughout the competition.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-2">
          {eventContent.rules.map((rule, i) => {
            const isObject = typeof rule === 'object' && rule !== null;
            const title = isObject ? rule.title : null;
            const text = isObject ? rule.text : rule;
            const tag = isObject ? rule.tag : null;

            return (
              <li
                key={title || rule}
                className="group relative flex flex-col justify-between rounded-xl border border-neon-purple/40 bg-night-card p-6 transition duration-200 hover:border-neon-cyan hover:shadow-[0_0_24px_rgba(0,229,255,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-2xl font-black text-neon-pink group-hover:text-neon-cyan transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {tag && (
                      <span className="rounded border border-neon-cyan/40 bg-neon-cyan/10 px-2.5 py-0.5 font-body text-xs font-bold tracking-wider text-neon-cyan">
                        {tag.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {title && (
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {title}
                    </h3>
                  )}
                  <p className="font-body text-lg leading-relaxed text-slate-300">
                    {text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
