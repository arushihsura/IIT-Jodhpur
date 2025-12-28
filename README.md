# CrisisNet — MERN Incident Reporting & Response

A full-stack MERN application to report, visualize, and manage emergency incidents with role-based access (citizen, responder, admin). The frontend (React + TypeScript + Vite + Tailwind) consumes a Node/Express API backed by MongoDB.

## Features
- Role-based auth (citizen, responder, admin) with JWT
- Report incidents with type, location, severity, and description
- Live incident feed and detail view with map preview
- Responder dashboard for triage and status updates
- Admin user management (list, update role, delete)
- Mock incidents fallback in the UI if API is unavailable
- MongoDB seeding script for sample data

## Project Structure
```
backend/
  models/
    Incident.js
    User.js
  routes/
    auth.js
    incidents.js
    admin.js
  scripts/
    seedIncidents.js
  package.json
  server.js
frontend/
  public/
    _redirects
    logo.png
  src/
    App.tsx
    main.tsx
    index.css
    types.ts
    components/
    context/
    lib/
      api.ts
      mockIncidents.ts
    pages/
    utils/
  package.json
```

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (Mongoose ODM)
- Auth: JWT (jsonwebtokens) + bcryptjs

## Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)

## Local Setup
1) Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2) Configure environment variables
- Backend (create `backend/.env`):
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret
PORT=5001
```
- Frontend (already present):
```
VITE_API_URL=http://localhost:5001/api
```

3) Seed mock incidents into MongoDB (optional but recommended)
```bash
cd backend
npm run seed:incidents
```

4) Run the app (two terminals)
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend will start on a free port (e.g., http://localhost:5173 or 5174). Backend runs on http://localhost:5001.

## API Overview
Base URL: `/api`

- Auth
  - `POST /auth/register` — body: `{ email, password, name, role }`
  - `POST /auth/login` — body: `{ email, password }`
- Incidents
  - `GET /incidents`
  - `GET /incidents/:id`
  - `POST /incidents`
  - `PATCH /incidents/:id`
  - `DELETE /incidents/:id`
- Admin
  - `GET /admin/users`
  - `PATCH /admin/users/:userId/role` — body: `{ role }`
  - `DELETE /admin/users/:userId`

See implementations in: `backend/routes/auth.js`, `backend/routes/incidents.js`, `backend/routes/admin.js`.

## Frontend Notes
- Routes (React Router): `/`, `/login`, `/incidents`, `/incidents/:id`, `/report`, `/responder`, `/admin`
- API client: `frontend/src/lib/api.ts`
- Mock fallback: If incidents fetch fails, UI falls back to `getMockIncidents()` from `frontend/src/lib/mockIncidents.ts`.
- Map: simplified OpenStreetMap-based preview in `SimpleMap` (no external SDK required).

## Deployment (Render)
- Backend (Web Service)
  - Environment: Node
  - Build Command: `npm install`
  - Start Command: `node server.js` (or `npm run start` if added)
  - Environment Variables: `MONGODB_URI`, `JWT_SECRET` (required). Render sets `PORT` automatically; the server already reads it.
  - MongoDB Atlas: Ensure Render’s outbound IPs are allowed or use `0.0.0.0/0` during development under Atlas → Network Access.

- Frontend (Static Site)
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
  - Environment Variables: `VITE_API_URL=https://<your-backend>.onrender.com/api`
  - SPA routing: The file `frontend/public/_redirects` contains `/* /index.html 200` to fix deep-link 404s (e.g., `/login`).

## Troubleshooting
- 500 on `/api/auth/login` or `/api/*`
  - Check `MONGODB_URI` and Atlas Network Access (IP allow list)
  - Ensure `JWT_SECRET` is set on the server
  - View logs on Render dashboard for the backend service

- 404 when navigating directly to `/login` (Render)
  - Confirm `frontend/public/_redirects` exists and the site is rebuilt and redeployed

- Port already in use (`EADDRINUSE: 5001`)
  - Stop the existing process using 5001 or change `PORT` in `backend/.env`

- TypeScript errors during `npm run dev` (frontend)
  - Some components reference Google Maps (`window.google`) which aren’t used anymore. Remove or guard those references.
  - Ensure UI components accept the props you pass (e.g., `Badge`/`Card` props).

## Useful Scripts
- Backend
  - `npm run dev` — start API with nodemon
  - `npm run seed:incidents` — seed mock incidents
- Frontend
  - `npm run dev` — start Vite dev server
  - `npm run build` — build for production
  - `npm run preview` — preview production build locally

## Security
- Keep `JWT_SECRET` private and strong
- Restrict MongoDB Atlas access in production (avoid `0.0.0.0/0`)

## License
This project is provided as-is for educational/demo purposes. Add your preferred license if needed.
