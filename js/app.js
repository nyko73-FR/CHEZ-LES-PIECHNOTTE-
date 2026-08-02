const stock=[
{name:'Coca 33 cl',stock:7},
{name:'Oasis Tropical 33 cl',stock:6},
{name:'Goudale Blonde 25 cl',stock:10},
{name:'Ricard 1 L',stock:1}
];
const HKEY='piechnotte_history';
const SKEY='piechnotte_stock_v2';
let data=JSON.parse(localStorage.getItem(SKEY)||'null')||stock;
let hist=JSON.parse(localStorage.getItem(HKEY)||'[]');
function save(){localStorage.setItem(SKEY,JSON.stringify(data));localStorage.setItem(HKEY,JSON.stringify(hist));draw();}
function draw(){
cards.innerHTML='';
history.innerHTML='';
data.forEach((b,i)=>{
let d=document.createElement('div');
d.className='card';
d.innerHTML=`<h3>${b.name}</h3><p>Stock : ${b.stock}</p>`;
let bt=document.createElement('button');
bt.textContent='Commander';
bt.onclick=()=>{
 if(b.stock>0){
  b.stock--;
  hist.unshift(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' - '+b.name);
  save();
 } else alert('Stock épuisé');
};
d.appendChild(bt);
cards.appendChild(d);
});
hist.forEach(h=>{
 let li=document.createElement('li');
 li.textContent=h;
 history.appendChild(li);
});
}
draw();
