const express = require("express");
const router = express.Router();

// ================= LOGIN CHECK =================

function isLoggedIn(req, res, next) {
  const role = req.headers["x-user-role"];

  if (!role) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  req.userRole = role;
  next();
}

// ================= REPORT =================

router.get("/", isLoggedIn, (req, res) => {
  const db = req.db;

  // Date filter
  const { from, to } = req.query;

  const report = {};

  // ================= TOTAL ITEMS =================

  db.get(
    "SELECT COUNT(*) AS totalItems FROM items",
    (err, items) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      report.totalItems = items.totalItems || 0;

      // ================= TOTAL SUPPLIERS =================

      db.get(
        "SELECT COUNT(*) AS totalSuppliers FROM suppliers",
        (err, suppliers) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: err.message,
            });
          }

          report.totalSuppliers =
            suppliers.totalSuppliers || 0;

          // ================= TOTAL PURCHASES =================

          let purchaseSql =
            "SELECT COUNT(*) AS totalPurchases FROM purchases";

          let purchaseParams = [];

          if (from && to) {
            purchaseSql +=
              " WHERE DATE(purchase_date) BETWEEN DATE(?) AND DATE(?)";

            purchaseParams = [from, to];
          }

          db.get(
            purchaseSql,
            purchaseParams,
            (err, purchases) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  error: err.message,
                });
              }

              report.totalPurchases =
                purchases.totalPurchases || 0;

              // ================= TOTAL STOCK =================

              db.get(
                "SELECT COALESCE(SUM(openingStock),0) AS totalStock FROM items",
                (err, stock) => {
                  if (err) {
                    return res.status(500).json({
                      success: false,
                      error: err.message,
                    });
                  }

                  report.totalStock =
                    stock.totalStock || 0;

                  // ================= INVENTORY VALUE =================

                  db.get(
                    `
                    SELECT
                      COALESCE(
                        SUM(openingStock * purchasePrice),
                        0
                      ) AS inventoryValue
                    FROM items
                    `,
                    (err, value) => {
                      if (err) {
                        return res.status(500).json({
                          success: false,
                          error: err.message,
                        });
                      }

                      report.inventoryValue =
                        value.inventoryValue || 0;

                      // ================= LOW STOCK =================

                      db.get(
                        `
                        SELECT COUNT(*) AS lowStock
                        FROM items
                        WHERE openingStock <= minimumStock
                        `,
                        (err, low) => {
                          if (err) {
                            return res.status(500).json({
                              success: false,
                              error: err.message,
                            });
                          }

                          report.lowStock =
                            low.lowStock || 0;

                          // ================= LOW STOCK ITEMS =================

                          db.all(
                            `
                            SELECT *
                            FROM items
                            WHERE openingStock <= minimumStock
                            ORDER BY openingStock ASC
                            `,
                            (err, lowItems) => {
                              if (err) {
                                return res.status(500).json({
                                  success: false,
                                  error: err.message,
                                });
                              }

                              report.lowStockItems =
                                lowItems;

                              // ================= RECENT PURCHASES =================

                              db.all(
                                `
                                SELECT *
                                FROM purchases
                                ORDER BY id DESC
                                LIMIT 10
                                `,
                                (err, purchasesList) => {
                                  if (err) {
                                    return res.status(500).json({
                                      success: false,
                                      error: err.message,
                                    });
                                  }

                                  report.recentPurchases =
                                    purchasesList;

                                  // ================= CATEGORY WISE STOCK =================

                                  db.all(
                                    `
                                    SELECT
                                      category,
                                      COALESCE(
                                        SUM(openingStock),
                                        0
                                      ) AS stock
                                    FROM items
                                    GROUP BY category
                                    ORDER BY category
                                    `,
                                    (err, categoryData) => {
                                      if (err) {
                                        return res.status(500).json({
                                          success: false,
                                          error: err.message,
                                        });
                                      }

                                      report.categoryWiseStock =
                                        categoryData;

                                      // ================= TODAY STOCK IN =================

                                      const today =
                                        new Date()
                                          .toISOString()
                                          .split("T")[0];

                                      let stockInSql = `
                                        SELECT
                                          COALESCE(SUM(qty),0)
                                          AS todayStockIn
                                        FROM stock_movements
                                        WHERE movementType='IN'
                                      `;

                                      let stockInParams = [];

                                      if (from && to) {
                                        stockInSql += `
                                          AND DATE(created_at)
                                          BETWEEN DATE(?) AND DATE(?)
                                        `;

                                        stockInParams = [
                                          from,
                                          to,
                                        ];
                                      } else {
                                        stockInSql += `
                                          AND DATE(created_at)=?
                                        `;

                                        stockInParams = [
                                          today,
                                        ];
                                      }

                                      db.get(
                                        stockInSql,
                                        stockInParams,
                                        (err, stockIn) => {
                                          if (err) {
                                            return res.status(500).json({
                                              success: false,
                                              error: err.message,
                                            });
                                          }

                                          report.todayStockIn =
                                            stockIn.todayStockIn || 0;

                                          // ================= TODAY STOCK OUT =================

                                          let stockOutSql = `
                                            SELECT
                                              COALESCE(SUM(qty),0)
                                              AS todayStockOut
                                            FROM stock_movements
                                            WHERE movementType='OUT'
                                          `;

                                          let stockOutParams = [];

                                          if (from && to) {
                                            stockOutSql += `
                                              AND DATE(created_at)
                                              BETWEEN DATE(?) AND DATE(?)
                                            `;

                                            stockOutParams = [
                                              from,
                                              to,
                                            ];
                                          } else {
                                            stockOutSql += `
                                              AND DATE(created_at)=?
                                            `;

                                            stockOutParams = [
                                              today,
                                            ];
                                          }

                                          db.get(
                                            stockOutSql,
                                            stockOutParams,
                                            (err, stockOut) => {
                                              if (err) {
                                                return res.status(500).json({
                                                  success: false,
                                                  error: err.message,
                                                });
                                              }

                                              report.todayStockOut =
                                                stockOut.todayStockOut || 0;

                                              // ================= FINAL RESPONSE =================

                                              res.json(report);
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