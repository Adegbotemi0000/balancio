require('dotenv').config();
const app = require('./app');
const { migrate } = require('./db/migrate');

const PORT = process.env.PORT || 4100;

async function start() {
  if (process.env.RUN_SETUP_ON_BOOT === '1') {
    await migrate();
  }
  app.listen(PORT, () => {
    console.log(`Quelron backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
