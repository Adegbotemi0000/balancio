# Roadmap

## Phase 0 — Foundation (build this first)

- Multi-tenant data model (`tenant_id` isolation, verified with a real cross-tenant test
  before moving on)
- Auth: sign up, sign in, JWT + role-based access, scoped per tenant
- Company/tenant setup flow: name, country, base currency, industry, business
  registration number (optional)
- Billing skeleton: plan selection at signup (even if only one plan exists at first),
  payment processor integration for recurring charges
- Super-admin skeleton: list of tenants, subscription status, basic support view
- Public marketing homepage (can be minimal at first — a real one comes once the product
  itself is further along)

## Phase 1 — Core accounting MVP

Ported directly from QRS (`C:\Users\xc\QRS`, left untouched — see CLAUDE.md), one module at
a time, adding `tenant_id` scoping as each is ported: Customers, Suppliers, Products,
Categories, Sales & Invoicing, Expenses, Purchases, Inventory + stock movements, Cash &
Bank accounts, Chart of Accounts / Journals / General Ledger / Trial Balance with real
auto-posting, generic Tax module (see `docs/08-compliance-and-tax.md`), Dashboard, basic
Reports, role-based access + audit trail, Document management, Trash/soft-delete pattern.
Start with Sales & Invoicing to prove the porting pattern end to end before doing the rest.

## Phase 2 — Everything else from the module list

POS, Wallet, Vendor Credits, Recurring Expenses, Production, Stores, Projects, Timesheets,
Loans, Fixed Assets, Payroll, Budgets, Discount Rules, Quotations, Bank Reconciliation,
Audit-Ready Report Pack, in-app AI help assistant.

## Phase 3 — Polish for selling to strangers (not just the founder's own use)

- Real marketing homepage with actual design work (not a placeholder)
- Onboarding flow polish (this is the first thing a paying stranger sees — it has to be
  good, unlike an internal tool where the founder already knows how to use it)
- Billing edge cases: failed payment/dunning, upgrade/downgrade, cancellation
- Support/help surface beyond the in-app assistant (a way for a confused new tenant to
  reach the founder)
- Security pass: confirm JWT/session handling, rate limiting, and tenant-isolation testing
  are all genuinely production-grade before charging strangers money

## Explicitly deferred, not forgotten

- Multi-currency *transactions* (a tenant invoicing in a currency other than their own
  base currency) — base-currency-only is enough for launch; true multi-currency
  transaction support is a real fast-follow, not launch-blocking.
- Country-specific e-invoicing extensions for any jurisdiction that requires one — opt-in
  per-tenant later, not a launch requirement for any country.
