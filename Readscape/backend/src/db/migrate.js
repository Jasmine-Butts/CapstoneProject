// src/db/migrate.js
//
// Applies schema.sql to whatever DATABASE_URL points at.
// Run with:  npm run db:migrate

const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");

async function migrate() {
  const sqlPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("[migrate] Applying schema.sql to Neon...");
  await pool.query(sql);
  console.log("[migrate] Done. Tables ready: books, book_searches");
  await pool.end();
}

migrate().catch((err) => {
  console.error("[migrate] Failed:", err);
  process.exit(1);
});
