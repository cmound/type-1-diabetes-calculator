// Type 1 Diabetes Calculator logic

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "t1d-food-history-v1";

let loggedItems = [];
let historyTemplates = [];

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

// Format current date & time like 11/18/2025 - 11:09 AM
function getCurrentDateTimeString() {
  const now = new Date();
  const pad2 = (n) => n.toString().padStart(2, "0");

  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const year = now.getFullYear();

  const hours24 = now.getHours();
  let hours = hours24 % 12;
  if (hours === 0) hours = 12;
  const minutes = pad2(now.getMinutes());
  const ampm = hours24 >= 12 ? "PM" : "AM";

  return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
}

// Tab handling
function showCurrentScreen() {
  const current = $("screen-current");
  const history = $("screen-history");
  const tabCurrent = $("tab-current");
  const tabHistory = $("tab-history");
  if (!current || !history) return;

  current.classList.remove("hidden");
  history.classList.add("hidden");
  if (tabCurrent) tabCurrent.classList.add("active");
  if (tabHistory) tabHistory.classList.remove("active");
}

function showHistoryScreen() {
  const current = $("screen-current");
  const history = $("screen-history");
  const tabCurrent = $("tab-current");
  const tabHistory = $("tab-history");
  if (!current || !history) return;

  current.classList.add("hidden");
  history.classList.remove("hidden");
  if (tabCurrent) tabCurrent.classList.remove("active");
  if (tabHistory) tabHistory.classList.add("active");
}

// Add current food item to logged list
function handleAddItem() {
  const nameInput = $("foodName");
  const name =
    (nameInput && nameInput.value.trim()) ||
    `Item ${loggedItems.length + 1}`;

  const mealTypeSelect = $("mealType");
  const mealType = mealTypeSelect ? mealTypeSelect.value : "";

  const servingSize = num("servingSize");
  const servingPieces = num("servingPieces");

  const calories = num("calories");
  const fat = num("fat");
  const sodium = num("sodium");
  const carbs = num("carbs");
  const fiber = num("fiber");
  const sugar = num("sugar");
  const protein = num("protein");

  const amountEaten = num("amountEaten");
  const piecesEaten = num("piecesEaten");

  // Decide factor used to scale from per serving to eaten amount
  let factor = 1;

  if (amountEaten > 0 && servingSize > 0) {
    factor = amountEaten / servingSize;
  } else if (piecesEaten > 0 && servingPieces > 0) {
    factor = piecesEaten / servingPieces;
  }

  const item = {
    name,
    mealType,
    servingSize,
    servingPieces,
    calories,
    fat,
    sodium,
    carbs,
    fiber,
    sugar,
    protein,
    amountEaten,
    piecesEaten,
    factor
  };

  loggedItems.push(item);
  renderLoggedItems();
  renderSummaryTable();
  calculateGuidance();

  const amountEatenInput = $("amountEaten");
  const piecesEatenInput = $("piecesEaten");
  if (amountEatenInput) amountEatenInput.value = "";
  if (piecesEatenInput) piecesEatenInput.value = "";

  // After adding, put cursor back into Food name and highlight it
  if (nameInput) {
    nameInput.focus();
    nameInput.select();
  }
}

// Render logged items table
function renderLoggedItems() {
  const tbody = $("loggedItemsBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  loggedItems.forEach((item, index) => {
    const f = item.factor || 1;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="actions-cell">
        <button type="button" class="icon-btn edit-btn" data-index="${index}" aria-label="Edit item">✏</button>
        <button type="button" class="icon-btn delete-btn" data-index="${index}" aria-label="Delete item">🗑</button>
      </td>
      <td>${item.name}</td>
      <td>${item.servingSize > 0 ? round1(item.servingSize) : ""}</td>
      <td>${round1(item.calories * f)}</td>
      <td>${round1(item.fat * f)}</td>
      <td>${round1(item.sodium * f)}</td>
      <td>${round1(item.carbs * f)}</td>
      <td>${round1(item.fiber * f)}</td>
      <td>${round1(item.sugar * f)}</td>
      <td>${round1(item.protein * f)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Wire up edit buttons
  tbody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      if (!Number.isNaN(index)) {
        editLoggedItem(index);
      }
    });
  });

  // Wire up delete buttons
  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      if (!Number.isNaN(index)) {
        deleteLoggedItem(index);
      }
    });
  });
}

// Edit an existing logged item by loading it back into the form
function editLoggedItem(index) {
  const item = loggedItems[index];
  if (!item) return;

  const setVal = (id, value) => {
    const el = $(id);
    if (el) el.value = value !== undefined && value !== null ? value : "";
  };

  setVal("foodName", item.name);
  const mealTypeSelect = $("mealType");
  if (mealTypeSelect) mealTypeSelect.value = item.mealType || "";

  setVal("servingSize", item.servingSize);
  setVal("servingPieces", item.servingPieces);
  setVal("calories", item.calories);
  setVal("fat", item.fat);
  setVal("sodium", item.sodium);
  setVal("carbs", item.carbs);
  setVal("fiber", item.fiber);
  setVal("sugar", item.sugar);
  setVal("protein", item.protein);
  setVal("amountEaten", item.amountEaten);
  setVal("piecesEaten", item.piecesEaten);

  // Remove the original so the updated one can be added as a fresh item
  loggedItems.splice(index, 1);
  renderLoggedItems();
  renderSummaryTable();
  calculateGuidance();

  const nameInput = $("foodName");
  if (nameInput) {
    nameInput.focus();
    nameInput.select();
  }
}

// Delete a logged item
function deleteLoggedItem(index) {
  if (index < 0 || index >= loggedItems.length) return;
  if (!confirm("Remove this item from the current meal?")) return;

  loggedItems.splice(index, 1);
  renderLoggedItems();
  renderSummaryTable();
  calculateGuidance();
}

// Render summary table for carbs, fat, protein per item
function renderSummaryTable() {
  const tbody = $("summaryTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  loggedItems.forEach((item) => {
    const f = item.factor || 1;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${round1(item.carbs * f)}</td>
      <td>${round1(item.fat * f)}</td>
      <td>${round1(item.protein * f)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Calculate totals across logged items
function getTotals() {
  let totalCarbs = 0;
  let totalFat = 0;
  let totalProtein = 0;

  loggedItems.forEach((item) => {
    const f = item.factor || 1;
    totalCarbs += item.carbs * f;
    totalFat += item.fat * f;
    totalProtein += item.protein * f;
  });

  return {
    carbs: totalCarbs,
    fat: totalFat,
    protein: totalProtein
  };
}

// Pre bolus suggestion based on BSL and IOB
function getPrebolusSuggestion(bsl, iob, totalCarbs) {
  if (totalCarbs === 0) {
    return "Enter food and context first.";
  }

  if (!Number.isFinite(bsl) || bsl <= 0) {
    return "Use your usual pre bolus timing.";
  }

  if (bsl < 90 && iob > 0.2) {
    return "Bolus at first bite and watch for early lows.";
  }

  if (bsl >= 90 && bsl <= 140) {
    return "Pre bolus about 2 to 5 minutes before eating.";
  }

  if (bsl > 140 && bsl <= 180) {
    return "Pre bolus about 5 to 8 minutes before eating.";
  }

  if (bsl > 180) {
    return "Pre bolus about 8 to 10 minutes before eating, adjust for correction with your care team rules.";
  }

  return "--";
}

// Softer split logic (40/60, short durations, longer only when clearly needed)
function getSplitSuggestion(totalCarbs, totalFat, mealType, bsl) {
  let split = "--";
  let reason =
    "Low fat or low carb load. Normal bolus is usually fine. Adjust based on your provider guidance.";

  if (totalCarbs < 20 || totalFat < 10) {
    return { split, reason };
  }

  const baseSplit = "40 / 60";
  let duration = "1.5 hours";

  if (totalFat < 20) {
    duration = "1 hour";
  } else if (totalFat < 30) {
    duration = "1.5 hours";
  } else {
    // Very high fat. Only use 2.5 hours when clearly long digesting.
    if (mealType === "Fast Food" || mealType === "Restaurant") {
      duration = "2.5 hours";
    } else {
      duration = "2 hours";
    }
  }

  const parts = [];
  parts.push(
    "Higher fat meal. Using a gentler 40/60 split so more insulin is extended instead of front-loaded."
  );

  if (Number.isFinite(bsl)) {
    if (bsl < 160) {
      parts.push(
        "BSL is under about 160 mg/dL, so this avoids large early doses that can hit harder for a 12-year-old around 60 lbs."
      );
    } else {
      parts.push(
        "BSL is at or above about 160 mg/dL. Still using 40/60, but monitor closely for early drops."
      );
    }
  }

  if (totalFat >= 30 && (mealType === "Fast Food" || mealType === "Restaurant")) {
    parts.push(
      "Very high fat or slow-digesting restaurant or fast food meal, so coverage extends a bit longer."
    );
  }

  split = `${baseSplit} over ${duration}`;
  reason = parts.join(" ");

  return { split, reason };
}

// Main guidance calculation
function calculateGuidance() {
  const totals = getTotals();
  const totalCarbs = totals.carbs;
  const totalFat = totals.fat;
  const totalProtein = totals.protein;

  const totalCarbsEl = $("resultTotalCarbs");
  const totalFatEl = $("resultTotalFat");
  const totalProteinEl = $("resultTotalProtein");

  if (totalCarbsEl) totalCarbsEl.textContent = round1(totalCarbs).toFixed(1);
  if (totalFatEl) totalFatEl.textContent = round1(totalFat).toFixed(1);
  if (totalProteinEl) {
    totalProteinEl.textContent = round1(totalProtein).toFixed(1);
  }

  const bslInput = $("bsl");
  const iobInput = $("iob");
  const bslVal = bslInput ? parseFloat(bslInput.value) : NaN;
  const iobVal = iobInput ? parseFloat(iobInput.value) : NaN;

  const pre = getPrebolusSuggestion(
    Number.isFinite(bslVal) ? bslVal : NaN,
    Number.isFinite(iobVal) ? iobVal : 0,
    totalCarbs
  );
  const preEl = $("resultPrebolus");
  if (preEl) preEl.textContent = pre;

  const mealTypeSelect = $("mealType");
  const mealTypeValue = mealTypeSelect ? mealTypeSelect.value : "";
  const foodTypeText =
    mealTypeValue || (loggedItems.length > 0 ? "Meal" : "--");
  const foodTypeEl = $("resultFoodType");
  if (foodTypeEl) foodTypeEl.textContent = foodTypeText;

  const splitInfo = getSplitSuggestion(
    totalCarbs,
    totalFat,
    mealTypeValue,
    Number.isFinite(bslVal) ? bslVal : NaN
  );
  const splitEl = $("resultSplit");
  if (splitEl) splitEl.textContent = splitInfo.split;

  const reasonEl = $("resultReason");
  if (reasonEl) reasonEl.textContent = splitInfo.reason;
}

// History handling
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      historyTemplates = JSON.parse(raw);
      if (!Array.isArray(historyTemplates)) {
        historyTemplates = [];
      }
    } else {
      historyTemplates = [];
    }
  } catch (e) {
    historyTemplates = [];
  }
  renderHistoryTable();
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyTemplates));
}

function renderHistoryTable() {
  const tbody = $("historyTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  historyTemplates.forEach((tpl) => {
    const tr = document.createElement("tr");
    const dateTime = tpl.dateTime || "--";
    tr.innerHTML = `
      <td>${dateTime}</td>
      <td>${tpl.name}</td>
      <td>${tpl.serving}</td>
      <td>${tpl.calories}</td>
      <td>${tpl.fat}</td>
      <td>${tpl.sodium}</td>
      <td>${tpl.carbs}</td>
      <td>${tpl.fiber}</td>
      <td>${tpl.sugar}</td>
      <td>${tpl.protein}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Save current logged items to history
function handleSaveToHistory() {
  if (!loggedItems.length) {
    return;
  }

  const dateInput = $("mealDateTime");
  let dateTimeText = dateInput && dateInput.value.trim();
  if (!dateTimeText) {
    dateTimeText = getCurrentDateTimeString();
    if (dateInput) dateInput.value = dateTimeText;
  }

  loggedItems.forEach((item) => {
    const servingTextParts = [];
    if (item.servingSize > 0) {
      servingTextParts.push(`${round1(item.servingSize)} g`);
    }
    if (item.servingPieces > 0) {
      servingTextParts.push(`${round1(item.servingPieces)} pcs`);
    }
    const servingText = servingTextParts.join(" / ") || "--";

    historyTemplates.push({
      dateTime: dateTimeText,
      name: item.name,
      serving: servingText,
      calories: round1(item.calories),
      fat: round1(item.fat),
      sodium: round1(item.sodium),
      carbs: round1(item.carbs),
      fiber: round1(item.fiber),
      sugar: round1(item.sugar),
      protein: round1(item.protein)
    });
  });

  saveHistory();
  renderHistoryTable();

  loggedItems = [];
  renderLoggedItems();
  renderSummaryTable();
  calculateGuidance();

  // After saving a meal, set date/time to "now" for the next meal
  const dateInput2 = $("mealDateTime");
  if (dateInput2) {
    dateInput2.value = getCurrentDateTimeString();
  }
}

// Clear all history
function handleClearHistory() {
  if (!historyTemplates.length) return;
  if (!confirm("Clear all saved food templates?")) return;

  historyTemplates = [];
  saveHistory();
  renderHistoryTable();
}

// Service worker registration
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // Ignore failure
      });
    });
  }
}

// Init
// Init
function init() {
  const tabCurrent = $("tab-current");
const tabHistory = $("tab-history");
if (tabCurrent) tabCurrent.addEventListener("click", showCurrentScreen);
if (tabHistory) tabHistory.addEventListener("click", showHistoryScreen);

const addBtn = $("addItemBtn");
if (addBtn) {
  if (typeof handleAddItem === "function") {
    addBtn.addEventListener("click", handleAddItem);
  } else if (typeof addItem === "function") {
    addBtn.addEventListener("click", addItem);
  }
}

const saveBtn = $("saveToHistoryBtn");
if (saveBtn) saveBtn.addEventListener("click", handleSaveToHistory);

const clearBtn = $("clearHistoryBtn");
if (clearBtn) clearBtn.addEventListener("click", handleClearHistory);

  // Auto recalc when BSL or IOB change
  ["bsl", "iob"].forEach((id) => {
    const el = $(id);
    if (el) {
      el.addEventListener("input", calculateGuidance);
    }
  });

  // Set initial date/time in Profile
  const dateEl = $("dateTime");
  if (dateEl) {
    dateEl.value = getCurrentDateTimeString();
  }

  // Default profile name to Kai if empty
  const profileEl = $("profileName");
  if (profileEl && !profileEl.value.trim()) {
    profileEl.value = "Kai";
  }

  loadHistory();
  calculateGuidance();
  
  const insulinAdviceEl = $("resultInsulinAdvice");
  if (insulinAdviceEl) {
    let insulinMsg = "--";
    if (Number.isFinite(iobVal) && iobVal > 0) {
      if (bslVal < 100 && totalCarbs < 15) {
        insulinMsg = `Yes – because ${iobVal.toFixed(2)}u IOB with low BSL, reduce to prevent stacking.`;
      } else if (bslVal > 180 && totalCarbs > 30) {
        insulinMsg = `No – BSL is elevated and carbs are high, stacking less likely.`;
      } else {
        insulinMsg = `Maybe – monitor closely with ${iobVal.toFixed(2)}u IOB.`;
      }
    } else {
      insulinMsg = "N/A";
    }
    insulinAdviceEl.textContent = insulinMsg;
  }

  
  const foodNameInput = $("foodName");
  if (foodNameInput) {
    foodNameInput.addEventListener("blur", () => {
      const name = foodNameInput.value.trim().toLowerCase();
      if (!name) return;

      const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const match = history.find((tpl) => tpl.name.toLowerCase() === name);
      if (!match) return;

      const setIfExists = (id, value) => {
        const el = $(id);
        if (el && value !== undefined && value !== null) {
          el.value = value;
        }
      };

      setIfExists("mealType", match.mealType || "");
      const servingParts = (match.serving || "").split("/");
      if (servingParts[0]) setIfExists("servingSize", parseFloat(servingParts[0]));
      if (servingParts[1]) {
        const pcs = servingParts[1].match(/\d+/);
        if (pcs) setIfExists("servingPieces", parseFloat(pcs[0]));
      }
      setIfExists("calories", match.calories);
      setIfExists("fat", match.fat);
      setIfExists("sodium", match.sodium);
      setIfExists("carbs", match.carbs);
      setIfExists("fiber", match.fiber);
      setIfExists("sugar", match.sugar);
      setIfExists("protein", match.protein);
    });
  }

  registerServiceWorker();
}

init();
