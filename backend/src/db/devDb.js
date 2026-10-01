// Local-only development database — a self-contained PostgreSQL binary with no
// system install, no Windows service. This is NOT for production: whatever
// real host gets chosen (see docs/04-tech-stack.md) has its own managed
// Postgres. Data persists in backend/.devdata across restarts (gitignored) so
// local test data survives between sessions.
require('dotenv').config();
const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');

const pg = new EmbeddedPostgres({
  databaseDir: path.join(__dirname, '..', '..', '.devdata'),
  user: 'postgres',
  password: 'postgres',
  port: 55440,
  persistent: true,
});

async function main() {
  console.log('Starting local dev PostgreSQL on port 55440...');
  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase('quelron_dev');
  } catch {
    // already exists from a previous run — fine
  }
  console.log('Dev database ready: quelron_dev');
  console.log('Leave this running. Press Ctrl+C to stop it.');
}

main().catch((err) => {
  console.error('Failed to start dev database:', err);
  process.exit(1);
});
