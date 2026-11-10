import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import vaultArtwork from '../../assets/vault-door.jpg';
import '../../styles/vault-intro.css';

export const VAULT_SESSION_KEY = 'cyberpunk-vault-seen-v1';

export function shouldShowVault() {
  if (window.location.hash || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !sessionStorage.getItem(VAULT_SESSION_KEY); } catch { return true; }
}

export default function VaultIntro({ onComplete }) {
  const [ready, setReady] = useState(false);
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
    const onKey = (event) => { if (event.key === 'Escape') onComplete(); };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => { if (motion.matches) onComplete(); };
    document.addEventListener('keydown', onKey);
    motion.addEventListener('change', onMotion);
    // A failed or stalled asset must never hold the page behind the intro.
    const fallback = window.setTimeout(onComplete, 10000);
    return () => {
      clearTimeout(fallback);
      document.removeEventListener('keydown', onKey);
      motion.removeEventListener('change', onMotion);
      if (shell) shell.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      document.documentElement.classList.remove('vault-revealing');
      if (previousFocus instanceof HTMLElement && previousFocus !== document.body && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [onComplete]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.add('vault-revealing');
    const timer = window.setTimeout(onComplete, 6000);
    return () => clearTimeout(timer);
  }, [ready, onComplete]);

  return createPortal(
    <div ref={introRef} tabIndex={-1} className={`vault-intro${ready ? ' is-playing' : ''}`} role="dialog" aria-modal="true" aria-label="Cyberpunk opening animation">
      <img className="vault-preload" src={vaultArtwork} alt="" onLoad={() => setReady(true)} onError={onComplete} />
      <div className="vault-scene" aria-hidden="true" style={{ '--vault-art': `url(${vaultArtwork})` }}>
        <div className="vault-half vault-top"><div className="vault-skin" /></div>
        <div className="vault-half vault-bottom"><div className="vault-skin" /></div>
        {['top', 'bottom'].map((half) => (
          <div key={half} className={`vault-rotor-half vault-${half}`}>
            <div className="vault-ring"><div className="vault-skin" /></div>
            <div className="vault-core"><div className="vault-skin" /></div>
          </div>
        ))}
        <div className="vault-energy" /><div className="vault-seam" /><div className="vault-bloom" /><div className="vault-wave" />
      </div>
      <div className="vault-letterbox vault-letterbox-top" aria-hidden="true" />
      <div className="vault-letterbox vault-letterbox-bottom" aria-hidden="true" />
    </div>, document.body,
  );
}
