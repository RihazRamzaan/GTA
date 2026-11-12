import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/home-intro.css';

export default function HomeIntro({ onComplete }) {
  const [closing, setClosing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    const shell = document.querySelector('.app-shell');
    const wasInert = shell?.inert;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    if (shell) shell.inert = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    introRef.current?.focus({ preventScroll: true });
    const onKey = event => {
      if (event.key === 'Escape') onComplete();
      if (event.key === 'Tab') { event.preventDefault(); introRef.current?.focus(); }
    };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => { if (motion.matches) onComplete(); };
    document.addEventListener('keydown', onKey);
    motion.addEventListener('change', onMotion);
    // Slow, blocked or broken media must never keep the homepage inaccessible.
    const fallback = window.setTimeout(onComplete, 18000);
    const video = videoRef.current;
    let active = true;
    video.play().catch(() => { if (active) onComplete(); });
    return () => {
      active = false;
      clearTimeout(fallback);
      video.pause();
      document.removeEventListener('keydown', onKey);
      motion.removeEventListener('change', onMotion);
      if (shell) shell.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus !== document.body && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      } else {
        document.querySelector('#home h1')?.focus({ preventScroll: true });
      }
    };
  }, [onComplete]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onComplete, 350);
    return () => clearTimeout(timer);
  }, [closing, onComplete]);

  return createPortal(
    <div ref={introRef} tabIndex={-1} className={`home-intro${closing ? ' home-intro--closing' : ''}`} role="dialog" aria-modal="true" aria-label="GAMORA opening animation" aria-describedby="home-intro-description">
      <p id="home-intro-description" className="sr-only">A short dragon animation introducing GAMORA. Press Escape to enter the website.</p>
      <video ref={videoRef} className="home-intro-video" src="/media/gamora-intro.mp4" muted playsInline preload="auto" aria-hidden="true" onPlaying={() => setPlaying(true)} onEnded={() => setClosing(true)} onError={onComplete} disablePictureInPicture />
    </div>, document.body,
  );
}
