-- Ported from QRS's payments table, tenant-scoped. direction 'in' covers
-- customer receipts (the only flow Sales & Invoicing needs in this first
-- slice); 'out' is reserved for when Expenses/Purchases is ported so the
-- same table can be reused rather than duplicated.
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  invoice_id INTEGER REFERENCES invoices(id),
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  direction VARCHAR(5) NOT NULL CHECK (direction IN ('in', 'out')),
  amount NUMERIC(14,2) NOT NULL,
  method VARCHAR(30),
  reference VARCHAR(100),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_account ON payments (account_id);
