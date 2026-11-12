export const HOME_INTRO_SESSION_KEY = 'gamora-dragon-intro-seen-v1';

export function shouldShowHomeIntro() {
  if (window.location.hash || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !sessionStorage.getItem(HOME_INTRO_SESSION_KEY); } catch { return true; }
}
