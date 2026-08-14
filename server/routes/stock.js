const express = require("express");
const router = express.Router();

// ================= ADMIN CHECK =================

function isLoggedIn(req, res, next) {
  const role = req.headers["x-user-role"];

  if (!role) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  next();
}

// ================= STOCK IN =================

router.post("/in", isLoggedIn, (req, res) => {
  const { company, modelNo, qty, remark, createdBy } = req.body;

  if (!company || !modelNo || !qty || Number(qty) <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid data",
    });
  }

  // Check item exists
  req.db.get(
    `SELECT id FROM items WHERE company = ? AND modelNo = ?`,
    [company, modelNo],
    (err, item) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!item) {
        return res.status(404).json({
          success: false,
          error: "Item not found",
        });
      }

      // Increase stock
      req.db.run(
        `UPDATE items
         SET openingStock = openingStock + ?
         WHERE company = ? AND modelNo = ?`,
        [Number(qty), company, modelNo],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: err.message,
            });
          }

          // Save history
          req.db.run(
            `INSERT INTO stock_movements
            (
              company,
              modelNo,
              movementType,
              qty,
              remark,
              createdBy
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              company,
              modelNo,
              "IN",
              Number(qty),
              remark || "Purchase",
              createdBy || "System",
            ],
            function (err) {
              if (err) {
                return res.status(500).json({
                  success: false,
                  error: err.message,
                });
              }

              res.json({
                success: true,
                message: "Stock In Successful",
              });
            }
          );
        }
      );
    }
  );
});

// ================= STOCK OUT =================

router.post("/out", isLoggedIn, (req, res) => {
  const { company, modelNo, qty, remark, createdBy } = req.body;

  if (!company || !modelNo || !qty || Number(qty) <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid data",
    });
  }

  // Check current stock
  req.db.get(
    `SELECT openingStock
     FROM items
     WHERE company = ? AND modelNo = ?`,
    [company, modelNo],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: "Item not found",
        });
      }

      if (Number(row.openingStock) < Number(qty)) {
        return res.status(400).json({
          success: false,
          error: "Insufficient Stock",
        });
      }

      // Decrease stock
      req.db.run(
        `UPDATE items
         SET openingStock = openingStock - ?
         WHERE company = ? AND modelNo = ?`,
        [Number(qty), company, modelNo],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: err.message,
            });
          }

          // Save history
          req.db.run(
            `INSERT INTO stock_movements
            (
              company,
              modelNo,
              movementType,
              qty,
              remark,
              createdBy
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              company,
              modelNo,
              "OUT",
              Number(qty),
              remark || "Production",
              createdBy || "System",
            ],
            function (err) {
              if (err) {
                return res.status(500).json({
                  success: false,
                  error: err.message,
                });
              }

              res.json({
                success: true,
                message: "Stock Out Successful",
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;