document.addEventListener("DOMContentLoaded", function () {
  const foodItems = [];
  const foodForm = document.getElementById("food-form");
  const foodNameInput = document.getElementById("food-name");
  const servingSizeInput = document.getElementById("serving-size");
  const mealTypeInput = document.getElementById("meal-type");
  const numberOrFractionInput = document.getElementById("number-or-fraction");
  const piecesInput = document.getElementById("pieces");
  const fractionInput = document.getElementById("fraction");
  const convertBtn = document.getElementById("convert-btn");
  const decimalResult = document.getElementById("decimal-result");
  const caloriesInput = document.getElementById("calories");
  const fatInput = document.getElementById("fat");
  const sodiumInput = document.getElementById("sodium");
  const carbsInput = document.getElementById("carbs");
  const fiberInput = document.getElementById("fiber");
  const sugarInput = document.getElementById("sugar");
  const proteinInput = document.getElementById("protein");
  const qtyInput = document.getElementById("qty-having");
  const currentBSLInput = document.getElementById("current-bsl");
  const insulinOnBoardInput = document.getElementById("insulin-on-board");
  const summaryContainer = document.getElementById("food-summary");
  const loggedItemsContainer = document.getElementById("logged-items");

  function updateResults() {
    let totalCarbs = 0,
      totalFat = 0,
      totalProtein = 0;
    foodItems.forEach(item => {
      const qty = parseFloat(item.qtyHaving) || 1;
      totalCarbs += item.carbs * qty;
      totalFat += item.fat * qty;
      totalProtein += item.protein * qty;
    });

    document.getElementById("total-carbs").textContent =
      totalCarbs.toFixed(1) + "g = " + Math.round(totalCarbs) + "g";
    document.getElementById("total-fat").textContent =
      totalFat.toFixed(1) + "g = " + Math.round(totalFat) + "g";
    document.getElementById("total-protein").textContent =
      totalProtein.toFixed(1) + "g = " + Math.round(totalProtein) + "g";

    const bsl = parseInt(currentBSLInput.value);
    let prebolus = "2-5 min";

    if (bsl >= 180 && bsl < 250) prebolus = "10-15 min";
    else if (bsl >= 250) prebolus = "20-30 min";
    else if (bsl <= 90) prebolus = "0 min";

    document.getElementById("prebolus").textContent = prebolus;

    document.getElementById("split").textContent =
      totalFat + totalProtein > 25 ? "40/60 split" : "No split needed";

    document.getElementById("food-type").textContent =
      mealTypeInput.value || "Other";

    document.getElementById("reason").textContent =
      totalFat > 20
        ? "High fat/protein content"
        : "Standard carb content - single dose likely sufficient";
  }

  function renderSummary() {
    summaryContainer.innerHTML = "";
    foodItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "summary-item";
      div.innerHTML = `<strong>${item.name}</strong>: Carbs: ${item.carbs}g, Fat: ${item.fat}g, Protein: ${item.protein}g, Qty: ${item.qtyHaving}`;
      summaryContainer.appendChild(div);
    });
  }

  function renderLoggedItems() {
    loggedItemsContainer.innerHTML = "";
    foodItems.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "logged-item";
      row.innerHTML = `
        <div class="actions">
          <button onclick="editItem(${index})">✏️</button>
          <button onclick="deleteItem(${index})">🗑️</button>
        </div>
        <div>${item.name}</div>
        <div>${item.servingSize}</div>
        <div>${item.calories}</div>
        <div>${item.fat}</div>
        <div>${item.sodium}</div>
        <div>${item.carbs}</div>
        <div>${item.fiber}</div>
        <div>${item.sugar}</div>
        <div>${item.protein}</div>
        <div>${item.qtyHaving}</div>
      `;
      loggedItemsContainer.appendChild(row);
    });
  }

  window.deleteItem = function (index) {
    foodItems.splice(index, 1);
    renderSummary();
    renderLoggedItems();
    updateResults();
  };

  window.editItem = function (index) {
    const item = foodItems[index];
    foodNameInput.value = item.name;
    servingSizeInput.value = item.servingSize;
    caloriesInput.value = item.calories;
    fatInput.value = item.fat;
    sodiumInput.value = item.sodium;
    carbsInput.value = item.carbs;
    fiberInput.value = item.fiber;
    sugarInput.value = item.sugar;
    proteinInput.value = item.protein;
    qtyInput.value = item.qtyHaving;
    deleteItem(index);
  };

  foodForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newItem = {
      name: foodNameInput.value,
      servingSize: servingSizeInput.value,
      mealType: mealTypeInput.value,
      calories: parseFloat(caloriesInput.value),
      fat: parseFloat(fatInput.value),
      sodium: parseFloat(sodiumInput.value),
      carbs: parseFloat(carbsInput.value),
      fiber: parseFloat(fiberInput.value),
      sugar: parseFloat(sugarInput.value),
      protein: parseFloat(proteinInput.value),
      qtyHaving: parseFloat(qtyInput.value)
    };

    foodItems.push(newItem);
    renderSummary();
    renderLoggedItems();
    updateResults();

    foodNameInput.focus();
    foodNameInput.select();

    // Clear relevant fields
    [
      servingSizeInput,
      caloriesInput,
      fatInput,
      sodiumInput,
      carbsInput,
      fiberInput,
      sugarInput,
      proteinInput,
      qtyInput,
      piecesInput,
      fractionInput
    ].forEach(el => (el.value = ""));
  });

  convertBtn.addEventListener("click", function () {
    const fractionValue = fractionInput.value.trim();
    if (fractionValue.includes("/")) {
      const [numerator, denominator] = fractionValue.split("/").map(Number);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        const decimal = numerator / denominator;
        decimalResult.textContent = decimal.toFixed(3);
        piecesInput.value = decimal.toFixed(3);
      } else {
        decimalResult.textContent = "Invalid fraction";
      }
    } else {
      decimalResult.textContent = "Invalid format";
    }
  });

  numberOrFractionInput.addEventListener("change", function () {
    const value = this.value;
    document.getElementById("number-input-section").style.display =
      value === "Number" ? "block" : "none";
    document.getElementById("fraction-input-section").style.display =
      value === "Fraction" ? "block" : "none";
  });

  // Initial calculation
  updateResults();
});
