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

2. Configure environment. `.env` is read automatically:

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

   Tables are created on boot via GORM `AutoMigrate`.

## Commands

| Command | Purpose |
| --- | --- |
| `go run .` | Start the API on `:8080` |
| `go build ./...` | Compile everything |
| `go vet ./...` | Static checks |
| `go test ./...` | Run unit tests |

## Architecture

`Route → Controller → Service → Repository (GORM) → Database`

```
config/         Environment loading, DB connection
controllers/    Gin handlers: parse request, call service, return JSON
middleware/     Auth (access cookie), CORS, origin check, request logger
models/         GORM entities
repositories/   (reserved for direct query helpers)
routes/         Route registration grouped by feature
services/       Business logic, request DTOs, validation
utils/          JWT signing, password hashing, token hashing
main.go         Wiring
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
