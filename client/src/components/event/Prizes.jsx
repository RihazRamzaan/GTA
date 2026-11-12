import { eventContent } from '../../data/eventContent.js';
import Icon from '../ui/Icon.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';

// Full class names are written out so Tailwind can find them
const styles = {
  gold: {
    border: 'border-prize-gold/70 hover:border-prize-gold',
    text: 'text-prize-gold',
    glow: 'shadow-[0_0_26px_rgba(245,184,61,0.25)] hover:shadow-[0_0_40px_rgba(245,184,61,0.55)]',
  },
  silver: {
    border: 'border-prize-silver/70 hover:border-prize-silver',
    text: 'text-prize-silver',
    glow: 'shadow-[0_0_26px_rgba(159,196,232,0.2)] hover:shadow-[0_0_40px_rgba(159,196,232,0.45)]',
  },
  bronze: {
    border: 'border-prize-bronze/70 hover:border-prize-bronze',
    text: 'text-prize-bronze',
    glow: 'shadow-[0_0_26px_rgba(224,121,74,0.22)] hover:shadow-[0_0_40px_rgba(224,121,74,0.45)]',
  },
};

export default function Prizes() {
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="prizes" ref={sectionRef} className="bg-night py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className={`reveal-fade-up ${isRevealed ? 'is-revealed' : ''}`}>
          <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">PRIZES</p>
          <h2 className="font-display text-4xl font-black text-white md:text-5xl">
            BIG IDEAS <span className="block">BIGGER REWARDS</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {eventContent.prizes.map((prize, i) => {
            const s = styles[prize.color];
            return (
              <div
                key={prize.place}
                style={{ transitionDelay: isRevealed ? `${i * 140}ms` : '0ms' }}
                className={`group rounded-xl border bg-night-card p-6 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] ${s.border} ${s.glow} reveal-scale-up ${
                  isRevealed ? 'is-revealed' : ''
                }`}
              >
                <p className={`flex items-center gap-2 font-body text-lg font-bold ${s.text}`}>
                  <span className="transition-transform duration-300 group-hover:scale-115">
                    <Icon name="trophy" size={30} />
                  </span>
                  {prize.place}
                </p>
                <p className="mt-3 font-display text-3xl font-black text-white">{prize.amount}</p>
                <ul className="mt-5 space-y-2 font-body text-lg text-slate-300">
                  {prize.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Icon name="check" size={18} glow={false} className={s.text} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
