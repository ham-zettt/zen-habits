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
cmd/migrate/    Schema + legacy-data migration command
cmd/drop-legacy/ Drop the old Todo/Study/Job tables
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
| GET/POST | `/api/modules` | List / create modules |
| GET/PUT/DELETE | `/api/modules/:id` | Get / update / delete a module |
| GET/POST | `/api/modules/:id/items` | List / create items |
| PUT/DELETE | `/api/modules/:id/items/:itemId` | Edit / delete an item |
| PATCH | `/api/modules/:id/items/:itemId/done` | Toggle item done |
| GET/POST | `/api/reminders` | List (`?month=YYYY-MM`) / create |
| PATCH/DELETE | `/api/reminders/:id` | Edit / delete reminder |
| GET | `/api/work-sessions` | List sessions with durations |
| POST | `/api/work-sessions/start` | Start a session |
| PATCH | `/api/work-sessions/:id/stop` | Stop a session |
| DELETE | `/api/work-sessions/:id` | Delete a session |
| GET/POST | `/api/transactions` | List (`?month=`) / create |
| GET | `/api/transactions/summary` | Monthly totals (`?month=`) |
| PATCH/DELETE | `/api/transactions/:id` | Edit / delete transaction |
| GET/POST | `/api/wishlist` | List / create wishlist items |
| PATCH/DELETE | `/api/wishlist/:id` | Edit / delete item |

## Custom modules

A module is a user-defined list with a title, a description, and an ordered set
of field definitions. Every item has a title, a done flag, and values keyed by
field id.

- **Field types:** `text`, `dropdown`, `subtask`, `date`, `link`.
- **Storage:** module field options and item values are JSONB (`datatypes.JSON`).
  A subtask value is an array of `{ id, text, done }`. Dates are `YYYY-MM-DD`.
- **Sorting:** done items always sink to the bottom. Otherwise items sort by the
  option order of the module's first dropdown field, then newest first.
- **Validation** lives in the service layer: field labels and types, dropdown
  options, and item values are checked against the field definitions.
- **Field updates:** a field's type is immutable. Removing a field also removes
  its stored values from every item. Unknown field ids in item values are
  ignored.
- **Authorization:** every query is scoped to the authenticated user; a missing
  or foreign resource returns 404.

Three starter modules (Todo List, Study Plan, Job Tracker) are seeded for every
new user on registration.

## Migrating old Todo/Study/Job data

`cmd/migrate` creates the schema, seeds starter modules for existing users, and
converts old `todos` / `study_plans` (+ `study_links`) / `jobs` rows into module
items. It is idempotent (guarded by a `schema_migrations` row) and leaves the old
tables in place.

```bash
go run ./cmd/migrate       # schema + seed + data migration
go run ./cmd/drop-legacy   # drop old tables once the result is verified
```

## Business rules

- **Modules** sort done items to the bottom and otherwise order by the first
  dropdown field's option order, then newest first.
- **Work sessions** store start/end timestamps; duration is computed on read,
  never stored. Only one session may run at a time.
- **Transactions** store amounts as integer cents; the monthly summary returns
  income, expense, and balance.
