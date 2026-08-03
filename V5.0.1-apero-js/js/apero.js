// Chez les Piechnotte - V5
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("search");
  const cards = document.querySelectorAll(".drink-card");

  if (search) {
    search.addEventListener("input", () => {
      const txt = search.value.toLowerCase();
      cards.forEach(card => {
        const name = card.querySelector("h2").textContent.toLowerCase();
        card.style.display = name.includes(txt) ? "" : "none";
      });
    });
  }

  cards.forEach(card => {
    const button = card.querySelector("button");
    const stockText = card.querySelector("strong");
    let stock = parseInt(stockText.textContent, 10);

    function updateColor() {
      card.style.borderLeftColor =
        stock > 5 ? "#2ecc71" :
        stock > 2 ? "#f39c12" : "#e74c3c";
    }

    updateColor();

    button.addEventListener("click", () => {
      if (stock <= 0) return;
      stock--;
      stockText.textContent = stock;
      updateColor();

      if (stock === 0) {
        button.disabled = true;
        button.textContent = "Rupture de stock";
      }
    });
  });
});
