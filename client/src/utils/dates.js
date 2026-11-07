// Show dates in Sri Lanka time. The server stores UTC.
export function formatColombo(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Example results: "16 Nov – 10 Dec 2026", "16 – 20 Nov 2026", "16 Nov 2026"
export function formatColomboDateRange(startIso, endIso) {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  const parts = (ms) => {
    const p = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Colombo',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).formatToParts(new Date(ms));
    const get = (type) => p.find((x) => x.type === type).value;
    return { day: get('day'), month: get('month'), year: get('year') };
  };

  const s = parts(start);
  const e = parts(end);

  if (s.day === e.day && s.month === e.month && s.year === e.year) return `${s.day} ${s.month} ${s.year}`;
  if (s.month === e.month && s.year === e.year) return `${s.day} – ${e.day} ${e.month} ${e.year}`;
  if (s.year === e.year) return `${s.day} ${s.month} – ${e.day} ${e.month} ${e.year}`;
  return `${s.day} ${s.month} ${s.year} – ${e.day} ${e.month} ${e.year}`;
}