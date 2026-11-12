import { eventContent } from '../../data/eventContent.js';
import Icon from '../ui/Icon.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';

const cardIcons = [
  { name: 'bulb', color: 'text-neon-cyan' },
  { name: 'users', color: 'text-[#b07bff]' },
  { name: 'gamepad', color: 'text-neon-pink' },
  { name: 'trophy', color: 'text-prize-gold' },
];

export default function About() {
  const { about } = eventContent;
  const [sectionRef, isRevealed] = useScrollReveal({ threshold: 0.18 });

  return (
    <section id="about" ref={sectionRef} className="bg-night py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
        {/* Left column: Single cohesive fade-up for heading and story */}
        <div className={`reveal-fade-up ${isRevealed ? 'is-revealed' : ''}`}>
          <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-cyan">ABOUT THE BUILDATHON</p>
          <h2 className="font-display text-4xl font-black text-white md:text-5xl">
            {about.title} <span className="text-neon-pink">{about.highlight}</span>
          </h2>
          <p className="mt-5 max-w-lg font-body text-xl text-slate-300">{about.text}</p>
          <a
            href="/#rules"
            className="mt-6 inline-block rounded border border-neon-cyan px-6 py-2 font-body text-lg font-bold text-neon-cyan transition hover:bg-neon-cyan/10 hover:shadow-[0_0_18px_rgba(0,229,255,0.35)]"
          >
            Explore Rules →
          </a>
        </div>

        {/* Right column: Staggered reveal for the 4 feature cards */}
        <div className="grid grid-cols-2 gap-4">
          {about.cards.map((card, i) => (
            <div
              key={card.title}
              style={{ transitionDelay: isRevealed ? `${i * 100}ms` : '0ms' }}
              className={`reveal-scale-up rounded-lg border border-neon-purple/40 bg-night-card p-5 transition-all duration-300 hover:border-neon-cyan hover:shadow-[0_0_22px_rgba(0,229,255,0.25)] ${
                isRevealed ? 'is-revealed' : ''
              }`}
            >
              <Icon name={cardIcons[i].name} size={34} className={cardIcons[i].color} />
              <h3 className="mt-3 font-display text-lg font-bold text-white">{card.title}</h3>
              <p className="mt-1 font-body text-base text-slate-400">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}