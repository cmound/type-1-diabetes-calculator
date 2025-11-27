/* -------------------------------------------------------------
   GLOBAL STATE
-------------------------------------------------------------- */
let foodItems = [];
let editingIndex = -1;
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];

/* -------------------------------------------------------------
   ELEMENT REFERENCES
-------------------------------------------------------------- */
const nameInput = document.getElementById("name");
const bslInput = document.getElementById("bsl");
const foodNameInput = document.getElementById("foodName");
const autocompleteBox = document.getElementById("autocompleteList");
const servingEqualsInput = document.getElementById("servingEquals");
const fractionBox = document.getElementById("fractionBox");
const fractionInput = document.getElementById("fractionInput");
const piecesInput = document.getElementById("pieces");

const amountHavingInput = document.getElementById("amountHaving");
const addFoodBtn = document.getElementById("addFoodBtn");

const foodSummaryDiv = document.getElementById("foodSummary");
const resultsDiv = document.getElementById("results");
const foodLogBody = document.getElementById("foodLogBody");

const saveToHistoryBtn = document.getElementById("saveToHistoryBtn");

/* -------------------------------------------------------------
   FRACTION CONVERTER
-------------------------------------------------------------- */
document.getElementById("convertFractionBtn").addEventListener("click", () => {
  try {
    const input = fractionInput.value.trim();

    let whole = 0;
    let numerator = 0;
    let denominator = 1;

    // Handle "2 1/4" format
    if (input.includes(" ")) {
      const parts = input.split(" ");
      whole = parseInt(parts[0]);
      const frac = parts[1];
      [numerator, denominator] = frac.split("/").map(Number);
    } else if (input.includes("/")) {
      // Handle simple fraction "1/3"
      [numerator, denominator] = input.split("/").map(Number);
    } else {
      alert("Invalid fraction format");
      return;
    }

    const decimal = whole + numerator / denominator;
    piecesInput.value = decimal.toFixed(3);
  } catch (err) {
    alert("Could not parse fraction.");
  }
});

/* -------------------------------------------------------------
   SHOW/HIDE FRACTION BOX
-------------------------------------------------------------- */
servingEqualsInput.addEventListener("change", () => {
  fractionBox.classList.toggle("hidden", servingEqualsInput.value !== "Fraction");
});

/* -------------------------------------------------------------
   MAIN CALCULATION ENGINE
-------------------------------------------------------------- */
function getFoodInputs() {
  return {
    name: foodNameInput.value.trim(),
    mealType: document.getElementById("mealType").value,
    servingSize: parseFloat(document.getElementById("servingSize").value),
    pieces: parseFloat(document.getElementById("pieces").value),
    calories: parseFloat(document.getElementById("calories").value),
    fat: parseFloat(document.getElementById("fat").value),
    sodium: parseFloat(document.getElementById("sodium").value),
    carbs: parseFloat(document.getElementById("carbs").value),
    fiber: parseFloat(document.getElementById("fiber").value),
    sugar: parseFloat(document.getElementById("sugar").value),
    protein: parseFloat(document.getElementById("protein").value),
    amountHaving: parseFloat(amountHavingInput.value)
  };
}

function calculateTotals(item) {
  if (!item.pieces || item.pieces === 0) return null;

  const servingFactor = item.amountHaving / item.pieces;

  return {
    calories: item.calories * servingFactor,
    sodium: item.sodium * servingFactor,
    fat: item.fat * servingFactor,
    carbs: item.carbs * servingFactor,
    fiber: item.fiber * servingFactor,
    sugar: item.sugar * servingFactor,
    protein: item.protein * servingFactor
  };
}

/* -------------------------------------------------------------
   ADD OR EDIT FOOD ITEM
-------------------------------------------------------------- */
addFoodBtn.addEventListener("click", () => {
  const item = getFoodInputs();

  if (!item.name || !item.amountHaving) {
    alert("Enter food name and amount");
    return;
  }

  if (editingIndex >= 0) {
    foodItems[editingIndex] = item;
    editingIndex = -1;
  } else {
    foodItems.push(item);
  }

  renderFoodLog();
  renderTotalsRow();
  renderSummary();
  updateResults();
  resetInputs();
});

/* -------------------------------------------------------------
   RENDER SUMMARY (TOTAL CARBS, FAT, PROTEIN)
-------------------------------------------------------------- */
function renderSummary() {
  let totalCarbs = 0;
  let totalFat = 0;
  let totalProtein = 0;

  foodItems.forEach((item) => {
    const totals = calculateTotals(item);
    if (!totals) return;

    totalCarbs += totals.carbs;
    totalFat += totals.fat;
    totalProtein += totals.protein;
  });

  foodSummaryDiv.innerHTML = `
    <p><strong>TOTAL CARBS:</strong> ${totalCarbs.toFixed(0)}g</p>
    <p><strong>TOTAL FAT:</strong> ${totalFat.toFixed(1)}g</p>
    <p><strong>TOTAL PROTEIN:</strong> ${totalProtein.toFixed(1)}g</p>
  `;
}

/* -------------------------------------------------------------
   PRE-BOLUS ENGINE
-------------------------------------------------------------- */
function getPreBolus(bsl) {
  if (!bsl) return "-";

  if (bsl <= 125) return "0–3 mins";
  if (bsl <= 150) return "3–5 mins";
  if (bsl <= 200) return "5–7 mins";
  if (bsl <= 250) return "8–10 mins";
  if (bsl <= 300) return "10–12 mins";
  return "12–15 mins";
}

/* -------------------------------------------------------------
   SMART SPLIT DOSE ENGINE
-------------------------------------------------------------- */
function getSplitDose() {
  if (foodItems.length === 0) return "No";

  let totalCarbs = 0;
  let totalFat = 0;

  foodItems.forEach((item) => {
    const totals = calculateTotals(item);
    if (!totals) return;
    totalCarbs += totals.carbs;
    totalFat += totals.fat;
  });

  const foodName = foodItems[foodItems.length - 1].name.toLowerCase();
  const bsl = parseFloat(bslInput.value);

  const highFatFoods = ["pizza", "fried", "burger", "cheese", "cream", "alfredo"];
  const simpleCarbs = ["donut", "soda", "candy", "white bread", "rice", "pasta"];

  let isHighFat = highFatFoods.some(f => foodName.includes(f));
  let isSimpleCarb = simpleCarbs.some(f => foodName.includes(f));

  if (isHighFat || totalFat > 15) {
    if (bsl > 200) return "60/40 over 2 hrs";
    return "50/50 over 1.5 hrs";
  }

  if (isSimpleCarb) {
    if (totalCarbs > 50) return "40/60 over 1 hr";
    return "No";
  }

  if (totalCarbs > 60) return "50/50 over 1.5 hrs";

  return "No";
}

/* -------------------------------------------------------------
   UPDATE RESULTS BOX
-------------------------------------------------------------- */
function updateResults() {
  const bsl = parseFloat(bslInput.value);
  const mealType = document.getElementById("mealType").value;

  const preBolus = getPreBolus(bsl);
  const splitDose = getSplitDose();

  resultsDiv.innerHTML = `
    <p><strong>Pre-Bolus:</strong> ${preBolus}</p>
    <p><strong>Split Dose:</strong> ${splitDose}</p>
    <p><strong>Food Type:</strong> ${mealType}</p>
  `;
}

bslInput.addEventListener("input", updateResults);

/* -------------------------------------------------------------
   FOOD LOG RENDER
-------------------------------------------------------------- */
function renderFoodLog() {
  foodLogBody.innerHTML = "";

  foodItems.forEach((item, index) => {
    const totals = calculateTotals(item);
    if (!totals) return;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td><span class="edit-btn" onclick="editItem(${index})">✏️</span></td>
      <td><span class="remove-btn" onclick="removeItem(${index})">🗑️</span></td>
      <td class="left">${item.name}</td>
      <td>${item.servingSize}</td>
      <td>${totals.calories.toFixed(1)}</td>
      <td>${totals.sodium.toFixed(1)}</td>
      <td>${totals.fat.toFixed(1)}</td>
      <td>${totals.carbs.toFixed(1)}</td>
      <td>${totals.fiber.toFixed(1)}</td>
      <td>${totals.sugar.toFixed(1)}</td>
      <td>${totals.protein.toFixed(1)}</td>
      <td>${item.amountHaving}</td>
    `;

    foodLogBody.appendChild(row);
  });
}

/* -------------------------------------------------------------
   TOTALS ROW
-------------------------------------------------------------- */
function renderTotalsRow() {
  let totalCalories = 0;
  let totalSodium = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalProtein = 0;

  foodItems.forEach((item) => {
    const totals = calculateTotals(item);
    if (!totals) return;
    totalCalories += totals.calories;
    totalSodium += totals.sodium;
    totalFat += totals.fat;
    totalCarbs += totals.carbs;
    totalFiber += totals.fiber;
    totalSugar += totals.sugar;
    totalProtein += totals.protein;
  });

  document.getElementById("totalCalories").innerText = totalCalories.toFixed(1);
  document.getElementById("totalSodium").innerText = totalSodium.toFixed(1);
  document.getElementById("totalFat").innerText = totalFat.toFixed(1);
  document.getElementById("totalCarbs").innerText = totalCarbs.toFixed(1);
  document.getElementById("totalFiber").innerText = totalFiber.toFixed(1);
  document.getElementById("totalSugar").innerText = totalSugar.toFixed(1);
  document.getElementById("totalProtein").innerText = totalProtein.toFixed(1);
}

/* -------------------------------------------------------------
   EDIT AND REMOVE
-------------------------------------------------------------- */
window.editItem = function(index) {
  const item = foodItems[index];
  editingIndex = index;

  foodNameInput.value = item.name;
  document.getElementById("mealType").value = item.mealType;
  document.getElementById("servingSize").value = item.servingSize;
  piecesInput.value = item.pieces;
  document.getElementById("calories").value = item.calories;
  document.getElementById("fat").value = item.fat;
  document.getElementById("sodium").value = item.sodium;
  document.getElementById("carbs").value = item.carbs;
  document.getElementById("fiber").value = item.fiber;
  document.getElementById("sugar").value = item.sugar;
  document.getElementById("protein").value = item.protein;
  amountHavingInput.value = item.amountHaving;

  amountHavingInput.focus();
  amountHavingInput.select();
};

window.removeItem = function(index) {
  foodItems.splice(index, 1);
  renderFoodLog();
  renderTotalsRow();
  renderSummary();
  updateResults();
};

/* -------------------------------------------------------------
   RESET INPUTS
-------------------------------------------------------------- */
function resetInputs() {
  const ids = [
    "foodName", "servingSize", "pieces", "calories", "fat",
    "sodium", "carbs", "fiber", "sugar", "protein", "amountHaving"
  ];

  ids.forEach(id => document.getElementById(id).value = "");

  foodNameInput.focus();
}

/* -------------------------------------------------------------
   AUTOCOMPLETE SYSTEM
-------------------------------------------------------------- */
foodNameInput.addEventListener("input", () => {
  const query = foodNameInput.value.toLowerCase();
  autocompleteBox.innerHTML = "";

  if (!query) {
    autocompleteBox.style.display = "none";
    return;
  }

  const matches = historyData.filter(item =>
    item.name.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    autocompleteBox.style.display = "none";
    return;
  }

  matches.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("autocomplete-item");
    div.innerText = item.name;

    div.onclick = () => {
      fillFromHistory(item);
      autocompleteBox.style.display = "none";
    };

    autocompleteBox.appendChild(div);
  });

  autocompleteBox.style.display = "block";
});

function fillFromHistory(item) {
  foodNameInput.value = item.name;
  document.getElementById("servingSize").value = item.servingSize;
  document.getElementById("calories").value = item.calories;
  document.getElementById("fat").value = item.fat;
  document.getElementById("sodium").value = item.sodium;
  document.getElementById("carbs").value = item.carbs;
  document.getElementById("fiber").value = item.fiber;
  document.getElementById("sugar").value = item.sugar;
  document.getElementById("protein").value = item.protein;

  amountHavingInput.focus();
}

/* -------------------------------------------------------------
   SAVE TO HISTORY PAGE
-------------------------------------------------------------- */
saveToHistoryBtn.addEventListener("click", () => {
  if (foodItems.length === 0) {
    alert("No items to save");
    return;
  }

  const last = foodItems[foodItems.length - 1];

  const original = {
    name: last.name,
    servingSize: last.servingSize,
    calories: last.calories,
    sodium: last.sodium,
    fat: last.fat,
    carbs: last.carbs,
    fiber: last.fiber,
    sugar: last.sugar,
    protein: last.protein
  };

  historyData.push(original);
  localStorage.setItem("t1d_food_history", JSON.stringify(historyData));

  alert("Saved to History Page");
});
