import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

export default function EditPurchase() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

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

  // ================= LOAD PURCHASE =================

  useEffect(() => {
    if (!id) return;

    const loadPurchase = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:5000/purchases/${id}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Purchase not found");
        }

        setForm({
          purchaseDate: data.purchase_date || "",
          invoiceNo: data.invoice_no || "",
          supplier: String(data.supplier_id || ""),
          company: data.company_name || "",
          model: data.model_no || "",
          hsn: data.hsn_code || "",
          unit: data.unit || "",
          qty: Number(data.qty || 1),
          price: Number(data.unit_price || 0),
          discount: Number(data.discount || 0),
          cgst: Number(data.cgst || 9),
          sgst: Number(data.sgst || 9),
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load purchase");
      } finally {
        setLoading(false);
      }
    };

    loadPurchase();
  }, [id]);

  // ================= LOAD SUPPLIERS =================

  useEffect(() => {
    fetch("http://localhost:5000/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error(err));
  }, []);

  // ================= LOAD COMPANIES =================

  useEffect(() => {
    fetch("http://localhost:5000/items/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
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
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((err) => console.error(err));
  }, [form.company]);

  // ================= CALCULATION =================

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

  // ================= UPDATE =================

  const handleUpdate = async () => {
    if (!id) return;

    if (
      !form.purchaseDate ||
      !form.invoiceNo ||
      !form.supplier ||
      !form.company ||
      !form.model ||
      !form.qty
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/purchases/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user.role,
          },
          body: JSON.stringify({
            purchase_date: form.purchaseDate,
            invoice_no: form.invoiceNo,
            supplier_id: Number(form.supplier),
            company_name: form.company,
            model_no: form.model,
            hsn_code: form.hsn,
            unit: form.unit,
            qty: Number(form.qty),
            unit_price: Number(form.price),
            discount: Number(form.discount),
            discounted_price: taxableAmount,
            cgst: Number(form.cgst),
            sgst: Number(form.sgst),
            amount: totalAmount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ Purchase Updated Successfully");
        navigate("/purchases");
      } else {
        alert(data.error || "Update Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Connection Error");
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          color: "#6B7280",
        }}
      >
        ⏳ Loading Purchase...
      </div>
    );
  }

  // ================= PAGE =================

  return (
    <div
      style={{
        padding: "28px 32px 40px",
        background: "#F4F7FC",
        minHeight: "100%",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            🛒 Update Purchase
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#6B7280",
              fontSize: "14px",
            }}
          >
            Edit purchase details and update inventory.
          </p>
        </div>

        <button
          onClick={() => navigate("/purchases")}
          style={{
            background: "#FFFFFF",
            border: "1px solid #D1D5DB",
            color: "#374151",
            padding: "10px 18px",
            borderRadius: "9px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Back to Purchases
        </button>
      </div>

      {/* ================= PURCHASE INFO ================= */}

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>
          📋 Purchase Information
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          {/* DATE */}

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

          {/* INVOICE */}

          <div>
            <label style={labelStyle}>
              Invoice No
            </label>

            <input
              type="text"
              value={form.invoiceNo}
              placeholder="Enter invoice number"
              onChange={(e) =>
                setForm({
                  ...form,
                  invoiceNo: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          {/* SUPPLIER */}

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

              {suppliers.map((supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= PRODUCT DETAILS ================= */}

      <div
        style={{
          ...cardStyle,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div style={sectionTitleStyle}>
            📦 Product Details
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#F8FAFC",
                  borderBottom:
                    "2px solid #EF3B3A",
                }}
              >
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Model</th>
                <th style={thStyle}>HSN</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>
                  Discount %
                </th>
                <th style={thStyle}>CGST %</th>
                <th style={thStyle}>SGST %</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                {/* COMPANY */}

                <td style={tdStyle}>
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
                    style={tableInputStyle}
                  >
                    <option value="">
                      Select Company
                    </option>

                    {companies.map((company) => (
                      <option
                        key={company.company}
                        value={company.company}
                      >
                        {company.company}
                      </option>
                    ))}
                  </select>
                </td>

                {/* MODEL */}

                <td style={tdStyle}>
                  <select
                    value={form.model}
                    onChange={(e) => {
                      const selected =
                        models.find(
                          (m) =>
                            m.modelNo ===
                            e.target.value
                        );

                      setForm({
                        ...form,
                        model: e.target.value,
                        hsn:
                          selected?.hsnCode || "",
                        unit:
                          selected?.unit || "",
                      });
                    }}
                    style={tableInputStyle}
                  >
                    <option value="">
                      Select Model
                    </option>

                    {models.map((model) => (
                      <option
                        key={model.modelNo}
                        value={model.modelNo}
                      >
                        {model.modelNo}
                      </option>
                    ))}
                  </select>
                </td>

                {/* HSN */}

                <td style={tdStyle}>
                  <input
                    value={form.hsn}
                    readOnly
                    style={{
                      ...tableInputStyle,
                      background: "#F8FAFC",
                    }}
                  />
                </td>

                {/* UNIT */}

                <td style={tdStyle}>
                  <input
                    value={form.unit}
                    readOnly
                    style={{
                      ...tableInputStyle,
                      background: "#F8FAFC",
                    }}
                  />
                </td>

                {/* QTY */}

                <td style={tdStyle}>
                  <input
                    type="number"
                    min="1"
                    value={form.qty}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        qty: Number(
                          e.target.value
                        ),
                      })
                    }
                    style={tableInputStyle}
                  />
                </td>

                {/* PRICE */}

                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: Number(
                          e.target.value
                        ),
                      })
                    }
                    style={tableInputStyle}
                  />
                </td>

                {/* DISCOUNT */}

                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount: Number(
                          e.target.value
                        ),
                      })
                    }
                    style={tableInputStyle}
                  />
                </td>

                {/* CGST */}

                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    value={form.cgst}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cgst: Number(
                          e.target.value
                        ),
                      })
                    }
                    style={tableInputStyle}
                  />
                </td>

                {/* SGST */}

                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    value={form.sgst}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sgst: Number(
                          e.target.value
                        ),
                      })
                    }
                    style={tableInputStyle}
                  />
                </td>

                {/* TOTAL */}

                <td style={tdStyle}>
                  <div
                    style={{
                      background: "#ECFDF5",
                      color: "#16A34A",
                      border:
                        "1px solid #BBF7D0",
                      padding: "10px",
                      borderRadius: "7px",
                      fontWeight: 700,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ₹{" "}
                    {totalAmount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= BOTTOM SECTION ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 380px",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        {/* LEFT INFO */}

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            📝 Purchase Summary
          </div>

          <div
            style={{
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: 1.8,
            }}
          >
            <div>
              <strong>Supplier:</strong>{" "}
              {suppliers.find(
                (s) =>
                  String(s.id) === form.supplier
              )?.company || "-"}
            </div>

            <div>
              <strong>Company:</strong>{" "}
              {form.company || "-"}
            </div>

            <div>
              <strong>Model:</strong>{" "}
              {form.model || "-"}
            </div>

            <div>
              <strong>Quantity:</strong>{" "}
              {form.qty}
            </div>
          </div>
        </div>

        {/* AMOUNT SUMMARY */}

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            💰 Amount Summary
          </div>

          <div style={summaryRow}>
            <span>Subtotal</span>
            <strong>
              ₹{" "}
              {subtotal.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div style={summaryRow}>
            <span>Discount</span>
            <strong>
              ₹{" "}
              {discountAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div style={summaryRow}>
            <span>Taxable Amount</span>
            <strong>
              ₹{" "}
              {taxableAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div style={summaryRow}>
            <span>CGST</span>
            <strong>
              ₹{" "}
              {cgstAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div style={summaryRow}>
            <span>SGST</span>
            <strong>
              ₹{" "}
              {sgstAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div
            style={{
              borderTop:
                "1px solid #D1D5DB",
              marginTop: "12px",
              paddingTop: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong
              style={{
                fontSize: "17px",
                color: "#111827",
              }}
            >
              Total Amount
            </strong>

            <strong
              style={{
                fontSize: "19px",
                color: "#16A34A",
              }}
            >
              ₹{" "}
              {totalAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "22px",
        }}
      >
        <button
          onClick={() => navigate("/purchases")}
          style={{
            padding: "12px 24px",
            background: "#FFFFFF",
            border: "1px solid #D1D5DB",
            color: "#374151",
            borderRadius: "9px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          style={{
            padding: "12px 28px",
            background: "#EF3B3A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "9px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow:
              "0 6px 15px rgba(239,59,58,.25)",
          }}
        >
          💾 Update Purchase
        </button>
      </div>
    </div>
  );
}

// ================= STYLES =================

const cardStyle = {
  background: "#FFFFFF",
  padding: "22px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,.05)",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#111827",
  marginBottom: "18px",
};

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
  fontSize: "14px",
  color: "#111827",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box" as const,
};

const tableInputStyle = {
  width: "100%",
  minWidth: "85px",
  height: "38px",
  padding: "0 8px",
  borderRadius: "7px",
  border: "1px solid #D1D5DB",
  fontSize: "13px",
  color: "#111827",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box" as const,
};

const thStyle = {
  padding: "13px 10px",
  textAlign: "left" as const,
  fontSize: "12px",
  fontWeight: 700,
  color: "#374151",
  whiteSpace: "nowrap" as const,
};

const tdStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #E5E7EB",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  color: "#4B5563",
  fontSize: "14px",
};