import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MainLayout.css";

export default function MainLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const role = user?.role;

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/");
      return;
    }

    setUser(JSON.parse(savedUser));

    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => {
        const lowStock = data.filter(
          (item: any) => item.openingStock <= item.minimumStock
        );

        setLowStockItems(lowStock);
      })
      .catch(console.error);
  }, [navigate]);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-section">
          <img
            src="/stellan-logo.png"
            alt="STELLAN ERP"
            className="sidebar-logo"
          />
        </div>

        <ul className="menu">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>🏠</span>
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/items"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>📦</span>
              Items
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/suppliers"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>🏢</span>
              Suppliers
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/purchases"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>🛒</span>
              Purchases
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/stockin"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>📥</span>
              Stock In
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/stockout"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>📤</span>
              Stock Out
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/stock-history"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span>📜</span>
              Stock History
            </NavLink>
          </li>

          {role === "admin" && (
           <li>
  <NavLink
    to="/reports"
    className={({ isActive }) => (isActive ? "active" : "")}
  >
    <span>📊</span>
    Reports
  </NavLink>
</li>
          )}

          {role === "admin" && (
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span>👤</span>
                Users
              </NavLink>
            </li>
          )}

          {role === "admin" && (
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span>⚙️</span>
                Settings
              </NavLink>
            </li>
          )}
        </ul>

        <div style={{ marginTop: "auto", padding: "20px" }}>
          <button onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="content">
                <header className="topbar">
          <div>
            <h2>STELLAN ERP</h2>
            <p className="top-subtitle">
              Factory Inventory Management System
            </p>
          </div>

          <div className="topbar-right">
<div className="notification-wrapper">

  <button
    className="notification-btn"
    onClick={() => setShowNotifications(!showNotifications)}
  >
    🔔

    {lowStockItems.length > 0 && (
      <span className="notification-badge">
        {lowStockItems.length}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="notification-popup">

      <div className="notification-header">
        🔔 Notifications
      </div>

      {lowStockItems.length === 0 ? (

        <div className="notification-empty">
          <div style={{ fontSize: "42px" }}>✅</div>

          <h3 style={{ margin: "12px 0 5px" }}>
            Everything Looks Good
          </h3>

          <p>No Low Stock Items</p>
        </div>

      ) : (

        <>
          {lowStockItems.map((item: any) => (
            <div
              key={item.id}
              className="notification-item"
            >
              <div>
                <strong>{item.itemName}</strong>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginTop: "4px",
                  }}
                >
                  Minimum : {item.minimumStock}
                </div>
              </div>

              <span className="stock-pill">
                {item.openingStock} PCS
              </span>
            </div>
          ))}

          <div className="notification-footer">

            <button
              className="view-all-btn"
              onClick={() => {
                navigate("/items");
                setShowNotifications(false);
              }}
            >
              View All Items →
            </button>

          </div>
        </>

      )}

    </div>
  )}

</div>

            <div className="user-card">
              <div className="avatar">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4>{user?.username}</h4>
                <span>{user?.role}</span>
              </div>
            </div>

          </div>
        </header>

        <section className="main-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}