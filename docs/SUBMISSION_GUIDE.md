# Game submission guide

Registration is free. New team registrations are confirmed automatically; no
payment or manual payment approval is needed.

## Save a game

1. Sign in at `/login` and open Game Submission from your team dashboard, or
   visit `/team/submission`.
2. Check that submissions are open in the live event agenda. The organizers can
   also open or close the submission gate directly.
3. Choose Create Your Game Submission and enter the title, description and
   GitHub repository URL, such as `https://github.com/your-team/your-game`.
   Playable game and video URLs are optional and can be left blank.
4. Save. Confirm that the saved game appears, then reload to verify it was saved
   on the server. Each team has one submission; saving edits updates that record.

## Edit or view a game

While submissions are open, choose Edit Submission, change the details and save.
Cancel discards unsaved form edits. When submissions close, the saved game stays
visible but cannot be created or edited. The backend enforces the deadline even
if a form was opened earlier. Use the live agenda rather than a copied deadline.

## If something fails

- If saved details cannot be loaded, choose Retry. A loading error does not mean
  your game is missing; avoid creating a replacement based on a failed request.
- Correct highlighted fields if saving fails. The GitHub hostname must be
  `github.com`, using HTTP or HTTPS with an owner and repository in the path.
- If registration needs attention, contact the organizers to check the saved
  record. No payment is required.
- Only your signed-in team's account can manage its game. Administrators can
  view submitted games through `/admin/submissions`.

## Supervisor walkthrough

Demonstrate a confirmed team saving and editing with both optional links blank,
reloading the record, and viewing it in the admin gallery. Close submissions and
verify that saving is rejected while the game remains readable. Simulate a
failed saved-game request, check the error and Retry, and verify another team
cannot read or edit the first team's record.
