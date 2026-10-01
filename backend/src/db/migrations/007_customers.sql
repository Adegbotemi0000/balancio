-- Ported from QRS's customers table (docs/03-data-model.md), tenant-scoped.
-- tax_id replaces QRS's "tin" field name -- same purpose (a customer's tax
-- identifier, written onto any invoice to them), generic naming since this
-- product isn't Nigeria-specific (see docs/08-compliance-and-tax.md).
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  name VARCHAR(150) NOT NULL,
  short_code VARCHAR(20),
  tax_id VARCHAR(30),
  email VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers (tenant_id);
