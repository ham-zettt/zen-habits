# ZenHabits — Frontend

## Requirements

- Node.js 20+
- The Go backend running on `http://localhost:8080`

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The frontend never calls the backend origin directly. `next.config.ts`
rewrites `/api/:path*` to `BACKEND_URL` (default `http://localhost:8080`), so
the browser stays same-origin and the `httpOnly` auth cookies work without
cross-site configuration. Override with `BACKEND_URL` in `.env.local`.

## Commands

| Command            | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Development server                           |
| `npm run build`    | Production build                             |
| `npm run start`    | Serve the production build                   |
| `npm run lint`     | ESLint                                       |
| `npm run test:e2e` | Playwright smoke tests (starts both servers) |

## Structure

```
app/
  page.tsx              Public landing page
  (auth)/login          Sign in
  (auth)/register       Create account
  app/                  Authenticated shell (sidebar + mobile drawer)
    page.tsx            Overview
    todos/ study/ calendar/ jobs/ timer/ expenses/
components/
  ui/                   Button, Input, Card, Modal, badges, states…
  app-shell.tsx         Navigation shell
  finance/              Wishlist panel
  landing/              Marketing preview panel
context/auth.tsx        Session state (loads /api/auth/me)
lib/
  api.ts                fetch wrapper with silent refresh-on-401
  use-api.ts            GET + reload hook
  date.ts / format.ts   Formatting helpers
proxy.ts                Optimistic route guard (cookie presence only)
```

## Auth model

Tokens live in `httpOnly` cookies and are never readable from JavaScript.
`AuthProvider` calls `GET /api/auth/me` on load; `apiFetch` transparently
refreshes once on a 401 and replays the request. `proxy.ts` only checks cookie
presence for fast redirects — the backend is the real authorization gate.

## Testing

`e2e/smoke.spec.ts` covers register → create task → toggle → sign out, plus the
unauthenticated redirect. It runs against a live backend and a disposable
database user created per run.
