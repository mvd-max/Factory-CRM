const express = require("express");
const cors = require("cors");

const db = require("./db");

const itemsRoutes = require("./routes/items");
const suppliersRoutes = require("./routes/suppliers");
const purchasesRoutes = require("./routes/purchases");
const stockRoutes = require("./routes/stock");
const stockHistoryRoutes = require("./routes/stockHistory");
const reportsRoutes = require("./routes/reports");
const settingsRoutes = require("./routes/settings");
const salesRoutes = require("./routes/sales");
const customersRoutes = require("./routes/customers");
const usersRoutes = require("./routes/users");
const backupRoutes = require("./routes/backup");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/items", itemsRoutes);
app.use("/suppliers", suppliersRoutes);
app.use("/purchases", purchasesRoutes);
app.use("/stock", stockRoutes);
app.use("/stock-history", stockHistoryRoutes);
app.use("/reports", reportsRoutes);
app.use("/settings", settingsRoutes);
app.use("/sales", salesRoutes);
app.use("/customers", customersRoutes);
app.use("/users", usersRoutes);
app.use("/backup", backupRoutes);
app.use("/backup", backupRoutes);

app.listen(5000, () => {
  console.log("Server Running on https://stellan-erp-api.onrender.com");
});