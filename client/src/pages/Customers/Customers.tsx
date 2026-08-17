import "./Customers.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  mobile: string;
  gst_number: string;
  city: string;
  status: string;
}

export default function Customers() {
  const role =
  JSON.parse(localStorage.getItem("user") || "{}")?.role;

const user =
  JSON.parse(localStorage.getItem("user") || "{}");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch(
        `https://stellan-erp-api.onrender.com/customers?search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const deleteCustomer = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    await fetch(`https://stellan-erp-api.onrender.com/customers/${id}`, {
  method: "DELETE",
  headers: {
    "x-user-role": user.role,
  },
});

    loadCustomers();
  };

  return (
    <div className="customers-page">

      <div className="customers-header">
        <h2>👥 Customer Management</h2>

        {role === "admin" && (
  <Link className="add-btn" to="/customers/add">
    + Add Customer
  </Link>
)}
      </div>

      <input
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Search customer..."
      />

      <div className="table-wrapper">
        <table className="customers-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Company</th>
              <th>Mobile</th>
              <th>GST No.</th>
              <th>City</th>
              <th>Status</th>
              {role === "admin" && (
  <th style={{ width: 170 }}>Action</th>
)}
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 30 }}>
                  No Customers Found
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.customer_name}</td>
                  <td>{c.company_name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.gst_number}</td>
                  <td>{c.city}</td>

                  <td>
                    <span
                      style={{
                        background:
                          c.status === "Active"
                            ? "#DCFCE7"
                            : "#FEE2E2",
                        color:
                          c.status === "Active"
                            ? "#15803D"
                            : "#DC2626",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {c.status}
                    </span>
                  </td>

                  {role === "admin" && (
  <td>
    <Link
      className="edit-btn"
      to={`/customers/edit/${c.id}`}
    >
      ✏️ Edit
    </Link>

    <button
      className="delete-btn"
      onClick={() => deleteCustomer(c.id)}
    >
      🗑 Delete
    </button>
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
}