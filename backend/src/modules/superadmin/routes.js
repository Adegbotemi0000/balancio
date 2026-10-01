const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireSuperAdmin } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./controller');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

router.post('/login', loginLimiter, asyncHandler(controller.login));
router.get('/tenants', requireSuperAdmin, asyncHandler(controller.listTenants));
router.get('/tenants/:id', requireSuperAdmin, asyncHandler(controller.getTenant));

module.exports = router;
