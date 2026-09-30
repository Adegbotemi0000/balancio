# Branding & Design

## Brand identity

This is Quelron's own product — the founder's personal brand, not a company name. Same
underlying identity as the founder's other Quelron-branded work (the internal tool for
Quelron Group uses this same palette), carried through here so anything under the Quelron
name looks like it belongs together.

**Base:** Jet Black, Carbon Gray, Silver, White.
**Accents (multi-color, deliberately more than one hue):** Electric Blue, Deep Emerald,
Luxury Gold, Safety Orange.

These are approximated from the existing brand guide — refine to exact hex codes once an
official brand export exists (see `docs/10-open-questions.md`). Industrial/technical feel,
not the soft consumer-SaaS look — dark surfaces read as intentional, not as a missing
light mode.

## Explicit design rules

- **Flat colors only. No gradients anywhere** — not on buttons, not on hero sections, not
  on charts. Every color is a solid fill.
- **Genuinely multi-color, not monochrome-plus-one-accent.** Use the four accent hues
  (Electric Blue, Deep Emerald, Luxury Gold, Safety Orange) as real, distinct signals —
  e.g. different accents for different states/categories/chart series — rather than
  picking one "brand blue" and leaving the rest of the palette gray.
- Suggested semantic mapping (adjust once real usage patterns emerge):
  - **Electric Blue** — primary actions, links, brand moments
  - **Deep Emerald** — positive/success states (paid, approved, in-stock)
  - **Safety Orange** — warnings, pending/attention states
  - **Luxury Gold** — highlights, premium/plan-tier moments, not overused
  - A red (not yet in the base four — needs picking, see open questions) for
    errors/overdue/negative states, since none of the four accents above should be
    overloaded to also mean "something's wrong"
- Dashboard-heavy UI needs to support dark mode as a first-class mode, not an afterthought
  — every color above needs a verified dark-mode-safe variant before it's used in a real
  component (contrast ratio checked, not just visually eyeballed).
- Charts/data visualization: use the accent hues as the categorical palette (this is
  exactly the kind of place "genuinely multi-color" pays off — a stacked bar or pie chart
  reads instantly if the segments are Electric Blue / Deep Emerald / Safety Orange / Luxury
  Gold rather than four shades of one color).

## Typography (placeholder — confirm with a real pairing before build)

A clean, highly-legible grotesk sans for the dashboard UI (numbers-dense, needs to stay
readable small); a slightly more distinctive sans for the marketing site's headlines, to
avoid the app and the marketing site feeling like two different products. Exact typeface
choice is a fast, cheap decision to make once actual screens are being built — don't lock
it in from docs alone.

## When doing actual visual/UI work on this product

Use real design tooling rather than guessing:
- Font recommendation/lookup tools, for a genuine pairing decision (not "Inter because
  it's the default").
- A UI/UX design-pattern reference for dashboard-heavy SaaS layout conventions, chart
  color accessibility, and component patterns appropriate to a fintech product.
- If/when an actual logo or brand export exists, a brand-extraction tool to pull exact
  hex values instead of continuing to approximate from a guide image.

This applies to the marketing homepage, the in-app dashboard UI, and any exported
documents (invoices, reports) — all three should read as one consistent brand, not three
different visual languages.
