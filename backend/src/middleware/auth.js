const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// Every authenticated request carries { sub: userId, tenantId, role } in its
// JWT. requireAuth re-checks the user AND their tenant are still active on
// every request (not just at login) -- the same reasoning as the founder's
// other tools: a JWT is valid on its own signature until it expires, so a
// disabled login or a deactivated tenant must be caught here to actually take
// effect immediately, not just block the next login attempt.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  let payload;
  try {
    // Pin the algorithm explicitly -- without this, jwt.verify accepts
    // whatever algorithm the token header claims (the classic "algorithm
    // confusion" JWT attack surface).
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.is_active AS user_active, t.is_active AS tenant_active
       FROM users u JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1 AND u.tenant_id = $2`,
      [payload.sub, payload.tenantId]
    );
    const row = rows[0];
    if (!row || !row.user_active) {
      return res.status(401).json({ error: 'This login has been disabled' });
    }
    if (!row.tenant_active) {
      return res.status(403).json({ error: 'This account is currently inactive' });
    }
  } catch (err) {
    console.error('Auth check failed (DB error):', err);
    return res.status(500).json({ error: 'Could not verify session -- try again' });
  }

  req.user = payload;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not permitted for this role' });
    }
    next();
  };
}

// Platform-level (founder-only) access -- see docs/05-roles-controls.md's
// super-admin note. Phase 0 keeps this to a single set of credentials in env
// vars rather than a whole separate admin-user table; revisit if the
// platform ever needs more than one operator.
function requireSuperAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, process.env.SUPERADMIN_JWT_SECRET, { algorithms: ['HS256'] });
    if (payload.role !== 'super_admin') throw new Error('wrong role');
    req.superAdmin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired super-admin session' });
  }
}

module.exports = { requireAuth, requireRole, requireSuperAdmin };
