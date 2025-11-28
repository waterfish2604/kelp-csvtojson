const { Pool } = require("pg");
const { config } = require("../config/env");

const pool = new Pool(config.db);

async function testConnection() {
  try {
    const res = await pool.query("SELECT 1 AS value");
    console.log("DB connection OK, test value:", res.rows[0].value);
  } catch (err) {
    console.error("DB connection FAILED:", err.message);
  }
}

module.exports = { pool, testConnection };
