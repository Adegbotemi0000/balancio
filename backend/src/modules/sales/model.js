const pool = require('../../db/pool');

// Ported from QRS's sales/model.js, tenant-scoped throughout. Deferred vs.
// QRS for this first slice (see CLAUDE.md's porting plan):
//   - No inventory/stock-movement sync on issue/cancel -- Inventory isn't
//     ported yet. issueInvoice/cancelInvoice here are pure status
//     transitions; stock sync gets added back when Inventory is ported.
//   - No tax-period locking (QRS's taxModel.assertDateNotLocked) -- the Tax
//     module isn't ported yet; enforced in the controller once it is.
//   - No PDF/DOCX/XLSX export -- its own slice later.
//   - No product_id / project_id columns on invoices or invoice_items --
//     added via their own migrations once Products/Projects are ported.
// Tax here is generic: a tenant's own tax_types rows, not a hardcoded 'VAT'
// row -- this product isn't Nigeria-specific.

function deriveShortCode(name) {
  const words = (name || '').replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'CUST';
  if (words.length === 1) return words[0].toUpperCase().slice(0, 20);
  return words.map((w) => w[0].toUpperCase()).join('').slice(0, 20);
}

// Format: INV-{CUSTOMER CODE}-{YYYY}-{MM}-{seq within that customer+month}.
// Unique per tenant (idx_invoices_tenant_number), not globally -- the
// customer row must already be locked FOR UPDATE by the caller so two
// concurrent invoices for the same customer can't compute the same sequence.
async function buildInvoiceNumber(client, tenantId, customer, date) {
  const shortCode = customer.short_code || deriveShortCode(customer.name);
  const yearMonth = date.slice(0, 7);
  const [year, month] = yearMonth.split('-');

  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS n FROM invoices WHERE tenant_id = $1 AND customer_id = $2 AND to_char(date, 'YYYY-MM') = $3`,
    [tenantId, customer.id, yearMonth]
  );
  const seq = String(rows[0].n + 1).padStart(3, '0');
  return `INV-${shortCode}-${year}-${month}-${seq}`;
}

async function findCustomer(client, tenantId, customerId) {
  const { rows } = await client.query('SELECT * FROM customers WHERE id = $1 AND tenant_id = $2 FOR UPDATE', [customerId, tenantId]);
  return rows[0];
}

async function findTaxType(client, tenantId, taxTypeId) {
  if (!taxTypeId) return null;
  const { rows } = await client.query('SELECT * FROM tax_types WHERE id = $1 AND tenant_id = $2', [taxTypeId, tenantId]);
  return rows[0];
}

// Checks for an existing non-cancelled invoice to the same customer, same
// date, same total within this tenant. Soft check: caller can override with
// confirmDuplicate.
async function findPossibleDuplicateInvoice(tenantId, { customerId, date, total }) {
  const { rows } = await pool.query(
    `SELECT id, invoice_number FROM invoices
     WHERE tenant_id = $1 AND customer_id = $2 AND date = $3 AND total = $4 AND status <> 'Cancelled'`,
    [tenantId, customerId, date, total]
  );
  return rows[0];
}

// Shared by invoice creation and the duplicate-invoice pre-check, so the
// comparison uses the real tax-inclusive total.
async function computeInvoiceTotals(client, tenantId, items) {
  let subtotal = 0;
  let taxAmount = 0;
  const preparedItems = [];

  for (const item of items) {
    const taxType = await findTaxType(client, tenantId, item.taxTypeId);
    const unitPrice = Number(item.unitPrice ?? 0);
    const quantity = Number(item.quantity);
    const description = item.description || 'Item';
    const lineSubtotal = unitPrice * quantity;

    let taxRate = 0;
    if (taxType && taxType.is_enabled) {
      taxRate = item.taxRate != null ? Number(item.taxRate) : Number(taxType.default_rate || 0);
    }
    const lineTax = lineSubtotal * (taxRate / 100);

    subtotal += lineSubtotal;
    taxAmount += lineTax;
    preparedItems.push({
      taxTypeId: item.taxTypeId ?? null,
      description,
      quantity,
      unitPrice,
      taxRate,
      lineSubtotal,
      lineTax,
      lineTotal: lineSubtotal + lineTax,
    });
  }

  return { subtotal, taxAmount, total: subtotal + taxAmount, preparedItems };
}

// Read-only preview (no transaction) -- used by the controller's pre-flight
// duplicate check before it commits to actually creating the invoice.
function previewInvoiceTotals(tenantId, items) {
  return computeInvoiceTotals(pool, tenantId, items);
}

async function createInvoiceWithItems({ tenantId, customerId, date, dueDate, items, userId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const customer = await findCustomer(client, tenantId, customerId);
    if (!customer) throw Object.assign(new Error('Customer not found'), { status: 400 });

    const { rows: tenantRows } = await client.query('SELECT business_reg_number FROM tenants WHERE id = $1', [tenantId]);
    const seller = tenantRows[0];

    const { subtotal, taxAmount, total, preparedItems } = await computeInvoiceTotals(client, tenantId, items);
    const invoiceNumber = await buildInvoiceNumber(client, tenantId, customer, date);

    const { rows } = await client.query(
      `INSERT INTO invoices (tenant_id, invoice_number, customer_id, date, due_date, status, subtotal, tax_amount, total, buyer_tax_id, seller_tax_id, created_by)
       VALUES ($1, $2, $3, $4, $5, 'Draft', $6, $7, $8, $9, $10, $11) RETURNING *`,
      [tenantId, invoiceNumber, customerId, date, dueDate ?? null, subtotal, taxAmount, total, customer.tax_id, seller?.business_reg_number ?? null, userId]
    );
    const invoice = rows[0];

    for (const it of preparedItems) {
      await client.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_type_id, tax_rate, line_subtotal, line_tax, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [invoice.id, it.description, it.quantity, it.unitPrice, it.taxTypeId, it.taxRate, it.lineSubtotal, it.lineTax, it.lineTotal]
      );
    }

    await client.query('COMMIT');
    return invoice;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listInvoices(tenantId, { customerId, status } = {}) {
  const conditions = ['i.tenant_id = $1'];
  const values = [tenantId];
  if (customerId) {
    values.push(customerId);
    conditions.push(`i.customer_id = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`i.status = $${values.length}`);
  }

  const { rows } = await pool.query(
    `SELECT i.*, c.name AS customer_name,
       COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id AND p.direction = 'in' AND NOT p.is_reversed), 0) AS amount_paid
     FROM invoices i
     JOIN customers c ON c.id = i.customer_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY i.created_at DESC`,
    values
  );

  const today = new Date().toISOString().slice(0, 10);
  return rows.map((r) => ({
    ...r,
    balance: Number(r.total) - Number(r.amount_paid),
    display_status:
      ['Issued', 'Partially Paid'].includes(r.status) && r.due_date && r.due_date < today
        ? 'Overdue'
        : r.status,
  }));
}

async function getInvoiceDetail(tenantId, id) {
  const { rows } = await pool.query(
    `SELECT i.*, c.name AS customer_name FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.id = $1 AND i.tenant_id = $2`,
    [id, tenantId]
  );
  const invoice = rows[0];
  if (!invoice) return null;

  const items = (await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id', [id])).rows;
  const payments = (await pool.query(
    `SELECT p.*, a.name AS account_name FROM payments p JOIN accounts a ON a.id = p.account_id
     WHERE p.invoice_id = $1 ORDER BY p.date, p.id`,
    [id]
  )).rows;

  const amountPaid = payments.filter((p) => !p.is_reversed).reduce((sum, p) => sum + Number(p.amount), 0);

  return { ...invoice, items, payments, amount_paid: amountPaid, balance: Number(invoice.total) - amountPaid };
}

// Pure status transition for this first slice -- no stock movement sync yet
// (see file header). Re-added once Inventory is ported.
async function issueInvoice(tenantId, id, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updated = await client.query(
      `UPDATE invoices SET status = 'Issued', updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND status = 'Draft' RETURNING *`,
      [id, tenantId]
    );
    await client.query('COMMIT');
    return updated.rows[0] || null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancelInvoice(tenantId, id, reason, userId) {
  const { rows } = await pool.query(
    `UPDATE invoices SET status = 'Cancelled', cancel_reason = $3, updated_at = now()
     WHERE id = $1 AND tenant_id = $2 AND status <> 'Paid' RETURNING *`,
    [id, tenantId, reason]
  );
  return rows[0] || null;
}

// "Duplicate payment detection" control: same invoice, amount, and date
// already recorded. Soft check -- caller can override with confirmDuplicate.
async function findPossibleDuplicatePayment(tenantId, { invoiceId, amount, date }) {
  const { rows } = await pool.query(
    `SELECT p.id FROM payments p JOIN invoices i ON i.id = p.invoice_id
     WHERE p.invoice_id = $1 AND i.tenant_id = $2 AND p.amount = $3 AND p.date = $4 AND NOT p.is_reversed`,
    [invoiceId, tenantId, amount, date]
  );
  return rows[0];
}

async function recordPayment({ tenantId, invoiceId, amount, date, method, accountId, reference, userId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invoiceRes = await client.query('SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2 FOR UPDATE', [invoiceId, tenantId]);
    const invoice = invoiceRes.rows[0];
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { status: 404 });
    if (invoice.status === 'Cancelled') throw Object.assign(new Error('Cannot pay a cancelled invoice'), { status: 400 });
    if (invoice.status === 'Draft') throw Object.assign(new Error('Issue the invoice before recording a payment'), { status: 400 });

    const accountRes = await client.query('SELECT id FROM accounts WHERE id = $1 AND tenant_id = $2', [accountId, tenantId]);
    if (!accountRes.rows[0]) throw Object.assign(new Error('Account not found'), { status: 400 });

    const paymentRes = await client.query(
      `INSERT INTO payments (tenant_id, invoice_id, direction, amount, date, method, account_id, reference, created_by)
       VALUES ($1, $2, 'in', $3, $4, $5, $6, $7, $8) RETURNING *`,
      [tenantId, invoiceId, amount, date, method ?? null, accountId, reference ?? null, userId]
    );

    const paidRes = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = $1 AND direction = 'in' AND NOT is_reversed`,
      [invoiceId]
    );
    const totalPaid = Number(paidRes.rows[0].paid);
    const newStatus = totalPaid >= Number(invoice.total) ? 'Paid' : 'Partially Paid';

    const updatedInvoice = await client.query(
      `UPDATE invoices SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [invoiceId, newStatus]
    );

    await client.query('COMMIT');
    return { payment: paymentRes.rows[0], invoice: updatedInvoice.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listReceivables(tenantId) {
  const { rows } = await pool.query(
    `SELECT i.id, i.invoice_number, i.customer_id, c.name AS customer_name, i.date, i.due_date, i.total, i.status,
       COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id AND NOT p.is_reversed), 0) AS amount_paid
     FROM invoices i
     JOIN customers c ON c.id = i.customer_id
     WHERE i.tenant_id = $1 AND i.status IN ('Issued', 'Partially Paid', 'Overdue')
     ORDER BY i.due_date ASC NULLS LAST`,
    [tenantId]
  );
  return rows
    .map((r) => ({ ...r, balance: Number(r.total) - Number(r.amount_paid) }))
    .filter((r) => r.balance > 0);
}

module.exports = {
  createInvoiceWithItems,
  listInvoices,
  getInvoiceDetail,
  issueInvoice,
  cancelInvoice,
  recordPayment,
  listReceivables,
  findPossibleDuplicateInvoice,
  findPossibleDuplicatePayment,
  previewInvoiceTotals,
};
