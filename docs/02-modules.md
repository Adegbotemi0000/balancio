# Core Modules

Every module below is per-tenant (see `docs/03-data-model.md` for the isolation shape).
Generalized from the founder's most mature internal tool — same functional depth, no
Nigeria-specific assumptions baked in.

## Tenant-side (used day to day by a signed-up business)

### Sales & Revenue
Customers, quotations (convertible to invoices), sales orders, invoices, invoice status,
payments, outstanding balances. Invoice statuses: Draft, Issued, Partially Paid, Paid,
Overdue, Cancelled. Every invoice captures buyer info, seller info, invoice date, a unique
invoice number, line items, and tax — using whatever tax type(s) the tenant has configured
for their country, not a fixed VAT assumption.

### Point of Sale (POS)
Walk-in/counter sales, completed instantly (not a draft-then-issue flow like a regular
invoice). Cash, card, transfer, and split payments; receipt printing; refunds and voids.

### Expenses
Date, category (configurable per tenant, not fixed), supplier/vendor, description, amount,
payment method, bank/cash account, receipt attachment, tax-relevant info, approval status.

### Recurring Expenses
Expenses that repeat on a schedule (rent, subscriptions) — set up once, the system
generates them when due instead of manual re-entry each period.

### Purchases & Suppliers
Suppliers, purchase orders, supplier invoices, payments to suppliers, outstanding supplier
balances, supporting documents. A purchase that affects inventory updates stock
automatically.

### Vendor Credits
Credit notes from suppliers, offset against future purchases.

### Inventory
Products/materials, opening stock, purchases in, stock received/issued/sold, adjustments,
damaged/lost stock, closing stock, stock value, reorder levels. Every stock movement needs
a reason and a reference — no unexplained stock changes.

### Production
Tracks make/production runs that consume raw materials (via a bill-of-materials-style
recipe) and produce finished stock.

### Stores
Multi-location inventory and sales — a tenant with more than one physical/warehouse
location tracks stock and sales per store, not just business-wide.

### Customers & Projects
Customer records link to contacts, projects, quotations, invoices, payments, balances, and
documents. Projects group costs/invoices under a specific job rather than the business as a
whole.

### Cash & Bank
Cash transactions, bank transactions, transfers, deposits, withdrawals, bank charges, and
reconciliation between recorded transactions and an uploaded bank statement (CSV, Excel, or
text-based PDF).

### Loans
Loan records with schedules/repayments — both loans the business gives and loans it owes.

### Fixed Assets
Asset register with depreciation and disposal tracking.

### Wallet
An internal balance/float tracking feature for managing direct payments outside the normal
cash/bank flow.

### Chart of Accounts / Journals / General Ledger / Trial Balance
Real double-entry bookkeeping underneath every other module — every operational event
(invoice issued, payment recorded, purchase approved, ...) auto-posts a balanced journal
entry. Manual journal entries are also supported for an accountant's own adjustments.

### Tax
Fully generic and tenant-configurable tax *types* (not a fixed VAT/PAYE/WHT list) — see
`docs/08-compliance-and-tax.md`. Every tax record tracks amount calculated, amount filed,
amount paid, due date, filing status, payment status, supporting document. Tax period
locking prevents edits to a dated record once that period is filed.

### Payroll
Staff records, salary, statutory-style deductions (configurable per tenant's jurisdiction,
not hard-coded to one country's bands), payslips.

### Timesheets
Staff time logged against projects, used for project costing.

### Budgets
Department/category budgets compared against actuals.

### Discount Rules
Reusable discount rules instead of manual per-invoice discounts.

### Document Management ("File Manager")
Every receipt, supplier invoice, customer invoice, payment evidence, bank statement, tax
filing, and contract can be attached to its transaction and is also browsable by category,
paginated.

### Dashboard & Reports
Revenue (period + YTD), expenses, estimated profit/loss, cash position, bank position,
receivables, payables, outstanding invoices, stock value, tax obligations, overdue customer
payments. Daily/weekly/monthly report presets, plus an Audit-Ready Report Pack export for
handing records to an accountant.

### In-app AI help assistant
A floating chat assistant answering two kinds of questions: how-to/general-accounting
questions (LLM-backed, grounded in this product's own modules) and questions about the
tenant's own live figures (answered entirely locally from that tenant's own data, never
sent to an external API, and strictly scoped to the requesting tenant — see
`docs/03-data-model.md`'s tenant-isolation note).

## Platform-side (not present in a single-tenant internal tool — needed because this is sold)

- **Public marketing homepage** — separate from the app, introducing the product.
- **Setup / onboarding flow** — company profile, country, base currency, industry, plan
  selection.
- **Sign up / sign in** — self-service account creation, not admin-provisioned.
- **Billing** — plan subscription, invoicing tenants for their own subscription (the
  founder's own sales record of who paid what, when).
- **Super-admin** — visibility into every tenant's subscription status, plan, and payment
  history; view (not necessarily edit) a tenant's account for support purposes.

## Explicitly not built (by design, not oversight)

- No NRS / FIRS / Nigeria-specific e-invoicing integration of any kind.
- No hard-coded tax type list — everything in `docs/08-compliance-and-tax.md` is
  tenant-configurable data.
