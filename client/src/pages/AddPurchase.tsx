import { useEffect, useState } from "react";

type Supplier = {
  id: number;
  company: string;
};

type Company = {
  company: string;
};

type Model = {
  modelNo: string;
  hsnCode: string;
  unit: string;
};

export default function AddPurchase() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    purchaseDate: "",
    invoiceNo: "",
    supplier: "",
    company: "",
    model: "",
    hsn: "",
    unit: "",
    qty: 1,
    price: 0,
    discount: 0,
    cgst: 9,
    sgst: 9,
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [saving, setSaving] = useState(false);

  // ================= LOAD SUPPLIERS =================

  useEffect(() => {
    fetch("http://localhost:5000/suppliers")
      .then((r) => r.json())
      .then(setSuppliers)
      .catch((err) => console.error(err));
  }, []);

  // ================= LOAD COMPANIES =================

  useEffect(() => {
    fetch("http://localhost:5000/items/companies")
      .then((r) => r.json())
      .then(setCompanies)
      .catch((err) => console.error(err));
  }, []);

  // ================= LOAD MODELS =================

  useEffect(() => {
    if (!form.company) {
      setModels([]);
      return;
    }

    fetch(
      `http://localhost:5000/items/models/${encodeURIComponent(
        form.company
      )}`
    )
      .then((r) => r.json())
      .then(setModels)
      .catch((err) => console.error(err));
  }, [form.company]);

  // ================= CALCULATIONS =================

  const subtotal = form.qty * form.price;

  const discountAmount =
    subtotal * (form.discount / 100);

  const taxableAmount =
    subtotal - discountAmount;

  const cgstAmount =
    taxableAmount * (form.cgst / 100);

  const sgstAmount =
    taxableAmount * (form.sgst / 100);

  const totalAmount =
    taxableAmount + cgstAmount + sgstAmount;

  // ================= SAVE PURCHASE =================

  const handleSave = async () => {
    if (!form.purchaseDate) {
      alert("Please select purchase date");
      return;
    }

    if (!form.invoiceNo.trim()) {
      alert("Please enter invoice number");
      return;
    }

    if (!form.supplier) {
      alert("Please select supplier");
      return;
    }

    if (!form.company) {
      alert("Please select company");
      return;
    }

    if (!form.model) {
      alert("Please select model");
      return;
    }

    if (form.qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:5000/purchases",
        {
          method: "POST",
          headers: {
  "Content-Type": "application/json",
  "x-user-role": user.role,
  "x-user-name": user.username || user.full_name || "System",
},
          body: JSON.stringify({
            purchase_date: form.purchaseDate,
            invoice_no: form.invoiceNo,
            supplier_id: Number(form.supplier),
            company_name: form.company,
            model_no: form.model,
            hsn_code: form.hsn,
            unit: form.unit,
            qty: form.qty,
            unit_price: form.price,
            discount: form.discount,
            discounted_price: taxableAmount,
            cgst: form.cgst,
            sgst: form.sgst,
            amount: totalAmount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("✅ Purchase Saved Successfully");

        setForm({
          purchaseDate: "",
          invoiceNo: "",
          supplier: "",
          company: "",
          model: "",
          hsn: "",
          unit: "",
          qty: 1,
          price: 0,
          discount: 0,
          cgst: 9,
          sgst: 9,
        });
      } else {
        alert(data.error || "Failed to save purchase");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server Connection Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#F4F7FC",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          🛒 Add Purchase
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            color: "#6B7280",
            fontSize: "14px",
          }}
        >
          Record a new purchase and automatically update inventory stock.
        </p>
      </div>

      {/* ================= BASIC DETAILS ================= */}

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "14px",
          padding: "25px",
          marginBottom: "22px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            margin: "0 0 20px",
            color: "#1F2937",
            fontSize: "18px",
          }}
        >
          📋 Purchase Details
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Date */}

          <div>
            <label style={labelStyle}>
              Purchase Date
            </label>

            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  purchaseDate: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          {/* Invoice */}

          <div>
            <label style={labelStyle}>
              Invoice Number
            </label>

            <input
              type="text"
              placeholder="Enter invoice number"
              value={form.invoiceNo}
              onChange={(e) =>
                setForm({
                  ...form,
                  invoiceNo: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          {/* Supplier */}

          <div>
            <label style={labelStyle}>
              Supplier
            </label>

            <select
              value={form.supplier}
              onChange={(e) =>
                setForm({
                  ...form,
                  supplier: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="">
                Select Supplier
              </option>

              {suppliers.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= ITEM DETAILS ================= */}

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "14px",
          padding: "25px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            margin: "0 0 20px",
            color: "#1F2937",
            fontSize: "18px",
          }}
        >
          📦 Item Details
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "18px",
          }}
        >
          {/* Company */}

          <div>
            <label style={labelStyle}>
              Company
            </label>

            <select
              value={form.company}
              onChange={(e) =>
                setForm({
                  ...form,
                  company: e.target.value,
                  model: "",
                  hsn: "",
                  unit: "",
                })
              }
              style={inputStyle}
            >
              <option value="">
                Select Company
              </option>

              {companies.map((c) => (
                <option
                  key={c.company}
                  value={c.company}
                >
                  {c.company}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}

          <div>
            <label style={labelStyle}>
              Model No.
            </label>

            <select
              value={form.model}
              onChange={(e) => {
                const selectedModel =
                  models.find(
                    (m) =>
                      m.modelNo === e.target.value
                  );

                setForm({
                  ...form,
                  model: e.target.value,
                  hsn:
                    selectedModel?.hsnCode || "",
                  unit:
                    selectedModel?.unit || "",
                });
              }}
              style={inputStyle}
              disabled={!form.company}
            >
              <option value="">
                Select Model
              </option>

              {models.map((m) => (
                <option
                  key={m.modelNo}
                  value={m.modelNo}
                >
                  {m.modelNo}
                </option>
              ))}
            </select>
          </div>

          {/* HSN */}

          <div>
            <label style={labelStyle}>
              HSN Code
            </label>

            <input
              value={form.hsn}
              readOnly
              placeholder="Auto"
              style={{
                ...inputStyle,
                background: "#F3F4F6",
              }}
            />
          </div>

          {/* Unit */}

          <div>
            <label style={labelStyle}>
              Unit
            </label>

            <input
              value={form.unit}
              readOnly
              placeholder="Auto"
              style={{
                ...inputStyle,
                background: "#F3F4F6",
              }}
            />
          </div>

          {/* Quantity */}

          <div>
            <label style={labelStyle}>
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={form.qty}
              onChange={(e) =>
                setForm({
                  ...form,
                  qty: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>

          {/* Price */}

          <div>
            <label style={labelStyle}>
              Unit Price (₹)
            </label>

            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>

          {/* Discount */}

          <div>
            <label style={labelStyle}>
              Discount (%)
            </label>

            <input
              type="number"
              min="0"
              value={form.discount}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>

          {/* CGST */}

          <div>
            <label style={labelStyle}>
              CGST (%)
            </label>

            <input
              type="number"
              min="0"
              value={form.cgst}
              onChange={(e) =>
                setForm({
                  ...form,
                  cgst: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>

          {/* SGST */}

          <div>
            <label style={labelStyle}>
              SGST (%)
            </label>

            <input
              type="number"
              min="0"
              value={form.sgst}
              onChange={(e) =>
                setForm({
                  ...form,
                  sgst: Number(e.target.value),
                })
              }
              style={inputStyle}
            />
          </div>
        </div>

        {/* ================= TOTAL SECTION ================= */}

        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            borderRadius: "12px",
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <SummaryBox
              title="Subtotal"
              value={subtotal}
            />

            <SummaryBox
              title="Discount"
              value={discountAmount}
            />

            <SummaryBox
              title={`CGST (${form.cgst}%)`}
              value={cgstAmount}
            />

            <SummaryBox
              title={`SGST (${form.sgst}%)`}
              value={sgstAmount}
            />

            <div
              style={{
                background: "#FFF1F2",
                borderRadius: "10px",
                padding: "15px",
                border: "1px solid #FECACA",
              }}
            >
              <div
                style={{
                  color: "#6B7280",
                  fontSize: "13px",
                  marginBottom: "5px",
                }}
              >
                Grand Total
              </div>

              <div
                style={{
                  color: "#EF3B3A",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                ₹{totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= BUTTONS ================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "25px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            style={cancelButtonStyle}
          >
            ← Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...saveButtonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            {saving
              ? "⏳ Saving..."
              : "💾 Save Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  height: "44px",
  padding: "0 12px",
  borderRadius: "8px",
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box" as const,
};

const cancelButtonStyle = {
  padding: "12px 22px",
  borderRadius: "8px",
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const saveButtonStyle = {
  padding: "12px 25px",
  borderRadius: "8px",
  border: "none",
  background: "#EF3B3A",
  color: "#FFFFFF",
  fontSize: "14px",
  fontWeight: 600,
  boxShadow: "0 5px 12px rgba(239,59,58,0.25)",
};

function SummaryBox({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "10px",
        padding: "15px",
        border: "1px solid #E5E7EB",
      }}
    >
      <div
        style={{
          color: "#6B7280",
          fontSize: "13px",
          marginBottom: "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        ₹
        {value.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}
      </div>
    </div>
  );
}