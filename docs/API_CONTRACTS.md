# API contracts

All JSON responses use `{ "success": true, "data": {} }`. Errors use `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable error" } }`. Session-authenticated requests send the HTTP-only session cookie. IDs are MongoDB IDs and dates are ISO-8601 strings.

| Method and path | Request fields | Expected data | Auth | Owner |
|---|---|---|---|---|
| GET `/api/public/settings` | None | Event settings, milestones, and effective public modes | Public | Rihaz (Yuwandhi consumes) |
| POST `/api/auth/register` | `email`, `password`, `team` (`name`, `leaderName`, `members`) | `user`, `team`, `registration` (`approved`, `feeAmount` 0); signs the leader in | Public, while registration is open | Akindu |
| POST `/api/auth/login` | `email`, `password` | `user` | Public | Akindu |
| POST `/api/auth/logout` | None | `data: { loggedOut: true }` | Session | Akindu |
| GET `/api/auth/me` | None | `user`, `team`, `registration` | Session | Akindu |
| GET `/api/team/me` | None | `team`, `registration`, `submission` summary or null, `canEditTeam` | Team session | Akindu |
| PATCH `/api/team/me` | Optional `teamName`, `leaderName`, `members` | `team`; 403 `TEAM_LOCKED` after registration closes | Team session | Akindu |
| POST `/api/team/payment` | Retired | 410 `PAYMENTS_RETIRED` | Team session | Thanish |
| GET `/api/team/payment/slip` | None | The team's old slip file, if any | Team session | Thanish |
| GET `/api/team/submission` | None | Submission or null | Team session | Tharushi |
| PUT `/api/team/submission` | `title`, `description`, `repoUrl`, `playableUrl`, `videoUrl` | Saved submission | Team session | Tharushi |
| GET `/api/admin/summary` | None | Counts and event summary | Admin session | Rihaz |
| GET `/api/admin/registrations` | Optional status/filter query | Registration list with team details | Admin session | Rihaz |
| PATCH `/api/admin/registrations/:id/review` | Retired | 410 `PAYMENTS_RETIRED` | Admin session | Rihaz |
| GET `/api/admin/registrations/:id/slip` | None | The team's old slip file, if any | Admin session | Rihaz |
| GET `/api/admin/settings` | None | Current EventSettings | Admin session | Rihaz |
| PATCH `/api/admin/settings` | `milestones`, `registrationMode`, `submissionMode` | Updated EventSettings | Admin session | Rihaz |
| GET `/api/admin/submissions` | Optional query filters | Submission list with team details | Admin session | Rihaz |

The listed request fields map to the five Mongoose models. Exact validation and error codes should be added by the responsible developer without changing the response envelope. Until implemented, route placeholders return `501 NOT_IMPLEMENTED`.

Validation errors may add `error.fields`, which maps a form field to its message. Registration uses `email`, `password`, `teamName`, `leaderName` and `members`.

On registration, the server sets `leaderEmail` from `email` and always counts the leader as a member, so `team.members` only needs the other members. Team size is limited by `TEAM_MIN_SIZE` and `TEAM_MAX_SIZE`.

On `PATCH /api/team/me`, `members` replaces the whole list and the same leader and size rules apply. The leader's email is the login email, so it can't be changed here. Teams can edit while registration is open, using the same open/closed rule as `POST /api/auth/register`; `canEditTeam` on `GET /api/team/me` gives the current answer.

Registration is free for this event. Payment uploads and reviews are switched off on the server; old payment details and slips are kept and can still be viewed.

All `/api/team/*` routes need a team session and all `/api/admin/*` routes need an admin session: 401 when signed out, 403 for the wrong account type.

## Editable event content

The public settings response now includes `agenda`, `sponsors`, `event` (name and
venue), and configured `teamSize` (min/max). Only published agenda entries and
sponsors are public. Each agenda entry contains a stable `id`, `title`,
`description`, `startsAt`, optional `endsAt`, `location`, `url`, `order` and
optional `milestoneKey`. Public settings use `Cache-Control: no-store`.

Admin settings include all drafts and `proposalDefaults` for an explicit reset
preview. PATCH additionally accepts `agenda` (whole list), `submissionOpensAt`,
`event` and `sponsors` (whole list). Sponsor fields are `id`, `name`, `category`,
`logoUrl`, optional `websiteUrl` and `published`; ordering follows the submitted
array. URLs are HTTP/HTTPS without embedded credentials. Lists and text have
bounded lengths. An empty sponsor list is valid and hides the public section.

Required agenda IDs map to existing gate milestones. Resolved dates come from
the milestone fields, so legacy PATCH `milestones` and new PATCH `agenda` stay
consistent. Do not send `milestones` and `agenda` in the same request. Core
entries cannot be deleted or relinked; hiding them does not bypass gate rules.
Invalid content returns 400 `INVALID_CONTENT`; inverted gate dates return 400
`CHRONOLOGY_VIOLATION`. See [Event content administration](EVENT_CONTENT_ADMIN.md).
