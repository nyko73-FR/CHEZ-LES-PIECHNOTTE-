const stock=JSON.parse(localStorage.getItem('piechnotte_stock')||'[]');
const hist=JSON.parse(localStorage.getItem('piechnotte_history')||'[]');
const stats=document.getElementById('stats');

const low=stock.filter(x=>x.stock<=2).length;
const total=stock.reduce((a,b)=>a+b.stock,0);

const count={};
hist.forEach(h=>count[h.nom]=(count[h.nom]||0)+1);
let top='Aucune';
let max=0;
Object.entries(count).forEach(([k,v])=>{if(v>max){max=v;top=k;}});

stats.innerHTML=`
<div class='row'><b>Boissons</b><span>${stock.length}</span></div>
<div class='row'><b>Stock total</b><span>${total}</span></div>
<div class='row'><b>Commandes</b><span>${hist.length}</span></div>
<div class='row'><b>Stocks faibles</b><span>${low}</span></div>
<div class='row'><b>La plus commandée</b><span>${top}</span></div>`;
