import { useEffect, useState } from 'react';
import { getPublicSettings } from '../api/public.js';
import { sampleSettings } from '../data/sampleSettings.js';

// Dummy data is ON only when explicitly requested via VITE_USE_SAMPLE_SETTINGS=true.
// By default, the application connects to the authoritative public settings API.
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE_SETTINGS === 'true';

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
            throw new Error(res.data?.error?.message || 'Public settings request failed');
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn('Could not fetch authoritative public settings, falling back to sample:', err);
            data = sampleSettings();
          } else {
            throw err;
          }
        }
      }
      const serverMs = Date.parse(data.serverTime);
      const offsetMs = Number.isNaN(serverMs) ? 0 : serverMs - Date.now();
      return { ...data, offsetMs };
    })();
    // If it failed, forget it so the next attempt can try again
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

// Every mounted page and button, so a new answer reaches the ones already on screen.
const listeners = new Set();

function publish(request) {
  request
    .then((settings) => listeners.forEach((listener) => listener({ status: 'ready', settings })))
    .catch((err) => {
      console.warn('Could not fetch public event settings:', err);
      listeners.forEach((listener) => listener({ status: 'error', settings: null }));
    });
}

// Call this after the settings change, for example when the admin saves them.
export function refreshEventSettings() {
  cached = null;
  publish(fetchSettings());
}

// status is 'loading', 'ready' or 'error'
// Pass { fresh: true } on pages that must not trust an earlier answer.
export default function useEventSettings({ fresh = false } = {}) {
  const [state, setState] = useState({ status: 'loading', settings: null });

  useEffect(() => {
    listeners.add(setState);
    if (fresh) cached = null;
    publish(fetchSettings());
    return () => {
      listeners.delete(setState);
    };
  }, [fresh]);

  return state;
}
