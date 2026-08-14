const express = require("express");
const router = express.Router();
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

// ================= GET ALL CUSTOMERS =================

router.get("/", (req, res) => {
  const search = req.query.search || "";

  let sql = "SELECT * FROM customers";
  let params = [];

  if (search) {
    sql +=
      " WHERE customer_name LIKE ? OR company_name LIKE ? OR mobile LIKE ?";
    const keyword = `%${search}%`;
    params = [keyword, keyword, keyword];
  }

  sql += " ORDER BY id DESC";

  req.db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json(rows);
  });
});

// ================= GET CUSTOMER BY ID =================

router.get("/:id", (req, res) => {
  req.db.get(
    "SELECT * FROM customers WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!row) {
        return res
          .status(404)
          .json({ success: false, error: "Customer not found" });
      }

      res.json(row);
    }
  );
});

// ================= ADD CUSTOMER =================

 router.post("/", isAdmin, (req, res) => { 
  const {
    customer_name,
    company_name,
    gst_number,
    mobile,
    email,
    address,
    city,
    state,
    pincode,
    status,
  } = req.body;

  req.db.run(
    `INSERT INTO customers
    (
      customer_name,
      company_name,
      gst_number,
      mobile,
      email,
      address,
      city,
      state,
      pincode,
      status
    )
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      customer_name,
      company_name,
      gst_number,
      mobile,
      email,
      address,
      city,
      state,
      pincode,
      status || "Active",
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
        message: "Customer Added Successfully",
      });
    }
  );
});

// ================= UPDATE CUSTOMER =================

router.put("/:id", isAdmin, (req, res) => {
  const {
    customer_name,
    company_name,
    gst_number,
    mobile,
    email,
    address,
    city,
    state,
    pincode,
    status,
  } = req.body;

  req.db.run(
    `UPDATE customers SET
      customer_name=?,
      company_name=?,
      gst_number=?,
      mobile=?,
      email=?,
      address=?,
      city=?,
      state=?,
      pincode=?,
      status=?
      WHERE id=?`,
    [
      customer_name,
      company_name,
      gst_number,
      mobile,
      email,
      address,
      city,
      state,
      pincode,
      status,
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
        message: "Customer Updated Successfully",
      });
    }
  );
});

// ================= DELETE CUSTOMER =================

router.delete("/:id", isAdmin, (req, res) => {
  req.db.run(
    "DELETE FROM customers WHERE id=?",
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
        message: "Customer Deleted Successfully",
      });
    }
  );
});

module.exports = router;