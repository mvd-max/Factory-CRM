import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Items.css";

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
  sellingPrice: number;
  openingStock: number;
  minimumStock: number;
};

const Items = () => {
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user") || "{}")?.role;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://stellan-erp-api.onrender.com/items");

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://stellan-erp-api.onrender.com/items/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Delete failed");
      }

      alert("✅ Item Deleted Successfully");
      fetchItems();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete item.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <div className="items-page">
      <div className="items-header">
        <div>
          <h1>📦 Items Management</h1>
          <p>Manage all inventory items from one place.</p>
        </div>

        {role === "admin" && (
  <button
    className="add-btn"
    onClick={() => navigate("/items/add")}
  >
    + Add Item
  </button>
)}
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Search by Code, Name or Category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="total-items">
          Total Items : <strong>{filteredItems.length}</strong>
        </div>
      </div>

      <div className="table-card">
        <table className="items-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Model</th>
              <th>HSN</th>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock</th>
              {role === "admin" && <th>Purchase Price</th>}
              <th>Status</th>
              {role === "admin" && (
  <th style={{ width: "180px" }}>Action</th>
)}
            </tr>
          </thead>

          <tbody>
                        {loading ? (
              <tr>
                <td colSpan={role === "admin" ? 10 : 8} className="empty-row">
                  Loading...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={role === "admin" ? 10 : 8} className="empty-row">
                  No Items Found
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.company}</td>
                  <td>{item.modelNo}</td>
                  <td>{item.hsnCode}</td>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td>{item.openingStock}</td>
                  {role === "admin" && (
  <td>₹{item.purchasePrice}</td>
)}

                  <td>
                    <span
                      className={
                        item.openingStock <= item.minimumStock
                          ? "status low"
                          : "status in"
                      }
                    >
                      {item.openingStock <= item.minimumStock
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </td>

                  {role === "admin" && (
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/items/edit/${item.id}`)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Items;