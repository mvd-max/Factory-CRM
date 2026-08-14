  const sqlite3 = require("sqlite3").verbose();

  const db = new sqlite3.Database("./inventory.db", (err) => {
    if (err) {
      console.error("❌ Database Error:", err.message);
    } else {
      console.log("✅ Connected to SQLite Database");
    }
  });

  // ================= ITEMS TABLE =================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT,
      modelNo TEXT,
      hsnCode TEXT,
      itemCode TEXT,
      itemName TEXT,
      category TEXT,
      unit TEXT,
      purchasePrice REAL,
      sellingPrice REAL,
      openingStock INTEGER,
      minimumStock INTEGER
  )
  `,
    (err) => {
      if (err) {
        console.error(err);
      } else {
        db.run("ALTER TABLE items ADD COLUMN company TEXT", (err) => {
          if (err && !err.message.includes("duplicate column name")) {
            console.error(err.message);
          }
        });

        db.run("ALTER TABLE items ADD COLUMN modelNo TEXT", (err) => {
          if (err && !err.message.includes("duplicate column name")) {
            console.error(err.message);
          }
        });

        db.run("ALTER TABLE items ADD COLUMN hsnCode TEXT", (err) => {
          if (err && !err.message.includes("duplicate column name")) {
            console.error(err.message);
          }
        });
      }
    }
  );

  // ================= COMPANY SETTINGS TABLE =================

  db.run(`
  CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyName TEXT,
      gstNumber TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      logo TEXT
  )
  `);

  db.run(`
  INSERT OR IGNORE INTO company_settings (
      id,
      companyName,
      gstNumber,
      address,
      phone,
      email,
      website,
      logo
  )
  VALUES (
      1,
      'STELLAN TECH INNOVATIONS PVT. LTD.',
      '',
      '',
      '',
      '',
      '',
      ''
  )
  `);

  // ================= SUPPLIERS TABLE =================

  db.run(`
  CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      person TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT,
      gst TEXT,
      address TEXT,
      city TEXT
  )
  `);

  // ================= PURCHASES TABLE =================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_date TEXT NOT NULL,
      invoice_no TEXT NOT NULL,
      supplier_id INTEGER,
      company_name TEXT,
      model_no TEXT,
      hsn_code TEXT,
      unit TEXT,
      qty INTEGER DEFAULT 0,
      unit_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      discounted_price REAL DEFAULT 0,
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      amount REAL DEFAULT 0,  
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `,
    (err) => {
      if (err) {
        console.error("CREATE PURCHASE TABLE ERROR:", err.message);
      } else {
        console.log("✅ Purchases table ready");
      }
    }
  );
  // ================= CUSTOMERS TABLE =================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      company_name TEXT,
      gst_number TEXT,
      mobile TEXT NOT NULL,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `,
    (err) => {
      if (err) {
        console.error("CREATE CUSTOMERS TABLE ERROR:", err.message);
      } else {
        console.log("✅ Customers table ready");
      }
    }
  );
  // ================= SALES TABLE =================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date TEXT NOT NULL,
      invoice_no TEXT NOT NULL,
      customer_name TEXT NOT NULL,

      company_name TEXT,
      model_no TEXT,
      hsn_code TEXT,
      unit TEXT,

      qty INTEGER DEFAULT 0,
      unit_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      discounted_price REAL DEFAULT 0,
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      amount REAL DEFAULT 0,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `,
    (err) => {
      if (err) {
        console.error("CREATE SALES TABLE ERROR:", err.message);
      } else {
        console.log("✅ Sales table ready");
      }
    }
  );
  // ================= STOCK MOVEMENTS TABLE =================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      modelNo TEXT NOT NULL,
      movementType TEXT NOT NULL,
      qty INTEGER NOT NULL,
      remark TEXT,
      createdBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `,
    (err) => {
      if (err) {
        console.error("CREATE STOCK MOVEMENTS TABLE ERROR:", err.message);
      } else {
        console.log("✅ Stock Movements table ready");
      }
    }
  );

  // ================= USERS TABLE =================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `,
    (err) => {
      if (err) {
        console.error("CREATE USERS TABLE ERROR:", err.message);
      } else {
        console.log("✅ Users table ready");
      }
    }
  );

  db.run(
    `
  INSERT OR IGNORE INTO users (
      id,
      full_name,
      username,
      password,
      role,
      status
  )
  VALUES (
      1,
      'Administrator',
      'admin',
      'admin123',
      'admin',
      'Active'
  )
  `
  );

  module.exports = db;