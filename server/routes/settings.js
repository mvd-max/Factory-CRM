const express = require("express");
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

// ================= GET COMPANY SETTINGS =================
// ADMIN ONLY

router.get("/", isAdmin, (req, res) => {
  req.db.get(
    "SELECT * FROM company_settings WHERE id = 1",
    [],
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
          error: "Company settings not found",
        });
      }

      res.json(row);
    }
  );
});

// ================= UPDATE COMPANY SETTINGS =================
// ADMIN ONLY

router.put("/", isAdmin, (req, res) => {
  const {
    companyName,
    gstNumber,
    address,
    phone,
    email,
    website,
    logo,
  } = req.body;

  req.db.run(
    `UPDATE company_settings
     SET
       companyName=?,
       gstNumber=?,
       address=?,
       phone=?,
       email=?,
       website=?,
       logo=?
     WHERE id=1`,
    [
      companyName,
      gstNumber,
      address,
      phone,
      email,
      website,
      logo,
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
          error: "Company settings not found",
        });
      }

      res.json({
        success: true,
        message: "Company Settings Updated Successfully",
      });
    }
  );
});

module.exports = router;