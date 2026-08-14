import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Company={company:string};
type Model={modelNo:string;hsnCode:string;unit:string;sellingPrice?:number};

export default function EditSale(){
const {id}=useParams();
const navigate=useNavigate();

const [companies,setCompanies]=useState<Company[]>([]);
const [models,setModels]=useState<Model[]>([]);
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

useEffect(()=>{
fetch("http://localhost:5000/items/companies").then(r=>r.json()).then(setCompanies);
},[]);

useEffect(()=>{
if(!form.company) return;
fetch(`http://localhost:5000/items/models/${encodeURIComponent(form.company)}`)
.then(r=>r.json())
.then(setModels);
},[form.company]);

useEffect(()=>{
fetch(`http://localhost:5000/sales/${id}`)
.then(r=>r.json())
.then(data=>{
setForm({
saleDate:data.sale_date||"",
invoiceNo:data.invoice_no||"",
customer:data.customer_name||"",
company:data.company_name||"",
model:data.model_no||"",
hsn:data.hsn_code||"",
unit:data.unit||"",
qty:Number(data.qty)||1,
price:Number(data.unit_price)||0,
discount:Number(data.discount)||0,
cgst:Number(data.cgst)||9,
sgst:Number(data.sgst)||9,
});
});
},[id]);

const subtotal=form.qty*form.price;
const taxable=subtotal-(subtotal*form.discount/100);
const total=taxable+(taxable*form.cgst/100)+(taxable*form.sgst/100);

async function handleUpdate(){
const res=await fetch(`http://localhost:5000/sales/${id}`,{
method:"PUT",
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
alert("Sale Updated Successfully");
navigate("/sales");
}else{
alert(data.error||"Update failed");
}
}

return (
<div style={{padding:30}}>
<h2>✏️ Edit Sale</h2>

<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:20}}>
<input type="date" value={form.saleDate} onChange={e=>setForm({...form,saleDate:e.target.value})}/>
<input value={form.invoiceNo} placeholder="Invoice No" onChange={e=>setForm({...form,invoiceNo:e.target.value})}/>
<input value={form.customer} placeholder="Customer Name" onChange={e=>setForm({...form,customer:e.target.value})}/>
</div>

<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr><th>Company</th><th>Model</th><th>HSN</th><th>Unit</th><th>Qty</th><th>Price</th><th>Discount</th><th>CGST</th><th>SGST</th><th>Total</th></tr></thead>
<tbody><tr>
<td>
<select value={form.company} onChange={e=>setForm({...form,company:e.target.value})}>
<option value="">Select Company</option>
{companies.map(c=><option key={c.company} value={c.company}>{c.company}</option>)}
</select>
</td>
<td>
<select value={form.model} onChange={e=>{
const m=models.find(x=>x.modelNo===e.target.value);
setForm({...form,model:e.target.value,hsn:m?.hsnCode||"",unit:m?.unit||"",price:Number(m?.sellingPrice||form.price)});
}}>
<option value="">Select Model</option>
{models.map(m=><option key={m.modelNo} value={m.modelNo}>{m.modelNo}</option>)}
</select>
</td>
<td><input readOnly value={form.hsn}/></td>
<td><input readOnly value={form.unit}/></td>
<td><input type="number" value={form.qty} onChange={e=>setForm({...form,qty:Number(e.target.value)})}/></td>
<td><input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/></td>
<td><input type="number" value={form.discount} onChange={e=>setForm({...form,discount:Number(e.target.value)})}/></td>
<td><input type="number" value={form.cgst} onChange={e=>setForm({...form,cgst:Number(e.target.value)})}/></td>
<td><input type="number" value={form.sgst} onChange={e=>setForm({...form,sgst:Number(e.target.value)})}/></td>
<td><input readOnly value={total.toFixed(2)}/></td>
</tr></tbody>
</table>

<button onClick={handleUpdate} style={{marginTop:20,padding:"10px 20px",background:"#EF3B3A",color:"#fff",border:"none",borderRadius:6}}>
💾 Update Sale
</button>
</div>
);
}