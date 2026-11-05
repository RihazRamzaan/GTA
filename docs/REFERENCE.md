# Shared reference sheet

Day 1 reference for the names everyone builds against. **Status: draft, waiting for supervisor approval.** Do not rename anything here without asking the supervisor.

The Mongoose models in `server/src/models/` and `docs/API_CONTRACTS.md` follow this sheet. Items marked *(needs ruling)* use the default shown until the supervisor decides.

## Collections

There are five collections and no others.

| Model | Fields | Rules |
|---|---|---|
| User | `email`, `passwordHash`, `role` (`team` or `admin`), `teamId` | Unique email, stored lowercase. One seeded admin, no public admin signup. `passwordHash` is never returned. |
| Team | `name`, `leaderName`, `leaderEmail`, `members[]` (`name`, `email`) | Unique `name` and unique `leaderEmail`. *(needs ruling: member fields; the architecture document lists `fullName`, optional `email`, `studentId`)* |
| Registration | `teamId`, `status`, `feeAmount`, `payment` (`reference`, `date`, `slipKey`, `slipMime`, `submittedAt`, `reviewedBy`, `reviewedAt`, `rejectionReason`) | One per team. `slipKey` is never exposed publicly. |
| EventSettings | `_id: "current"`, `milestones` (`registrationOpensAt`, `registrationClosesAt`, `buildingStartsAt`, `submissionOpensAt`, `submissionClosesAt`, `resultsAt`), `registrationMode`, `submissionMode` | One document only. Dates are stored in UTC and shown in Asia/Colombo. |
| Submission | `teamId`, `title`, `description`, `repoUrl`, `playableUrl`, `videoUrl`, `submittedAt` | One per team. `playableUrl` and `videoUrl` are optional. |

## Statuses and modes

**Registration status:** `waiting_for_slip` → `waiting_for_approval` → `approved` or `rejected`. A rejected team returns to `waiting_for_approval` by uploading a new slip. *(The SRS and architecture document call the first two `pending_payment` and `pending_review`; this sheet replaces those names.)*

**Window mode:** `auto`, `force_open` or `force_closed`, set separately for registration and submission.

**Is a window open?** `force_open` is always open and `force_closed` is always closed. `auto` is open when `opensAt <= serverNow < closesAt`. If the dates are missing, the window is closed. On first use, `EventSettings.getOrCreateSingleton` creates the settings with the default dates in the model.

Use the one shared helper for this check, so that every route gives the same answer:

```js
import { getEffectiveGates } from '../services/gates.js';

const { registrationOpen, submissionOpen } = getEffectiveGates(settings, new Date());
```

## Pages

| Route | Owner | Access |
|---|---|---|
| `/` | Yuwandhi | Public |
| `/register`, `/login` | Akindu | Public |
| `/team`, `/team/payment` | Thanish | Team |
| `/team/submission` | Tharushi | Team |
| `/admin/login` | Rihaz | Public |
| `/admin`, `/admin/agenda`, `/admin/payments`, `/admin/submissions` | Rihaz | Admin |

## API

The routes, request fields and owners are listed in `docs/API_CONTRACTS.md`.

Every response uses `{ "success": true, "data": {} }` or `{ "success": false, "error": { "code": "", "message": "" } }`. Validation errors may also include `error.fields`, which maps a form field to its message.

| Status | Meaning |
|---|---|
| 400 | Validation failed |
| 401 | Not signed in |
| 403 | Wrong account, or the window is closed |
| 404 | Not found |
| 409 | Duplicate or conflict |
| 413 | File too large |
| 429 | Too many attempts |
| 500 | Server error |

## Example team data

`GET /api/auth/me` for a signed-in team leader:

```json
{
  "success": true,
  "data": {
    "user": { "id": "665f1c0a2b3c4d5e6f708192", "email": "leader@example.com", "role": "team", "teamId": "665f1c0a2b3c4d5e6f708193" },
    "team": {
      "id": "665f1c0a2b3c4d5e6f708193",
      "name": "Neon Runners",
      "leaderName": "Example Leader",
      "leaderEmail": "leader@example.com",
      "members": [
        { "name": "Example Leader", "email": "leader@example.com" },
        { "name": "Example Member", "email": "member@example.com" }
      ]
    },
    "registration": { "id": "665f1c0a2b3c4d5e6f708194", "status": "waiting_for_slip", "feeAmount": 0, "payment": {} }
  }
}
```

## Using the signed-in account on the server

`requireAuth` loads the account into `req.user`, so read the role and team from there. Never accept `role`, `teamId`, payment status or window status from the request body.

```js
router.use(requireAuth, requireTeam, loadRegistration); // team routes: use req.user.teamId and req.registration.status
router.use(requireAuth, requireAdmin); // admin routes
```

Create errors with `httpError` and let the error handler send the response:

```js
import { httpError } from '../middleware/error.js';

throw httpError(403, 'SUBMISSION_CLOSED', 'Submissions are closed.');
```

## Open decisions for the supervisor

- Team size, currently set by `TEAM_MIN_SIZE` and `TEAM_MAX_SIZE`.
- Registration fee, currently set by `REGISTRATION_FEE`.
- Member fields.
- Whether an admin Teams page is needed. The SRS has none, although Day 1 lists one.
- Hosting, because the session cookie only works if the client and API share a site.
- Who owns the FR-10 backup checklist.
