const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./controller');

const router = express.Router();
router.use(requireAuth);

const canWrite = requireRole('owner', 'management', 'accountant', 'operations');

router.get('/', asyncHandler(controller.listCustomers));
router.post('/', canWrite, asyncHandler(controller.createCustomer));
router.patch('/:id', canWrite, asyncHandler(controller.updateCustomer));
router.delete('/:id', canWrite, asyncHandler(controller.deactivateCustomer));

module.exports = router;
