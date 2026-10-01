const pool = require('../../db/pool');

async function getById(tenantId) {
  const { rows } = await pool.query(
    `SELECT t.*, s.status AS subscription_status, s.trial_ends_at, p.name AS plan_name, p.code AS plan_code
     FROM tenants t
     LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
     LEFT JOIN plans p ON p.id = s.plan_id
     WHERE t.id = $1`,
    [tenantId]
  );
  return rows[0];
}

// Country and base currency are deliberately NOT editable here once set --
// changing either after real transactions exist would corrupt every
// already-recorded amount's meaning. If a tenant genuinely needs to change
// jurisdiction/currency, that's a support-assisted data migration, not a
// self-service settings field (see docs/03-data-model.md).
async function updateProfile(tenantId, { name, industry, businessRegNumber, logoUrl }) {
  const { rows } = await pool.query(
    `UPDATE tenants SET
       name = COALESCE($2, name),
       industry = COALESCE($3, industry),
       business_reg_number = COALESCE($4, business_reg_number),
       logo_url = COALESCE($5, logo_url),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [tenantId, name ?? null, industry ?? null, businessRegNumber ?? null, logoUrl ?? null]
  );
  return rows[0];
}

module.exports = { getById, updateProfile };
