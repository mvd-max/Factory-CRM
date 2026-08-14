const express = require("express");
const router = express.Router();

// ================= ADMIN PERMISSION =================

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

// ================= GET ALL SUPPLIERS =================

router.get("/", (req, res) => {
  req.db.all(
    "SELECT * FROM suppliers ORDER BY id DESC",
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

// ================= GET SINGLE SUPPLIER =================

router.get("/:id", (req, res) => {
  req.db.get(
    "SELECT * FROM suppliers WHERE id = ?",
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
          error: "Supplier not found",
        });
      }

      res.json(row);
    }
  );
});

// ================= ADD SUPPLIER =================

router.post("/", isAdmin, (req, res) => {
  const {
    company,
    person,
    mobile,
    email,
    gst,
    address,
    city,
  } = req.body;

  req.db.run(
    `INSERT INTO suppliers
    (
      company,
      person,
      mobile,
      email,
      gst,
      address,
      city
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      company,
      person,
      mobile,
      email,
      gst,
      address,
      city,
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
        message: "Supplier Added Successfully",
        id: this.lastID,
      });
    }
  );
});

// ================= UPDATE SUPPLIER =================

router.put("/:id", isAdmin, (req, res) => {
  const {
    company,
    person,
    mobile,
    email,
    gst,
    address,
    city,
  } = req.body;

  req.db.run(
    `UPDATE suppliers SET
      company=?,
      person=?,
      mobile=?,
      email=?,
      gst=?,
      address=?,
      city=?
    WHERE id=?`,
    [
      company,
      person,
      mobile,
      email,
      gst,
      address,
      city,
      req.params.id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "Supplier not found",
        });
      }

      res.json({
        success: true,
        message: "Supplier Updated Successfully",
      });
    }
  );
});

// ================= DELETE SUPPLIER =================

router.delete("/:id", isAdmin, (req, res) => {
  req.db.run(
    "DELETE FROM suppliers WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "Supplier not found",
        });
      }

      res.json({
        success: true,
        message: "Supplier Deleted Successfully",
      });
    }
  );
});

module.exports = router;