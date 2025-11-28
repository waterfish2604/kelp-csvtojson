const express = require("express");
const { config } = require("./config/env");
const { testConnection } = require("./db");
const importRoute = require("./routes/routes");

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.send("OK");
});

// Our import route, prefixed with /api
app.use("/api", importRoute);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
  testConnection();
});
