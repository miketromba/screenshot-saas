# screenshot-saas

## ⚠️ MANDATORY: Verify Everything Before Declaring Done

**No task is complete until you have comprehensively verified it works.** This is non-negotiable.

Before you tell the user something is "done", you MUST:

1. **Run the linter and type checker** — zero errors allowed. Run `bun check` or the relevant Biome/TypeScript commands and confirm a clean output.
2. **Run automated tests** — if tests exist for the area you touched, run them and confirm they pass. If you added new logic, write tests for it and run them.
3. **Manually verify in a real environment** — spin up the dev server, use `agent-browser` (see `.agents/skills/agent-browser/SKILL.md`) to test UI changes in a real browser, hit the API endpoint, query the database — whatever it takes to confirm the feature actually works end-to-end in a running application. Reading the code and "it looks right" is NOT verification.
4. **Test edge cases and error states** — don't just test the happy path. Confirm error handling, empty states, invalid inputs, and boundary conditions behave correctly.
5. **Confirm you haven't broken anything else** — run the full test suite, not just the files you touched. Check that related features still work.

**If you cannot verify something (e.g., missing credentials, blocked port), explicitly tell the user what you were unable to verify and why.** Do NOT silently skip verification and claim the task is done.

**Use the QA Testing skill** (`.agents/skills/qa-testing/SKILL.md`) for structured, thorough verification of any feature or fix. It provides a complete workflow for autonomous QA using browser automation.

**The bar is: you would bet money that it works.** If you're not that confident, keep testing until you are or flag what's uncertain. Half-done work that "should work" wastes more time than doing it right the first time.

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
- Verify changes work before claiming they're done — see **MANDATORY: Verify Everything Before Declaring Done** above

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
