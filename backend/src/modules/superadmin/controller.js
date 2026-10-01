const jwt = require('jsonwebtoken');
const pool = require('../../db/pool');

// Single-operator platform login (see docs/05-roles-controls.md) -- plain
// env-var credentials for now, same pattern as the founder's other tools'
// bootstrap-admin login. Revisit if the platform ever needs more than one
// operator (a real super_admins table, not env vars).
async function login(req, res) {
  const { email, password } = req.body;
  if (email !== process.env.SUPERADMIN_EMAIL || password !== process.env.SUPERADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'super_admin', email }, process.env.SUPERADMIN_JWT_SECRET, { expiresIn: '4h' });
  res.json({ token });
}

async function listTenants(req, res) {
  const { rows } = await pool.query(
    `SELECT t.id, t.name, t.slug, t.country, t.base_currency, t.is_active, t.created_at,
       s.status AS subscription_status, s.trial_ends_at, p.name AS plan_name,
       (SELECT COUNT(*)::int FROM users u WHERE u.tenant_id = t.id) AS user_count
     FROM tenants t
     LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
     LEFT JOIN plans p ON p.id = s.plan_id
     ORDER BY t.created_at DESC`
  );
  res.json(rows);
}

// View, not edit -- see docs/05-roles-controls.md: a super-admin can see a
// tenant's account for support purposes, never touch their actual financial
// records.
async function getTenant(req, res) {
  const { rows } = await pool.query(
    `SELECT t.*, s.status AS subscription_status, s.trial_ends_at, p.name AS plan_name
     FROM tenants t
     LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
     LEFT JOIN plans p ON p.id = s.plan_id
     WHERE t.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Tenant not found' });
  res.json(rows[0]);
}

module.exports = { login, listTenants, getTenant };
