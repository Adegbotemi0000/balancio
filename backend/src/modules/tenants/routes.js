const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./controller');

const router = express.Router();
router.use(requireAuth);

router.get('/me', asyncHandler(controller.getMe));
router.patch('/me', requireRole('owner'), asyncHandler(controller.updateMe));
router.get('/users', requireRole('owner', 'management'), asyncHandler(controller.listUsers));

module.exports = router;
