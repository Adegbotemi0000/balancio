# Compliance & Tax (generic, multi-country)

## Core principle

No tax type, rate, or filing rule is hard-coded anywhere in this product. Every tenant
configures their own tax types during setup (with country-based *suggestions*, never
enforced) — the opposite of the founder's Nigeria-specific tools, which assume VAT/PAYE/WHT
exist and are enabled by default.

## Generic tax-type model

A tax type is tenant-owned data: a label, a rate (or schedule of rates), whether it's
enabled, and a general shape flag so the product knows how to apply it without knowing the
country's specific name for it:

- **Consumption-tax-style** (what most countries call VAT, GST, or Sales Tax) — applied to
  invoice line items.
- **Payroll-tax-style** (what most countries call PAYE, income tax withholding, etc.) —
  applied per payslip, typically banded/progressive.
- **Withholding-style** (tax deducted at source on certain payment types) — applied to
  specific transaction types a tenant configures.
- **Other** — a tenant can define a tax type that doesn't fit the three shapes above; the
  system tracks amount calculated/filed/paid/due-date/status regardless of shape.

Country selection at signup suggests a starting set (e.g. a UK tenant might get "VAT"
pre-labelled at a common starting rate; a US tenant might get "Sales Tax" instead, since US
sales tax is jurisdiction-specific and genuinely different in shape from VAT) — but every
suggestion is editable, and a tenant can ignore the suggestions and configure their own
list from scratch.

## What's explicitly not built

- No e-invoicing transmission integration to any national tax authority (no NRS, no
  equivalent for any other country) at launch. If a specific paying tenant's jurisdiction
  requires it later, that becomes an opt-in, country-specific extension module — not a
  default assumption baked into every invoice.
- No assumption that a specific tax type is "on by default" — unlike the Nigeria-specific
  tools (which enable VAT/PAYE by default since that's realistic for every Nigerian
  business), this product can't assume any one tax type applies to every tenant globally,
  so nothing is pre-enabled without the tenant's own setup choice.

## Tax records (same shape regardless of country)

Every tax record tracks: amount calculated, amount filed, amount paid, due date, filing
status, payment status, supporting document — this part generalizes cleanly since every
jurisdiction's tax authority ultimately wants the same basic facts, even if the specific
form/rate/name differs.

## Open question

How deep the "generic" model needs to go for the actual first launch markets (see
`docs/10-open-questions.md`) — e.g. US sales tax is jurisdiction-specific in a way that
might need more structure than a flat rate/label pair once real US tenants sign up.
