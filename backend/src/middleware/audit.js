const pool = require('../db/pool');

// Records a financial/administrative action. Called explicitly from module
// controllers around create/update/cancel/reverse/archive -- never on plain
// reads, and always AFTER the actual business action has already committed.
// If the audit insert itself fails (a transient DB hiccup), swallow it here
// rather than letting it propagate: the business action already succeeded,
// so throwing at this point would turn a successful create/update into a 500
// the client sees as a failure. Log loudly so a real, recurring
// audit-logging failure is still visible operationally.
// Ported from QRS's middleware/audit.js, with tenantId added since every
// table here is tenant-scoped.
async function recordAudit({ tenantId, entityType, entityId, userId, action, fieldChanged, oldValue, newValue, reason }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (tenant_id, entity_type, entity_id, user_id, action, field_changed, old_value, new_value, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [tenantId, entityType, entityId, userId ?? null, action, fieldChanged ?? null, oldValue ?? null, newValue ?? null, reason ?? null]
    );
  } catch (err) {
    console.error('AUDIT LOG WRITE FAILED (action already committed):', { tenantId, entityType, entityId, action }, err);
  }
}

module.exports = { recordAudit };
