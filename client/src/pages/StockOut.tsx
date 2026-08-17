import { useEffect, useState } from "react";

type Item = {
  company: string;
  modelNo: string;
  openingStock: number;
  minimumStock: number;
};

export default function StockOut() {
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

  const remainingStock =
    currentItem && qty
      ? currentItem.openingStock - Number(qty)
      : currentItem?.openingStock ?? 0;

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
        "https://stellan-erp-api.onrender.com/stock/out",
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
        alert("✅ Stock Out Successful");

        setCompany("");
        setModelNo("");
        setQty("");
        setRemark("");

        loadItems();
      } else {
        alert(data.error || "Stock Out Failed");
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
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            📤 Stock Out
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6B7280",
            }}
          >
            Issue material and reduce inventory stock.
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
          <div style={{ fontSize: "34px" }}>🏢</div>
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
          <div style={{ fontSize: "34px" }}>📦</div>
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
          <div style={{ fontSize: "34px" }}>
            {loading ? "⏳" : "📤"}
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
          width: "100%",
          maxWidth: "1100px",
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 18px rgba(0,0,0,.06)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Company & Model */}

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

{/* Stock Details */}

{currentItem && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "20px",
      background: "#FEF2F2",
      border: "1px solid #FCA5A5",
      borderRadius: "16px",
      padding: "20px",
    }}
  >
    <div>
      <div
        style={{
          color: "#6B7280",
          fontSize: "13px",
          marginBottom: "6px",
        }}
      >
        Current Stock
      </div>

      <h2 style={{ margin: 0 }}>
        {currentItem.openingStock}
      </h2>
    </div>

    <div>
      <div
        style={{
          color: "#6B7280",
          fontSize: "13px",
          marginBottom: "6px",
        }}
      >
        Remaining Stock
      </div>

      <h2
        style={{
          margin: 0,
          color:
            remainingStock <= currentItem.minimumStock
              ? "#DC2626"
              : "#16A34A",
        }}
      >
        {remainingStock}
      </h2>
    </div>

    <div>
      <div
        style={{
          color: "#6B7280",
          fontSize: "13px",
          marginBottom: "6px",
        }}
      >
        Minimum Stock
      </div>

      <h2 style={{ margin: 0 }}>
        {currentItem.minimumStock}
      </h2>
    </div>

    {remainingStock <= currentItem.minimumStock && (
      <div
        style={{
          gridColumn: "1 / -1",
          background: "#DC2626",
          color: "#fff",
          padding: "12px",
          borderRadius: "10px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        ⚠️ Warning: Stock will reach minimum level.
      </div>
    )}
  </div>
)}

{/* Quantity & Remark */}

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
      placeholder="Production / Issue / Damage / Return..."
      style={inputStyle}
    />
  </div>
</div>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#DC2626",
            color: "#fff",
            border: "none",
            padding: "16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "17px",
            fontWeight: "bold",
            marginTop: "10px",
            boxShadow: "0 8px 18px rgba(220,38,38,.25)",
          }}
        >
          📤 Save Stock Out
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
};