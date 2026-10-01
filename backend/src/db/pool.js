const { Pool } = require('pg');

// A small pool on purpose — whatever host this ends up on (see
// docs/04-tech-stack.md's open hosting question), a serverless/PaaS deploy
// often pairs with a connection pooler in front (e.g. Neon, PgBouncer) that
// already absorbs concurrency across instances; a large local pool here would
// just fight it. Easy to raise once a real host is chosen and load-tested.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 10,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
