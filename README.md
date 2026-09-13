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

## Repository layout

```
backend/    Go API
frontend/   Next.js app
```
