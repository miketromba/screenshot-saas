# screenshot-saas

## Stack

- **Monorepo:** Turborepo + Bun workspaces
- **Linting/Formatting:** Biome (tabs, single quotes, no trailing commas)
- **Pre-commit:** Husky (biome check + typecheck + test)
- **Frontend:** Next.js (App Router), React 19, Tailwind v4
- **UI:** shadcn/ui (new-york)
- **API:** Elysia + Eden Treaty
- **Database:** Drizzle ORM + PostgreSQL
- **Auth:** Supabase Auth (profiles sync)

## Conventions

- Always use `bun` (never npm, pnpm, yarn)
- Prefer single object parameters for functions with 2+ arguments
- Never use `any` — use `unknown` for truly unknown types
- Fix linter errors immediately
- All clickable elements must have `cursor-pointer`
- Always show hover, loading, and error states
- When adding/removing env vars, update `.env.example` to match
- Never hardcode colors — use design tokens from the theme
- Verify changes work before claiming they're done

## Database

- Schema lives in `packages/db/src/schema.ts`
- `bun db:generate` — auto-generate migration from schema changes
- `bun db:generate:custom` — create a custom SQL migration (for triggers, RLS, etc.)
- `bun db:migrate` — apply pending migrations
- `bun db:studio` — open Drizzle Studio
- Import like: `import { db, schema, eq, and, desc } from '@screenshot-saas/db'`
- Never manually create migration files — always use `db:generate` or `db:generate:custom`

## Auth

- Use `supabase.auth.getUser()` to protect pages and data — never trust `getSession()` server-side
- Profiles table syncs from `auth.users` via database triggers
- Migrations are pre-generated — configure `DATABASE_URL` in `.env` then run `bun db:migrate`

## API

- Route modules are Elysia plugins with domain prefixes
- Chain all `.use()` middleware before route handlers for correct type inference
- Export `type App = typeof app` from `apps/server/src/app.ts` for Eden Treaty
- Use Eden Treaty + React Query for all API consumption on the frontend
