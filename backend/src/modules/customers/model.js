const pool = require('../../db/pool');

// Minimal tenant-scoped CRUD for this first porting slice -- QRS generates
// this kind of module via a shared crudFactory utility (generic
// create/import/trash across many entities); that factory isn't ported yet,
// so this is a small dedicated module instead. Revisit once more than one or
// two modules need the same generic shape.

async function list(tenantId) {
  const { rows } = await pool.query(
    'SELECT * FROM customers WHERE tenant_id = $1 AND is_active = true ORDER BY name',
    [tenantId]
  );
  return rows;
}

async function create(tenantId, { name, shortCode, taxId, email, phone, address, notes }, userId) {
  const { rows } = await pool.query(
    `INSERT INTO customers (tenant_id, name, short_code, tax_id, email, phone, address, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [tenantId, name, shortCode ?? null, taxId ?? null, email ?? null, phone ?? null, address ?? null, notes ?? null, userId]
  );
  return rows[0];
}

async function update(tenantId, id, { name, shortCode, taxId, email, phone, address, notes }) {
  const { rows } = await pool.query(
    `UPDATE customers SET name = $3, short_code = $4, tax_id = $5, email = $6, phone = $7, address = $8, notes = $9, updated_at = now()
     WHERE id = $1 AND tenant_id = $2 RETURNING *`,
    [id, tenantId, name, shortCode ?? null, taxId ?? null, email ?? null, phone ?? null, address ?? null, notes ?? null]
  );
  return rows[0] || null;
}

// Soft-delete only -- never hard-delete a record that may already be
// referenced by an invoice.
async function deactivate(tenantId, id) {
  const { rows } = await pool.query(
    `UPDATE customers SET is_active = false, updated_at = now() WHERE id = $1 AND tenant_id = $2 RETURNING *`,
    [id, tenantId]
  );
  return rows[0] || null;
}

module.exports = { list, create, update, deactivate };
