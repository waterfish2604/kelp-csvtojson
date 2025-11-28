const dotenv = require("dotenv");
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  csvFilePath: process.env.CSV_FILE_PATH,
  db: {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
};

module.exports = { config };
