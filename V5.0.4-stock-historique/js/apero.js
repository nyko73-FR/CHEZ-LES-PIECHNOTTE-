// Chez les Piechnotte V5.0.4
// Sauvegarde locale + historique

document.addEventListener("DOMContentLoaded", async () => {
 const STOCK_KEY="piechnotte_stock";
 const HIST_KEY="piechnotte_history";
 const container=document.getElementById("drinks");
 const search=document.getElementById("search");

 let boissons=JSON.parse(localStorage.getItem(STOCK_KEY)||"null");

 if(!boissons){
   const r=await fetch("../data/boissons.json");
   boissons=await r.json();
   localStorage.setItem(STOCK_KEY,JSON.stringify(boissons));
 }

 function save(){localStorage.setItem(STOCK_KEY,JSON.stringify(boissons));}

 function historyAdd(name){
   const hist=JSON.parse(localStorage.getItem(HIST_KEY)||"[]");
   hist.unshift({
     nom:name,
     heure:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
   });
   localStorage.setItem(HIST_KEY,JSON.stringify(hist));
 }

 const color=s=>s>5?"#2ecc71":s>2?"#f39c12":"#e74c3c";

 function draw(filter=""){
   container.innerHTML="";
   boissons.filter(b=>b.nom.toLowerCase().includes(filter.toLowerCase())).forEach(b=>{
     const card=document.createElement("article");
     card.className="drink-card";
     card.style.borderLeft="6px solid "+color(b.stock);
     card.innerHTML=`<h2>${b.nom}</h2>
     <p>${b.categorie}</p>
     <p>Stock : <strong>${b.stock}</strong></p>
     <button ${b.stock===0?"disabled":""}>${b.stock===0?"Rupture":"Commander"}</button>`;
     const btn=card.querySelector("button");
     btn.onclick=()=>{
       if(b.stock<=0)return;
       b.stock--;
       historyAdd(b.nom);
       save();
       draw(search.value);
     };
     container.appendChild(card);
   });
 }

 search?.addEventListener("input",e=>draw(e.target.value));
 draw();
});
