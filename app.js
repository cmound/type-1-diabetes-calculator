
// Type 1 Diabetes Calculator logic

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "t1d-food-history-v1";

let loggedItems = [];
let editingIndex = -1;

// Utility to read numeric value safely
function num(id) {
  const el = $(id);
  if (!el) return 0;
  const val = el.value.trim();
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : 0;
}

// Round to one decimal
function round1(value) {
  return Math.round(value * 10) / 10;
}

// Convert fraction (including mixed numbers like "2 1/4") to decimal
$("fractionInput").addEventListener("input", () => {
  const input = $("fractionInput").value.trim();
  try {
    let parts = input.split(" ");
    let whole = 0, frac = "0/1";
    if (parts.length === 2) {
      whole = parseInt(parts[0], 10);
      frac = parts[1];
    } else {
      frac = parts[0];
    }

    const [numerator, denominator] = frac.split("/").map(Number);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      const decimal = whole + numerator / denominator;
      $("servingQty").value = round1(decimal);
    } else {
      $("servingQty").value = "";
    }
  } catch (e) {
    $("servingQty").value = "";
  }
});

// Smart logic for Pre-Bolus time
function getPrebolusTime(bsl) {
  if (bsl <= 120) return "0–2 min";
  if (bsl <= 160) return "3–4 min";
  if (bsl <= 200) return "5–7 min";
  return "8–10 min";
}

// Smart logic for Split
function getSplit(bsl) {
  return bsl > 200 ? "60/40" : "40/60";
}

// Trigger update when BSL changes
$("bsl").addEventListener("input", updateResults);

function updateResults() {
  const totalCarbs = round1(loggedItems.reduce((acc, item) => acc + (item.carbs * item.qty), 0));
  const totalFat = round1(loggedItems.reduce((acc, item) => acc + (item.fat * item.qty), 0));
  const totalProtein = round1(loggedItems.reduce((acc, item) => acc + (item.protein * item.qty), 0));

  const bsl = num("bsl");
  const split = getSplit(bsl);
  const prebolus = getPrebolusTime(bsl);
  const mealType = $("mealType").value;

  $("resultsBox").innerHTML = `
    <strong>Total carbs:</strong> ${totalCarbs} g<br>
    <strong>Total fat:</strong> ${totalFat} g<br>
    <strong>Total protein:</strong> ${totalProtein} g<br>
    <strong>Pre-bolus:</strong> ${prebolus}<br>
    <strong>Split:</strong> ${split}<br>
    <strong>Split time:</strong> Over 1 hour 30 mins<br>
    <strong>Food type:</strong> ${mealType}<br>
    <strong>Reason:</strong> High fat meal
  `;
}

// Handle Add or Save
$("addBtn").addEventListener("click", () => {
  const item = {
    name: $("foodName").value.trim(),
    size: num("servingSize"),
    calories: num("calories"),
    fat: num("fat"),
    sodium: num("sodium"),
    carbs: num("carbs"),
    fiber: num("fiber"),
    sugar: num("sugar"),
    protein: num("protein"),
    qty: num("servingQty"),
  };

  if (editingIndex >= 0) {
    loggedItems[editingIndex] = item;
    editingIndex = -1;
  } else {
    loggedItems.push(item);
  }

  $("foodName").focus();
  $("foodName").select();

  clearInputs();
  renderTable();
  updateResults();
});

function clearInputs() {
  $("calories").value = "";
  $("fat").value = "";
  $("sodium").value = "";
  $("carbs").value = "";
  $("fiber").value = "";
  $("sugar").value = "";
  $("protein").value = "";
  $("servingQty").value = "";
  $("servingSize").value = "";
  $("fractionInput").value = "";
}

// Render table and attach edit/delete
function renderTable() {
  const table = $("foodTableBody");
  table.innerHTML = "";

  loggedItems.forEach((item, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <button onclick="editItem(${i})">✏️</button>
        <button onclick="deleteItem(${i})">❌</button>
      </td>
      <td>${item.name}</td>
      <td>${item.size}</td>
      <td>${item.calories}</td>
      <td>${item.sodium}</td>
      <td>${item.fat}</td>
      <td>${item.carbs}</td>
      <td>${item.fiber}</td>
      <td>${item.sugar}</td>
      <td>${item.protein}</td>
      <td>${item.qty}</td>
    `;
    table.appendChild(row);
  });
}

// Edit button
window.editItem = function (index) {
  const item = loggedItems[index];
  editingIndex = index;

  $("foodName").value = item.name;
  $("servingSize").value = item.size;
  $("calories").value = item.calories;
  $("fat").value = item.fat;
  $("sodium").value = item.sodium;
  $("carbs").value = item.carbs;
  $("fiber").value = item.fiber;
  $("sugar").value = item.sugar;
  $("protein").value = item.protein;
  $("servingQty").value = item.qty;

  window.scrollTo(0, 0);
};

// Delete button
window.deleteItem = function (index) {
  loggedItems.splice(index, 1);
  renderTable();
  updateResults();
};
