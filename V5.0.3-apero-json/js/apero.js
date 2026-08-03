// Chez les Piechnotte V5.0.3
// Génère automatiquement les cartes depuis data/boissons.json

document.addEventListener("DOMContentLoaded", async () => {

  const container=document.getElementById("drinks");
  const search=document.getElementById("search");

  let boissons=[];

  try{
    const r=await fetch("../data/boissons.json");
    boissons=await r.json();
  }catch(e){
    container.innerHTML="<p>Impossible de charger les boissons.</p>";
    return;
  }

  function color(stock){
    if(stock>5) return "#2ecc71";
    if(stock>2) return "#f39c12";
    return "#e74c3c";
  }

  function afficher(filtre=""){
    container.innerHTML="";
    boissons
      .filter(b=>b.nom.toLowerCase().includes(filtre.toLowerCase()))
      .forEach(b=>{
        const card=document.createElement("article");
        card.className="drink-card";
        card.style.borderLeft="6px solid "+color(b.stock);

        card.innerHTML=`
          <h2>${b.nom}</h2>
          <p>${b.categorie}</p>
          <p>Stock : <strong>${b.stock}</strong></p>
          <button ${b.stock===0?"disabled":""}>
            ${b.stock===0?"Rupture de stock":"Commander"}
          </button>`;

        card.querySelector("button").onclick=()=>{
          if(b.stock<=0) return;
          b.stock--;
          afficher(search.value);
        };

        container.appendChild(card);
      });
  }

  search?.addEventListener("input",e=>afficher(e.target.value));
  afficher();

});
