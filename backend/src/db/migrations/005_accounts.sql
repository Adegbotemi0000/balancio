-- Minimal cash/bank account so payments have somewhere to point. Ported from
-- QRS's accounts table (docs/02-modules.md Cash & Bank) -- same shape, just
-- tenant-scoped. Full statement import/reconciliation builds on this later,
-- not a parallel structure to be replaced.
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('cash', 'bank')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON accounts (tenant_id);
