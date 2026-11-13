import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/home-intro.css';

const fadeDuration = 3.5;

export default function HomeIntro({ onComplete, onReveal }) {
  const [phase, setPhase] = useState('playing');
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
    let frame;
    let revealed = false;
    const update = () => {
      const video = videoRef.current;
      if (!video || !introRef.current) return;
      if (Number.isFinite(video.duration) && video.duration > 0) {
        const duration = Math.min(fadeDuration, video.duration);
        const remaining = video.duration - video.currentTime;
        if (remaining <= duration && !revealed) {
          revealed = true;
          setPhase('reveal');
          onReveal();
        }
        introRef.current.style.opacity = String(Math.max(0, Math.min(1, remaining / duration)));
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [onReveal]);

  return createPortal(
    <div ref={introRef} tabIndex={-1} className="home-intro" data-phase={phase} role="dialog" aria-modal="true" aria-label="GAMORA opening animation" aria-describedby="home-intro-description">
      <p id="home-intro-description" className="sr-only">A short dragon animation introducing GAMORA. Press Escape to enter the website.</p>
      <video ref={videoRef} className="home-intro-video" src="/media/gamora-intro.mp4" muted playsInline preload="auto" aria-hidden="true" onEnded={onComplete} onError={onComplete} disablePictureInPicture />
    </div>, document.body,
  );
}
