import { useEffect, useMemo, useState } from "react";
import "./ReportsV2.css";

type Item = {
  id: number;
  company: string;
  modelNo: string;
  hsnCode: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  purchasePrice: number;
  openingStock: number;
  minimumStock: number;
};

type Purchase = {
  id: number;
  supplier?: string;
  company?: string;
  invoiceNo?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  amount?: number;
  created_at?: string;
  date?: string;
};

type ReportData = {
  totalItems: number;
  totalSuppliers: number;
  totalPurchases: number;
  totalStock: number;
  inventoryValue: number;
  lowStock: number;
  lowStockItems: Item[];
  recentPurchases: Purchase[];
  categoryWiseStock: {
    category: string;
    stock: number;
  }[];
  todayStockIn: number;
  todayStockOut: number;
};

const ReportsV2 = () => {
  const [report, setReport] = useState<ReportData>({
    totalItems: 0,
    totalSuppliers: 0,
    totalPurchases: 0,
    totalStock: 0,
    inventoryValue: 0,
    lowStock: 0,
    lowStockItems: [],
    recentPurchases: [],
    categoryWiseStock: [],
    todayStockIn: 0,
    todayStockOut: 0,
  });

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  // ================= LOAD REPORT =================

  const loadReport = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/reports", {
        headers: {
          "x-user-role": user.role || "admin",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load report");
      }

      const data = await res.json();

      setReport({
        totalItems: data.totalItems || 0,
        totalSuppliers: data.totalSuppliers || 0,
        totalPurchases: data.totalPurchases || 0,
        totalStock: data.totalStock || 0,
        inventoryValue: data.inventoryValue || 0,
        lowStock: data.lowStock || 0,
        lowStockItems: data.lowStockItems || [],
        recentPurchases: data.recentPurchases || [],
        categoryWiseStock: data.categoryWiseStock || [],
        todayStockIn: data.todayStockIn || 0,
        todayStockOut: data.todayStockOut || 0,
      });
    } catch (error) {
      console.error(error);
      alert("❌ Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD ITEMS =================

  const loadItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/items");

      if (!res.ok) {
        throw new Error("Failed to load items");
      }

      const data = await res.json();
      setItems(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadReport();
    loadItems();
  }, []);

  // ================= CATEGORIES =================

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((item) => item.category).filter(Boolean))
    );

    return unique;
  }, [items]);

  // ================= FILTERED ITEMS =================

  const filteredItems = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesCategory =
        category === "All Categories" ||
        item.category?.toLowerCase() === category.toLowerCase();

      const matchesSearch =
        !searchText ||
        item.itemName?.toLowerCase().includes(searchText) ||
        item.itemCode?.toLowerCase().includes(searchText) ||
        item.company?.toLowerCase().includes(searchText) ||
        item.modelNo?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [items, category, search]);

  // ================= DATE FILTER =================

  const dateFilteredPurchases = useMemo(() => {
    return report.recentPurchases.filter((purchase) => {
      const rawDate =
        purchase.created_at ||
        purchase.date ||
        "";

      if (!rawDate) return true;

      const purchaseDate = new Date(rawDate);

      if (Number.isNaN(purchaseDate.getTime())) {
        return true;
      }

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);

        if (purchaseDate < from) {
          return false;
        }
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        if (purchaseDate > to) {
          return false;
        }
      }

      return true;
    });
  }, [report.recentPurchases, fromDate, toDate]);

  // ================= RESET =================

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCategory("All Categories");
    setSearch("");
  };

  // ================= PRINT =================

  const handlePrint = () => {
    window.print();
  };

  // ================= EXPORT CSV =================

  const handleExportExcel = () => {
    const rows = filteredItems.map((item) => ({
      Company: item.company,
      Model: item.modelNo,
      HSN: item.hsnCode,
      "Item Code": item.itemCode,
      "Item Name": item.itemName,
      Category: item.category,
      Unit: item.unit,
      "Purchase Price": item.purchasePrice,
      Stock: item.openingStock,
      "Minimum Stock": item.minimumStock,
      Status:
        item.openingStock <= item.minimumStock
          ? "Low Stock"
          : "In Stock",
    }));

    if (rows.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value =
              row[header as keyof typeof row] ?? "";

            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "STELLAN_Inventory_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ================= EXPORT PDF =================

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="reports-page">

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div className="report-header">
          <h1>📊 Inventory Reports</h1>

          <p>
            STELLAN TECH INNOVATIONS PVT. LTD.
          </p>
        </div>

        <div
          className="report-actions"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={handleExportPDF}
          >
            📄 Export PDF
          </button>

          <button
            className="btn btn-primary"
            onClick={handleExportExcel}
          >
            📊 Export Excel
          </button>

          <button
            className="btn btn-primary"
            onClick={handlePrint}
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* ================= FILTER ================= */}

      <div className="report-toolbar card">

        <input
          type="date"
          className="input"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="input"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="input"
          placeholder="Search Item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={() => {
            loadReport();
            loadItems();
          }}
        >
          🔍 Search
        </button>

        <button
          className="btn"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* ================= SUMMARY ================= */}

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            fontWeight: 700,
          }}
        >
          Loading Reports...
        </div>
      ) : (
        <>
          <div className="summary-grid">

            <div className="summary-card">
              <div>📦</div>
              <h4>Total Items</h4>
              <h2>{report.totalItems}</h2>
            </div>

            <div className="summary-card">
              <div>📊</div>
              <h4>Total Stock</h4>
              <h2>{report.totalStock}</h2>
            </div>

            <div className="summary-card">
              <div>💰</div>
              <h4>Inventory Value</h4>
              <h2>{formatMoney(report.inventoryValue)}</h2>
            </div>

            <div className="summary-card">
              <div>⚠️</div>
              <h4>Low Stock</h4>
              <h2>{report.lowStock}</h2>
            </div>

            <div className="summary-card">
              <div>🛒</div>
              <h4>Purchases</h4>
              <h2>{report.totalPurchases}</h2>
            </div>

            <div className="summary-card">
              <div>🏢</div>
              <h4>Suppliers</h4>
              <h2>{report.totalSuppliers}</h2>
            </div>

            <div className="summary-card">
              <div>📥</div>
              <h4>Today Stock In</h4>
              <h2>{report.todayStockIn}</h2>
            </div>

            <div className="summary-card">
              <div>📤</div>
              <h4>Today Stock Out</h4>
              <h2>{report.todayStockOut}</h2>
            </div>

          </div>

          {/* ================= INVENTORY TABLE ================= */}

          <div className="table-card">

            <div className="table-header">
              <h3>📦 Inventory Details</h3>

              <span>
                {filteredItems.length} Items
              </span>
            </div>

            <div className="table-body">

              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Model</th>
                    <th>HSN</th>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: "35px",
                        }}
                      >
                        No Items Found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id}>

                        <td>
                          {item.company}
                        </td>

                        <td>
                          {item.modelNo}
                        </td>

                        <td>
                          {item.hsnCode}
                        </td>

                        <td>
                          {item.itemCode}
                        </td>

                        <td>
                          {item.itemName}
                        </td>

                        <td>
                          {item.category}
                        </td>

                        <td>
                          {item.openingStock} {item.unit}
                        </td>

                        <td>
                          <span
                            className={
                              item.openingStock <=
                              item.minimumStock
                                ? "badge badge-warning"
                                : "badge badge-success"
                            }
                          >
                            {item.openingStock <=
                            item.minimumStock
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </div>
          </div>

          {/* ================= LOW STOCK ================= */}

          <div className="table-card">

            <div className="table-header">
              <h3>⚠️ Low Stock Items</h3>

              <span>
                {report.lowStockItems.length} Items
              </span>
            </div>

            <div className="table-body">

              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Model</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Minimum Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {report.lowStockItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "35px",
                        }}
                      >
                        ✅ No Low Stock Items
                      </td>
                    </tr>
                  ) : (
                    report.lowStockItems.map((item) => (
                      <tr key={item.id}>

                        <td>
                          {item.company}
                        </td>

                        <td>
                          {item.modelNo}
                        </td>

                        <td>
                          {item.itemName}
                        </td>

                        <td>
                          {item.category}
                        </td>

                        <td>
                          {item.openingStock}
                        </td>

                        <td>
                          {item.minimumStock}
                        </td>

                        <td>
                          <span className="badge badge-warning">
                            Low Stock
                          </span>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </div>
          </div>

          {/* ================= CATEGORY STOCK ================= */}

          <div className="table-card">

            <div className="table-header">
              <h3>📊 Category Wise Stock</h3>
            </div>

            <div className="table-body">

              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {report.categoryWiseStock.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          textAlign: "center",
                          padding: "35px",
                        }}
                      >
                        No Category Data
                      </td>
                    </tr>
                  ) : (
                    report.categoryWiseStock.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>
                            {item.category || "Uncategorized"}
                          </td>

                          <td>
                            <strong>
                              {item.stock}
                            </strong>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>

            </div>
          </div>

          {/* ================= RECENT PURCHASES ================= */}

          <div className="table-card">

            <div className="table-header">
              <h3>🛒 Recent Purchases</h3>

              <span>
                {dateFilteredPurchases.length} Records
              </span>
            </div>

            <div className="table-body">

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Supplier</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {dateFilteredPurchases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "35px",
                        }}
                      >
                        No Purchase Records
                      </td>
                    </tr>
                  ) : (
                    dateFilteredPurchases.map(
                      (purchase) => (
                        <tr key={purchase.id}>

                          <td>
                            #{purchase.id}
                          </td>

                          <td>
                            {purchase.supplier ||
                              purchase.company ||
                              "-"}
                          </td>

                          <td>
                            {purchase.invoiceNo ||
                              purchase.invoiceNumber ||
                              "-"}
                          </td>

                          <td>
                            {formatMoney(
                              Number(
                                purchase.totalAmount ||
                                purchase.amount ||
                                0
                              )
                            )}
                          </td>

                          <td>
                            {purchase.created_at ||
                            purchase.date
                              ? new Date(
                                  purchase.created_at ||
                                    purchase.date ||
                                    ""
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}
                          </td>

                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsV2;