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

// ================= GET ALL SALES =================

router.get("/", (req, res) => {
  req.db.all(
    "SELECT * FROM sales ORDER BY id DESC",
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
// ================= GET SINGLE SALE =================

router.get("/:id", (req, res) => {
  req.db.get(
    "SELECT * FROM sales WHERE id=?",
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
          error: "Sale not found",
        });
      }

      res.json(row);
    }
  );
});

// ================= ADD SALE =================

router.post("/", isAdmin, (req, res) => {
  const {
    sale_date,
    invoice_no,
    customer_name,
    company_name,
    model_no,
    hsn_code,
    unit,
    qty,
    unit_price,
    discount,
    discounted_price,
    cgst,
    sgst,
    amount,
  } = req.body;

  req.db.get(
    `SELECT openingStock
     FROM items
     WHERE company=? AND modelNo=?`,
    [company_name, model_no],
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

      if (item.openingStock < qty) {
        return res.status(400).json({
          success: false,
          error: "Insufficient Stock",
        });
      }

      req.db.run(
        `INSERT INTO sales
        (
          sale_date,
          invoice_no,
          customer_name,
          company_name,
          model_no,
          hsn_code,
          unit,
          qty,
          unit_price,
          discount,
          discounted_price,
          cgst,
          sgst,
          amount
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          sale_date,
          invoice_no,
          customer_name,
          company_name,
          model_no,
          hsn_code,
          unit,
          qty,
          unit_price,
          discount,
          discounted_price,
          cgst,
          sgst,
          amount,
        ],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: err.message,
            });
          }

          req.db.run(
            `UPDATE items
             SET openingStock = openingStock - ?
             WHERE company=? AND modelNo=?`,
            [qty, company_name, model_no],
            (err) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  error: err.message,
                });
              }

              res.json({
                success: true,
                message: "Sale Added Successfully",
                id: this.lastID,
              });
            }
          );
        }
      );
    }
  );
});

// ================= UPDATE SALE =================

router.put("/:id", isAdmin, (req, res) => {
  const {
    sale_date,
    invoice_no,
    customer_name,
    company_name,
    model_no,
    hsn_code,
    unit,
    qty,
    unit_price,
    discount,
    discounted_price,
    cgst,
    sgst,
    amount,
  } = req.body;

  // Get old sale
  req.db.get(
    "SELECT * FROM sales WHERE id=?",
    [req.params.id],
    (err, oldSale) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!oldSale) {
        return res
          .status(404)
          .json({ success: false, error: "Sale not found" });
      }

      // Restore old stock
      req.db.run(
        `UPDATE items
         SET openingStock = openingStock + ?
         WHERE company=? AND modelNo=?`,
        [oldSale.qty, oldSale.company_name, oldSale.model_no],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, error: err.message });
          }

          // Check new stock
          req.db.get(
            `SELECT openingStock
             FROM items
             WHERE company=? AND modelNo=?`,
            [company_name, model_no],
            (err, item) => {
              if (err) {
                return res
                  .status(500)
                  .json({ success: false, error: err.message });
              }

              if (!item || item.openingStock < qty) {
                return res.status(400).json({
                  success: false,
                  error: "Insufficient Stock",
                });
              }

              // Update sale
              req.db.run(
                `UPDATE sales SET
                  sale_date=?,
                  invoice_no=?,
                  customer_name=?,
                  company_name=?,
                  model_no=?,
                  hsn_code=?,
                  unit=?,
                  qty=?,
                  unit_price=?,
                  discount=?,
                  discounted_price=?,
                  cgst=?,
                  sgst=?,
                  amount=?
                 WHERE id=?`,
                [
                  sale_date,
                  invoice_no,
                  customer_name,
                  company_name,
                  model_no,
                  hsn_code,
                  unit,
                  qty,
                  unit_price,
                  discount,
                  discounted_price,
                  cgst,
                  sgst,
                  amount,
                  req.params.id,
                ],
                (err) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ success: false, error: err.message });
                  }

                  // Deduct new stock
                  req.db.run(
                    `UPDATE items
                     SET openingStock = openingStock - ?
                     WHERE company=? AND modelNo=?`,
                    [qty, company_name, model_no],
                    (err) => {
                      if (err) {
                        return res
                          .status(500)
                          .json({ success: false, error: err.message });
                      }

                      res.json({
                        success: true,
                        message: "Sale Updated Successfully",
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});
// ================= DELETE SALE =================

router.delete("/:id", isAdmin, (req, res) => {
  req.db.get(
    "SELECT * FROM sales WHERE id=?",
    [req.params.id],
    (err, sale) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!sale) {
        return res.status(404).json({
          success: false,
          error: "Sale not found",
        });
      }

      // Restore Stock
      req.db.run(
        `UPDATE items
         SET openingStock = openingStock + ?
         WHERE company=? AND modelNo=?`,
        [sale.qty, sale.company_name, sale.model_no],
        (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: err.message,
            });
          }

          // Delete Sale
          req.db.run(
            "DELETE FROM sales WHERE id=?",
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
                message: "Sale Deleted Successfully",
              });
            }
          );
        }
      );
    }
  );
});
module.exports = router;