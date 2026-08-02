
Promise.all([
 fetch('../data/config.json').then(r=>r.json()).catch(()=>({version:'4.1'})),
]).then(([cfg])=>{
 document.getElementById('content').innerHTML=`
 <div class='row'><b>Version</b><span>${cfg.version}</span></div>
 <div class='row'><b>Seuil stock faible</b><span>${cfg.lowStockThreshold}</span></div>
 <div class='row'><b>Thème</b><span>${cfg.theme}</span></div>
 <p>La Partie 2 ajoutera les statistiques détaillées.</p>`;
});
