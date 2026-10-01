const model = require('./model');
const { recordAudit } = require('../../middleware/audit');

// Ported from QRS's sales/controller.js. Deferred vs. QRS for this first
// slice: no tax-period locking (taxModel.assertDateNotLocked -- Tax isn't
// ported yet) and no PDF/DOCX/XLSX download endpoint -- its own slice later.

async function createInvoice(req, res) {
  const tenantId = req.user.tenantId;
  const { customerId, date, dueDate, items, confirmDuplicate } = req.body;
  if (!customerId) return res.status(400).json({ error: 'customerId is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one line item is required' });
  }
  for (const item of items) {
    if (!item.quantity || Number(item.quantity) <= 0) {
      return res.status(400).json({ error: 'Each line item needs a positive quantity' });
    }
    if (item.unitPrice == null) {
      return res.status(400).json({ error: 'Each line item needs a unitPrice' });
    }
  }

  const invoiceDate = date || new Date().toISOString().slice(0, 10);

  if (!confirmDuplicate) {
    const { total: previewTotal } = await model.previewInvoiceTotals(tenantId, items);
    const dup = await model.findPossibleDuplicateInvoice(tenantId, { customerId, date: invoiceDate, total: Math.round(previewTotal * 100) / 100 });
    if (dup) {
      return res.status(409).json({
        error: `A similar invoice already exists (${dup.invoice_number}). Resubmit with confirmDuplicate: true to proceed anyway.`,
        duplicateOf: dup,
      });
    }
  }

  const invoice = await model.createInvoiceWithItems({ tenantId, customerId, date: invoiceDate, dueDate, items, userId: req.user.sub });

  await recordAudit({
    tenantId,
    entityType: 'invoice',
    entityId: invoice.id,
    userId: req.user.sub,
    action: 'create',
    newValue: `${invoice.invoice_number}, total=${invoice.total}`,
  });

  res.status(201).json(invoice);
}

async function listInvoices(req, res) {
  const { customerId, status } = req.query;
  res.json(await model.listInvoices(req.user.tenantId, { customerId, status }));
}

async function getInvoice(req, res) {
  const invoice = await model.getInvoiceDetail(req.user.tenantId, req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
}

async function issueInvoice(req, res) {
  const invoice = await model.issueInvoice(req.user.tenantId, req.params.id, req.user.sub);
  if (!invoice) return res.status(400).json({ error: 'Invoice not found or not in Draft status' });

  await recordAudit({ tenantId: req.user.tenantId, entityType: 'invoice', entityId: invoice.id, userId: req.user.sub, action: 'update', fieldChanged: 'status', newValue: 'Issued' });
  res.json(invoice);
}

// Cancellation is an approval-gated action (routes.js restricts it to
// owner/management) and requires a reason.
async function cancelInvoice(req, res) {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'A cancellation reason is required' });

  const invoice = await model.cancelInvoice(req.user.tenantId, req.params.id, reason, req.user.sub);
  if (!invoice) return res.status(400).json({ error: 'Invoice not found or already Paid/Cancelled' });

  await recordAudit({ tenantId: req.user.tenantId, entityType: 'invoice', entityId: invoice.id, userId: req.user.sub, action: 'cancel', fieldChanged: 'status', newValue: 'Cancelled', reason });
  res.json(invoice);
}

async function recordPayment(req, res) {
  const tenantId = req.user.tenantId;
  const { amount, date, method, accountId, reference, confirmDuplicate } = req.body;
  const invoiceId = req.params.id;

  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'A positive amount is required' });
  if (!accountId) return res.status(400).json({ error: 'accountId is required' });

  const paymentDate = date || new Date().toISOString().slice(0, 10);

  if (!confirmDuplicate) {
    const dup = await model.findPossibleDuplicatePayment(tenantId, { invoiceId, amount, date: paymentDate });
    if (dup) {
      return res.status(409).json({
        error: 'A payment with the same invoice, amount and date already exists. Resubmit with confirmDuplicate: true to proceed anyway.',
      });
    }
  }

  const { payment, invoice } = await model.recordPayment({ tenantId, invoiceId, amount, date: paymentDate, method, accountId, reference, userId: req.user.sub });

  await recordAudit({
    tenantId,
    entityType: 'payment',
    entityId: payment.id,
    userId: req.user.sub,
    action: 'create',
    newValue: `invoice=${invoice.invoice_number}, amount=${amount}`,
  });

  res.status(201).json({ payment, invoice });
}

async function listReceivables(req, res) {
  res.json(await model.listReceivables(req.user.tenantId));
}

module.exports = { createInvoice, listInvoices, getInvoice, issueInvoice, cancelInvoice, recordPayment, listReceivables };
