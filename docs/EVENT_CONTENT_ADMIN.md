# Agenda and sponsor administration

## Event agenda

Open `/admin/agenda`. Titles, descriptions, online/venue labels, public session
links, start/end times and publication flags are stored in MongoDB. All time
inputs are **Asia/Colombo**, even if the administrator's device is abroad.
The public timeline sorts entries chronologically. Up/Down controls entries at
the same time. Draft/hidden entries are excluded from the public API.

Registration Opens, Registration Closes, Round 1 Begins, Round 1 Deadline and
Finale are required entries linked to the existing milestone fields. They cannot
be deleted or relinked. Their start date has one source: `settings.milestones`.
Editing the agenda updates the gate dates; legacy milestone edits update the
resolved agenda. Hiding an entry does not disable the gate. Submission saving
opens at a separately editable time; it is not a milestone printed in the PDF.
Force Open and Force Closed remain independent overrides of the saved schedule.

New databases start with the eleven roadmap entries on proposal pages 12–13:

| Entry | Sri Lanka time in 2026 |
| --- | --- |
| Awareness I | Nov 12, 7 PM |
| Registration opens | Nov 13, noon |
| Awareness II | Nov 14, 7 PM |
| Registration closes | Nov 27, noon |
| Workshop | Nov 28, 7 AM |
| Topic release and Round 1 | Nov 29, noon |
| Round 1 deadline | Dec 10, 12 AM |
| Top 6 and Round 2 | Dec 13, 6 PM |
| Tech talk I | Dec 14, 7 PM |
| Tech talk II | Dec 15, noon |
| Finale and Expo | Dec 17, 9 AM–5 PM |

The PDF's midnight is implemented literally as the **start of December 10**
(Dec 9 at 18:30 UTC). Verify this and the 7 AM workshop before launch.
Submission opening defaults to topic release as an operational assumption.
The 11:30 AM creator/VIP arrival on page 14 is a separate finale activity, not
the event opening. Add it as an agenda entry if it should be public.

Existing settings retain their admin-edited dates and overrides. The first
settings read adds the extra agenda metadata if absent, without resetting dates.
The existing finale gets an eight-hour duration. **Load proposal schedule** only
changes the form after confirmation. Review it, then Save agenda to update the
database. Gate override modes and sponsors are kept. It does not run on deploy.

The hero date range, deadline-dependent guidelines/FAQ, and countdown resolve
dates from the backend. A multi-hour event remains in progress until its end.
The shared settings store refreshes after saving, on focus/visibility return,
at agenda boundaries and at least once per minute. No restart or redeploy is
needed to publish content changes.

## Sponsors

Open `/admin/sponsors`. Add the company name, partnership category, public logo
URL and optional company website. Supported suggestions include Title, Gold,
Silver, Bronze, Banner and value-exchange categories; custom categories work too.
New entries are unpublished. Check Published and Save sponsors when confirmed.
You can reorder, hide or remove entries, then save the list.

Logos must be hosted on durable storage or an approved sponsor asset URL. This
version accepts URLs; it does not upload images, require a Blob token or store
files on Vercel's temporary disk. Only HTTP/HTTPS URLs without credentials are
accepted. Supply logos intended for public use.

The initial sponsor list is empty. If no sponsor is published, the section,
its divider and all header/mobile/footer links are hidden. Partnership tiers in
the proposal are opportunities, not signed sponsors. No placeholder company is
published automatically.

## API

- `GET /api/public/settings` adds `agenda`, published `sponsors`, `event` and
  configured `teamSize`. Existing milestone/gate fields remain unchanged.
- `GET /api/admin/settings` returns all drafts and `proposalDefaults` as well.
- `PATCH /api/admin/settings` accepts `agenda`, `submissionOpensAt`, `event`,
  `sponsors` and gate modes. Sponsor edits do not change agenda dates. Legacy
  `milestones` updates remain accepted, but do not send them alongside `agenda`.
- All admin endpoints retain authentication and admin-role protection. Invalid
  URLs, duplicate IDs, missing required entries, reversed windows and invalid
  event durations are rejected before persistence.

Backend verification: `node server/tests/event-content.test.js` (database calls
stubbed; never modifies event data).
