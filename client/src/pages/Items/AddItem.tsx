import { useState } from "react";

const AddItem = () => {
  const [formData, setFormData] = useState({
    company: "",
    modelNo: "",
    hsnCode: "",
    itemCode: "",
    itemName: "",
    category: "",
    unit: "Nos",
    purchasePrice: "",
    openingStock: "",
    minimumStock: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const user = JSON.parse(
  localStorage.getItem("user") || "{}"
);

  const handleSave = async () => {
  try {
    const response = await fetch("http://localhost:5000/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": user.role,
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert("✅ Item Added Successfully");

      setFormData({
        company: "",
        modelNo: "",
        hsnCode: "",
        itemCode: "",
        itemName: "",
        category: "",
        unit: "Nos",
        purchasePrice: "",
        openingStock: "",
        minimumStock: "",
      });
    } else {
      alert(result.error || "Failed to save item");
    }
  } catch (error) {
    console.error(error);
    alert("❌ Server connection failed");
  }
};

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ marginBottom: "25px" }}>Add New Item</h1>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
          maxWidth: "900px",
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
            <input
              type="text"
              name="company"
              placeholder="Aarvee Pharma"
              value={formData.company}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Model No</label>
            <input
              type="text"
              name="modelNo"
              placeholder="ST-100"
              value={formData.modelNo}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>HSN Code</label>
            <input
              type="text"
              name="hsnCode"
              placeholder="84223000"
              value={formData.hsnCode}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Item Code</label>
            <input
              type="text"
              name="itemCode"
              placeholder="ST001"
              value={formData.itemCode}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Item Name</label>
            <input
              type="text"
              name="itemName"
              placeholder="Bearing"
              value={formData.itemName}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              <option value="Machine">Machine</option>
              <option value="Spare Parts">Spare Parts</option>
              <option value="Electrical">Electrical</option>
              <option value="Packaging">Packaging</option>
            </select>
          </div>

          <div>
            <label>Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Nos">Nos</option>
              <option value="Kg">Kg</option>
              <option value="Meter">Meter</option>
              <option value="Box">Box</option>
            </select>
          </div>

          <div>
            <label>Purchase Price (Admin Only)</label>
            <input
              type="number"
              name="purchasePrice"
              placeholder="0"
              value={formData.purchasePrice}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Opening Stock</label>
            <input
              type="number"
              name="openingStock"
              placeholder="0"
              value={formData.openingStock}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Minimum Stock</label>
            <input
              type="number"
              name="minimumStock"
              placeholder="10"
              value={formData.minimumStock}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            marginTop: "30px",
            background: "#ef3b3a",
            color: "#fff",
            border: "none",
            padding: "12px 35px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Save Item
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
  boxSizing: "border-box" as const,
};

export default AddItem;