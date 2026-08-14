import { useEffect, useState } from "react";

type Company={company:string};
type Model={modelNo:string;hsnCode:string;unit:string;sellingPrice?:number};

export default function AddSale(){
const [form,setForm]=useState({
saleDate:"",
invoiceNo:"",
customer:"",
company:"",
model:"",
hsn:"",
unit:"",
qty:1,
price:0,
discount:0,
cgst:9,
sgst:9,
});
const [companies,setCompanies]=useState<Company[]>([]);
const [models,setModels]=useState<Model[]>([]);

useEffect(()=>{fetch("http://localhost:5000/items/companies").then(r=>r.json()).then(setCompanies)},[]);
useEffect(()=>{
if(!form.company){setModels([]);return;}
fetch(`http://localhost:5000/items/models/${encodeURIComponent(form.company)}`).then(r=>r.json()).then(setModels);
},[form.company]);

const subtotal=form.qty*form.price;
const taxable=subtotal-(subtotal*form.discount/100);
const total=taxable+(taxable*form.cgst/100)+(taxable*form.sgst/100);

async function handleSave(){
const res=await fetch("http://localhost:5000/sales",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
sale_date:form.saleDate,
invoice_no:form.invoiceNo,
customer_name:form.customer,
company_name:form.company,
model_no:form.model,
hsn_code:form.hsn,
unit:form.unit,
qty:form.qty,
unit_price:form.price,
discount:form.discount,
discounted_price:taxable,
cgst:form.cgst,
sgst:form.sgst,
amount:total
})
});
const data=await res.json();
if(res.ok){
alert("✅ Sale Saved Successfully");
setForm({saleDate:"",invoiceNo:"",customer:"",company:"",model:"",hsn:"",unit:"",qty:1,price:0,discount:0,cgst:9,sgst:9});
}else alert(data.error||"Save failed");
}

return (
<div style={{padding:30}}>
<h2>💰 Add Sale</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:20}}>
<input type="date" value={form.saleDate} onChange={e=>setForm({...form,saleDate:e.target.value})}/>
<input placeholder="Invoice No" value={form.invoiceNo} onChange={e=>setForm({...form,invoiceNo:e.target.value})}/>
<input placeholder="Customer Name" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/>
</div>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr><th>Company</th><th>Model</th><th>HSN</th><th>Unit</th><th>Qty</th><th>Price</th><th>Discount</th><th>CGST</th><th>SGST</th><th>Total</th></tr></thead>
<tbody><tr>
<td><select value={form.company} onChange={e=>setForm({...form,company:e.target.value,model:"",hsn:"",unit:"",price:0})}><option value="">Select Company</option>{companies.map(c=><option key={c.company}>{c.company}</option>)}</select></td>
<td><select value={form.model} onChange={e=>{const m=models.find(x=>x.modelNo===e.target.value);setForm({...form,model:e.target.value,hsn:m?.hsnCode||"",unit:m?.unit||"",price:Number(m?.sellingPrice||0)})}}><option value="">Select Model</option>{models.map(m=><option key={m.modelNo} value={m.modelNo}>{m.modelNo}</option>)}</select></td>
<td><input readOnly value={form.hsn}/></td>
<td><input readOnly value={form.unit}/></td>
<td><input type="number" value={form.qty} onChange={e=>setForm({...form,qty:Number(e.target.value)})}/></td>
<td><input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/></td>
<td><input type="number" value={form.discount} onChange={e=>setForm({...form,discount:Number(e.target.value)})}/></td>
<td><input type="number" value={form.cgst} onChange={e=>setForm({...form,cgst:Number(e.target.value)})}/></td>
<td><input type="number" value={form.sgst} onChange={e=>setForm({...form,sgst:Number(e.target.value)})}/></td>
<td><input readOnly value={total.toFixed(2)}/></td>
</tr></tbody></table>
<button onClick={handleSave} style={{marginTop:20,padding:"10px 20px",background:"#EF3B3A",color:"#fff",border:"none",borderRadius:6}}>💾 Save Sale</button>
</div>);
}