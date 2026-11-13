import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';
import useEventSettings from '../hooks/useEventSettings.js';
import { eventContent } from '../data/eventContent.js';
import { eventEnd, getAgenda, hasSponsors, resolveEventText } from '../utils/eventAgenda.js';
import { formatColomboDateRange } from '../utils/dates.js';
import Agenda from '../components/event/Agenda.jsx';
import Countdown from '../components/event/Countdown.jsx';
import RegisterButton from '../components/event/RegisterButton.jsx';
import RegistrationNotice from '../components/event/RegistrationNotice.jsx';
import PrizeCounter from '../components/event/PrizeCounter.jsx';
import HomeIntro from '../components/event/HomeIntro.jsx';
import Dock from '../components/layout/Dock.jsx';
import { HOME_INTRO_SESSION_KEY, shouldShowHomeIntro } from '../utils/homeIntro.js';
import '../styles/home.css';

const introduction = 'A meeting point for imagination and engineering. GAMORA brings university students together to build games, explore game AI and turn ambitious ideas into interactive worlds.';
const prizeTotal = eventContent.prizes.reduce((sum, prize) => sum + Number(prize.amount.replace(/[^0-9.]/g, '')), 0);

export default function Home() {
  const { settings, status } = useEventSettings();
  const { user } = useAuth();
  const { hash } = useLocation();
  const [introStage, setIntroStage] = useState(() => shouldShowHomeIntro() ? 'playing' : 'bypassed');
  const showIntro = introStage === 'playing' || introStage === 'revealing';
  const revealHero = useCallback(() => setIntroStage('revealing'), []);
  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem(HOME_INTRO_SESSION_KEY, '1'); } catch { /* Storage may be disabled. */ }
    setIntroStage(current => current === 'revealing' ? 'complete' : 'bypassed');
  }, []);
  const pageRef = useRef(null);
  const name = settings?.event?.name || eventContent.name;
  const agenda = getAgenda(settings);
  const end = eventEnd(settings);
  const dates = status === 'ready' && agenda.length && Number.isFinite(end)
    ? formatColomboDateRange(agenda[0].startsAt, new Date(end).toISOString()) : 'Dates to be announced';
  const venue = settings?.event?.venue || 'Venue to be announced';

  useEffect(() => {
    const root = pageRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .18, rootMargin: '0px 0px -110px 0px' });
    const observe = () => root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(node => observer.observe(node));
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(root, { childList: true, subtree: true });

    const dock = root.querySelector('.home-dock');
    const documentStyle = document.documentElement.style;
    const previousClearance = documentStyle.getPropertyValue('--home-dock-clearance');
    const measureDock = () => documentStyle.setProperty('--home-dock-clearance', `${Math.ceil(window.innerHeight - dock.getBoundingClientRect().top + 20)}px`);
    const dockObserver = new ResizeObserver(measureDock);
    dockObserver.observe(dock);
    measureDock();

    const reading = root.querySelector('[data-reading]');
    const words = reading.querySelectorAll('[data-word]');
    let frame = 0;
    const update = () => {
      const box = reading.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .85 - box.top) / (box.height + window.innerHeight * .25)));
      words.forEach((word, index) => word.classList.toggle('is-read', motion.matches || index / words.length < progress));
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const onResize = () => { measureDock(); onScroll(); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    motion.addEventListener('change', onScroll);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      dockObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      motion.removeEventListener('change', onScroll);
      if (previousClearance) documentStyle.setProperty('--home-dock-clearance', previousClearance);
      else documentStyle.removeProperty('--home-dock-clearance');
    };
  }, []);

  useEffect(() => {
    if (hash && showIntro) finishIntro();
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [hash, status, showIntro, finishIntro]);

  return <div className="gamora-home" data-intro={introStage} ref={pageRef}>
    {showIntro && <HomeIntro onComplete={finishIntro} onReveal={revealHero} />}
    <a className="home-skip" href="#about">Skip introduction</a>
    <section id="home" className="home-hero">
      <span className="hero-watermark" aria-hidden="true">{name}</span>
      <div className="home-wrap hero-layout"><div className="hero-copy">
        <p className="home-eyebrow">GAME BUILDATHON & INTERACTIVE EXPO</p>
        <h1 tabIndex={-1}><span>IMAGINE</span><span className="home-outline">BUILD</span><span className="home-pink">UNLEASH</span></h1>
        <p className="hero-date">{dates}</p><p className="hero-caption">Your imagination. A world worth playing.</p>
      </div></div>
      <div className="hero-bottom home-wrap"><span>UNIVERSITY OF KELANIYA</span><span>FREE REGISTRATION · OPEN POSSIBILITIES</span></div>
    </section>

    <section id="about" className="home-about home-wrap home-section">
      <p className="home-eyebrow" data-reveal>THE IDEA BEHIND THE EXPERIENCE</p><h2 data-reveal>What is <span className="home-outline">{name}?</span></h2>
      <p className="home-reading" data-reading>{introduction.split(' ').map((word, index) => <span data-word key={`${index}-${word}`}>{word}{' '}</span>)}</p>
      <p className="home-organizers" data-reveal>Organized by <strong>SESA × IEEE SB UOK</strong><br />University of Kelaniya</p>
    </section>

    <div className="home-marquee" aria-hidden="true"><div>{Array.from({ length: 4 }, (_, i) => <span key={i}>IMAGINE <i>✳</i> BUILD <i>✳</i> UNLEASH <i>✳</i> </span>)}</div></div>
    <section className="home-rounds home-wrap home-section" aria-labelledby="rounds-title">
      <p className="home-eyebrow" data-reveal>FROM THE FIRST IDEA TO THE FINAL STAGE</p><h2 id="rounds-title" data-reveal>One journey.<br /><span className="home-outline">Two levels.</span></h2>
      <div className="round-levels">
        <article className="round-copy" data-reveal><span className="round-index">01 / BUILD</span><h3>Make your<br />world playable.</h3><p>Start with the topic. Build an original game. Bring your engineering, game AI and imagination together.</p><a href="#rules" className="home-text-link">Explore the guidelines ↗</a></article>
        <article className="round-copy" data-reveal><span className="round-index">02 / SHOWCASE</span><h3>Small beginnings.<br />A bigger stage.</h3><p>The finalists move into the next round. Refine your game, share your work and bring it to life at the buildathon finale and interactive expo.</p><a href="#timeline" className="home-text-link">Follow the journey ↗</a></article>
      </div>
    </section>

    <section id="timeline" className="home-timeline home-section home-wrap"><header className="home-center" data-reveal><p className="home-eyebrow">EVERY STEP IS PART OF THE STORY</p><h2>The <span className="home-outline">roadmap.</span></h2><p className="home-muted">From your first hello to the final showcase. All times are Sri Lanka time.</p></header><div className="home-clock" data-reveal><Countdown settings={settings} status={status} /></div><Agenda settings={settings} status={status} /></section>

    <section id="prizes" className="home-prizes home-section home-wrap"><p className="home-eyebrow" data-reveal>GOOD IDEAS DESERVE THE SPOTLIGHT</p><h2 data-reveal>Build for the love.<br /><span className="home-outline">Play for the podium.</span></h2><div className="prize-total" data-reveal><span className="prize-currency">LKR</span> <PrizeCounter total={prizeTotal} /><p>Total cash prize pool</p></div><ol className="home-podium" data-reveal>{eventContent.prizes.map((prize, i) => <li key={prize.place} className={`podium-tile podium-${prize.color || (i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze')}`}><span className="podium-rank">0{i + 1}</span><span className="podium-place">{prize.place}</span><h3 className="podium-amount">{prize.amount}</h3><p className="podium-perks">{prize.perks.join(' · ')}</p></li>)}</ol></section>

    <section id="rules" className="home-guidelines home-section home-wrap"><header data-reveal><p className="home-eyebrow">A FAIR GAME FOR EVERYONE</p><h2>Before you <span className="home-outline">begin.</span></h2><p className="home-muted">Current event guidelines. Final policy details are subject to organizer confirmation.</p></header><div className="home-accordions">{eventContent.rules.map((rule, i) => <details key={rule.title} data-reveal><summary><span className="accordion-number">{String(i + 1).padStart(2, '0')}</span>{rule.title}<span className="accordion-plus" aria-hidden="true">+</span></summary><p>{resolveEventText(rule.text, settings)}</p></details>)}</div></section>

    {hasSponsors(settings) && <section id="sponsors" className="home-partners home-section home-wrap"><header className="home-center" data-reveal><p className="home-eyebrow">MAKING IT POSSIBLE, TOGETHER</p><h2>Our <span className="home-outline">partners.</span></h2></header><div className="home-sponsor-grid">{settings.sponsors.map(sponsor => <div key={sponsor.id} data-reveal><p className="home-eyebrow">{sponsor.category}</p><img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} loading="lazy" />{sponsor.websiteUrl ? <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">{sponsor.name} ↗</a> : <span>{sponsor.name}</span>}</div>)}</div></section>}

    <section id="faq" className="home-faq home-section home-wrap"><header data-reveal><p className="home-eyebrow">A LITTLE CLARITY BEFORE YOU PLAY</p><h2>Wondering <span className="home-outline">something?</span></h2></header><div className="home-accordions">{eventContent.faq.map(item => <details key={item.q} data-reveal><summary>{item.q}<span className="accordion-plus" aria-hidden="true">+</span></summary><p>{resolveEventText(item.a, settings)}</p></details>)}</div></section>

    <div className="home-ending">
      <section className="home-finish home-section home-wrap" aria-labelledby="finish-title" data-reveal><p className="home-eyebrow">SEE YOU ON THE OTHER SIDE OF THE SCREEN</p><h2 id="finish-title">Your next world<br /><span className="home-outline">starts here.</span></h2><p className="finish-venue">{venue}</p><RegisterButton className="home-register" arrow /><RegistrationNotice /></section>
      <footer className="home-footer home-wrap"><a href="https://www.sesa.lk" target="_blank" rel="noopener noreferrer">SESA × IEEE SB UOK ↗</a><span>© {new Date().getFullYear()} {name}</span><a href="#home">Back to top ↑</a></footer>
    </div>
    <Dock />
  </div>;
}
