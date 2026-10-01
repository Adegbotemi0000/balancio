const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./controller');

const router = express.Router();

// Same reasoning as the founder's other tools: login is the one endpoint an
// attacker can hit without already holding a valid token, so it's capped.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

router.post('/signup', authLimiter, asyncHandler(controller.signup));
router.post('/login', authLimiter, asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
