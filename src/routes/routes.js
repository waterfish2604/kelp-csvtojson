const express = require("express");
const { importUsersFromCsv } = require("../services/import");

const router = express.Router();

router.post("/import", async (req, res) => {
  try {
    const stats = await importUsersFromCsv();
    res.status(200).json({
      message: "Import completed",
      stats,
    });
  } catch (err) {
    console.error("Import failed:", err.message);
    res.status(500).json({
      message: "Import failed",
      error: err.message,
    });
  }
});

module.exports = router;
