// src/db/pool.js
//
// Single shared Postgres connection pool, pointed at Neon.
//
// Neon connection strings already look like:
//   postgresql://USER:PASSWORD@ep-xxxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require
//
// The `pg` driver understands the URL directly. Neon always requires SSL, and
// on most hosting platforms (Render, Railway, local dev, etc.) you also need
// to tell node's TLS layer not to reject Neon's certificate chain, or you'll
// see "self-signed certificate in certificate chain" errors.

const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] WARNING: DATABASE_URL is not set. Set it in backend/.env to your Neon connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  // Idle client errors shouldn't crash the whole server.
  console.error("[db] Unexpected error on idle client", err);
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("[db] query", { text, duration, rows: result.rowCount });
  }
  return result;
}

module.exports = { pool, query };
