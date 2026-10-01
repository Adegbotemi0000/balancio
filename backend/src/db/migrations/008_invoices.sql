-- Ported from QRS's invoices table (docs/03-data-model.md), tenant-scoped.
-- Renamed buyer_tin/seller_tin -> buyer_tax_id/seller_tax_id (generic, not
-- Nigeria-specific naming) and dropped e_invoice_reference entirely -- this
-- product has no e-invoicing transmission target at all (docs/08-compliance-
-- and-tax.md), unlike QRS/Xtreme Finance's NRS-readiness fields.
-- project_id is intentionally left out here (QRS keeps it as an unenforced
-- placeholder column) -- added via its own migration once Projects is
-- ported, per the "one concern per migration" rule, rather than carrying a
-- dangling column now.
-- Invoice numbering here is tenant-scoped (see the application code) --
-- unlike QRS's single global sequence, this uses a per-tenant counter so
-- invoice_number only needs to be unique within a tenant, not globally.
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  invoice_number VARCHAR(40) NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled')),
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  buyer_tax_id VARCHAR(30),
  seller_tax_id VARCHAR(30),
  cancel_reason TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_tenant_number ON invoices (tenant_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices (tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
