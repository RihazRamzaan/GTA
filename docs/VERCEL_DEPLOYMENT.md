# Deploy the frontend and API in one Vercel project

Import the repository with Root Directory set to the repository root, not
`client` or `server`. Use the Other framework preset. The root `vercel.json`
builds the client with `npm run build` and serves `client/dist`.

API requests under `/api` go to `api/handler.js`, which initializes MongoDB
before passing the original request to Express. Static files are served next.
Other paths return `index.html` so React Router can handle direct visits and
refreshes on `/team`, `/register`, and `/admin` pages.

Set the following in the Vercel project's environment variable settings:

```dotenv
VITE_API_URL=/api
VITE_USE_SAMPLE_SETTINGS=false
NODE_ENV=production
MONGODB_URI=REPLACE_WITH_PRODUCTION_MONGODB_URI
SESSION_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
CLIENT_ORIGIN=https://YOUR_PROJECT.vercel.app
REGISTRATION_FEE=0
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

This configuration does not implement the free-registration business changes.
Setting the fee to zero alone does not remove approval requirements. The current
disk-based slip storage is also not durable serverless storage; retire payment
uploads as planned before using this deployment for the free event.
