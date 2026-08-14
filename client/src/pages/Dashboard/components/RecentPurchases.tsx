import { useNavigate } from "react-router-dom";

type Purchase = {
  id: number;
  purchase_date: string;
  invoice_no: string;
  company_name: string;
  model_no: string;
  qty: number;
  amount: number;
};

type Props = {
  purchases: Purchase[];
};

export default function RecentPurchases({
  purchases,
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
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            🛒 Recent Purchases
          </h2>

          <p
            style={{
              marginTop: "6px",
              color: "#6B7280",
            }}
          >
            Latest Purchase Transactions
          </p>
        </div>

        <button
          onClick={() => navigate("/purchases")}
          style={{
            background: "#2563EB",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          View All →
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
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Invoice</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Amount</th>
            </tr>
          </thead>

          <tbody>
                        {purchases.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "45px",
                    color: "#6B7280",
                  }}
                >
                  No Recent Purchases Found
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  style={{
                    borderTop: "1px solid #E5E7EB",
                  }}
                >
                  <td style={tdStyle}>
                    📅 {purchase.purchase_date}
                  </td>

                  <td style={tdStyle}>
                    <strong>{purchase.invoice_no}</strong>
                  </td>

                  <td style={tdStyle}>
                    🏢 {purchase.company_name}
                  </td>

                  <td style={tdStyle}>
                    {purchase.model_no}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#DBEAFE",
                        color: "#1D4ED8",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      {purchase.qty}
                    </span>
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      color: "#16A34A",
                      fontWeight: "bold",
                    }}
                  >
                    ₹
                    {Number(
                      purchase.amount
                    ).toLocaleString("en-IN")}
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