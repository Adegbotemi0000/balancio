const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./controller');

const router = express.Router();
router.use(requireAuth);

// Role mapping from QRS (admin/system_admin -> owner, sales_operations ->
// operations, management/accountant carried over 1:1 -- see CLAUDE.md).
const canWrite = requireRole('owner', 'management', 'accountant', 'operations');
const canCancel = requireRole('owner', 'management');

router.get('/invoices', asyncHandler(controller.listInvoices));
router.get('/receivables', asyncHandler(controller.listReceivables));
router.get('/invoices/:id', asyncHandler(controller.getInvoice));
router.post('/invoices', canWrite, asyncHandler(controller.createInvoice));
router.patch('/invoices/:id/issue', canWrite, asyncHandler(controller.issueInvoice));
router.patch('/invoices/:id/cancel', canCancel, asyncHandler(controller.cancelInvoice));
router.post('/invoices/:id/payments', canWrite, asyncHandler(controller.recordPayment));

module.exports = router;
