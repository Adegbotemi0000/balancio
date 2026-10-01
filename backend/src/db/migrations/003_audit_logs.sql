-- Tenant-scoped audit trail (see docs/05-roles-controls.md). entity_id is
-- NOT NULL (a genuinely non-entity-specific action uses 0 as a sentinel,
-- matching the convention already proven out on the founder's other tools).
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  entity_type VARCHAR(60) NOT NULL,
  entity_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(20) NOT NULL,
  field_changed VARCHAR(60),
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs (tenant_id, created_at DESC);
