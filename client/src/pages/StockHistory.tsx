import { useEffect, useMemo, useState } from "react";

type StockHistory = {
  id: number;
  company: string;
  modelNo: string;
  movementType: "IN" | "OUT";
  qty: number;
  remark: string;
  createdBy: string;
  created_at: string;
};

export default function StockHistory() {
  const API = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const totalIn = history.filter((h) => h.movementType === "IN").length;
  const totalOut = history.filter((h) => h.movementType === "OUT").length;
  const totalQty = history.reduce((sum, h) => sum + Number(h.qty), 0);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/stock-history`, {
        headers: {
          "x-user-role": user.role || "admin",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch stock history");
      }

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load stock history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      return (
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.modelNo.toLowerCase().includes(search.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(search.toLowerCase()) ||
        item.remark.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [history, search]);

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>📜 Stock History</h1>
          <p style={{ color: "#6B7280", marginTop: "8px" }}>
            View all stock movements.
          </p>
        </div>

        <input
          type="text"
          placeholder="🔍 Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "300px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #D1D5DB",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: 34 }}>📜</div>
          <h4>Total Records</h4>
          <h2>{history.length}</h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: 34 }}>📥</div>
          <h4>Stock In</h4>
          <h2>{totalIn}</h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: 34 }}>📤</div>
          <h4>Stock Out</h4>
          <h2>{totalOut}</h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: 34 }}>📦</div>
          <h4>Total Quantity</h4>
          <h2>{totalQty}</h2>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 8px 20px rgba(0,0,0,.06)",
          marginTop: "25px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead
            style={{
              background: "#f5f5f5",
            }}
          >
            <tr>
              <th style={{ padding: "12px" }}>Date</th>
              <th>Company</th>
              <th>Model</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Remark</th>
              <th>User</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No Stock History Found
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: "1px solid #eee",
                  }}
                >
                  <td style={{ padding: "12px" }}>
                    {new Date(item.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td>{item.company}</td>
                  <td>{item.modelNo}</td>

                  <td>
                    <span
                      style={{
                        background:
                          item.movementType === "IN"
                            ? "#DCFCE7"
                            : "#FEE2E2",
                        color:
                          item.movementType === "IN"
                            ? "#166534"
                            : "#991B1B",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {item.movementType}
                    </span>
                  </td>

                  <td style={{ fontWeight: "bold" }}>{item.qty}</td>
                  <td>{item.remark}</td>
                  <td>{item.createdBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}