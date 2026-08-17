import "./Customers.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    company_name: "",
    gst_number: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    status: "Active",
  });

  const change = (e:any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e:any) => {
    e.preventDefault();

    if (!form.customer_name || !form.mobile) {
      alert("Customer Name and Mobile are required.");
      return;
    }

    const res = await fetch("https://stellan-erp-api.onrender.com/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Customer Added Successfully");
      navigate("/customers");
    } else {
      alert(data.error || "Failed to add customer");
    }
  };

  return (
    <div style={{ padding: 25, maxWidth: 900 }}>
      <h2>Add Customer</h2>

      <form onSubmit={save} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <input name="customer_name" placeholder="Customer Name *" value={form.customer_name} onChange={change}/>
        <input name="company_name" placeholder="Company Name" value={form.company_name} onChange={change}/>
        <input name="mobile" placeholder="Mobile *" value={form.mobile} onChange={change}/>
        <input name="gst_number" placeholder="GST Number" value={form.gst_number} onChange={change}/>
        <input name="email" placeholder="Email" value={form.email} onChange={change}/>
        <input name="city" placeholder="City" value={form.city} onChange={change}/>
        <input name="state" placeholder="State" value={form.state} onChange={change}/>
        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={change}/>
        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={change}
          style={{ gridColumn:"1 / span 2", minHeight:80 }}
        />
        <select name="status" value={form.status} onChange={change}>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <div style={{ gridColumn:"1 / span 2", display:"flex", gap:10 }}>
          <button type="submit">Save Customer</button>
          <button type="button" onClick={()=>navigate("/customers")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}