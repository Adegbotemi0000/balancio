const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const model = require('./model');

const signupSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  country: z.string().trim().length(2, 'country must be an ISO 3166-1 alpha-2 code, e.g. "US"'),
  baseCurrency: z.string().trim().length(3, 'baseCurrency must be an ISO 4217 code, e.g. "USD"'),
  industry: z.string().trim().optional(),
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().trim().min(1, 'Your name is required'),
});

function issueToken(user, tenantId) {
  return jwt.sign(
    { sub: user.id, tenantId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: parsed.error.issues[0].message });
  }
  const data = parsed.data;
  data.country = data.country.toUpperCase();
  data.baseCurrency = data.baseCurrency.toUpperCase();

  const { tenant, user } = await model.signup(data);
  const token = issueToken(user, tenant.id);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, country: tenant.country, baseCurrency: tenant.base_currency },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = await model.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.is_active) return res.status(401).json({ error: 'This login has been disabled' });
  if (!user.tenant_active) return res.status(403).json({ error: 'This account is currently inactive' });

  await model.touchLastLogin(user.id);
  const token = issueToken(user, user.tenant_id);
  res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    tenant: { id: user.tenant_id, name: user.tenant_name, slug: user.tenant_slug },
  });
}

async function me(req, res) {
  res.json({ userId: req.user.sub, tenantId: req.user.tenantId, role: req.user.role });
}

module.exports = { signup, login, me };
