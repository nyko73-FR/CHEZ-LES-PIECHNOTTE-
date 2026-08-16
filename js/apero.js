const KEY='piechnotte_v402';
fetch('../data/boissons.json').then(r=>r.json()).then(init=>{
let data=JSON.parse(localStorage.getItem(KEY)||'null')||init;
const cards=document.getElementById('cards'),search=document.getElementById('search');
const cls=s=>s>5?'g':s>1?'o':'r';
function save(){localStorage.setItem(KEY,JSON.stringify(data));draw();}
function draw(){
cards.innerHTML='';
data.filter(b=>b.nom.toLowerCase().includes(search.value.toLowerCase())).forEach(b=>{
const c=document.createElement('div');
c.className='card '+cls(b.stock);
c.innerHTML=`<h3>${b.nom}</h3><p>${b.categorie}</p><p>Stock : <b>${b.stock}</b></p>`;
const bt=document.createElement('button');
bt.textContent='Commander';
bt.onclick=()=>{if(b.stock>0){b.stock--;save();}else alert('Stock épuisé');};
c.appendChild(bt);cards.appendChild(c);
});
}
search.oninput=draw;draw();
});