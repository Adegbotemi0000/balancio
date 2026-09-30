# Pricing & Plans

**Nothing here is confirmed yet** — unlike the sibling multi-tenant project (which had
concrete tiers/prices agreed before build started), this is a placeholder structure to
build against, not a committed pricing sheet. See `docs/10-open-questions.md`.

## Assumed shape (to validate with the founder before billing code is built)

- Tiered by included user/seat count (a pattern that's worked before): a small tier for a
  solo operator or tiny team, a mid tier for a growing team, a top tier for a larger team —
  exact seat counts and prices TBD.
- Extra seats beyond a plan's included count cost a flat per-seat add-on rate — TBD.
- Every plan includes: role-based access + audit trail, core accounting modules, payroll.
- Whether any modules are gated to higher tiers only (vs. every tenant getting the full
  module list regardless of plan) — TBD; the sibling project's decision was "no gating,
  full depth on every plan," which is a reasonable default to start from.

## Billing mechanics (not yet built)

- Recurring subscription billing via a payment processor that supports the founder's
  actual target markets/currencies (not assumed to be Nigeria/NGN-only) — processor choice
  is an open question (`docs/10-open-questions.md`).
- Tenant-facing invoices/receipts for their own subscription charges — the founder's own
  sales record of who paid what, when, tracked the same way any other invoice is tracked
  in this system (dogfooding the product's own Sales module for the founder's own SaaS
  revenue).
- Failed-payment/dunning handling, plan upgrade/downgrade, cancellation flow — all TBD,
  standard SaaS billing concerns to design once a processor is chosen.
