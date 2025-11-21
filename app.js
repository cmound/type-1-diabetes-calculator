document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  let items = [];

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  $("addItemBtn").addEventListener("click", () => {
    const name = $("foodName").value || "Unnamed";
    const carbs = parseFloat($("carbs").value) || 0;
    const fat = parseFloat($("fat").value) || 0;
    const protein = parseFloat($("protein").value) || 0;
    const pieces = parseFloat($("piecesEaten").value) || 0;

    items.push({ name, carbs, fat, protein, qty: pieces });
    renderSummary();
    calculateResults();
  });

  function renderSummary() {
    const body = $("summaryTableBody");
    body.innerHTML = "";
    items.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${round1(item.carbs)}</td>
        <td>${round1(item.fat)}</td>
        <td>${round1(item.protein)}</td>
        <td>${item.qty > 0 ? round1(item.qty) : ''}</td>`;
      body.appendChild(tr);
    });
  }

  function calculateResults() {
    // placeholder logic
    const bsl = parseFloat($("bsl").value) || 0;
    const iob = parseFloat($("iob").value) || 0;
    let reduce = "";

    if (bsl < 130 && iob > 1.5) {
      reduce = "✓";
    }

    $("reduceInsulin").innerText = reduce;
  }

  $("convertFractionBtn").addEventListener("click", () => {
    const input = $("fractionInput").value.trim();
    if (input.includes("/")) {
      const [num, denom] = input.split("/").map(Number);
      if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
        $("fractionResult").innerText = (num / denom).toFixed(3);
      }
    }
  });
});
