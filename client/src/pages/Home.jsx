import Hero from '../components/event/Hero.jsx';
import About from '../components/event/About.jsx';
import Countdown from '../components/event/Countdown.jsx';
import Agenda from '../components/event/Agenda.jsx';
import Prizes from '../components/event/Prizes.jsx';
import Rules from '../components/event/Rules.jsx';
import Sponsors from '../components/event/Sponsors.jsx';
import Faq from '../components/event/Faq.jsx';
import useEventSettings from '../hooks/useEventSettings.js';

function Divider() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="neon-divider" />
    </div>
  );
}

export default function Home() {
  const { settings, status } = useEventSettings();

  return (
    <div className="full-bleed bg-night">
      <Hero />
      <About />
      <Divider />

      <section id="timeline" className="bg-night py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="mb-3 font-body text-sm font-bold tracking-[0.3em] text-neon-pink">EVENT TIMELINE</p>
          <h2 className="mb-8 font-display text-4xl font-black text-white md:text-5xl">
            YOUR JOURNEY TO <span className="text-neon-cyan">CREATION</span>
          </h2>
          <Countdown settings={settings} status={status} />
          <Agenda settings={settings} status={status} />
        </div>
      </section>

      <Divider />
      <Prizes />
      <Divider />
      <Rules />
      <Divider />
      <Sponsors />
      <Divider />
      <Faq />
    </div>
  );
}