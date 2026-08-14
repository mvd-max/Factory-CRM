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

// ================= LOGIN =================

router.post("/login", (req, res) => {
  const db = req.db;

  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users
     WHERE username = ?
     AND password = ?
     AND status = 'Active'`,
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!row) {
        return res.status(401).json({
          success: false,
          message: "Invalid Username or Password",
        });
      }

      res.json({
        success: true,
        user: row,
      });
    }
  );
});
// ================= GET USERS =================
// ADMIN ONLY

router.get("/", isAdmin, (req, res) => {
  const db = req.db;

  db.all(
    "SELECT * FROM users ORDER BY id DESC",
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

// ================= ADD USER =================
// ADMIN ONLY

router.post("/", isAdmin, (req, res) => {
  const db = req.db;

  const {
    full_name,
    username,
    password,
    role,
    status,
  } = req.body;

  if (
    !full_name ||
    !username ||
    !password ||
    !role ||
    !status
  ) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  db.run(
    `INSERT INTO users
    (
      full_name,
      username,
      password,
      role,
      status
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      full_name,
      username,
      password,
      role,
      status,
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
        message: "User Added Successfully",
      });
    }
  );
});
// ================= CHANGE PASSWORD =================
// ADMIN ONLY

router.post("/password-change", isAdmin, (req, res) => {
  const db = req.db;

  const { username, currentPassword, newPassword } = req.body;

  console.log("PASSWORD CHANGE REQUEST:", {
    username,
    hasCurrentPassword: !!currentPassword,
    hasNewPassword: !!newPassword,
  });

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: "All password fields are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: "New password must be at least 6 characters",
    });
  }

  db.get(
    `SELECT id FROM users
     WHERE username = ?
     AND password = ?
     AND status = 'Active'`,
    [username, currentPassword],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!row) {
        return res.status(401).json({
          success: false,
          error: "Current password is incorrect",
        });
      }

      db.run(
        `UPDATE users
         SET password = ?
         WHERE username = ?`,
        [newPassword, username],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: err.message,
            });
          }

          res.json({
            success: true,
            message: "Password Changed Successfully",
          });
        }
      );
    }
  );
});
// ================= UPDATE USER =================
// ADMIN ONLY

router.put("/:id", isAdmin, (req, res) => {
  const db = req.db;

  const {
    full_name,
    username,
    password,
    role,
    status,
  } = req.body;

  if (
    !full_name ||
    !username ||
    !role ||
    !status
  ) {
    return res.status(400).json({
      success: false,
      error: "Required fields are missing",
    });
  }

  db.run(
    `UPDATE users
     SET
       full_name=?,
       username=?,
       password=?,
       role=?,
       status=?
     WHERE id=?`,
    [
      full_name,
      username,
      password,
      role,
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

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User Updated Successfully",
      });
    }
  );
});

// ================= DELETE USER =================
// ADMIN ONLY

router.delete("/:id", isAdmin, (req, res) => {
  const db = req.db;

  db.run(
    "DELETE FROM users WHERE id=?",
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
          error: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User Deleted Successfully",
      });
    }
  );
});

module.exports = router;