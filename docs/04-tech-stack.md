# Tech Stack

Boring and maintainable, matching the proven stack from the founder's other tools — no
reason to introduce a new stack for a new brand when the same one has already survived
real production use twice.

## Confirmed

- **Backend:** Node.js / Express
- **Frontend:** React (Vite)
- **Database:** PostgreSQL — real double-entry GL, `NUMERIC` for money, `TIMESTAMPTZ` for
  timestamps
- **Auth:** JWT-based, role-based access control
- **Never hard-delete:** soft-delete (`deleted_at`) + audit log on every financial mutation

## Open questions (see `docs/10-open-questions.md` for the full list)

- **Hosting:** cPanel (like the internal tool) has caused real production incidents
  (broken env-var UI, disabled global `fetch` on Node 18, native-dependency install
  failures). Vercel + a serverless Postgres (like the sibling multi-tenant project) avoided
  those specific issues but introduced its own serverless-specific gotchas (root
  `package.json` dependency resolution, no persistent filesystem, cold-start migration
  timing). Given this product needs to scale to many paying tenants with real uptime
  expectations, a managed VPS or a mainstream PaaS with a persistent Node process (not
  serverless functions) is worth strong consideration before committing — avoids both
  cPanel's fragility and serverless's filesystem/cold-start constraints. Final call
  pending.
- **Payment processor:** needs to support recurring SaaS billing globally, not just one
  country's cards/banks — a decision for `docs/06-pricing-plans.md`'s billing integration,
  not settled yet.
- **Marketing site framework:** the app itself is React/Vite; the public marketing
  homepage could be the same SPA, or a separate statically-generated site for better
  SEO/load performance. Worth deciding once the marketing site's actual content/design is
  scoped.

## Non-negotiable engineering conventions

- New database columns: nullable or `DEFAULT`, never a bare `NOT NULL` added to an
  existing table with data in it.
- One concern per migration; a fix to an already-run migration is always a *new*
  migration, never an edit to the old one.
- Every list endpoint expected to grow large (POS transactions, journal entries, invoices)
  returns a paginated shape from day one, not bolted on after the fact.
- Request validation on every new endpoint — not ad-hoc `if (!field)` checks.
- Multi-tenancy isolation checked at the query layer on every read/write, tested directly
  before every release (see `docs/03-data-model.md`).
