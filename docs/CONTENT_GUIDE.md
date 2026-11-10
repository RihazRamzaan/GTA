# Content Update Guide — GAMORA

Public event wording, hackathon guidelines, and event copy belong to **Yuwandhi**.
This document outlines where frontend content lives, how to update it, which dates are driven dynamically by backend admin settings, and how the official **GAMORA** proposal data and free-registration policy are integrated across participant-facing pages.

---

## 1. Event Overview & Organizers

- **Event Name**: **GAMORA**
- **Motto**: **CREATE • PLAY • BEYOND**
- **Official Designation**: **Gaming Buildathon & Interactive Expo**
- **Organized by**:
  - **Software Engineering Students’ Association (SESA)**, Faculty of Science, University of Kelaniya
  - **IEEE Student Branch University of Kelaniya (IEEE SB UOK)**
- **Official Website**: [www.sesa.lk](https://www.sesa.lk)
- **Venue**: Dharmaloka Hall, University of Kelaniya

---

## 2. Content Architecture Overview

Public frontend content is cleanly separated between:

1. **Static and Semi-Static Event Copy**: Maintained in `client/src/data/eventContent.js`.
2. **Dynamic Live Milestone Dates and Window States**: Provided by the API (`GET /api/public/settings`) and managed by the Admin in `server/src/models/EventSettings.js`.

| Content Area                | Source File                                               | Managed By       | Dynamic / Static                          |
| --------------------------- | --------------------------------------------------------- | ---------------- | ----------------------------------------- |
| Event Branding & Tagline    | `client/src/data/eventContent.js`                         | Yuwandhi         | Static                                    |
| Navigation Links            | `client/src/data/eventContent.js`                         | Yuwandhi         | Static                                    |
| Hero Section Content        | `client/src/components/event/Hero.jsx`                    | Yuwandhi         | Hybrid (Text is static; dates from API)   |
| Milestone Dates & Countdown | `client/src/components/event/Countdown.jsx`, `Agenda.jsx` | Yuwandhi / Rihaz | Dynamic (`EventSettings`)                 |
| Prizes & Awards             | `client/src/data/eventContent.js`, `Prizes.jsx`           | Yuwandhi         | Static                                    |
| Hackathon Rules & Rubric    | `client/src/data/eventContent.js`, `Rules.jsx`            | Yuwandhi         | Static (Supervisor approved)              |
| Sponsors & Partners         | `client/src/data/eventContent.js`, `Sponsors.jsx`         | Yuwandhi         | Static (SVG assets in `assets/sponsors/`) |
| FAQ Section                 | `client/src/data/eventContent.js`, `Faq.jsx`              | Yuwandhi         | Static                                    |
| Registration Status Notice  | `client/src/components/event/RegistrationNotice.jsx`      | Yuwandhi         | Dynamic (`EventSettings`)                 |

---

## 3. Official Event Data (`client/src/data/eventContent.js`)

All public text, rules, prizes, sponsors, and FAQs are centralized in:
`client/src/data/eventContent.js`

### Structure and Fields

```javascript
export const eventContent = {
  name: 'GAMORA',
  logo: { first: 'GAM', second: 'ORA' },
  label: 'GAMING BUILDATHON & INTERACTIVE EXPO',
  heroLines: ['CREATE', 'PLAY', 'BEYOND'],
  tagline: "Sri Lanka's premier multiplayer game development buildathon and interactive gaming expo.",

  // Fallback metadata used when the API is loading or offline
  info: {
    dates: '13 NOV – 17 DEC 2026',
    venue: 'DHARMALOKA HALL, UOK',
    teamSize: 'TEAMS OF 2 – 4',
  },
  ...
};
```

### Core Prize Pool (LKR 150,000 Locked & Ring-Fenced)

The core prize pool follows page 16 of the official proposal:

- **1st Place**: LKR 75,000 + Official Trophy
- **2nd Place**: LKR 50,000 + Official Trophy
- **3rd Place**: LKR 25,000 + Official Trophy
- _Special Category Awards_: Best Multiplayer Architecture, Best AI Implementation, Community Choice (funded by partners).

### Technical Evaluation Rubric & Guidelines

The Rules section (`client/src/components/event/Rules.jsx`) displays the 5 technical pillars from page 15 of the proposal alongside standard hackathon policies:

1. **Multiplayer Replication & Network Reliability**: Authoritative synchronization, lag compensation, client-side prediction, and session consistency.
2. **Game AI Systems**: Custom NPC behaviors, decision trees/FSMs, pathfinding, or adaptive difficulty algorithms.
3. **Architecture & Software Engineering**: Clean design patterns, modular code structure, memory and resource management, and execution optimization.
4. **UX/UI & Polish**: Audio-visual feedback systems, accessible interfaces, HUD usability, and gameplay responsiveness.
5. **Deployment & Packaging**: Standalone runnable release packages, technical documentation, and build automation scripts.

---

## 4. Dynamic Dates and Admin Settings

Event milestones are not hardcoded on the public site. They are fetched from `GET /api/public/settings` via the `useEventSettings` hook.

### Milestone Keys and Meanings

| Milestone Key          | Public Label        | Used In                                             |
| ---------------------- | ------------------- | --------------------------------------------------- |
| `registrationOpensAt`  | Registration Opens  | Countdown, Agenda                                   |
| `registrationClosesAt` | Registration Closes | Countdown, Agenda, Hero notice, Registration button |
| `buildingStartsAt`     | Round 1 Begins      | Countdown, Agenda, Hero date range start            |
| `submissionOpensAt`    | Submissions Open    | Countdown, Agenda                                   |
| `submissionClosesAt`   | Round 1 Deadline    | Countdown, Agenda, Hero date range end              |
| `resultsAt`            | Grand Finale & Expo | Countdown, Agenda                                   |

---

## 5. Free Registration Policy Implementation

As of Day 7, registration is completely free. All public content reflects this policy:

1. **Zero Fees**: No participant-facing screen requests money, entry fees, or bank transfers.
2. **No Slip Uploads**: All references to bank slips, deposit slips, payment verification, and manual review have been removed from the homepage, registration page, and FAQ.
3. **Immediate Confirmation**: Public guidance clarifies that teams are confirmed automatically upon registration.
4. **Optional Playable Demo & Video**: FAQ and submission guidelines state that only title, short description, and GitHub repository URL are required; playable web URLs and video demos are optional.

---

## 6. Responsive Design and Visual Polish

The public pages use the NEXUS Cyberpunk neon palette:

- Neon Cyan: `#00e5ff`
- Neon Pink / Magenta: `#ff2bd6`
- Neon Purple: `#8b3dff`
- Night Background: `#070714`
- Night Card Surface: `#0d0f24`
