const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./modules/auth/routes');
const tenantsRoutes = require('./modules/tenants/routes');
const superadminRoutes = require('./modules/superadmin/routes');

const app = express();

// Set this to 1 if/once deployed behind a reverse proxy, so Express trusts
// X-Forwarded-For for the real client IP (needed for rate limiting to track
// attempts per real visitor instead of per proxy). Left unset for local dev.
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : undefined }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/superadmin', superadminRoutes);

// Centralised error handler -- anything asyncHandler forwards, or any
// synchronous throw, lands here instead of crashing the process or leaking a
// stack trace to the client.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: status < 500 ? err.message : 'Something went wrong' });
});

module.exports = app;
