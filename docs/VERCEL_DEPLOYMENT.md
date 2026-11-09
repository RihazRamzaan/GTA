# Deploy the frontend and API in one Vercel project

Import the repository with Root Directory set to the repository root, not
`client` or `server`. The root `vercel.json` defines two Vercel Services in one
project: a Vite client rooted at `client` and an Express server rooted at `server`.
Build and output settings belong to each service; remove dashboard overrides
left over from the previous single-build setup.

API requests at `/api` and under `/api/` go to the server service with their
original paths preserved. Its explicit entrypoint is `src/server.js`, which
connects to MongoDB before starting Express. All other requests go to the client
service. That service serves existing static files first and then falls back to
`index.html` so React Router can handle direct visits and refreshes on `/team`,
`/register`, and `/admin` pages. There is no separate root API function.

Both services share the project's environment variables and public domain.
Vercel Services is currently beta. Configuration references:
https://vercel.com/docs/services
https://vercel.com/docs/services/routing

Set the following in the Vercel project's environment variable settings:
Use the root `.env.example` as the combined import template. Replace its
placeholders before importing; never commit the populated file.

```dotenv
VITE_API_URL=/api
VITE_USE_SAMPLE_SETTINGS=false
NODE_ENV=production
MONGODB_URI=REPLACE_WITH_PRODUCTION_MONGODB_URI
SESSION_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
CLIENT_ORIGIN=https://YOUR_PROJECT.vercel.app
TEAM_MIN_SIZE=2
TEAM_MAX_SIZE=4
```

Replace the placeholders. CLIENT_ORIGIN must exactly match the browser origin,
without a trailing slash. Use separate database values for preview deployments;
their browser origin must also be configured if testing authenticated writes.
Do not commit actual credentials. Do not set PORT on Vercel. Redeploy after
changing environment variables; Vite embeds its public values at build time.

After deployment, visit `/api/health` and confirm a JSON response, refresh a
frontend route directly, and verify login, registration, and an authenticated
team API call. An unknown `/api` path must return an API error rather than HTML.

Registration is free: new teams are confirmed straight away, there is no fee
setting, and payment uploads and reviews return `410 PAYMENTS_RETIRED`. Old slips
are kept on local disk, which is not durable serverless storage, so they will not
be available on Vercel. Before deploying, run the one-time migration in
`docs/BACKEND_HANDOVER.md` against the production database.
