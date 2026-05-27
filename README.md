# To-do — Task Manager

Monorepo for a task management demo: NestJS API + React (Vite) web UI.

> **Docker is intentionally not used.** This repository is set up for local presentation (`pnpm dev` / `pnpm start:prod` + optional Cloudflare Tunnel). A formal container/deploy flow is out of scope.

## Stack

| Package | Tech |
|---------|------|
| `apps/api` | NestJS 11, Prisma, PostgreSQL, JWT — port **3010** |
| `apps/web` | Vite 6, React 19, React Router — port **3011** |

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io/) 10.x (`corepack enable` recommended)
- PostgreSQL ≥ 14 running locally

Create the database once:

```bash
createdb infopoly
# or: psql -c "CREATE DATABASE infopoly;"
```

## Quick start (local)

```bash
# 1. Environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit apps/api/.env — JWT_SECRET (min 32 chars), DATABASE_URL

# 2. Install & migrate
pnpm install
pnpm db:migrate

# 3. Run API + web
pnpm dev
# or (same behaviour, presentation alias):
pnpm start:prod
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3011 |
| API | http://localhost:3010/api |
| Swagger | http://localhost:3010/api/docs |

Register with a password that has **at least 8 characters, one uppercase letter, and one digit** (e.g. `Password1`).

### `start:prod` vs production build

`pnpm start:prod` intentionally runs **development mode** (`NODE_ENV=development`, Nest watch + Vite dev server) on ports 3010/3011 — for local/tunnel presentation, not a compiled production deploy.

To run a built API binary: `pnpm --filter @infopoly/api run start:built` (after `pnpm build`).

## Cloudflare Tunnel (presentation)

| Public hostname | Local service |
|-----------------|---------------|
| `https://infopoly.skoldrum.online` | `http://localhost:3011` (Vite) |
| `https://api-infopoly.skoldrum.online` | `http://localhost:3010` (Nest) |

## Scripts

```bash
pnpm dev              # API (watch) + Vite — development
pnpm start:prod       # Same as dev (presentation alias, still NODE_ENV=development)
pnpm build            # Build all apps
pnpm db:migrate       # Prisma migrate dev (api)
pnpm --filter @infopoly/api run db:studio
pnpm lint             # ESLint / tsc checks
pnpm run test:check   # Unit + e2e (api)
```

## API overview

- `POST /api/auth/register`, `POST /api/auth/login` — returns `{ accessToken }` (SPA uses Bearer header)
- `GET /api/projects`, `POST /api/projects`, …
- `GET /api/projects/:projectId/tasks` — filters: `status`, `priority`, pagination

See Swagger at `/api/docs` when `NODE_ENV=development`.

## Project layout

```
apps/
  api/     NestJS + Prisma
  web/     Vite + React todo board
```
