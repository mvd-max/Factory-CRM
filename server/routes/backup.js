const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ================= ADMIN PERMISSION =================

function isAdmin(req, res, next) {
  const role = req.headers["x-user-role"];

  if (!role) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  next();
}

// ================= DOWNLOAD DATABASE BACKUP =================

router.get("/download", isAdmin, (req, res) => {
  try {
    const databasePath = path.resolve("./inventory.db");

    if (!fs.existsSync(databasePath)) {
      return res.status(404).json({
        success: false,
        error: "Database file not found",
      });
    }

    const date = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "");

    const fileName = `STELLAN_ERP_Backup_${date}.db`;

    res.download(databasePath, fileName, (err) => {
      if (err) {
        console.error("Backup Download Error:", err.message);
      }
    });
  } catch (err) {
    console.error("Backup Error:", err);

    res.status(500).json({
      success: false,
      error: "Backup failed",
    });
  }
});

module.exports = router;