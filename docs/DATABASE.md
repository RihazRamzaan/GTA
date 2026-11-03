# Database

The application uses MongoDB through Mongoose. Models live in `server/src/models/`.

- **User**: unique email, password hash, `team`/`admin` role, and optional team reference.
- **Team**: unique team name, unique leader email, and embedded member contact objects.
- **Registration**: one registration per team, status, fee amount, and embedded payment/review metadata.
- **EventSettings**: singleton document with `_id: current`, milestone dates under `milestones`, and independent registration/submission modes (`auto`, `force_open`, `force_closed`).
- **Submission**: one submission per team with project links and submission time.

Indexes and uniqueness are declared in the model definitions. Business rules, gate evaluation, mutation workflows, and file storage are intentionally not implemented here.
