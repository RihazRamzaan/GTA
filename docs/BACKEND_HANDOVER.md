# Backend handover

Registration is free for this event. A new team is confirmed as soon as it registers, payment uploads and reviews are switched off on the server, and a one-time migration confirms teams from the paid version. Owner: Akindu.

## Collections

There are five MongoDB collections.

| Collection | Holds | Rules |
|---|---|---|
| `users` | Team leader logins and the single admin (`role`: `team` or `admin`) | Unique email. The admin is created only with `npm run seed:admin --workspace server`. |
| `teams` | Team name, leader and members | Unique team name and leader email. The leader is always the first member. |
| `registrations` | One per team: `status`, `feeAmount`, old `payment` details | Payment details and slips from the paid version are kept, never deleted. |
| `eventsettings` | One document, `_id: "current"`: dates and open/closed modes | Created with the default dates in `server/src/models/EventSettings.js` if missing. |
| `submissions` | One game per team | Owned by Tharushi's submission routes. |

## Registration status

| Status | Meaning now |
|---|---|
| `approved` | **Registration confirmed.** Every new team gets this, with `feeAmount` 0. Show it as "Registration confirmed" or "Registered". |
| `waiting_for_slip`, `waiting_for_approval`, `rejected` | Only on records from the paid version. The migration below moves them to `approved`. |

No status or API field was renamed. `registration.status` is still in `GET /api/auth/me` and `GET /api/team/me`.

## Rules the server enforces

- **Registration window:** `POST /api/auth/register` only works while registration is open, using the admin's mode and dates (`server/src/services/gates.js`). Existing teams can still sign in after it closes.
- **Roster cutoff:** leaders can change team and member details while registration is open. After it closes, `PATCH /api/team/me` returns 403 `TEAM_LOCKED`. `GET /api/team/me` includes `canEditTeam` for the dashboard. Being confirmed no longer locks editing.
- **Team ownership:** team routes only use the signed-in account's team, so a team cannot read or change another team.
- **Admin only:** every `/api/admin/*` route needs the admin account; every `/api/team/*` route needs a team account.
- **Payments retired:** `POST /api/team/payment` and `PATCH /api/admin/registrations/:id/review` return 410 `PAYMENTS_RETIRED` before doing anything, so no file is accepted. Old slips can still be viewed through the existing slip routes.
- **Submissions:** a team must be confirmed (`approved`) and the submission window must be open. These checks are in Tharushi's `submission.controller.js`.

## Configuration

| Variable | Use |
|---|---|
| `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_ORIGIN` | Required in production; the server refuses to start without them. |
| `TEAM_MIN_SIZE`, `TEAM_MAX_SIZE` | Team size including the leader. Default 2 to 4, still to be confirmed. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only while seeding the admin. Remove the password afterwards. |

There is no fee setting. `REGISTRATION_FEE` was removed and is ignored if still set.

## One-time migration

Run from the `server` folder with `MONGODB_URI` pointing at the event database. Nothing changes without `--apply`.

1. **Back up first.** Take a database snapshot (for example an Atlas backup or `mongodump`). The script also saves its own backup.
2. **Preview:** `npm run migrate:free-registration`. It prints the counts by status, the records that would become `approved` with `feeAmount` 0, and the exceptions it will not touch.
3. **Agree the scope** with the supervisor using that preview.
4. **Apply:** `npm run migrate:free-registration -- --apply`. Add `--include-rejected` only if the supervisor agrees that rejected teams should be confirmed; the preview shows each rejection reason.
5. **Give the supervisor the printed summary.** It lists what changed, what was skipped and the backup file.

**What it changes:** only `status` and `feeAmount` on `waiting_for_slip` and `waiting_for_approval` records, plus `rejected` with `--include-rejected`. Payment details and slip files are never changed, and no refunds are issued.

**What it leaves for inspection:** registrations whose team is missing, teams with no login account or no registration, and unknown statuses. Teams already `approved` keep their recorded fee.

**Backup:** before the first write, the script saves the whole `registrations` collection and the list of changed records to `server/backups/` (ignored by git).

**Rollback:** `npm run migrate:free-registration -- --rollback <backup file>` previews, and adding `--apply` restores the old status and fee. Only records still in their migrated state are restored, so later changes are never overwritten, and a backup from another database is refused.

## Demonstration checklist

| Check | Expected |
|---|---|
| Admin login | `/admin/login` opens the admin dashboard, or the admin page that was asked for |
| Team login | `/login` opens `/team`, or the team page that was asked for |
| Free registration | New team gets `approved`, `feeAmount` 0, and lands on its real dashboard |
| Roster cutoff | Members can be edited while registration is open; 403 `TEAM_LOCKED` after it closes |
| Closed registration | New registration gets 403; existing teams can still sign in |
| Team ownership | A team sees only its own data; team accounts get 403 on admin routes |
| Retired payments | Upload and review return 410 and change nothing |
| Migrated team | Preview, apply and rollback give the counts shown in the summary |

## Remaining limitations

- **Old slips on Vercel:** slips are stored on the server's local disk, which Vercel does not keep. They remain on the machine that received them, and are not available after deploying to Vercel.
- **Rate limits:** login and registration limits are kept in memory, so each server instance counts separately.
- **Default dates:** a new database opens registration on the placeholder dates in `EventSettings.js` until the admin saves real ones.
- **Unconfirmed values:** team size and member fields are still placeholders awaiting supervisor confirmation.
- **Payment code kept:** the payment upload and review code is still in the codebase, unreachable behind the retired routes, with its tests. It can be deleted after the event.
- **No password reset:** a forgotten password needs the supervisor's manual recovery process.
