import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import EditPurchase from "../pages/EditPurchase";
import StockIn from "../pages/StockIn";
import StockOut from "../pages/StockOut";
import StockHistory from "../pages/StockHistory";
import ReportsV2 from "../pages/ReportsV2";
import Settings from "../pages/Settings/Settings";
import Users from "../pages/Users/Users";

// Items
import Items from "../pages/Items/Items";
import AddItem from "../pages/Items/AddItem";
import EditItem from "../pages/Items/EditItem";

// Suppliers
import Suppliers from "../pages/Suppliers/Suppliers";
import AddSupplier from "../pages/Suppliers/AddSupplier";

// Purchases
import Purchases from "../pages/Purchases";
import AddPurchase from "../pages/AddPurchase";

// Layout
import MainLayout from "../layouts/MainLayout";

// Sales
import AddSale from "../pages/AddSale";
import Sales from "../pages/Sales";
import EditSale from "../pages/EditSale";

// Customers
import Customers from "../pages/Customers/Customers";
import AddCustomer from "../pages/Customers/AddCustomer";
import EditCustomer from "../pages/Customers/EditCustomer";

function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Main Layout */}
        <Route path="/" element={<MainLayout />}>

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Items */}
          <Route path="items" element={<Items />} />
          <Route path="items/add" element={<AddItem />} />
          <Route path="items/edit/:id" element={<EditItem />} />

          {/* Suppliers */}
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/add" element={<AddSupplier />} />

          {/* Customers */}
          <Route path="customers" element={<Customers />} />
          <Route path="customers/add" element={<AddCustomer />} />
          <Route path="customers/edit/:id" element={<EditCustomer />} />

          {/* Purchases */}
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/add" element={<AddPurchase />} />
          <Route path="purchases/edit/:id" element={<EditPurchase />} />

          {/* Sales */}
          <Route path="sales" element={<Sales />} />
          <Route path="sales/add" element={<AddSale />} />
          <Route path="sales/edit/:id" element={<EditSale />} />

          {/* Stock */}
          <Route path="stockin" element={<StockIn />} />
          <Route path="stockout" element={<StockOut />} />
          <Route path="stock-history" element={<StockHistory />} />

          {/* Admin Only */}
          <Route
            path="reports"
            element={
              <AdminRoute>
                <ReportsV2 />
              </AdminRoute>
            }
          />

          <Route
            path="users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          <Route
            path="settings"
            element={
              <AdminRoute>
                <Settings />
              </AdminRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
