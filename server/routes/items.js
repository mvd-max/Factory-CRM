const express = require("express");
const router = express.Router();

// ================= CHECK ADMIN =================

function isAdmin(req, res, next) {
  const role = req.headers["x-user-role"];

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access Denied",
    });
  }

  next();
}

// ================= GET ALL ITEMS =================

router.get("/", (req, res) => {
  req.db.all(
    "SELECT * FROM items ORDER BY id DESC",
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

// ================= GET ALL COMPANIES =================

router.get("/companies", (req, res) => {
  req.db.all(
    "SELECT DISTINCT company FROM items ORDER BY company",
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

// ================= GET MODELS BY COMPANY =================

router.get("/models/:company", (req, res) => {
  req.db.all(
    `
    SELECT
      modelNo,
      hsnCode,
      unit
    FROM items
    WHERE company = ?
    ORDER BY modelNo
    `,
    [req.params.company],
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

// ================= GET SINGLE ITEM =================

router.get("/:id", (req, res) => {
  req.db.get(
    "SELECT * FROM items WHERE id = ?",
    [req.params.id],
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

      res.json(row);
    }
  );
});

// ================= ADD ITEM =================

router.post("/", isAdmin, (req, res) => {
  console.log("REQ BODY:", req.body);

  const {
    company,
    modelNo,
    hsnCode,
    itemCode,
    itemName,
    category,
    unit,
    purchasePrice,
    openingStock,
    minimumStock,
  } = req.body;

  req.db.run(
    `
    INSERT INTO items
    (
      company,
      modelNo,
      hsnCode,
      itemCode,
      itemName,
      category,
      unit,
      purchasePrice,
      openingStock,
      minimumStock
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      company,
      modelNo,
      hsnCode,
      itemCode,
      itemName,
      category,
      unit,
      purchasePrice,
      openingStock,
      minimumStock,
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
        id: this.lastID,
        message: "Item Added Successfully",
      });
    }
  );
});

// ================= UPDATE ITEM =================

router.put("/:id", isAdmin, (req, res) => {
  const {
    company,
    modelNo,
    hsnCode,
    itemCode,
    itemName,
    category,
    unit,
    purchasePrice,
    openingStock,
    minimumStock,
  } = req.body;

  req.db.run(
    `
    UPDATE items SET
      company = ?,
      modelNo = ?,
      hsnCode = ?,
      itemCode = ?,
      itemName = ?,
      category = ?,
      unit = ?,
      purchasePrice = ?,
      openingStock = ?,
      minimumStock = ?
    WHERE id = ?
    `,
    [
      company,
      modelNo,
      hsnCode,
      itemCode,
      itemName,
      category,
      unit,
      purchasePrice,
      openingStock,
      minimumStock,
      req.params.id,
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
        message: "Item Updated Successfully",
      });
    }
  );
});

// ================= DELETE ITEM =================

router.delete("/:id", isAdmin, (req, res) => {
  req.db.run(
    "DELETE FROM items WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Item Deleted Successfully",
      });
    }
  );
});

module.exports = router;