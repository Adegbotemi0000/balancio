# Roles, Approvals, Audit Trail & Controls

## User roles (per tenant)

| Role | Access |
|---|---|
| Owner/Admin | Full access to their tenant's data; the person who completed onboarding; manages their own company's users and roles |
| Management | Dashboards, reports, approves selected transactions |
| Accountant | Reviews records, reconciles, validates tax, prepares filings |
| Operations/Sales | Quotations, sales records, project info — day-to-day entry, not approvals |

Enforce all of this server-side, scoped to `tenant_id` on every check — never rely on the
frontend hiding a button, and never let a role check for one tenant leak into another's
data (see `docs/03-data-model.md`).

## Approval workflow

Require approval on sensitive actions: expenses above a configured limit, purchase orders,
supplier payments, refunds, stock adjustments, invoice cancellations, manual financial
adjustments. Single-approver model to start (management approves anything an operator
flags); can get more granular later per tenant if a paying customer asks for it.

## Audit trail

Every important financial action is traceable: user, date/time, action, previous value
(where relevant), new value (where relevant), reason for adjustment (where applicable).
Financial records never simply disappear on delete — cancel, reverse, or archive instead,
and log the action.

## Controls

- Duplicate invoice / duplicate payment detection
- Negative stock warnings
- Unapproved expense warnings
- Overdue invoice alerts
- Missing receipt warnings
- Unreconciled transaction alerts
- Tax period locking (prevent edits to a period once filed)
- Restricted financial adjustments (role-gated)
- Role-based access throughout, always scoped by `tenant_id`

## Platform-level roles (not per-tenant)

- **Super-admin** (the founder / platform operator) — can view a tenant's account and
  usage for support purposes, cannot edit a tenant's actual financial records, sees
  subscription/billing status across all tenants.
