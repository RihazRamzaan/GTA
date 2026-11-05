import { useSyncExternalStore } from 'react';
import { getPublicSettings } from '../api/public.js';
import { sampleSettings } from '../data/sampleSettings.js';
import { eventContent } from '../data/eventContent.js';

// Dummy data is ON only when explicitly requested via VITE_USE_SAMPLE_SETTINGS=true.
// By default, the application connects to the authoritative public settings API.
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE_SETTINGS === 'true';

const MIN_WAIT = 1000; // never refresh more often than once a second
const MAX_WAIT = 5 * 60 * 1000; // refresh at least every 5 minutes (also picks up admin changes)
const RETRY_WAIT = 30 * 1000; // if the first load fails, try again after 30 seconds

// One shared store for the whole app, so every component sees the same settings
// and only one request (and one timer) exists.
let snapshot = { status: 'loading', settings: null }; // status: 'loading', 'ready' or 'error'
const listeners = new Set();
let started = false;
let timer = null;

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
    if (res.data?.success && res.data?.data) {
      data = res.data.data;
    } else {
      throw new Error(res.data?.error?.message || 'Public settings request failed');
    }
  }
  const serverMs = Date.parse(data.serverTime);
  const offsetMs = Number.isNaN(serverMs) ? 0 : serverMs - Date.now();
  return { ...data, offsetMs };
}

// Ask the server again just after the next milestone, so the Register button
// and the messages change by themselves without a page refresh.
function scheduleNext(settings) {
  clearTimeout(timer);
  if (USE_SAMPLE) return; // sample dates are made up fresh each time, so keep them fixed

  const serverNow = Date.now() + (settings?.offsetMs || 0);
  const upcoming = eventContent.agendaSteps
    .map((step) => Date.parse(settings?.milestones?.[step.key]))
    .filter((time) => !Number.isNaN(time) && time > serverNow)
    .sort((a, b) => a - b)[0];

  const wait = upcoming ? upcoming - serverNow + 1500 : MAX_WAIT;
  timer = setTimeout(load, Math.min(Math.max(wait, MIN_WAIT), MAX_WAIT));
}

async function load() {
  try {
    const settings = await request();
    publish({ status: 'ready', settings });
    scheduleNext(settings);
  } catch (err) {
    console.warn('Could not fetch public event settings:', err);
    // If we already have good data, keep showing it instead of flipping to an error
    if (snapshot.status !== 'ready') publish({ status: 'error', settings: null });
    clearTimeout(timer);
    if (!USE_SAMPLE) timer = setTimeout(load, RETRY_WAIT);
  }
}

function subscribe(listener) {
  listeners.add(listener);
  if (!started) {
    started = true;
    load();
  }
  return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;

export default function useEventSettings() {
  return useSyncExternalStore(subscribe, getSnapshot);
}