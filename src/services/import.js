const { streamCsv } = require("../utils/parser");
const { buildObjectFromRow, toUserRecord } = require("../utils/userMapping");
const { pool } = require("../db");
const { config } = require("../config/env");

async function importUsersFromCsv() {
  if (!config.csvFilePath) {
    throw new Error("CSV_FILE_PATH is not configured in .env");
  }

  const client = await pool.connect();

  let headers = null;
  let total = 0;

  // Age buckets
  let lt20 = 0;
  let btw20_40 = 0;
  let btw40_60 = 0;
  let gt60 = 0;

  try {
    await client.query("BEGIN");

    // Read CSV line by line
    for await (const row of streamCsv(config.csvFilePath)) {
      if (!headers) {
        // First line is header
        headers = row;
        continue;
      }

      // Build nested object from this row
      const nested = buildObjectFromRow(headers, row);

      // Convert nested object to DB record
      const userRecord = toUserRecord(nested);
      const { name, age, address, additional_info } = userRecord;

      // Insert into DB
      await client.query(
        `INSERT INTO public.users("name", age, address, additional_info)
         VALUES ($1, $2, $3, $4)`,
        [
          name,
          age,
          address ? JSON.stringify(address) : null,
          additional_info ? JSON.stringify(additional_info) : null,
        ]
      );

      // Update age buckets
      if (age < 20) lt20++;
      else if (age < 40) btw20_40++;
      else if (age <= 60) btw40_60++;
      else gt60++;

      total++;
    }

    await client.query("COMMIT");

    // Print distribution
    printAgeDistribution({ total, lt20, btw20_40, btw40_60, gt60 });

    return { total, lt20, btw20_40, btw40_60, gt60 };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error importing CSV:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

function printAgeDistribution({ total, lt20, btw20_40, btw40_60, gt60 }) {
  const pct = (count) =>
    total === 0 ? 0 : Number(((count / total) * 100).toFixed(2));

  console.log("Age-Group % Distribution");
  console.log(`< 20      ${pct(lt20)}`);
  console.log(`20 to 40  ${pct(btw20_40)}`);
  console.log(`40 to 60  ${pct(btw40_60)}`);
  console.log(`> 60      ${pct(gt60)}`);
}

module.exports = { importUsersFromCsv };
