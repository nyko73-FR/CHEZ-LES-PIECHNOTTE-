const key='piechnotte_stock';
fetch('data/boissons.json').then(r=>r.json()).then(init=>{
let data=JSON.parse(localStorage.getItem(key)||'null')||init;
const el=document.getElementById('list');
function save(){localStorage.setItem(key,JSON.stringify(data));render();}
function render(){
el.innerHTML='';
data.forEach(b=>{
let d=document.createElement('div');d.className='card';
d.innerHTML=`<h3>${b.nom}</h3><p>Stock : <span class='stock'>${b.stock}</span></p>`;
let bt=document.createElement('button');
bt.textContent='Commander';
bt.onclick=()=>{if(b.stock>0){b.stock--;save();alert('Bonne dégustation !')}else alert('Stock épuisé');};
d.appendChild(bt);el.appendChild(d);
});
}
render();
});