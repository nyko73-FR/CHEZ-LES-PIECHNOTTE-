fetch('../data/boissons.json').catch(()=>fetch('data/boissons.json')).then(r=>r.json()).then(data=>{
const c=document.getElementById('cards');const s=document.getElementById('search');
function draw(){
 const q=s.value.toLowerCase();
 c.className='grid'; c.innerHTML='';
 data.filter(b=>b.nom.toLowerCase().includes(q)).forEach(b=>{
   let cls=b.stock>5?'green':b.stock>1?'orange':'red';
   c.innerHTML+=`<div class="card ${cls}"><h3>${b.nom}</h3><p>${b.categorie}</p><p>Stock : ${b.stock}</p><button disabled>Commander (Sprint 3.2)</button></div>`;
 });
}
s.oninput=draw;draw();
});