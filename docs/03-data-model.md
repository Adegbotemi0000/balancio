# Data Model

## Multi-tenancy shape

Every tenant-owned table carries a `tenant_id`, enforced at the query layer on every single
read and write — never trusted to a WHERE clause someone might forget. **True multi-tenancy
is the one rule with zero tolerance for shortcuts**: complete data isolation between tenant
companies, enforced at the database/application layer, never just hidden in the UI. A
tenant must never be able to see or query another tenant's data under any circumstance —
this gets tested directly before every release, not assumed.

Open question (see `docs/10-open-questions.md`): shared schema with `tenant_id` on every
row, vs. schema-per-tenant, vs. database-per-tenant. Shared-schema-with-`tenant_id` is the
default assumption for launch (simplest to operate, cheapest, standard for this class of
product) unless a specific tenant's compliance requirement forces isolation at the
infrastructure level later.

## Company / tenant profile

Every tenant sets up, at signup:
- Company name, logo (shown on that tenant's own dashboard/invoices, not on the shared
  platform's public branding)
- **Country** — drives which tax-type presets are suggested (not enforced; a tenant can
  still configure custom types)
- **Base currency** — every amount stored in the tenant's base currency; multi-currency
  transactions (a sale invoiced in a currency other than the tenant's base) are a
  fast-follow, not required for launch (see `docs/09-roadmap.md`)
- Industry (optional, informational — may drive default category/tax-type suggestions
  later)
- Business registration number (optional, generic field — not a Nigeria-specific CAC
  number; whatever a business in any country would use to identify itself)
- Primary contact person (name, role, phone, email)

## Core entities

Standard entity list, generalized from the founder's mature internal tool — see
`docs/02-modules.md` for what each module needs to do with these:

Customers, Suppliers, Products/Materials (with a `tracks_stock` flag), Categories
(expense/tax/discount, configurable per tenant), Quotations, Invoices + Invoice Line Items,
Payments, Purchases + Purchase Line Items, Vendor Credits, Expenses, Recurring Expense
Templates, Stock Movements, Production Vouchers (+ recipe/BOM lines), POS Transactions,
Stores, Projects, Timesheets Entries, Loans + Loan Repayments, Fixed Assets, Wallet
Transactions, GL Accounts, Journal Entries + Journal Lines, Tax Types (tenant-configurable —
see `docs/08-compliance-and-tax.md`), Tax Periods, Tax Records, Staff, Payroll Entries,
Budgets + Budget Lines, Bank/Cash Accounts, Bank Statement Imports + Lines, Documents
(attached to any of the above), Users + Roles, Audit Log entries.

## Invoice fields (always captured, regardless of country)

Buyer info, seller info, invoice date, a unique invoice number, line items, and the
tax amount(s) computed from whatever tax type(s) apply per line/category. No e-invoicing
transmission fields are required (unlike the Nigeria-specific tools) — if a future tenant's
country requires e-invoicing, that becomes an optional, country-specific extension later,
not a default field on every invoice everywhere.

## Money and dates

Money stays `NUMERIC`, never floating point. Every monetary table also carries (directly or
via its tenant's profile) which currency the amount is in. Timestamps stay `TIMESTAMPTZ`.
IDs stay `SERIAL`/`INTEGER` for consistency unless a specific table's expected scale
justifies a `BIGINT`.

## Soft-delete / audit pattern

Financial records are never hard-deleted — a `deleted_at`/`deleted_by` pair moves a record
to Trash (restorable); a genuine permanent delete is a separate, tightly-gated action.
Every important financial action (create/edit/cancel/delete) writes an audit log entry:
who, when, what action, old value, new value, reason where applicable.
