const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./controller');

const router = express.Router();
router.use(requireAuth);

const canWrite = requireRole('owner', 'management', 'accountant');

router.get('/', asyncHandler(controller.listAccounts));
router.post('/', canWrite, asyncHandler(controller.createAccount));

module.exports = router;
