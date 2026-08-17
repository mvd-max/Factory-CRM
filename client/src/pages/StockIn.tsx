import { useEffect, useState } from "react";

type Item = {
  company: string;
  modelNo: string;
  openingStock: number;
  minimumStock: number;
};

export default function StockIn() {
  const [items, setItems] = useState<Item[]>([]);
  const [company, setCompany] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [qty, setQty] = useState("");
  const [remark, setRemark] = useState("");

  const [loading, setLoading] = useState(false);

  const totalCompanies = new Set(
    items.map((i) => i.company)
  ).size;

  const totalStock = items.reduce(
    (sum, item) => sum + Number(item.openingStock),
    0
  );

  const currentItem = items.find(
    (i) =>
      i.company === company &&
      i.modelNo === modelNo
  );

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://stellan-erp-api.onrender.com/items"
      );

      const data = await res.json();

      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!company || !modelNo || !qty) {
      alert("Please fill all fields.");
      return;
    }

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
        try {
      const res = await fetch(
        "https://stellan-erp-api.onrender.com/stock/in",
        {
          method: "POST",
          headers: {
  "Content-Type": "application/json",
  "x-user-role": user.role,
},
          body: JSON.stringify({
            company,
            modelNo,
            qty: Number(qty),
            remark,
            createdBy: user.username,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("✅ Stock In Successful");

        setCompany("");
        setModelNo("");
        setQty("");
        setRemark("");

        loadItems();
      } else {
        alert(data.error || "Stock In Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Connection Error");
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      {/* Header */}

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
          <h1
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            📥 Stock In
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6B7280",
            }}
          >
            Receive inventory and increase stock.
          </p>
        </div>
      </div>

      {/* Summary Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
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
          <div style={{ fontSize: 34 }}>🏢</div>
          <h4>Total Companies</h4>
          <h2>{totalCompanies}</h2>
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
          <h4>Total Stock</h4>
          <h2>{totalStock}</h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: 34 }}>
            {loading ? "⏳" : "✅"}
          </div>

          <h4>Status</h4>

          <h2>
            {loading ? "Loading..." : "Ready"}
          </h2>
        </div>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "1100px",
          width: "100%",
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  }}
>
  <div>
    <label>Company</label>

    <select
      value={company}
      onChange={(e) => {
        setCompany(e.target.value);
        setModelNo("");
      }}
      style={inputStyle}
      required
    >
      <option value="">Select Company</option>

      {[...new Set(items.map((i) => i.company))].map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label>Model</label>

    <select
      value={modelNo}
      onChange={(e) => setModelNo(e.target.value)}
      style={inputStyle}
      required
    >
      <option value="">Select Model</option>

      {items
        .filter((i) => i.company === company)
        .map((i) => (
          <option key={i.modelNo} value={i.modelNo}>
            {i.modelNo}
          </option>
        ))}
    </select>
  </div>
</div>

{currentItem && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "20px",
      background: "#F0FDF4",
      border: "1px solid #86EFAC",
      borderRadius: "16px",
      padding: "20px",
    }}
  >
    <div>
      <div style={{ color: "#6B7280", fontSize: "13px" }}>
        Current Stock
      </div>

      <h2 style={{ margin: 0 }}>
        {currentItem.openingStock}
      </h2>
    </div>

    <div>
      <div style={{ color: "#6B7280", fontSize: "13px" }}>
        Updated Stock
      </div>

      <h2 style={{ margin: 0, color: "#16A34A" }}>
        {currentItem.openingStock + Number(qty || 0)}
      </h2>
    </div>

    <div>
      <div style={{ color: "#6B7280", fontSize: "13px" }}>
        Minimum Stock
      </div>

      <h2 style={{ margin: 0 }}>
        {currentItem.minimumStock}
      </h2>
    </div>
  </div>
)}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  }}
>
  <div>
    <label>Quantity</label>

    <input
      type="number"
      value={qty}
      onChange={(e) => setQty(e.target.value)}
      placeholder="Enter Quantity"
      style={inputStyle}
      required
    />
  </div>

  <div>
    <label>Remark</label>

    <input
      type="text"
      value={remark}
      onChange={(e) => setRemark(e.target.value)}
      placeholder="Purchase / Return / Received..."
      style={inputStyle}
    />
  </div>
</div>

        <button
  type="submit"
  style={{
    width: "100%",
    background: "#16A34A",
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "bold",
    marginTop: "10px",
    boxShadow: "0 8px 18px rgba(22,163,74,.25)",
  }}
>
  📥 Save Stock In
</button>
      </form>
          </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "15px",
  outline: "none",
  background: "#FFFFFF",
  boxSizing: "border-box" as const,
  transition: "0.3s",
};