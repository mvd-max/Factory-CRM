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
  supplierName?: string;
  company?: string;
  modelNo?: string;
  qty?: number;
  totalAmount?: number;
  amount?: number;
  created_at?: string;
  date?: string;
};

type CategoryStock = {
  category: string;
  stock: number;
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
  categoryWiseStock: CategoryStock[];
  todayStockIn: number;
  todayStockOut: number;
};

const emptyReport: ReportData = {
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
};

const ReportsV2 = () => {
  const [report, setReport] = useState<ReportData>(emptyReport);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [search, setSearch] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-user-role": user.role || "admin",
      };

      const [reportRes, itemsRes] = await Promise.all([
        fetch("https://stellan-erp-api.onrender.com/reports", {
          headers,
        }),
        fetch("https://stellan-erp-api.onrender.com/items", {
          headers,
        }),
      ]);

      if (!reportRes.ok) {
        throw new Error("Failed to load report");
      }

      const reportData = await reportRes.json();

      setReport({
        ...emptyReport,
        ...reportData,
      });

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(Array.isArray(itemsData) ? itemsData : []);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const categories = useMemo(() => {
    const values = items
      .map((item) => item.category)
      .filter(Boolean);

    return Array.from(new Set(values)).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        item.itemName?.toLowerCase().includes(searchText) ||
        item.itemCode?.toLowerCase().includes(searchText) ||
        item.modelNo?.toLowerCase().includes(searchText) ||
        item.company?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All Categories" ||
        item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCategory("All Categories");
    setSearch("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportCSV = () => {
    const rows = [
      [
        "Company",
        "Model",
        "Item Code",
        "Item Name",
        "Category",
        "Stock",
        "Minimum Stock",
        "Purchase Price",
        "Inventory Value",
      ],
      ...filteredItems.map((item) => [
        item.company,
        item.modelNo,
        item.itemCode,
        item.itemName,
        item.category,
        item.openingStock,
        item.minimumStock,
        item.purchasePrice,
        item.openingStock * item.purchasePrice,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

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

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 700,
            color: "#475569",
          }}
        >
          📊 Loading Inventory Reports...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            📊 Inventory Reports
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
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
            onClick={exportCSV}
          >
            📄 Export CSV
          </button>

          <button
            className="btn btn-primary"
            onClick={printReport}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="report-toolbar card">

        <input
          className="input"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          title="From Date"
        />

        <input
          className="input"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          title="To Date"
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
          className="input"
          type="text"
          placeholder="🔍 Search Item, Code, Model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={() => setSearch(search.trim())}
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

      {/* ================= SUMMARY CARDS ================= */}

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
          <h2>{formatCurrency(report.inventoryValue)}</h2>
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
          <div>📥</div>
          <h4>Today's Stock In</h4>
          <h2>{report.todayStockIn}</h2>
        </div>

        <div className="summary-card">
          <div>📤</div>
          <h4>Today's Stock Out</h4>
          <h2>{report.todayStockOut}</h2>
        </div>

        <div className="summary-card">
          <div>🏢</div>
          <h4>Total Suppliers</h4>
          <h2>{report.totalSuppliers}</h2>
        </div>

      </div>

      {/* ================= INVENTORY DETAILS ================= */}

      <div className="table-card">

        <div className="table-header">
          <div>
            <h3>📦 Inventory Details</h3>

            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {filteredItems.length} Records
            </span>
          </div>
        </div>

        <div className="table-body">

          <table>

            <thead>
              <tr>
                <th>Company</th>
                <th>Model</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Purchase Price</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>

              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    No Inventory Records Found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {

                  const isLow =
                    Number(item.openingStock) <=
                    Number(item.minimumStock);

                  return (
                    <tr key={item.id}>

                      <td>{item.company}</td>

                      <td>{item.modelNo}</td>

                      <td>{item.itemCode}</td>

                      <td>{item.itemName}</td>

                      <td>{item.category}</td>

                      <td>
                        <strong>{item.openingStock}</strong>
                      </td>

                      <td>{item.unit}</td>

                      <td>
                        <span
                          className={
                            isLow
                              ? "badge badge-warning"
                              : "badge badge-success"
                          }
                        >
                          {isLow ? "LOW STOCK" : "IN STOCK"}
                        </span>
                      </td>

                      <td>
                        {formatCurrency(item.purchasePrice)}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            Number(item.openingStock) *
                              Number(item.purchasePrice)
                          )}
                        </strong>
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* ================= LOW STOCK ================= */}

      <div className="table-card">

        <div className="table-header">
          <h3>⚠️ Low Stock Items</h3>
        </div>

        <div className="table-body">

          <table>

            <thead>
              <tr>
                <th>Company</th>
                <th>Model</th>
                <th>Item Name</th>
                <th>Current Stock</th>
                <th>Minimum Stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {report.lowStockItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "35px",
                      color: "#15803d",
                      fontWeight: 700,
                    }}
                  >
                    ✅ No Low Stock Items
                  </td>
                </tr>
              ) : (
                report.lowStockItems.map((item) => (
                  <tr key={item.id}>

                    <td>{item.company}</td>

                    <td>{item.modelNo}</td>

                    <td>{item.itemName}</td>

                    <td>
                      <strong>{item.openingStock}</strong>
                    </td>

                    <td>{item.minimumStock}</td>

                    <td>
                      <span className="badge badge-warning">
                        LOW STOCK
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
                      padding: "30px",
                    }}
                  >
                    No Category Data
                  </td>
                </tr>
              ) : (
                report.categoryWiseStock.map((item) => (
                  <tr key={item.category}>

                    <td>{item.category}</td>

                    <td>
                      <strong>{item.stock}</strong>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* ================= RECENT PURCHASES ================= */}

      <div className="table-card">

        <div className="table-header">
          <h3>🛒 Recent Purchases</h3>
        </div>

        <div className="table-body">

          <table>

            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier</th>
                <th>Company</th>
                <th>Model</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>

              {report.recentPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "35px",
                      color: "#64748b",
                    }}
                  >
                    No Recent Purchases
                  </td>
                </tr>
              ) : (
                report.recentPurchases.map((purchase) => {

                  const amount =
                    Number(
                      purchase.totalAmount ??
                        purchase.amount ??
                        0
                    );

                  return (
                    <tr key={purchase.id}>

                      <td>
                        {formatDate(
                          purchase.created_at ??
                            purchase.date
                        )}
                      </td>

                      <td>
                        {purchase.supplierName ??
                          purchase.supplier ??
                          "-"}
                      </td>

                      <td>
                        {purchase.company ?? "-"}
                      </td>

                      <td>
                        {purchase.modelNo ?? "-"}
                      </td>

                      <td>
                        {purchase.qty ?? 0}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(amount)}
                        </strong>
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
};

export default ReportsV2;