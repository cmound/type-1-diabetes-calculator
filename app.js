
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
        <td>${item.qty > 0 ? round1(item.qty) : ""}</td>
      `;
      body.appendChild(tr);
    });
  }

  function calculateResults() {
    const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
    const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);

    $("resultTotalCarbs").textContent = round1(totalCarbs);
    $("resultTotalFat").textContent = round1(totalFat);
    $("resultTotalProtein").textContent = round1(totalProtein);

    const iob = parseFloat($("iob").value) || 0;
    const bsl = parseFloat($("bsl").value) || 0;

    let advice = "N/A";
    if (iob > 0 && bsl > 0) {
      if (iob >= 2 || bsl < 120) {
        advice = `Yes – reduce to prevent stacking (IOB: ${iob})`;
      } else {
        advice = "No reduction needed.";
      }
    }
    $("resultInsulinAdvice").textContent = advice;
  }

  $("convertFraction").addEventListener("click", () => {
    const input = $("fractionInput").value.trim();
    const parts = input.split("/");
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const denom = parseFloat(parts[1]);
      if (denom !== 0) {
        $("fractionResult").textContent = (num / denom).toFixed(2);
        return;
      }
    }
    $("fractionResult").textContent = "Invalid input";
  });
});
