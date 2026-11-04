# Buildathon Website

Starter monorepo for a single-event Buildathon website. This repository is the foundation for the junior developer team: it contains the runtime setup, shared models, route contracts, and placeholders, but intentionally does not contain the event's application features.

## Technology

- React, Vite, React Router, Tailwind CSS, Axios, and Context API
- Node.js, Express, Mongoose, MongoDB, dotenv, CORS, Helmet, cookie-parser, and express-session
- npm workspaces

## Structure

`client/` contains the React application. Put public pages in `client/src/pages/`, shared UI in `client/src/components/`, HTTP modules in `client/src/api/`, and auth state in `client/src/context/`.

`server/` contains the Express application. Put route declarations in `server/src/routes/`, feature code in the matching controllers/services, and schema definitions in `server/src/models/`.

`docs/` contains the architecture, database, API, contribution, and branch guidance.

## Setup

From the repository root:

```bash
npm install
copy client\.env.example client\.env
copy server\.env.example server\.env
```

On macOS/Linux, use `cp` instead of `copy`. Edit `server/.env` with a local MongoDB URI and a long local session secret. Do not put secrets in `client/.env`; Vite variables are exposed to the browser.

## Run

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5000`. You can also run them separately with `npm run dev:client` and `npm run dev:server`. The production frontend build is `npm run build`; the normal API process is `npm run start:server`.

Check `GET http://localhost:5000/api/health` for the server health response.

## Admin account

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then run the command below once. It never changes an existing admin. Remove `ADMIN_PASSWORD` from the file afterwards.

```bash
npm run seed:admin --workspace server
```

## Unfinished work

Login, sessions, route protection, and team registration are implemented. Registration stays closed until the `EventSettings` document exists and its window is open.

Team dashboards, payment uploads/review, agenda management, admin controls, and game submissions are still placeholders. Implement them only on the assigned branches and keep the API contracts in `docs/API_CONTRACTS.md` synchronized. Shared names are listed in `docs/REFERENCE.md`.

See `docs/CONTRIBUTING.md` for ownership and `docs/BRANCHING.md` for the branch workflow.
