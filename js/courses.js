
const stock=JSON.parse(localStorage.getItem('piechnotte_v402')||'[]');
const out=document.getElementById('list');
const low=stock.filter(x=>x.stock<=2);
if(!low.length){
 out.innerHTML='<p class="ok">Aucun réapprovisionnement nécessaire.</p>';
}else{
 low.forEach(p=>{
  out.innerHTML+=`<div class="item"><b>${p.nom}</b><br>Stock restant : ${p.stock}</div>`;
 });
}
