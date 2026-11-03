import { useEffect, useState } from 'react';
import { getPublicSettings } from '../api/public.js';
import { sampleSettings } from '../data/sampleSettings.js';

// Dummy data is ON by default in development until the backend is ready, and never used in production builds.
// When the real API exists, set VITE_USE_SAMPLE_SETTINGS=false in client/.env.
const USE_SAMPLE = import.meta.env.DEV && import.meta.env.VITE_USE_SAMPLE_SETTINGS !== 'false';

// One shared request, so Navbar, Hero and Home do not each call the API.
let cached = null;

function fetchSettings() {
  if (!cached) {
    cached = (async () => {
      let data;
      if (USE_SAMPLE) {
        data = sampleSettings();
      } else {
        const res = await getPublicSettings();
        data = res.data.data; // API shape: { success: true, data: {...} }
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