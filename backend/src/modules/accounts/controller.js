const model = require('./model');
const { recordAudit } = require('../../middleware/audit');

async function listAccounts(req, res) {
  res.json(await model.list(req.user.tenantId));
}

async function createAccount(req, res) {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!['cash', 'bank'].includes(type)) return res.status(400).json({ error: "type must be 'cash' or 'bank'" });

  const account = await model.create(req.user.tenantId, { name, type }, req.user.sub);
  await recordAudit({ tenantId: req.user.tenantId, entityType: 'account', entityId: account.id, userId: req.user.sub, action: 'create', newValue: account.name });
  res.status(201).json(account);
}

module.exports = { listAccounts, createAccount };
