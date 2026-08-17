import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type Sale = {
  id: number;
  sale_date: string;
  invoice_no: string;
  customer_name: string;
  company_name: string;
  model_no: string;
  qty: number;
  amount: number;
};

export default function Sales() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user?.role;

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD SALES =================

  const loadSales = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://stellan-erp-api.onrender.com/sales"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data: Sale[] = await response.json();

      setSales(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // ================= DELETE SALE =================

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://stellan-erp-api.onrender.com/sales/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-role": user.role,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("✅ Sale Deleted Successfully");
        loadSales();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server Connection Error");
    }
  };

  // ================= PAGE =================

  return (
    <div style={{ padding: "30px" }}>

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            🛒 Sale Management
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6B7280",
            }}
          >
            Manage customer sales and transactions.
          </p>
        </div>

        {role === "admin" && (
          <Link
            to="/sales/add"
            style={{
              background: "#EF3B3A",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              boxShadow:
                "0 6px 15px rgba(239,59,58,.25)",
            }}
          >
            ➕ Add Sale
          </Link>
        )}
      </div>

      {/* ================= TABLE ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,.06)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >

          {/* ================= HEADER ================= */}

          <thead
            style={{
              background: "#F5F5F5",
              color: "#333",
              borderBottom:
                "2px solid #EF3B3A",
            }}
          >
            <tr>
              <th style={{ padding: "12px" }}>
                Date
              </th>

              <th style={{ padding: "12px" }}>
                Invoice
              </th>

              <th style={{ padding: "12px" }}>
                Customer
              </th>

              <th style={{ padding: "12px" }}>
                Company
              </th>

              <th style={{ padding: "12px" }}>
                Model
              </th>

              <th style={{ padding: "12px" }}>
                Qty
              </th>

              {role === "admin" && (
                <th style={{ padding: "12px" }}>
                  Amount
                </th>
              )}

              {role === "admin" && (
                <th style={{ padding: "12px" }}>
                  Action
                </th>
              )}
            </tr>
          </thead>

          {/* ================= BODY ================= */}

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={role === "admin" ? 8 : 6}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6B7280",
                  }}
                >
                  Loading Sales...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td
                  colSpan={role === "admin" ? 8 : 6}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6B7280",
                  }}
                >
                  No Sale Found
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  style={{
                    borderBottom:
                      "1px solid #E5E7EB",
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    {sale.sale_date}
                  </td>

                  <td
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {sale.invoice_no}
                  </td>

                  <td style={{ padding: "12px" }}>
                    {sale.customer_name}
                  </td>

                  <td style={{ padding: "12px" }}>
                    {sale.company_name}
                  </td>

                  <td style={{ padding: "12px" }}>
                    {sale.model_no}
                  </td>

                  <td style={{ padding: "12px" }}>
                    {sale.qty}
                  </td>

                  {role === "admin" && (
                    <td
                      style={{
                        padding: "12px",
                        color: "#16A34A",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{" "}
                      {Number(
                        sale.amount
                      ).toLocaleString("en-IN")}
                    </td>
                  )}

                  {role === "admin" && (
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <Link
                          to={`/sales/edit/${sale.id}`}
                          style={{
                            background: "#2563EB",
                            color: "#fff",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontSize: "14px",
                          }}
                        >
                          ✏️ Edit
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(sale.id)
                          }
                          style={{
                            background: "#DC2626",
                            color: "#fff",
                            border: "none",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
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
}