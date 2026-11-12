import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getPublicSettings } from '../api/public.js';
import { sampleSettings } from '../data/sampleSettings.js';
import { getAgenda } from '../utils/eventAgenda.js';

// Dummy data is ON only when explicitly requested via VITE_USE_SAMPLE_SETTINGS=true.
// By default, the application connects to the authoritative public settings API.
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE_SETTINGS === 'true';

const MIN_WAIT = 1000; // never refresh more often than once a second
const MAX_WAIT = 60 * 1000; // pick up edits from other admin sessions
const RETRY_WAIT = 30 * 1000; // if a load fails, try again after 30 seconds
const LOADING = { status: 'loading', settings: null };

// One shared store for the whole app, so every component sees the same settings
// and only one request (and one timer) exists.
let snapshot = LOADING; // status: 'loading', 'ready' or 'error'
const listeners = new Set();
let started = false;
let timer = null;
let inflight = null; // the request that is running right now
let inflightStartedAt = 0;
let queued = null; // one more request, waiting for the running one to finish

function publish(next) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

async function request() {
  let data;
  if (USE_SAMPLE) {
    data = sampleSettings();
  } else {
    const res = await getPublicSettings();
    if (!res.data?.success || !res.data?.data) throw new Error('Public settings request failed');
    data = res.data.data;
  }
  const serverMs = Date.parse(data.serverTime);
  const offsetMs = Number.isNaN(serverMs) ? 0 : serverMs - Date.now();
  return { ...data, offsetMs };
}

// Ask the server again just after the next milestone, so the Register button
// and the messages change by themselves without a page refresh.
function scheduleNext(settings) {
  clearTimeout(timer);

  const serverNow = Date.now() + (settings?.offsetMs || 0);
  const upcoming = [...getAgenda(settings).flatMap(entry => [entry.time, entry.endTime]), ...Object.values(settings?.milestones || {}).map(value => Date.parse(value))]
    .filter((time) => !Number.isNaN(time) && time > serverNow)
    .sort((a, b) => a - b)[0];

  const wait = upcoming ? upcoming - serverNow + 1500 : MAX_WAIT;
  timer = setTimeout(load, Math.min(Math.max(wait, MIN_WAIT), MAX_WAIT));
}

async function fetchAndPublish() {
  try {
    const settings = await request();
    publish({ status: 'ready', settings });
    scheduleNext(settings);
  } catch (err) {
    console.warn('Could not fetch public event settings:', err);
    // If we already have good data, keep showing it instead of flipping to an error
    if (snapshot.status !== 'ready') publish({ status: 'error', settings: null });
    clearTimeout(timer);
    timer = setTimeout(load, RETRY_WAIT);
  }
}

function load() {
  if (inflight) return inflight;
  inflightStartedAt = Date.now();
  inflight = fetchAndPublish().finally(() => {
    inflight = null;
  });
  return inflight;
}

// Call this after the settings change, for example when the admin saves them.
// Every page and button on screen gets the new answer.
export function refreshEventSettings() {
  if (!inflight) return load();
  // An answer is already on its way, but it may be older than this change,
  // so ask once more after it arrives.
  if (!queued) {
    queued = inflight.then(() => {
      queued = null;
      return load();
    });
  }
  return queued;
}

function subscribe(listener) {
  listeners.add(listener);
  if (!started) {
    started = true;
    load();
    window.addEventListener('focus', () => { if (!USE_SAMPLE) refreshEventSettings(); });
    document.addEventListener('visibilitychange', () => { if (!USE_SAMPLE && document.visibilityState === 'visible') refreshEventSettings(); });
  }
  return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;

// status is 'loading', 'ready' or 'error'.
// Pass { fresh: true } on pages that must not trust an earlier answer: the hook
// reports 'loading' until a newer answer has arrived.
export default function useEventSettings({ fresh = false } = {}) {
  const current = useSyncExternalStore(subscribe, getSnapshot);
  const mountedAt = useRef(Date.now());
  const [waiting, setWaiting] = useState(fresh);

  useEffect(() => {
    if (!fresh) return undefined;
    let cancelled = false;
    setWaiting(true);
    // A request that started after this page opened is already fresh enough
    const answer = inflight && inflightStartedAt >= mountedAt.current ? inflight : refreshEventSettings();
    answer.then(() => {
      if (!cancelled) setWaiting(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fresh]);

  return fresh && waiting ? LOADING : current;
}
