-- The root of multi-tenancy: every tenant-owned table elsewhere carries a
-- tenant_id referencing this. See docs/03-data-model.md.
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(80) UNIQUE NOT NULL,
  country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
  base_currency VARCHAR(3) NOT NULL, -- ISO 4217
  industry VARCHAR(100),
  business_reg_number VARCHAR(100),
  logo_url TEXT,
  fiscal_year_start_month SMALLINT NOT NULL DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
  fiscal_year_locked BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
