# Quelron Ledger (working name)

## What this is

A cloud-based, multi-tenant accounting and bookkeeping SaaS platform, built and owned by
Quelron — the founder's personal brand, not a company product line. Any business, in any
country, can sign up, set up their company profile (country, base currency), subscribe to
a plan, and immediately start managing sales, purchases, expenses, payroll, inventory, and
full double-entry bookkeeping.

This is a **separate, standalone project** — genuinely independent from every other
finance/bookkeeping app already built under this account:

- **Not** `xtreme-finance-system` (Xtreme Cr8tivity's internal single-tenant tool)
- **Not** `xtreme-books` (Xtreme Cr8tivity's own separate multi-tenant SaaS play)
- **Not** `QRS` (Quelron Group's own internal, personal/solo-run finance tool)

Nothing in this repo touches any of those three — no shared code, database, deployment,
or branding. The *functional depth* of the accounting/bookkeeping domain (what a GL posting
engine needs to do, what an audit trail needs to capture, how approvals should work) is
common sense shared across any serious accounting product, not something copied from one
codebase into another. Do not open or reference those other repos while working here.

## Who this is for and why it's different from the others

Quelron's own sellable product — international, not tied to one country's tax authority.
Key differences from the Nigeria-specific internal tools this founder has also built:

- **No NRS / Nigeria-specific e-invoicing.** No FIRS/NRS REV 360 integration, no mandatory
  IRN, no Nigeria-only tax assumptions baked in anywhere.
- **Multi-currency and multi-country from day one.** Every tenant picks their own country
  and base currency during setup. Tax types are fully generic/configurable (see
  `docs/03-data-model.md`) — VAT/GST/Sales-Tax-style, PAYE/payroll-tax-style, withholding-
  style — labelled and rated per tenant's own jurisdiction, never hard-coded to one country's
  rules the way the Nigeria-specific tools are.
- **Public marketing site + self-service setup/signup/signin**, same commercial-SaaS shape
  as the sibling project, but under Quelron's own brand and identity, not Xtreme Cr8tivity's.

## Scope: same functional depth as the mature internal tool, generalized

Every module the founder's most mature internal accounting tool has, reimplemented fresh
(not shared code) and generalized for any country/currency:

Sales & invoicing, quotations, customers, expenses, purchases & suppliers, vendor credits,
inventory & stock movements, production tracking, POS, wallet/internal balance tracking,
cash & bank accounts, bank reconciliation, loans, fixed assets (register + depreciation +
disposal), payroll, recurring expenses, budgets, projects, timesheets, discount rules,
multi-store support, full double-entry Chart of Accounts / Journals / General Ledger /
Trial Balance, configurable tax records (generic, not Nigeria-specific), document
management, dashboard + reports + an audit-ready report pack, role-based access with a full
audit trail, a Trash/soft-delete pattern (never hard-delete financial records), and an
in-app AI help assistant.

Full context lives in `docs/`. Read them in order before starting work:

1. `docs/01-overview.md` — vision, business model, target market, guiding principles
2. `docs/02-modules.md` — every module and what it needs to do
3. `docs/03-data-model.md` — core entities, multi-tenancy shape, multi-currency/country
   shape
4. `docs/04-tech-stack.md` — stack decisions and open technical questions
5. `docs/05-roles-controls.md` — RBAC, audit trail, tenant data isolation
6. `docs/06-pricing-plans.md` — subscription tiers and billing rules
7. `docs/07-branding-design.md` — brand identity, visual direction, design bar
8. `docs/08-compliance-and-tax.md` — generic/configurable tax model, no single country's
   rules assumed
9. `docs/09-roadmap.md` — phased build plan
10. `docs/10-open-questions.md` — decisions still needed from the founder

## Ground rules while building

- Every transaction enters the system once and flows automatically into every relevant
  record (sale → invoice → payment → revenue → receivable if unpaid → stock movement →
  GL posting → reports). Never build a second place to enter the same fact.
- Every important financial action (create/edit/cancel/delete) is traceable: who, when,
  what changed. Never hard-delete a financial record — cancel, reverse, or archive.
- Tax types, PAYE/payroll-tax bands, and currencies are configurable data per tenant, not
  hard-coded — this product exists specifically to *not* assume one country's rules.
- Expense/discount categories are configurable data per tenant, not hard-coded enums.
- Keep the stack boring and maintainable — this needs to survive being handed off to or
  maintained by a small team, not showcase new tech.
- **True multi-tenancy is the one rule with zero tolerance for shortcuts**: complete data
  isolation between tenant companies, enforced at the database/application layer, never
  just hidden in the UI. Tested directly before every release, not assumed.

## Design direction

Multi-color palette — genuinely more than one accent color, not a single-hue brand locked
to black/white/one-accent the way the Nigeria-specific tools are. **No gradients anywhere**
— flat color fields only. Reach for real design skills/tools when doing actual visual work
(brand palette generation, font pairing, UI pattern references) rather than guessing —
covered further in `docs/07-branding-design.md`.

## Decisions still needed from the founder

See `docs/10-open-questions.md` for the full list — plan pricing/tiers, product name
(currently just a working title), payment processor for global card billing, and how deep
the "generic tax" model needs to go for the first launch markets.
