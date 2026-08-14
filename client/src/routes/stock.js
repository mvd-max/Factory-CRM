const express = require("express");
const router = express.Router();

// ================= CHECK USER ROLE =================

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
  const { company, modelNo, qty } = req.body;

  if (!company || !modelNo || !qty || qty <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid data",
    });
  }

  req.db.get(
    `SELECT id
     FROM items
     WHERE company = ? AND modelNo = ?`,
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

      req.db.run(
        `UPDATE items
         SET openingStock = openingStock + ?
         WHERE company = ? AND modelNo = ?`,
        [qty, company, modelNo],
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
});

// ================= STOCK OUT =================

router.post("/out", isLoggedIn, (req, res) => {
  const { company, modelNo, qty } = req.body;

  if (!company || !modelNo || !qty || qty <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid data",
    });
  }

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

      if (row.openingStock < qty) {
        return res.status(400).json({
          success: false,
          error: "Insufficient Stock",
        });
      }

      req.db.run(
        `UPDATE items
         SET openingStock = openingStock - ?
         WHERE company = ? AND modelNo = ?`,
        [qty, company, modelNo],
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
});

module.exports = router;