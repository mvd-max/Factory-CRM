import { useNavigate } from "react-router-dom";

type Item = {
  id: number;
  itemName: string;
  category: string;
  openingStock: number;
  minimumStock: number;
};

type Props = {
  items: Item[];
};

export default function LowStockTable({
  items,
}: Props) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "18px",
        padding: "24px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 20px rgba(0,0,0,.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            🚨 Low Stock Alerts
          </h2>

          <p
            style={{
              marginTop: "6px",
              color: "#6B7280",
            }}
          >
            {items.length} Item(s) below minimum stock
          </p>
        </div>

        <button
          onClick={() => navigate("/items")}
          style={{
            background: "#DC2626",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          View Items →
        </button>
      </div>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#F8FAFC",
              }}
            >
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Available</th>
              <th style={thStyle}>Minimum</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
                        {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "45px",
                    color: "#6B7280",
                  }}
                >
                  ✅ No Low Stock Items
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: "1px solid #E5E7EB",
                  }}
                >
                  <td style={tdStyle}>
                    📦 {item.itemName}
                  </td>

                  <td style={tdStyle}>
                    {item.category}
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: "bold",
                      color: "#DC2626",
                    }}
                  >
                    {item.openingStock}
                  </td>

                  <td style={tdStyle}>
                    {item.minimumStock}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#FEE2E2",
                        color: "#B91C1C",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      🔴 Low Stock
                    </span>
                  </td>
                </tr>
              ))
            )}
                      </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px",
  textAlign: "left",
  color: "#374151",
  fontWeight: "bold",
  borderBottom: "1px solid #E5E7EB",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #F3F4F6",
  color: "#374151",
};