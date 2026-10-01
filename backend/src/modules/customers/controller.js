const model = require('./model');
const { recordAudit } = require('../../middleware/audit');

async function listCustomers(req, res) {
  res.json(await model.list(req.user.tenantId));
}

async function createCustomer(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const customer = await model.create(req.user.tenantId, req.body, req.user.sub);
  await recordAudit({ tenantId: req.user.tenantId, entityType: 'customer', entityId: customer.id, userId: req.user.sub, action: 'create', newValue: customer.name });
  res.status(201).json(customer);
}

async function updateCustomer(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const customer = await model.update(req.user.tenantId, req.params.id, req.body);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  await recordAudit({ tenantId: req.user.tenantId, entityType: 'customer', entityId: customer.id, userId: req.user.sub, action: 'update' });
  res.json(customer);
}

async function deactivateCustomer(req, res) {
  const customer = await model.deactivate(req.user.tenantId, req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  await recordAudit({ tenantId: req.user.tenantId, entityType: 'customer', entityId: customer.id, userId: req.user.sub, action: 'archive' });
  res.json(customer);
}

module.exports = { listCustomers, createCustomer, updateCustomer, deactivateCustomer };
