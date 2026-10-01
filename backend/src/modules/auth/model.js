const bcrypt = require('bcrypt');
const pool = require('../../db/pool');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'company';
}

async function uniqueSlug(client, baseName) {
  const base = slugify(baseName);
  let slug = base;
  let n = 1;
  // Small tenant volume expected early on -- a loop here is fine; revisit if
  // signup ever needs to handle real concurrency at this exact step.
  while (true) {
    const { rows } = await client.query('SELECT 1 FROM tenants WHERE slug = $1', [slug]);
    if (rows.length === 0) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// Signup creates the tenant, its Owner user, and a trialing subscription to
// the placeholder plan all in one transaction -- a business either fully
// exists after signup or not at all, never half-created.
async function signup({ companyName, country, baseCurrency, industry, email, password, fullName }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: existing } = await client.query('SELECT 1 FROM users WHERE lower(email) = lower($1)', [email]);
    if (existing.length > 0) {
      throw Object.assign(new Error('An account with this email already exists'), { status: 409 });
    }

    const slug = await uniqueSlug(client, companyName);
    const { rows: tenantRows } = await client.query(
      `INSERT INTO tenants (name, slug, country, base_currency, industry)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyName, slug, country, baseCurrency, industry ?? null]
    );
    const tenant = tenantRows[0];

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows: userRows } = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'owner') RETURNING *`,
      [tenant.id, email, passwordHash, fullName]
    );
    const user = userRows[0];

    const { rows: planRows } = await client.query(`SELECT id FROM plans WHERE code = 'starter'`);
    const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-day trial, placeholder length
    await client.query(
      `INSERT INTO tenant_subscriptions (tenant_id, plan_id, status, trial_ends_at)
       VALUES ($1, $2, 'trialing', $3)`,
      [tenant.id, planRows[0].id, trialEnds]
    );

    // Every tenant needs somewhere for a payment to land -- QRS seeds this
    // once at the database level since it's single-tenant; here it's done
    // per-tenant at signup instead.
    await client.query(
      `INSERT INTO accounts (tenant_id, name, type) VALUES ($1, 'Cash', 'cash')`,
      [tenant.id]
    );

    await client.query('COMMIT');
    return { tenant, user };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT u.*, t.name AS tenant_name, t.slug AS tenant_slug, t.is_active AS tenant_active
     FROM users u JOIN tenants t ON t.id = u.tenant_id
     WHERE lower(u.email) = lower($1)`,
    [email]
  );
  return rows[0];
}

async function touchLastLogin(userId) {
  await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
}

module.exports = { signup, findUserByEmail, touchLastLogin };
