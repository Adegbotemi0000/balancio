# Open Questions — decisions needed from the founder

Nothing below blocks starting Phase 0, but each should get an answer before the part of the
build that depends on it starts.

## Product & branding
- **Product name** — "Quelron Ledger" is a working title only, not chosen. Needs a real
  name before the marketing site/signup flow can be built for real (a placeholder name
  baked into copy/URLs now just means redoing it later).
- **Exact brand hex codes** — the four-accent palette (Electric Blue, Deep Emerald, Luxury
  Gold, Safety Orange on Jet Black/Carbon Gray/Silver/White) is approximated from an
  existing guide image. Worth nailing down exact values (and dark-mode-safe variants)
  before real UI work starts, not after.
- **Font pairing** — placeholder only in `docs/07-branding-design.md`; pick a real pairing
  once actual screens are being designed.

## Pricing & billing
- **Plan tiers and prices** — nothing confirmed (see `docs/06-pricing-plans.md`); needs an
  actual decision, not just "similar to the sibling project's tiers."
- **Payment processor** — needs to support the founder's actual target launch markets'
  currencies/payment methods, not assumed to be one specific processor.
- **Whether any modules are plan-gated** — or every tenant gets full depth regardless of
  tier (the sibling project's approach).

## Technical
- **Multi-tenancy architecture** — shared schema with `tenant_id` (default assumption) vs.
  schema-per-tenant vs. database-per-tenant. Confirm before Phase 0's data model is built,
  since retrofitting this later is expensive.
- **Hosting platform** — cPanel and Vercel-serverless both have known failure modes from
  the founder's other projects (see `docs/04-tech-stack.md`); worth a real decision instead
  of defaulting to whichever was used last.
- **How deep the generic tax model needs to go** for actual first-launch markets — see
  `docs/08-compliance-and-tax.md`'s open question on US-style jurisdiction-specific sales
  tax.

## Market
- **Which countries/markets to actually target at launch** — "any country" is the design
  principle, but a real launch probably wants 1-3 concrete initial markets to design the
  first tax-type presets and marketing copy around, rather than trying to be equally ready
  for everywhere on day one.
