
const key='piechnotte_v402';
const data=JSON.parse(localStorage.getItem(key)||'[]');
const cats={};
let low=0,total=0;
data.forEach(x=>{
 cats[x.categorie]=(cats[x.categorie]||0)+(x.stock??0);
 if((x.stock??0)<=2) low++;
 total+=x.stock??0;
});
const el=document.getElementById('stats');
el.innerHTML=`<div class='row'><b>Produits</b><span>${data.length}</span></div>
<div class='row'><b>Stock total</b><span>${total}</span></div>
<div class='row'><b>Stocks faibles</b><span>${low}</span></div>`;
Object.entries(cats).forEach(([k,v])=>{
 el.innerHTML+=`<div class='row'><span>${k}</span><span>${v}</span></div>`;
});
