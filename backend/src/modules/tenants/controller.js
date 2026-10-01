const model = require('./model');
const pool = require('../../db/pool');

async function getMe(req, res) {
  const tenant = await model.getById(req.user.tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
}

async function updateMe(req, res) {
  const { name, industry, businessRegNumber, logoUrl } = req.body;
  const tenant = await model.updateProfile(req.user.tenantId, { name, industry, businessRegNumber, logoUrl });
  res.json(tenant);
}

async function listUsers(req, res) {
  const { rows } = await pool.query(
    `SELECT id, email, full_name, role, is_active, last_login_at, created_at
     FROM users WHERE tenant_id = $1 ORDER BY created_at ASC`,
    [req.user.tenantId]
  );
  res.json(rows);
}

module.exports = { getMe, updateMe, listUsers };
