# Balancio

**Balancio by Quelron** — Quelron's own multi-tenant, multi-country accounting/bookkeeping
SaaS, personally branded and built to sell. Fully separate from Xtreme Cr8tivity's finance
tools (`xtreme-finance-system`, `xtreme-books`) — different brand, codebase, database,
deployment, never touched from here.

Its modules are ported from QRS (`C:\Users\xc\QRS`, Quelron Group's own internal finance
tool, which stays untouched as the reference source) one at a time, adding multi-tenancy
as each is ported — not reimplemented from zero.

Read `CLAUDE.md` first, then `docs/` in the order listed there, before doing any work here.

**Status:** Phase 0 foundation built (multi-tenant signup/login, tenant isolation, billing
skeleton, super-admin, marketing homepage) — see `docs/09-roadmap.md`. Module porting from
QRS starts next.
