import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import DashboardCharts from "./components/DashboardCharts";
import RecentPurchases from "./components/RecentPurchases";
import LowStockTable from "./components/LowStockTable";

type Item = {
  id: number;
  itemName: string;
  category: string;
  openingStock: number;
  minimumStock: number;
};

type Purchase = {
  id: number;
  purchase_date: string;
  invoice_no: string;
  company_name: string;
  model_no: string;
  qty: number;
  amount: number;
};

type CategoryStock = {
  category: string;
  stock: number;
};

type Report = {
  totalItems: number;
  totalStock: number;
  inventoryValue: number;
  lowStock: number;
  totalPurchases: number;
  totalSuppliers: number;
  todayStockIn: number;
  todayStockOut: number;
  categoryWiseStock: CategoryStock[];
  recentPurchases: Purchase[];
};


const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [report, setReport] = useState<Report>({
  totalItems: 0,
  totalStock: 0,
  inventoryValue: 0,
  lowStock: 0,
  totalPurchases: 0,
  totalSuppliers: 0,
  todayStockIn: 0,
  todayStockOut: 0,
  categoryWiseStock: [],
  recentPurchases: [],
});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(
  localStorage.getItem("user") || "{}"
);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
  try {
    // Load Items
    const res = await fetch("https://stellan-erp-api.onrender.compi.onrender.com/items");

    if (!res.ok) {
      throw new Error("Failed to fetch items");
    }

    const itemsData = await res.json();
    setItems(itemsData);

    // Load Dashboard Report
    const reportRes = await fetch("https://stellan-erp-api.onrender.com/reports", {
  headers: {
    "x-user-role": user.role,
  },
});

    const reportData = await reportRes.json();

    setReport(reportData);
  } catch (err) {
    console.error(err);
    alert("Failed to load dashboard data.");
  } finally {
    setLoading(false);
  }
};
  const lowStockItems = useMemo(() => {
    return items.filter(
      (item) => item.openingStock <= item.minimumStock
    );
  }, [items]);

  const totalCategories = useMemo(() => {
    return new Set(items.map((i) => i.category)).size;
  }, [items]);

  return (
    <>
      <div className="dashboard-header">
  <div>
    <h1>Welcome Back, {user.full_name || user.username} 👋</h1>
    <p>
  {user.role === "admin"
    ? "Administrator Dashboard"
    : "Inventory Manager Dashboard"}
</p>

    <div className="quick-actions">

  {user.role === "admin" && (
    <button
      className="quick-btn"
      onClick={() => navigate("/items/add")}
    >
      ➕ Add Item
    </button>
  )}

  <button
    className="quick-btn"
    onClick={() => navigate("/stockin")}
  >
    📥 Stock In
  </button>

  <button
    className="quick-btn"
    onClick={() => navigate("/stockout")}
  >
    📤 Stock Out
  </button>

  {user.role === "admin" && (
    <button
      className="quick-btn"
      onClick={() => navigate("/purchases/add")}
    >
      🛒 Add Purchase
    </button>
  )}

</div>
  </div>

  <div className="today-date">
    📅 {today}
  </div>
</div>

      <div className="cards">

<div
  className="card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/items")}
>
  <span>📦</span>
  <h3>Total Items</h3>
  <h1>{loading ? "..." : report.totalItems}</h1>
</div>

 <div
  className="card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/items")}
>
  <span>📊</span>
  <h3>Total Stock</h3>
    <h1>{loading ? "..." : report.totalStock}</h1>
  </div>

  {user.role === "admin" && (
  <div
    className="card"
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/reports")}
  >
    <span>💰</span>
    <h3>Inventory Value</h3>
    <h1>
      {loading
        ? "..."
        : `₹${Number(report.inventoryValue).toLocaleString("en-IN")}`}
    </h1>
  </div>
)}

  <div
  className="card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/items")}
>
  <span>⚠️</span>
  <h3>Low Stock</h3>
    <h1>{loading ? "..." : report.lowStock}</h1>
  </div>

  <div
  className="card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/items")}
>
  <span>📂</span>
  <h3>Categories</h3>
  <h1>{loading ? "..." : totalCategories}</h1>
</div>

  <div className="card">
    <span>✅</span>
    <h3>In Stock</h3>
    <h1>{loading ? "..." : report.totalItems - report.lowStock}</h1>
  </div>
  
<div
  className="card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/stockin")}
>
  <span>📥</span>
  <h3>Today's Stock In</h3>
  <h1>{loading ? "..." : report.todayStockIn}</h1>
</div>

<div
  className="card"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/stockout")}
>
  <span>📤</span>
  <h3>Today's Stock Out</h3>
  <h1>{loading ? "..." : report.todayStockOut}</h1>
</div>
</div>
{lowStockItems.length > 0 && (
  <div
    style={{
      background: "#FEF2F2",
      border: "1px solid #FCA5A5",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "25px",
    }}
  >
    <h2
      style={{
        color: "#DC2626",
        margin: "0 0 15px 0",
      }}
    >
      ⚠️ Low Stock Alert ({lowStockItems.length})
    </h2>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  }}
>
  <span style={{ color: "#7F1D1D" }}>
    Items below minimum stock level.
  </span>

  <button
    onClick={() => navigate("/items")}
    style={{
      background: "#DC2626",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    View All Items →
  </button>
</div>

    {lowStockItems.map((item) => (
      <div
        key={item.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: "1px solid #FECACA",
        }}
      >
        <strong>{item.itemName}</strong>

        <span>
          {item.openingStock} / {item.minimumStock}
        </span>
      </div>
    ))}
  </div>
)}
     <div className="dashboard-grid">

  <DashboardCharts data={report.categoryWiseStock} />

  <RecentPurchases purchases={report.recentPurchases} />

  <LowStockTable items={lowStockItems} />

</div>
    </>
  );
};

export default Dashboard;