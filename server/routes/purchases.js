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

// ================= GET ALL PURCHASES =================

router.get("/", (req, res) => {
  const sql = `
    SELECT
      purchases.*,
      suppliers.company AS supplier_name
    FROM purchases
    LEFT JOIN suppliers
      ON purchases.supplier_id = suppliers.id
    ORDER BY purchases.id DESC
  `;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json(rows);
  });
});

// ================= GET COMPANIES =================

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

// ================= GET SINGLE PURCHASE =================

router.get("/:id", (req, res) => {
  req.db.get(
    "SELECT * FROM purchases WHERE id = ?",
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
          error: "Purchase not found",
        });
      }

      res.json(row);
    }
  );
});

// ================= ADD PURCHASE =================

router.post("/", isAdmin, (req, res) => {
  const {
    purchase_date,
    invoice_no,
    supplier_id,
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

  const createdBy = req.headers["x-user-name"] || "System";

  if (!company_name || !model_no || !qty || Number(qty) <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid purchase data",
    });
  }

  // Check item exists
  req.db.get(
    `SELECT id FROM items
     WHERE company = ? AND modelNo = ?`,
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

      // Insert Purchase
      const sql = `
        INSERT INTO purchases (
          purchase_date,
          invoice_no,
          supplier_id,
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
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;

      req.db.run(
        sql,
        [
          purchase_date,
          invoice_no,
          supplier_id,
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

          const purchaseId = this.lastID;

          // Increase Stock
          req.db.run(
            `UPDATE items
             SET openingStock = openingStock + ?
             WHERE company = ? AND modelNo = ?`,
            [Number(qty), company_name, model_no],
            function (stockErr) {
              if (stockErr) {
                return res.status(500).json({
                  success: false,
                  error: stockErr.message,
                });
              }

              // Save Stock History
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
                  company_name,
                  model_no,
                  "IN",
                  Number(qty),
                  `Purchase - Invoice ${invoice_no}`,
                  createdBy,
                ],
                function (historyErr) {
                  if (historyErr) {
                    return res.status(500).json({
                      success: false,
                      error: historyErr.message,
                    });
                  }

                  res.json({
                    success: true,
                    message: "Purchase Added Successfully",
                    id: purchaseId,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ================= UPDATE PURCHASE =================

router.put("/:id", isAdmin, (req, res) => {
  const purchaseId = req.params.id;

  const {
    purchase_date,
    invoice_no,
    supplier_id,
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

  const createdBy = req.headers["x-user-name"] || "System";

  if (!company_name || !model_no || !qty || Number(qty) <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid purchase data",
    });
  }

  // Get old purchase
  req.db.get(
    "SELECT * FROM purchases WHERE id = ?",
    [purchaseId],
    (err, oldPurchase) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!oldPurchase) {
        return res.status(404).json({
          success: false,
          error: "Purchase not found",
        });
      }

      // Restore old stock
      req.db.run(
        `UPDATE items
         SET openingStock = openingStock + ?
         WHERE company = ? AND modelNo = ?`,
        [
          Number(oldPurchase.qty),
          oldPurchase.company_name,
          oldPurchase.model_no,
        ],
        (restoreErr) => {
          if (restoreErr) {
            return res.status(500).json({
              success: false,
              error: restoreErr.message,
            });
          }

          // Check new item
          req.db.get(
            `SELECT id FROM items
             WHERE company = ? AND modelNo = ?`,
            [company_name, model_no],
            (itemErr, item) => {
              if (itemErr) {
                return res.status(500).json({
                  success: false,
                  error: itemErr.message,
                });
              }

              if (!item) {
                return res.status(404).json({
                  success: false,
                  error: "New item not found",
                });
              }

              // Add new stock
              req.db.run(
                `UPDATE items
                 SET openingStock = openingStock + ?
                 WHERE company = ? AND modelNo = ?`,
                [Number(qty), company_name, model_no],
                (stockErr) => {
                  if (stockErr) {
                    return res.status(500).json({
                      success: false,
                      error: stockErr.message,
                    });
                  }

                  // Update Purchase
                  req.db.run(
                    `UPDATE purchases SET
                      purchase_date=?,
                      invoice_no=?,
                      supplier_id=?,
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
                      purchase_date,
                      invoice_no,
                      supplier_id,
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
                      purchaseId,
                    ],
                    function (updateErr) {
                      if (updateErr) {
                        return res.status(500).json({
                          success: false,
                          error: updateErr.message,
                        });
                      }

                      // Save Edit History
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
                          company_name,
                          model_no,
                          "IN",
                          Number(qty),
                          `Purchase Updated - Invoice ${invoice_no}`,
                          createdBy,
                        ],
                        function (historyErr) {
                          if (historyErr) {
                            return res.status(500).json({
                              success: false,
                              error: historyErr.message,
                            });
                          }

                          res.json({
                            success: true,
                            message: "Purchase Updated Successfully",
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
    }
  );
});

// ================= DELETE PURCHASE =================

router.delete("/:id", isAdmin, (req, res) => {
  const purchaseId = req.params.id;

  const createdBy = req.headers["x-user-name"] || "System";

  req.db.get(
    "SELECT * FROM purchases WHERE id = ?",
    [purchaseId],
    (err, purchase) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!purchase) {
        return res.status(404).json({
          success: false,
          error: "Purchase not found",
        });
      }

      // Check current stock before reducing
      req.db.get(
        `SELECT openingStock
         FROM items
         WHERE company = ? AND modelNo = ?`,
        [purchase.company_name, purchase.model_no],
        (stockCheckErr, item) => {
          if (stockCheckErr) {
            return res.status(500).json({
              success: false,
              error: stockCheckErr.message,
            });
          }

          if (!item) {
            return res.status(404).json({
              success: false,
              error: "Item not found",
            });
          }

          if (Number(item.openingStock) < Number(purchase.qty)) {
            return res.status(400).json({
              success: false,
              error:
                "Purchase cannot be deleted because current stock is less than purchase quantity.",
            });
          }

          // Reduce stock
          req.db.run(
            `UPDATE items
             SET openingStock = openingStock - ?
             WHERE company = ? AND modelNo = ?`,
            [
              Number(purchase.qty),
              purchase.company_name,
              purchase.model_no,
            ],
            (stockErr) => {
              if (stockErr) {
                return res.status(500).json({
                  success: false,
                  error: stockErr.message,
                });
              }

              // Delete Purchase
              req.db.run(
                "DELETE FROM purchases WHERE id = ?",
                [purchaseId],
                function (deleteErr) {
                  if (deleteErr) {
                    return res.status(500).json({
                      success: false,
                      error: deleteErr.message,
                    });
                  }

                  // Save Delete History
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
                      purchase.company_name,
                      purchase.model_no,
                      "OUT",
                      Number(purchase.qty),
                      `Purchase Deleted - Invoice ${purchase.invoice_no}`,
                      createdBy,
                    ],
                    function (historyErr) {
                      if (historyErr) {
                        return res.status(500).json({
                          success: false,
                          error: historyErr.message,
                        });
                      }

                      res.json({
                        success: true,
                        message: "Purchase Deleted Successfully",
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

module.exports = router;