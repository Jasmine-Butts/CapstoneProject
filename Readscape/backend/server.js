require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const { Pool } = require('pg');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createApp } = require('./src/app');
async function start() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in backend/.env.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  pool.on('error', () => console.error('Database connection interrupted.'));
  await pool.query(readFileSync(join(__dirname,'sql/schema.sql'),'utf8'));
  const server = createApp(pool).listen(process.env.PORT || 3001, () => console.log('Readscape backend ready; database connected.'));
  process.on('SIGTERM', () => server.close(() => pool.end()));
}
start().catch((error) => {
  console.error("Startup error:", error.code, error.message);
  process.exitCode = 1;
});