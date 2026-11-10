# Content Update Guide

Public event wording, hackathon guidelines, and event copy belong to **Yuwandhi**.
This document outlines where frontend content lives, how to update it, which dates are driven dynamically by backend admin settings, and how the free-registration policy is presented across participant-facing pages.

---

## 1. Content Architecture Overview

Public frontend content is cleanly separated between:
1. **Static and Semi-Static Event Copy**: Maintained in `client/src/data/eventContent.js`.
2. **Dynamic Live Milestone Dates and Window States**: Provided by the API (`GET /api/public/settings`) and managed by the Admin in `server/src/models/EventSettings.js`.

| Content Area | Source File | Managed By | Dynamic / Static |
|---|---|---|---|
| Event Branding & Tagline | `client/src/data/eventContent.js` | Yuwandhi | Static |
| Navigation Links | `client/src/data/eventContent.js` | Yuwandhi | Static |
| Hero Section Content | `client/src/components/event/Hero.jsx` | Yuwandhi | Hybrid (Text is static; dates from API) |
| Milestone Dates & Countdown | `client/src/components/event/Countdown.jsx`, `Agenda.jsx` | Yuwandhi / Rihaz | Dynamic (`EventSettings`) |
| Prizes & Awards | `client/src/data/eventContent.js`, `Prizes.jsx` | Yuwandhi | Static |
| Hackathon Rules & Guidelines | `client/src/data/eventContent.js`, `Rules.jsx` | Yuwandhi | Static (Supervisor approved) |
| Sponsors & Partners | `client/src/data/eventContent.js`, `Sponsors.jsx` | Yuwandhi | Static (SVG assets in `assets/sponsors/`) |
| FAQ Section | `client/src/data/eventContent.js`, `Faq.jsx` | Yuwandhi | Static |
| Registration Status Notice | `client/src/components/event/RegistrationNotice.jsx` | Yuwandhi | Dynamic (`EventSettings`) |

---

## 2. Where Frontend Content Lives (`client/src/data/eventContent.js`)

All public text, rules, prizes, sponsors, and FAQs are centralized in:
`client/src/data/eventContent.js`

### Structure and Fields

```javascript
export const eventContent = {
  name: 'Cyberpunk',
  logo: { first: 'CYBER', second: 'PUNK' },
  label: 'GAME BUILDATHON',
  heroLines: ['CREATE', 'PLAY', 'BEYOND'],
  tagline: 'A game development buildathon for dreamers, builders and gamers.',

  // Fallback metadata used when the API is loading or offline
  info: {
    dates: '16 NOV – 10 DEC 2026',
    venue: 'COLOMBO, SRI LANKA',
    teamSize: 'TEAMS OF 2 – 4',
  },

  navLinks: [ ... ],
  about: { ... },
  agendaSteps: [ ... ],
  prizes: [ ... ],
  sponsors: [ ... ],
  rules: [ ... ],
  faq: [ ... ],
};
```

### Updating Rules & Guidelines
The Rules section (`client/src/components/event/Rules.jsx`) consumes `eventContent.rules`. Each rule is an object structured as follows:
- `title`: The guideline headline.
- `text`: Detailed explanation of the rule.
- `tag`: Category badge (e.g. `Eligibility`, `Originality`, `Technology`, `Licensing`, `AI Policy`, `Submission`, `Judging`, `Conduct`).

### Updating Prizes
The Prizes section (`client/src/components/event/Prizes.jsx`) consumes `eventContent.prizes`:
- `place`: Position (`1st Place`, `2nd Place`, `3rd Place`).
- `amount`: Cash prize string (e.g. `LKR 150,000`).
- `color`: Neon theme styling accent (`gold`, `silver`, `bronze`).
- `perks`: Array of awarded benefits.

### Updating Sponsors
Sponsor logos are stored in `client/src/assets/sponsors/`. Import the SVG/PNG and reference it in `eventContent.sponsors`.

---

## 3. Dynamic Dates and Admin Settings

Event milestones are not hardcoded on the public site. They are fetched from `GET /api/public/settings` via the `useEventSettings` hook.

### Milestone Keys and Meanings

| Milestone Key | Public Label | Used In |
|---|---|---|
| `registrationOpensAt` | Registration Opens | Countdown, Agenda |
| `registrationClosesAt` | Registration Closes | Countdown, Agenda, Hero notice, Registration button |
| `buildingStartsAt` | Building Starts | Countdown, Agenda, Hero date range start |
| `submissionOpensAt` | Submissions Open | Countdown, Agenda |
| `submissionClosesAt` | Submissions Close | Countdown, Agenda, Hero date range end |
| `resultsAt` | Results | Countdown, Agenda |

### Date Fallback Strategy
If the backend is booting or unreachable:
1. `Hero.jsx` falls back to `eventContent.info.dates` (`16 NOV – 10 DEC 2026`).
2. `Countdown.jsx` and `Agenda.jsx` show graceful status states (`Loading event timeline...` or error retry).
3. Dates are formatted in Asia/Colombo time using `formatColombo()` and `formatColomboDateRange()`.

---

## 4. Free Registration Policy Implementation

As of Day 7, registration is completely free. All public content reflects this policy:
1. **Zero Fees**: No participant-facing screen requests money, entry fees, or bank transfers.
2. **No Slip Uploads**: All references to bank slips, deposit slips, payment verification, and manual review have been removed from the homepage, registration page, and FAQ.
3. **Immediate Confirmation**: Public guidance clarifies that teams are confirmed automatically upon registration.
4. **Optional Playable Demo & Video**: FAQ and submission guidelines state that only title, short description, and GitHub repository URL are required; playable web URLs and video demos are optional.

---

## 5. Responsive Design and Visual Polish

The public pages use the NEXUS Cyberpunk neon palette:
- Neon Cyan: `#00e5ff`
- Neon Pink / Magenta: `#ff2bd6`
- Neon Purple: `#8b3dff`
- Night Background: `#070714`
- Night Card Surface: `#0d0f24`

### Hero Section Alignment
- The Hero section top padding is optimized (`pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-8 md:pb-20 lg:pt-10 lg:pb-24`) so the `CREATE PLAY BEYOND` heading sits close to the navigation bar.
- On mobile viewports (`< 768px`), an extra overlay `bg-night/60` guarantees high-contrast text readability over background artwork.
- On large viewports (`>= 768px`), horizontal gradients fade into the background artwork on the right.

