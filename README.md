# ZenHabits

A personal daily-habit web app: todos, study plans, calendar reminders, job
applications, a work timer, and an expense tracker with a wishlist.

- **Backend:** Go + Gin + GORM + PostgreSQL — see [`backend/README.md`](backend/README.md)
- **Frontend:** Next.js (App Router) + Tailwind v4 — see [`frontend/README.md`](frontend/README.md)

## Quick start

```bash
# 1. Database
createdb zenhabits-v2

# 2. Backend (terminal 1)
cd backend && go run .

# 3. Frontend (terminal 2)
cd frontend && npm install && npm run dev
```

Then open http://localhost:3000, create an account, and start tracking.

## Deploying to Vercel

Deploy as **two Vercel projects** from this repo:

| Project | Root Directory | Key settings |
| --- | --- | --- |
| Frontend | `frontend` | `BACKEND_URL` = deployed backend URL |
| Backend | `backend` | Go preset; `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `GIN_MODE=release`, `COOKIE_SECURE=true`, `RUN_MIGRATIONS=false` |

The frontend proxies `/api/*` to the backend, so the browser stays same-origin
and the auth cookies remain first-party. Full steps:
[`backend/README.md`](backend/README.md#deploying-to-vercel) ·
[`frontend/README.md`](frontend/README.md#deploying-to-vercel).

## Repository layout

```
backend/    Go API
frontend/   Next.js app
```
