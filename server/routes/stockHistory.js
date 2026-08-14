const express = require("express");
const router = express.Router();

// ================= GET STOCK HISTORY =================

router.get("/", (req, res) => {
  req.db.all(
    `
    SELECT
      id,
      company,
      modelNo,
      movementType,
      qty,
      remark,
      createdBy,
      created_at
    FROM stock_movements
    ORDER BY created_at DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
});

module.exports = router;