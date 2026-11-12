# Cyberpunk Game Buildathon — Admin Operating Guide

For the expanded eleven-entry agenda, proposal reset and sponsor management,
follow [Event content administration](EVENT_CONTENT_ADMIN.md). The current admin
screens use saved database values rather than a fixed six-step schedule.

**Document Version:** 2.0 (Free Registration Pivot)  
**Audience:** Event Administrators & Organizers  
**Owner:** Rihaz (Admin Dashboard, Event Settings, & Event Governance)

---

## 1. Overview & Free Registration Model

The Buildathon operates under a **100% Free Registration model (LKR 0 entry fee)**:
- **Automatic Confirmation:** Newly registered teams are confirmed immediately upon registration (status: `approved`, `feeAmount: 0`).
- **Retired Payment Approvals:** Administrative payment verification, bank slip upload requirements, and manual approve/reject actions are retired.
- **Roster Lock Cutoff:** Team leaders can edit member rosters until the **Registration Closes** milestone is reached, after which rosters are frozen.

---

## 2. Authentication & Navigation

| Route | View | Description |
|---|---|---|
| `/admin/login` | Admin Sign In | Authenticates administrative accounts via secure HTTP-only session cookies. |
| `/admin` | Command Center Overview | Key metrics (Confirmed Squads, Gate States, Submissions count), recent squads, and quick controls. |
| `/admin/agenda` | Event Controls & Gates | Configure milestone dates (Asia/Colombo) and gate override modes (`auto`, `force_open`, `force_closed`). |
| `/admin/teams` | Squads Roster | Browse all registered teams, filter by status, search by name/leader/email, and inspect member rosters. |
| `/admin/submissions` | Submissions Gallery | Audit game projects, inspect GitHub repos, test live web builds, and preview gameplay videos. |
| `/admin/payments` | Retired Flow Notice | Legacy redirect notice confirming registration is free and payment review is retired. |

---

## 3. Event Controls & Gate Management (`/admin/agenda`)

The system enforces two independent functional gates: **Registration** and **Submissions**.

### Gate Modes
1. **`auto` (Default):** Gate opens and closes automatically based on milestone timestamps evaluated against current server time (`opensAt <= serverNow < closesAt`).
2. **`force_open`:** Overrides the schedule to keep the window open immediately (used for emergency extensions).
3. **`force_closed`:** Overrides the schedule to immediately close the window (used for early cutoffs).

### Milestone Chronology
Milestones are stored in UTC and displayed in local Sri Lanka time (**Asia/Colombo / UTC+05:30**). Updates must satisfy strict chronological order:
1. `Registration Opens` &lt;
2. `Registration Closes` (Roster Freeze Cutoff) &lt;
3. `Hackathon Starts` &lt;
4. `Submissions Open` &lt;
5. `Submissions Close` (Deadline) &lt;
6. `Results Announcement`

*Note: If an invalid milestone sequence is submitted, the server rejects the request with HTTP 400 `CHRONOLOGY_VIOLATION` with details.*

---

## 4. Squads & Team Management (`/admin/teams`)

- **Confirmed Squads Roster:** Lists all registered teams with leader contact details, registration timestamps, and member counts.
- **Filtering & Search:** Instant text search across squad names, leader names, and emails.
- **Squad Dossier Modal:** Click **"View Squad"** on any team to review full member rosters (names, emails, and designated roles).
- **Team Locking:** Teams cannot be modified by participants once the registration gate closes.

---

## 5. Game Submissions Gallery (`/admin/submissions`)

- **Live Project Audit:** Filter and search submitted games in real time.
- **Dual Presentation:** Toggle between visual **Cards (Grid)** and dense **Audit Table** layouts.
- **Submission Requirements:**
  - **Game Title & Pitch:** Brief description of gameplay and story.
  - **GitHub Repository URL:** Primary source code repository (mandatory, verified GitHub hostname).
  - **Playable Demo URL:** Web/WebGL playable build link (optional).
  - **Gameplay Video Walkthrough:** YouTube/Vimeo gameplay video (optional).
- **Detail Modal:** Open any game card to inspect full submission metadata, team details, and direct external action links.

---

## 6. Historical Data & Retired Endpoints

- Legacy payment slip files saved in `server/storage/slips/` are preserved for historical audit and can still be retrieved via `GET /api/admin/registrations/:id/slip` using admin credentials.
- The review endpoint `PATCH /api/admin/registrations/:id/review` returns HTTP 410 `PAYMENTS_RETIRED` as payments are no longer accepted or reviewed.

