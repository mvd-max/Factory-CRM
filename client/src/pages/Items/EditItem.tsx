  import { useEffect, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";

  const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(
  localStorage.getItem("user") || "{}"
);
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
    useEffect(() => {
      fetch(`http://localhost:5000/items/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            company: data.company || "",
            modelNo: data.modelNo || "",
            hsnCode: data.hsnCode || "",
            itemCode: data.itemCode || "",
            itemName: data.itemName || "",
            category: data.category || "",
            unit: data.unit || "Nos",
            purchasePrice: data.purchasePrice || "",
            openingStock: data.openingStock || "",
            minimumStock: data.minimumStock || "",
          });
        })
        .catch((err) => console.error(err));
    }, [id]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const handleUpdate = async () => {
      try {
        const response = await fetch(`http://localhost:5000/items/${id}`, {
          method: "PUT",
          headers: {
  "Content-Type": "application/json",
  "x-user-role": user.role,
},
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          alert("✅ Item Updated Successfully");
          navigate("/items");
        } else {
          alert(result.error || "Failed to update item");
        }
      } catch (error) {
        console.error(error);
        alert("❌ Server connection failed");
      }
    };

    return (
      <div style={{ padding: "30px" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "700",
              color: "#1F2937",
            }}
          >
            Edit Item
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6B7280",
              fontSize: "15px",
            }}
          >
            Update item details, pricing and stock information.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
            maxWidth: "900px",
            margin: "0 auto",
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
                value={formData.minimumStock}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "35px",
            }}
          >
            <button
              onClick={() => navigate("/items")}
              style={{
                background: "#E5E7EB",
                color: "#111827",
                border: "none",
                padding: "14px 35px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              ← Cancel
            </button>

            <button
              onClick={handleUpdate}
              style={{
                background: "#EF3B3A",
                color: "#fff",
                border: "none",
                padding: "14px 40px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(239,59,58,0.25)",
              }}
            >
              💾 Update Item
            </button>
          </div>
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

  export default EditItem;