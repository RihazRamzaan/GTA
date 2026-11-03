import { useEffect, useState } from 'react';
import { getPublicSettings } from '../api/public.js';
import { sampleSettings } from '../data/sampleSettings.js';

// Dummy data is ON by default until the backend is ready.
// When the real API exists, set VITE_USE_SAMPLE_SETTINGS=false in client/.env.
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE_SETTINGS !== 'false';

// One shared request, so Navbar, Hero and Home do not each call the API.
let cached = null;

function fetchSettings() {
  if (!cached) {
    cached = (async () => {
      let data;
      if (USE_SAMPLE) {
        data = sampleSettings();
      } else {
        try {
          const res = await getPublicSettings();
          if (res.data?.success && res.data?.data) {
            data = res.data.data;
          } else {
            data = sampleSettings();
          }
        } catch (err) {
          console.warn('API /public/settings unreachable, using sampleSettings fallback.', err);
          data = sampleSettings();
        }
      }
      const serverMs = Date.parse(data.serverTime);
      const offsetMs = Number.isNaN(serverMs) ? 0 : serverMs - Date.now();
      return { ...data, offsetMs };
    })();
    // If it failed, forget it so the next page load can try again
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

// status is 'loading', 'ready' or 'error'
export default function useEventSettings() {
  const [state, setState] = useState({ status: 'loading', settings: null });

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((settings) => {
        if (!cancelled) setState({ status: 'ready', settings });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', settings: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}