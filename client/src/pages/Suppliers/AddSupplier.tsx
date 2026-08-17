import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddSupplier.css";

const AddSupplier = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    person: "",
    mobile: "",
    email: "",
    gst: "",
    address: "",
    city: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("https://stellan-erp-api.onrender.com/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      alert("Supplier Saved Successfully ✅");
      navigate("/suppliers");
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    console.error(error);
    alert("Server Connection Error");
  }
};

  return (
    <div className="add-item-page">
      <div className="page-header">
        <h1>🏢 Add Supplier</h1>
        <p>Create a new supplier for your inventory.</p>
      </div>

      <form className="item-form" onSubmit={handleSubmit}>
        <div className="grid">

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              name="person"
              value={formData.person}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            rows={4}
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/suppliers")}
          >
            Cancel
          </button>

          <button type="submit" className="save-btn">
            Save Supplier
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSupplier;