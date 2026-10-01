-- Every user belongs to exactly one tenant (see docs/05-roles-controls.md for
-- the role list). The Owner/Admin who completes signup is the first row for
-- their tenant; they invite/create the rest from inside the app later
-- (Phase 1) -- Phase 0 only needs signup to create tenant + owner together.
--
-- email is globally unique (not just per-tenant): login only ever takes an
-- email + password, with no tenant selector, so a single email must resolve
-- to exactly one account. A person who needs access to more than one tenant
-- (e.g. an accountant serving several client businesses) signs up a separate
-- email per tenant for now -- true multi-tenant-membership-per-user is a
-- real feature to design later (see docs/10-open-questions.md), not a Phase
-- 0 concern.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'management', 'accountant', 'operations')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  otp_enabled BOOLEAN NOT NULL DEFAULT false,
  otp_secret VARCHAR(64),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users (tenant_id);
