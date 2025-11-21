// Utility functions
function $(id) {
  return document.getElementById(id);
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
function getCurrentDateTimeString() {
  const now = new Date();
  return now.toLocaleString("en-US");
}

// Constants
const STORAGE_KEY = "t1d-calculator-history";

// Data
let loggedItems = [];
let historyTemplates = [];

// Prebolus logic
function getPrebolusSuggestion(bsl, iob, totalCarbs) {
  if (!Number.isFinite(bsl) || totalCarbs === 0) return "Enter food and context first.";
  if (bsl > 180) return "15–30 min";
  if (bsl > 140) return "10–15 min";
  if (bsl > 120) return "5–10 min";
  return "2–5 min";
}

// Split logic
function getSplitSuggestion(carbs, fat, mealType, bsl) {
  if (carbs === 0 && fat === 0) return { split: "--", reason: "--" };
  let split = "60/40";
  let reason = "Default split";

  if (fat >= 20 && carbs >= 40) {
    split = "40/60";
    reason = "High fat & carb meal";
  } else if (mealType === "Fast Food" || mealType === "Restaurant") {
    split = "40/60";
    reason = "Likely delayed digestion";
  } else if (mealType === "Pizza") {
    split = "30/70";
    reason = "Slow digesting meal";
  }

  if (bsl > 200) {
    reason += ". Adjust due to high BSL.";
  }

  return { split, reason };
}

// Rendering logic
function renderLoggedItems() {
  const tbody = $("loggedItemsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  loggedItems.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><button onclick="editItem(${index})">✏️</button><button onclick="removeItem(${index})">🗑️</button></td>
      <td>${item.name}</td>
      <td>${item.carbs}</td>
      <td>${item.fat}</td>
      <td>${item.protein}</td>
      <td>${item.qty}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSummaryTable() {
  const tbody = $("summaryTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  loggedItems.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.carbs}</td>
      <td>${item.fat}</td>
      <td>${item.protein}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Adding/removing
function addItem() {
  const name = $("foodName").value.trim();
  const carbs = parseFloat($("carbs").value) || 0;
  const fat = parseFloat($("fat").value) || 0;
  const protein = parseFloat($("protein").value) || 0;
  const qty = parseFloat($("qty").value) || 1;

  loggedItems.push({ name, carbs, fat, protein, qty });
  renderLoggedItems();
  renderSummaryTable();
  calculateGuidance();
}

function removeItem(index) {
  loggedItems.splice(index, 1);
  renderLoggedItems();
  renderSummaryTable();
  calculateGuidance();
}

function editItem(index) {
  const item = loggedItems[index];
  $("foodName").value = item.name;
  $("carbs").value = item.carbs;
  $("fat").value = item.fat;
  $("protein").value = item.protein;
  $("qty").value = item.qty;
  removeItem(index);
}

// Calculations
function calculateGuidance() {
  let totalCarbs = 0;
  let totalFat = 0;
  let totalProtein = 0;

  loggedItems.forEach((item) => {
    totalCarbs += item.carbs * item.qty;
    totalFat += item.fat * item.qty;
    totalProtein += item.protein * item.qty;
  });

  const totalCarbsEl = $("resultCarbs");
  const totalFatEl = $("resultFat");
  const totalProteinEl = $("resultProtein");

  if (totalCarbsEl) totalCarbsEl.textContent = round1(totalCarbs).toFixed(1);
  if (totalFatEl) totalFatEl.textContent = round1(totalFat).toFixed(1);
  if (totalProteinEl) totalProteinEl.textContent = round1(totalProtein).toFixed(1);

  const bsl = parseFloat($("bsl").value) || 0;
  const iob = parseFloat($("iob").value) || 0;
  const mealType = $("mealType").value || "";

  const prebolus = getPrebolusSuggestion(bsl, iob, totalCarbs);
  $("resultPrebolus").textContent = prebolus;

  const split = getSplitSuggestion(totalCarbs, totalFat, mealType, bsl);
  $("resultSplit").textContent = split.split;
  $("resultReason").textContent = split.reason;
  $("resultFoodType").textContent = mealType || "--";
}

// Init
function init() {
  $("addItemBtn").addEventListener("click", addItem);
  $("bsl").addEventListener("input", calculateGuidance);
  $("iob").addEventListener("input", calculateGuidance);
  $("mealType").addEventListener("change", calculateGuidance);
  $("profileName").value = "Kai";
  $("dateTime").value = getCurrentDateTimeString();
  calculateGuidance();
}

init();
