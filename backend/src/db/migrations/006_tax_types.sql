-- Generic, tenant-configurable tax types (docs/08-compliance-and-tax.md) --
-- NOT a fixed VAT/PAYE/WHT list like the Nigeria-specific tools. A tenant
-- defines their own code/label/rate; nothing here assumes which ones apply.
-- Minimal shape for this first slice (just what Sales & Invoicing needs to
-- compute a consumption-tax-style line amount) -- filing/period tracking
-- comes with the full Tax module later.
CREATE TABLE IF NOT EXISTS tax_types (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  code VARCHAR(20) NOT NULL,
  label VARCHAR(60) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  default_rate NUMERIC(6,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tax_types_tenant_code ON tax_types (tenant_id, code);
