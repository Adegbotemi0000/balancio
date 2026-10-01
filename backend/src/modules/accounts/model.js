const pool = require('../../db/pool');

async function list(tenantId) {
  const { rows } = await pool.query(
    'SELECT * FROM accounts WHERE tenant_id = $1 AND is_active = true ORDER BY name',
    [tenantId]
  );
  return rows;
}

async function create(tenantId, { name, type }, userId) {
  const { rows } = await pool.query(
    `INSERT INTO accounts (tenant_id, name, type, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [tenantId, name, type, userId]
  );
  return rows[0];
}

module.exports = { list, create };
