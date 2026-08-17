import "./Customers.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name:"",
    company_name:"",
    gst_number:"",
    mobile:"",
    email:"",
    address:"",
    city:"",
    state:"",
    pincode:"",
    status:"Active"
  });

  useEffect(()=>{
    fetch(`https://stellan-erp-api.onrender.com/customers/${id}`)
      .then(r=>r.json())
      .then(setForm);
  },[id]);

  const change=(e:any)=>setForm({...form,[e.target.name]:e.target.value});

  const update=async(e:any)=>{
    e.preventDefault();
    const res=await fetch(`https://stellan-erp-api.onrender.com/customers/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form)
    });
    const data=await res.json();
    if(res.ok){
      alert(data.message||"Customer Updated Successfully");
      navigate("/customers");
    }else{
      alert(data.error||"Update Failed");
    }
  };

  return (
    <div style={{padding:25,maxWidth:900}}>
      <h2>Edit Customer</h2>
      <form onSubmit={update} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <input name="customer_name" value={form.customer_name} onChange={change} placeholder="Customer Name"/>
        <input name="company_name" value={form.company_name} onChange={change} placeholder="Company Name"/>
        <input name="mobile" value={form.mobile} onChange={change} placeholder="Mobile"/>
        <input name="gst_number" value={form.gst_number} onChange={change} placeholder="GST Number"/>
        <input name="email" value={form.email} onChange={change} placeholder="Email"/>
        <input name="city" value={form.city} onChange={change} placeholder="City"/>
        <input name="state" value={form.state} onChange={change} placeholder="State"/>
        <input name="pincode" value={form.pincode} onChange={change} placeholder="Pincode"/>
        <textarea name="address" value={form.address} onChange={change} placeholder="Address" style={{gridColumn:"1 / span 2",minHeight:80}}/>
        <select name="status" value={form.status} onChange={change}>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <div style={{gridColumn:"1 / span 2",display:"flex",gap:10}}>
          <button type="submit">Update Customer</button>
          <button type="button" onClick={()=>navigate("/customers")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}