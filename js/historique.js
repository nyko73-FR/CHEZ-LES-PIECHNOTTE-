
const stockKey='piechnotte_v402';
const histKey='piechnotte_history';
const stock=JSON.parse(localStorage.getItem(stockKey)||'[]');
const hist=JSON.parse(localStorage.getItem(histKey)||'[]');
document.getElementById('stats').innerHTML=
`<h2>📊 Tableau de bord</h2>
<p>Produits : <b>${stock.length}</b></p>
<p>Commandes : <b>${hist.length}</b></p>
<p>Stocks faibles : <b>${stock.filter(x=>x.stock<=2).length}</b></p>`;
const box=document.getElementById('history');
if(hist.length===0){
 box.innerHTML+="<p>Aucune commande enregistrée pour le moment.</p>";
}else{
 box.innerHTML+="<h2>Historique</h2>";
 hist.slice().reverse().forEach(h=>{
   box.innerHTML+=`<div class='item'><span>${h.nom}</span><span>${h.heure}</span></div>`;
 });
}
