import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Suppliers.css";

type Supplier = {
  id: number;
  company: string;
  person: string;
  mobile: string;
  email: string;
  gst: string;
  city: string;
};

const Suppliers = () => {
  const navigate = useNavigate();
  const role =
  JSON.parse(localStorage.getItem("user") || "{}")?.role;

const user =
  JSON.parse(localStorage.getItem("user") || "{}");

  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

const totalCities = useMemo(() => {
  return new Set(suppliers.map((s) => s.city)).size;
}, [suppliers]);

  // ================= LOAD SUPPLIERS =================
const loadSuppliers = async () => {
  try {
    setLoading(true);

    const res = await fetch("http://localhost:5000/suppliers");

    if (!res.ok) {
      throw new Error("Failed to fetch suppliers");
    }

    const data = await res.json();

    setSuppliers(data);
  } catch (err) {
    console.error(err);
    alert("Failed to load suppliers");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ================= DELETE SUPPLIER =================

  const deleteSupplier = async (id: number) => {
  if (!window.confirm("Delete this supplier?")) return;

  try {
    await fetch(`http://localhost:5000/suppliers/${id}`, {
      method: "DELETE",
      headers: {
        "x-user-role": user.role,
      },
    });

    loadSuppliers();
  } catch (err) {
    console.error(err);
  }
}

  // ================= SEARCH =================

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (supplier) =>
        supplier.company.toLowerCase().includes(search.toLowerCase()) ||
        supplier.person.toLowerCase().includes(search.toLowerCase()) ||
        supplier.mobile.includes(search)
    );
  }, [search, suppliers]);

  return (
    <div className="suppliers-page">

      <div className="suppliers-header">
  <div>
    <h1>🏢 Suppliers Management</h1>
    <p>Manage all supplier records from one place.</p>
  </div>

  {role === "admin" && (
  <button
    className="add-btn"
    onClick={() => navigate("/suppliers/add")}
  >
    ➕ Add Supplier
  </button>
)}
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "25px",
  }}
>
  <div className="card">
    <span>🏢</span>
    <h3>Total Suppliers</h3>
    <h1>{suppliers.length}</h1>
  </div>

  <div className="card">
    <span>🌍</span>
    <h3>Total Cities</h3>
    <h1>{totalCities}</h1>
  </div>

  <div className="card">
    <span>📞</span>
    <h3>Contacts</h3>
    <h1>{suppliers.length}</h1>
  </div>
</div>

<div className="toolbar">
  <input
    type="text"
    placeholder="🔍 Search Company, Person or Mobile..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <div className="total-items">
    Total Suppliers : <strong>{filteredSuppliers.length}</strong>
  </div>
</div>

      <div className="table-card">
        <table className="items-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact Person</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>GST No.</th>
              <th>City</th>
              {role === "admin" && (
  <th style={{ width: "180px" }}>Action</th>
)}
            </tr>
          </thead>

          <tbody>
  {loading ? (
    <tr>
      <td
        colSpan={7}
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#6B7280",
        }}
      >
        Loading Suppliers...
      </td>
    </tr>
  ) : filteredSuppliers.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#6B7280",
        }}
      >
        No Suppliers Found
      </td>
    </tr>
  ) : (
    filteredSuppliers.map((supplier) => (
      <tr key={supplier.id}>
        <td>{supplier.company}</td>
        <td>{supplier.person}</td>
        <td>{supplier.mobile}</td>
        <td>{supplier.email}</td>
        <td>{supplier.gst}</td>
        <td>{supplier.city}</td>

        {role === "admin" && (
  <td>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <button
        className="edit-btn"
        onClick={() =>
          navigate(`/suppliers/edit/${supplier.id}`)
        }
      >
        ✏️ Edit
      </button>

      <button
        className="delete-btn"
        onClick={() => deleteSupplier(supplier.id)}
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

export default Suppliers;