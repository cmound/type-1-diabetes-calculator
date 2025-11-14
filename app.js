"use strict";

// Simple helper
const $ = (id) => document.getElementById(id);

// LocalStorage keys
const STORAGE = {
  PROFILE: "t1d_profile",
  MEAL_TYPE: "t1d_meal_type",
  TEMPLATES: "t1d_templates",
  CURRENT_MEAL: "t1d_current_meal"
};

// State
let templates = [];     // Per-serving food templates
let currentMeal = [];   // Items in the current meal
let totals = { carbs: 0, fat: 0, protein: 0, fiber: 0 };

// ---------- Persistence helpers ----------

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

function loadState() {
  // Profile
  const savedProfile = localStorage.getItem(STORAGE.PROFILE);
  if (savedProfile && $("profileName")) {
    $("profileName").value = savedProfile;
  }

  const savedMealType = localStorage.getItem(STORAGE.MEAL_TYPE);
  if (savedMealType && $("mealType")) {
    $("mealType").value = savedMealType;
  }

  // Templates and current meal
  templates = loadJson(STORAGE.TEMPLATES, []);
  currentMeal = loadJson(STORAGE.CURRENT_MEAL, []);
}

function saveProfile() {
  if ($("profileName")) {
    localStorage.setItem(STORAGE.PROFILE, $("profileName").value.trim());
  }
}

function saveMealType() {
  if ($("mealType")) {
    localStorage.setItem(STORAGE.MEAL_TYPE, $("mealType").value);
  }
}

function saveTemplates() {
  saveJson(STORAGE.TEMPLATES, templates);
}

function saveCurrentMeal() {
  saveJson(STORAGE.CURRENT_MEAL, currentMeal);
}

// ---------- Utility formatting ----------

function toNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function fmt1(n) {
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

function fmt0(n) {
  return Number.isFinite(n) ? n.toFixed(0) : "0";
}

// ---------- Template helpers ----------

function findTemplateByName(name) {
  const trimmed = name.trim().toLowerCase();
  return templates.find(t => t.name.trim().toLowerCase() === trimmed) || null;
}

function upsertTemplateFromLabel() {
  const name = ($("foodName")?.value || "").trim();
  if (!name) return;

  const servingSize = toNumber($("servingSize")?.value);
  const servingPieces = toNumber($("servingPieces")?.value);

  const labelCalories = toNumber($("labelCalories")?.value);
  const labelFat = toNumber($("labelFat")?.value);
  const labelSodium = toNumber($("labelSodium")?.value);
  const labelCarbs = toNumber($("labelCarbs")?.value);
  const labelFiber = toNumber($("labelFiber")?.value);
  const labelSugar = toNumber($("labelSugar")?.value);
  const labelProtein = toNumber($("labelProtein")?.value);

  if (!servingSize || (!labelCarbs && !labelFat && !labelProtein && !labelCalories)) {
    // Not enough info to make a useful template
    return;
  }

  const existing = findTemplateByName(name);
  const tpl = {
    name,
    servingSize,
    servingPieces,
    calories: labelCalories,
    fat: labelFat,
    sodium: labelSodium,
    carbs: labelCarbs,
    fiber: labelFiber,
    sugar: labelSugar,
    protein: labelProtein
  };

  if (existing) {
    Object.assign(existing, tpl);
  } else {
    templates.push(tpl);
  }

  saveTemplates();
  refreshFoodNameDatalist();
}

// Autofill label when user picks a known food
function tryAutofillFromHistory() {
  const name = ($("foodName")?.value || "").trim();
  if (!name) return;
  const tpl = findTemplateByName(name);
  if (!tpl) return;

  $("servingSize").value = tpl.servingSize || "";
  $("servingPieces").value = tpl.servingPieces || "";
  $("labelCalories").value = tpl.calories || "";
  $("labelFat").value = tpl.fat || "";
  $("labelSodium").value = tpl.sodium || "";
  $("labelCarbs").value = tpl.carbs || "";
  $("labelFiber").value = tpl.fiber || "";
  $("labelSugar").value = tpl.sugar || "";
  $("labelProtein").value = tpl.protein || "";
}

function refreshFoodNameDatalist() {
  const list = $("foodNames");
  if (!list) return;
  list.innerHTML = "";
  templates
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.name;
      list.appendChild(opt);
    });
}

// ---------- Current meal logic ----------

function addItem() {
  const nameRaw = $("foodName")?.value || "";
  const name = nameRaw.trim();
  const mealType = $("mealType")?.value || "Home Meal";

  const servingSize = toNumber($("servingSize")?.value);      // grams or mL per serving
  const servingPieces = toNumber($("servingPieces")?.value);  // e.g., 5 crackers

  const labelCalories = toNumber($("labelCalories")?.value);
  const labelFat = toNumber($("labelFat")?.value);
  const labelSodium = toNumber($("labelSodium")?.value);
  const labelCarbs = toNumber($("labelCarbs")?.value);
  const labelFiber = toNumber($("labelFiber")?.value);
  const labelSugar = toNumber($("labelSugar")?.value);
  const labelProtein = toNumber($("labelProtein")?.value);

  const amtGrams = toNumber($("amountGrams")?.value);
  const amtPieces = toNumber($("amountPieces")?.value);

  if (!name) {
    alert("Please enter a food name.");
    return;
  }

  if (!servingSize) {
    alert("Please enter the serving size shown on the label.");
    return;
  }

  let portionGrams = 0;

  if (amtGrams) {
    portionGrams = amtGrams;
  } else if (amtPieces && servingPieces) {
    // Convert pieces to grams based on the label
    portionGrams = servingSize * (amtPieces / servingPieces);
  } else {
    alert("Enter how much is eaten in grams/mL or pieces.");
    return;
  }

  const factor = portionGrams / servingSize;

  const item = {
    name,
    mealType,
    portionGrams,
    portionPieces: amtPieces || 0,
    calories: labelCalories * factor,
    fat: labelFat * factor,
    sodium: labelSodium * factor,
    carbs: labelCarbs * factor,
    fiber: labelFiber * factor,
    sugar: labelSugar * factor,
    protein: labelProtein * factor
  };

  currentMeal.push(item);
  saveCurrentMeal();

  // Keep / update template for this food
  upsertTemplateFromLabel();

  // Clear inputs for the next item (Phase 2)
  clearLabelInputs();
  clearPortionInputs();

  renderMeal();
  renderSummary();
  updateGuidance();
}

function clearLabelInputs() {
  ["foodName", "servingSize", "servingPieces",
   "labelCalories", "labelFat", "labelSodium",
   "labelCarbs", "labelFiber", "labelSugar", "labelProtein"
  ].forEach(id => {
    if ($(id)) $(id).value = "";
  });
}

function clearPortionInputs() {
  ["amountGrams", "amountPieces"].forEach(id => {
    if ($(id)) $(id).value = "";
  });
}

function removeItem(index) {
  currentMeal.splice(index, 1);
  saveCurrentMeal();
  renderMeal();
  renderSummary();
  updateGuidance();
}

function renderMeal() {
  const body = $("mealBody");
  if (!body) return;
  body.innerHTML = "";

  totals = { carbs: 0, fat: 0, protein: 0, fiber: 0 };

  currentMeal.forEach((item, idx) => {
    totals.carbs += item.carbs;
    totals.fat += item.fat;
    totals.protein += item.protein;
    totals.fiber += item.fiber;

    const tr = document.createElement("tr");

    function td(text) {
      const cell = document.createElement("td");
      cell.textContent = text;
      return cell;
    }

    tr.appendChild(td(item.name));
    tr.appendChild(td(fmt1(item.calories)));
    tr.appendChild(td(fmt1(item.fat)));
    tr.appendChild(td(fmt1(item.sodium)));
    tr.appendChild(td(fmt1(item.carbs)));
    tr.appendChild(td(fmt1(item.fiber)));
    tr.appendChild(td(fmt1(item.sugar)));
    tr.appendChild(td(fmt1(item.protein)));

    const removeTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.className = "danger small";
    btn.addEventListener("click", () => removeItem(idx));
    removeTd.appendChild(btn);
    tr.appendChild(removeTd);

    body.appendChild(tr);
  });

  // Totals in Results block
  if ($("totalCarbs")) $("totalCarbs").textContent = fmt1(totals.carbs);
  if ($("totalFat")) $("totalFat").textContent = fmt1(totals.fat);
  if ($("totalProtein")) $("totalProtein").textContent = fmt1(totals.protein);
}

function renderSummary() {
  const body = $("summaryBody");
  if (!body) return;
  body.innerHTML = "";

  currentMeal.forEach(item => {
    const tr = document.createElement("tr");

    function td(text) {
      const cell = document.createElement("td");
      cell.textContent = text;
      return cell;
    }

    tr.appendChild(td(item.name));
    tr.appendChild(td(fmt1(item.carbs)));
    tr.appendChild(td(fmt1(item.fat)));
    tr.appendChild(td(fmt1(item.protein)));

    body.appendChild(tr);
  });
}

// ---------- History (templates) view ----------

function renderTemplates() {
  const body = $("templatesBody");
  if (!body) return;
  body.innerHTML = "";

  templates.forEach(t => {
    const tr = document.createElement("tr");
    function td(text) {
      const cell = document.createElement("td");
      cell.textContent = text;
      return cell;
    }

    const servingDesc = t.servingPieces
      ? `${fmt0(t.servingSize)} / ${fmt0(t.servingPieces)} pcs`
      : fmt0(t.servingSize);

    tr.appendChild(td(t.name));
    tr.appendChild(td(servingDesc));
    tr.appendChild(td(fmt1(t.calories)));
    tr.appendChild(td(fmt1(t.fat)));
    tr.appendChild(td(fmt1(t.sodium)));
    tr.appendChild(td(fmt1(t.carbs)));
    tr.appendChild(td(fmt1(t.fiber)));
    tr.appendChild(td(fmt1(t.sugar)));
    tr.appendChild(td(fmt1(t.protein)));

    body.appendChild(tr);
  });
}

function clearHistory() {
  if (!confirm("Clear ALL saved food templates?")) return;
  templates = [];
  saveTemplates();
  renderTemplates();
  refreshFoodNameDatalist();
}

// ---------- Tabs ----------

function showTab(which) {
  if ($("currentView")) {
    $("currentView").style.display = which === "current" ? "block" : "none";
  }
  if ($("historyView")) {
    $("historyView").style.display = which === "history" ? "block" : "none";
  }
  if ($("tabcurrent")) $("tabcurrent").classList.toggle("active", which === "current");
  if ($("tabhistory")) $("tabhistory").classList.toggle("active", which === "history");
}

// ---------- Guidance / food type logic ----------

function classifyMeal(totalsObj, mealType, items) {
  const carbs = totalsObj.carbs;
  const fat = totalsObj.fat;
  const protein = totalsObj.protein;
  const fiber = totalsObj.fiber;

  const hasPizza = items.some(i => /pizza/i.test(i.name));
  const isFast = mealType === "Fast Food" || mealType === "Restaurant";

  let foodType = "Mixed meal";
  let split = "40/60 over ~1.5 hours";
  let reasonParts = [];

  const lowCarbVeg = carbs < 10 && fat < 5 && protein < 5;
  const highProteinOnly = protein >= 20 && carbs < 10;
  const highFat = fat >= 25;
  const carbsWithGoodFiber = carbs >= 30 && fiber >= 5;
  const mostlySimpleCarbs = carbs >= 40 && fat <= 10 && fiber < 5;

  if (lowCarbVeg) {
    foodType = "Low-Carb Veggies";
    split = "No split, standard bolus";
    reasonParts.push("Very low carbs with minimal fat.");
  } else if (highProteinOnly) {
    foodType = "Protein";
    split = "No split, standard bolus";
    reasonParts.push("Mostly protein with very few carbs.");
  } else if (carbsWithGoodFiber && !highFat) {
    foodType = "Carbs with Fiber";
    split = "40/60 over ~1–1.5 hours";
    reasonParts.push("Higher carbs with good fiber and moderate fat.");
  } else if (mostlySimpleCarbs) {
    foodType = "Simple Carbs";
    split = "No split, standard bolus";
    reasonParts.push("High carbs with low fat and low fiber.");
  } else if (hasPizza && isFast) {
    foodType = "High-Fat (Pizza)";
    split = "35/65 over ~2 hours";
    reasonParts.push("Pizza from fast food / restaurant, very fat-heavy.");
  } else if (highFat && isFast) {
    foodType = "High-Fat";
    split = "35/65 over ~1.5–2 hours";
    reasonParts.push("High fat fast-food / restaurant meal.");
  } else if (highFat && !isFast) {
    foodType = "Plant-based Fat";
    split = "40/60 over ~1.5–2 hours";
    reasonParts.push("Higher fat meal, slower digestion.");
  } else if (protein >= 25 && carbs <= 30) {
    foodType = "High-Protein";
    split = "No split or small 30/70 over ~1 hour";
    reasonParts.push("Protein dominant with moderate carbs.");
  }

  if (!reasonParts.length) {
    reasonParts.push("Mixed carbs, fat, and protein.");
  }

  return { foodType, split, reason: reasonParts.join(" ") };
}

function computePrebolus(bslValue) {
  const bsl = toNumber(bslValue);
  if (!bsl) return "0–2 min (no BSL entered)";

  if (bsl < 80) return "0–2 min, consider a small snack first";
  if (bsl < 140) return "2–5 min";
  if (bsl < 200) return "5–7 min";
  return "7–10 min (higher BSL)";
}

function updateGuidance() {
  const hasItems = currentMeal.length > 0 && totals.carbs > 0;
  const preSpan = $("resultPrebolus");
  const splitSpan = $("resultSplit");
  const typeSpan = $("resultFoodType");
  const reasonSpan = $("resultReason");
  const autoInput = $("foodTypeAuto");

  if (!hasItems) {
    if (preSpan) preSpan.textContent = "--";
    if (splitSpan) splitSpan.textContent = "--";
    if (typeSpan) typeSpan.textContent = "--";
    if (reasonSpan) reasonSpan.textContent = "--";
    if (autoInput) autoInput.value = "";
    return;
  }

  const mealType = $("mealType")?.value || "Home Meal";
  const guidance = classifyMeal(totals, mealType, currentMeal);
  const prebolus = computePrebolus($("bsl")?.value);

  if (preSpan) preSpan.textContent = prebolus;
  if (splitSpan) splitSpan.textContent = guidance.split;
  if (typeSpan) typeSpan.textContent = guidance.foodType;
  if (reasonSpan) reasonSpan.textContent = guidance.reason;
  if (autoInput) autoInput.value = guidance.foodType;
}

// ---------- Save to history (templates) button ----------

function saveToHistoryAndClearCurrent() {
  if (!currentMeal.length) return;

  // Templates are already upserted as each item is added,
  // so here we only need to clear the current meal.
  currentMeal = [];
  saveCurrentMeal();
  renderMeal();
  renderSummary();
  updateGuidance();
  renderTemplates();
}

// ---------- Init ----------

function init() {
  loadState();

  refreshFoodNameDatalist();
  renderMeal();
  renderSummary();
  renderTemplates();
  updateGuidance();
  showTab("current");

  // Buttons
  if ($("addBtn")) $("addBtn").addEventListener("click", addItem);
  if ($("calcBtn")) $("calcBtn").addEventListener("click", updateGuidance);
  if ($("saveHistory")) $("saveHistory").addEventListener("click", saveToHistoryAndClearCurrent);
  if ($("clearHistory")) $("clearHistory").addEventListener("click", clearHistory);

  // Tabs
  if ($("tabcurrent")) $("tabcurrent").addEventListener("click", () => showTab("current"));
  if ($("tabhistory")) $("tabhistory").addEventListener("click", () => showTab("history"));

  // Autofill on food name change/blur
  if ($("foodName")) {
    $("foodName").addEventListener("change", tryAutofillFromHistory);
    $("foodName").addEventListener("blur", tryAutofillFromHistory);
  }

  // Profile + meal type
  if ($("profileName")) $("profileName").addEventListener("blur", saveProfile);
  if ($("mealType")) $("mealType").addEventListener("change", () => {
    saveMealType();
    updateGuidance();
  });

  // BSL / IOB changes should refresh guidance
  if ($("bsl")) $("bsl").addEventListener("blur", updateGuidance);
  if ($("iob")) $("iob").addEventListener("blur", updateGuidance);
}

// Run init when DOM is ready (handles PWA / cached loads)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
