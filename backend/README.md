# ZenHabits — Backend

Go + Gin + GORM API for ZenHabits, backed by PostgreSQL.

## Requirements

- Go 1.26+
- PostgreSQL 16+ running locally

## Setup

1. Create the database:

   ```bash
   createdb zenhabits-v2
   ```

2. Configure environment. `.env` is read automatically; see `.env.example`
   for the full list.

   ```dotenv
   PORT=8080
   DATABASE_URL=host=localhost port=5432 user=postgres password='' dbname=zenhabits-v2 sslmode=disable
   JWT_SECRET=change-me-32-bytes-minimum
   FRONTEND_URL=http://localhost:3000
   GIN_MODE=debug
   DB_LOG_LEVEL=warn
   ACCESS_TOKEN_TTL=15m
   REFRESH_TOKEN_TTL=720h
   COOKIE_SECURE=false
   RUN_MIGRATIONS=true
   ```

   > Keep the quotes around an empty `password=''`. An unquoted `password=`
   > makes the keyword DSN swallow the next key and silently connect to the
   > default `postgres` database.

3. Run:

   ```bash
   go run .
   # or, with live reload
   air
   ```

   Tables are created on boot via GORM `AutoMigrate` when `RUN_MIGRATIONS=true`.

## Commands

| Command | Purpose |
| --- | --- |
| `go run .` | Start the API on `:8080` (or `$PORT`) |
| `go run ./cmd/migrate` | Apply the schema without starting the server |
| `go build ./...` | Compile everything |
| `go vet ./...` | Static checks |
| `go test ./...` | Run unit tests |

## Deploying to Vercel

The backend uses Vercel's [Go framework preset](https://vercel.com/docs/functions/runtimes/go),
which runs a standard Gin/`net/http` server. `vercel.json` sets
`"framework": "go"` and the server already listens on `$PORT`.

1. **Create a Postgres database** with a managed provider (Vercel Postgres,
   Neon, Supabase, …) and copy its connection string. Use `sslmode=require`.
2. **Import the repo** into Vercel as a new project and set **Root Directory**
   to `backend`.
3. **Set environment variables** (Production and Preview):

   | Variable | Production value |
   | --- | --- |
   | `DATABASE_URL` | `postgres://user:pass@host/db?sslmode=require` |
   | `JWT_SECRET` | a long random string |
   | `FRONTEND_URL` | your frontend URL, e.g. `https://zenhabits.vercel.app` |
   | `GIN_MODE` | `release` |
   | `COOKIE_SECURE` | `true` |
   | `RUN_MIGRATIONS` | `false` |
   | `DB_MAX_OPEN_CONNS` | `5` |
   | `DB_LOG_LEVEL` | `error` |

4. **Run migrations once** from your machine against the production database:

   ```bash
   DATABASE_URL='postgres://…' go run ./cmd/migrate
   ```

5. Deploy. Note the project URL — the frontend needs it as `BACKEND_URL`.

**Preview deployments:** add the frontend preview URL to `FRONTEND_URL`, or use
a wildcard so every preview is accepted:

```dotenv
FRONTEND_URL=https://zenhabits.vercel.app,https://*.vercel.app
```

`FRONTEND_URL` is a comma-separated list; entries may be exact origins, `*`,
or host wildcards.

## Architecture

`Route → Controller → Service → Repository (GORM) → Database`

```
config/         Environment loading, DB connection, pool limits
controllers/    Gin handlers: parse request, call service, return JSON
middleware/     Auth (access cookie), CORS, origin check, request logger
models/         GORM entities
repositories/   Direct GORM queries per entity
routes/         Route registration grouped by feature
services/       Business logic, request DTOs, validation
utils/          JWT signing, password hashing, token hashing
cmd/migrate/    One-off schema migration command
main.go         Wiring and HTTP server
```

## Authentication

- Access token (15 min) and refresh token (30 days) are both `httpOnly`
  cookies. The refresh cookie is scoped to `/api/auth`.
- Refresh tokens are stored as SHA-256 hashes and rotated on every refresh;
  logout revokes the presented token.
- All routes except `POST /api/auth/register`, `POST /api/auth/login`, and
  `POST /api/auth/refresh` require a valid access cookie.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Rotate tokens |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/todos` | List / create tasks |
| PATCH/DELETE | `/api/todos/:id` | Edit / delete task |
| PATCH | `/api/todos/:id/toggle` | Toggle done |
| GET/POST | `/api/study-plans` | List / create study plans |
| PATCH/DELETE | `/api/study-plans/:id` | Edit / delete plan |
| PATCH | `/api/study-plans/:id/toggle` | Toggle done |
| POST | `/api/study-plans/:id/links` | Add reference link |
| DELETE | `/api/study-links/:id` | Remove reference link |
| GET/POST | `/api/reminders` | List (`?month=YYYY-MM`) / create |
| PATCH/DELETE | `/api/reminders/:id` | Edit / delete reminder |
| GET/POST | `/api/jobs` | List / create jobs |
| PATCH/DELETE | `/api/jobs/:id` | Edit / delete job |
| GET | `/api/work-sessions` | List sessions with durations |
| POST | `/api/work-sessions/start` | Start a session |
| PATCH | `/api/work-sessions/:id/stop` | Stop a session |
| DELETE | `/api/work-sessions/:id` | Delete a session |
| GET/POST | `/api/transactions` | List (`?month=`) / create |
| GET | `/api/transactions/summary` | Monthly totals (`?month=`) |
| PATCH/DELETE | `/api/transactions/:id` | Edit / delete transaction |
| GET/POST | `/api/wishlist` | List / create wishlist items |
| PATCH/DELETE | `/api/wishlist/:id` | Edit / delete item |

## Business rules

- **Todos** sort by priority (`urgent → normal → low`); completed tasks always
  sink to the bottom.
- **Study plans** hold one or more reference links and use the same reversible
  done toggle.
- **Work sessions** store start/end timestamps; duration is computed on read,
  never stored. Only one session may run at a time.
- **Transactions** store amounts as integer cents; the monthly summary returns
  income, expense, and balance.
