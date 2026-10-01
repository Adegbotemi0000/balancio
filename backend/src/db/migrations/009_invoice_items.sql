-- Ported from QRS's invoice_items table, tenant-scoped via the parent invoice.
-- product_id is intentionally left out here, same reasoning as project_id on
-- invoices -- added once Inventory/Products is ported. Line items are
-- free-text + quantity/rate/tax until then.
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(250) NOT NULL,
  quantity NUMERIC(14,3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_type_id INTEGER REFERENCES tax_types(id),
  tax_rate NUMERIC(6,3) NOT NULL DEFAULT 0,
  line_subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  line_tax NUMERIC(14,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);
