// =============================================================
// Batch 1 — GLOBAL STATE, DOM REFERENCES, DEBUG LOG
// =============================================================

let foodItems = [];
let editingIndex = -1;
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];
let timelineChart = null;
let selectedMealType = null;
let currentTotals = {
    calories: 0,
    sodium: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    protein: 0
};

// AI Guidance QC State
const aiGuidanceState = {
    recommended: {
        prebolus: 'N/A',
        splitPercent: 'N/A',
        splitDuration: 'N/A'
    },
    using: {
        prebolus: 'N/A',
        splitPercent: 'N/A',
        splitDuration: 'N/A'
    }
};

// AI Guidance QC State
const aiGuidanceState = {
    recommended: {
        prebolus: 'N/A',
        splitPercent: 'N/A',
        splitDuration: 'N/A'
    },
    using: {
        prebolus: 'N/A',
        splitPercent: 'N/A',
        splitDuration: 'N/A'
    }
};

// Core inputs
const bslInput = document.getElementById("bslInput");
const foodNameInput = document.getElementById("foodNameInput");
const mealTypeInput = document.getElementById("mealTypeInput");
const servingSizeInput = document.getElementById("servingSize");
const servingEqualsInput = document.getElementById("servingEqualsInput");
const perQuantityInput = document.getElementById("perQuantity");

const caloriesInput = document.getElementById("calories");
const fatInput = document.getElementById("fat");
const sodiumInput = document.getElementById("sodium");
const carbsInput = document.getElementById("carbs");
const fiberInput = document.getElementById("fiber");
const sugarInput = document.getElementById("sugar");
const proteinInput = document.getElementById("protein");

const amountHavingInput = document.getElementById("amountHavingInput");
const addFoodBtn = document.getElementById("addFoodBtn");

// Summary, table
const foodSummaryDiv = document.getElementById("foodSummary");
const resultBox = document.getElementById("resultBox");
const foodLogBody = document.getElementById("foodLogBody");
const totalsRowEls = Array.from(document.querySelectorAll("#totalsRow"));
const totalsStrip = totalsRowEls.find(el => el.tagName === "DIV") || null; // Step 2 strip
const totalsTableRow = totalsRowEls.find(el => el.tagName === "TR") || null; // Table footer

// Fraction controls
const fractionBox = document.getElementById("fractionBox");
const fractionInput = document.getElementById("fractionInput");
const convertFractionBtn = document.getElementById("convertFractionBtn");
const fractionResult = document.getElementById("fractionResult");

// History buttons
const saveHistoryButton = document.getElementById("saveHistoryButton");
const viewHistoryBtn = document.getElementById("viewHistoryBtn");

// Timeline
const timelineCanvas = document.getElementById("timelineChart");
const runAiButton = document.getElementById("runAiButton");
const aiNotesBox = document.getElementById("aiNotes");
const extractAllBtn = document.getElementById("extractAllBtn");
const prebolusSpan = document.getElementById("aiPreBolusSummary");
const splitRecSpan = document.getElementById("aiSplitRecSummary");
const splitPercentSpan = document.getElementById("aiSplitPercentSummary");
const splitDurationSpan = document.getElementById("aiSplitDurationSummary");
const splitReasonSpan = document.getElementById("aiSplitReasonSummary");
const doseSpan = document.getElementById("aiDoseSummary");
const floatTotalsText = document.getElementById("floatTotalsText");
const floatPrebolusText = document.getElementById("floatPrebolusText");
const floatSplitText = document.getElementById("floatSplitText");

// Debug drawer
const debugDrawer = document.getElementById("debugDrawer");
const debugToggle = document.getElementById("debugToggle");
const debugClear = document.getElementById("debugClear");
const debugPanelLog = document.getElementById("debugPanelLog");

// Edit mode controls
const editConfirmBar = document.getElementById("editConfirmBar");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Debug logger
function logDebug(msg) {
    if (!debugPanelLog) return;
    const time = new Date().toLocaleTimeString();
    const row = document.createElement("div");
    row.textContent = `[${time}] ${msg}`;
    debugPanelLog.appendChild(row);
    debugPanelLog.scrollTop = debugPanelLog.scrollHeight;
}

debugToggle?.addEventListener("click", () => {
    debugDrawer.classList.toggle("open");
});
debugClear?.addEventListener("click", () => {
    debugPanelLog.innerHTML = "";
    logDebug("Log cleared");
});

logDebug("Batch 1 loaded");
// =============================================================
// Batch 2 — FRACTIONS, HELPERS, COLLECT INPUT, CLEAR INPUTS
// =============================================================

servingEqualsInput?.addEventListener("change", () => {
    if (servingEqualsInput.value === "Fraction") {
        fractionBox.classList.remove("hidden");
    } else {
        fractionBox.classList.add("hidden");
        fractionInput.value = "";
        fractionResult.textContent = "";
    }
});

function convertFractionToDecimal(frac) {
    try {
        let value;
        if (frac.includes(" ")) {
            const [whole, part] = frac.split(" ");
            const [num, den] = part.split("/");
            value = parseFloat(whole) + (parseFloat(num) / parseFloat(den));
        } else {
            const [num, den] = frac.split("/");
            value = parseFloat(num) / parseFloat(den);
        }
        if (Number.isNaN(value)) throw "bad";
        return value;
    } catch {
        return null;
    }
}

convertFractionBtn?.addEventListener("click", () => {
    const raw = fractionInput.value.trim();
    
    // Clear previous result/error
    fractionResult.textContent = "";
    fractionResult.style.color = "";
    
    // Validate input
    if (!raw) {
        fractionResult.textContent = "Please enter a fraction (e.g., 1/3 or 2 1/4)";
        fractionResult.style.color = "#ff6b6b";
        return;
    }
    
    if (!raw.includes("/")) {
        fractionResult.textContent = "Invalid format. Use 1/2 or 2 1/3";
        fractionResult.style.color = "#ff6b6b";
        return;
    }
    
    // Convert fraction
    const dec = convertFractionToDecimal(raw);
    if (dec === null) {
        fractionResult.textContent = "Invalid fraction. Check your numbers.";
        fractionResult.style.color = "#ff6b6b";
        return;
    }
    
    // Success - populate the Per Quantity field
    perQuantityInput.value = dec.toFixed(3);
    fractionResult.textContent = `✓ Converted: ${raw} = ${dec.toFixed(3)}`;
    fractionResult.style.color = "#4caf50";
    
    logDebug(`Fraction converted: ${raw} → ${dec.toFixed(3)}`);
});

function collectFoodItem() {
    const amtHaving = Number(amountHavingInput?.value) || 0;
    const perQty = Number(perQuantityInput?.value) || 1;
    const multiplier = perQty ? amtHaving / perQty : 0;

    const caloriesPerServing = Number(caloriesInput?.value) || 0;
    const fatPerServing = Number(fatInput?.value) || 0;
    const sodiumPerServing = Number(sodiumInput?.value) || 0;
    const carbsPerServing = Number(carbsInput?.value) || 0;
    const fiberPerServing = Number(fiberInput?.value) || 0;
    const sugarPerServing = Number(sugarInput?.value) || 0;
    const proteinPerServing = Number(proteinInput?.value) || 0;

    return {
        name: (foodNameInput?.value || "").trim(),
        mealType: mealTypeInput?.value || "",
        servingSize: Number(servingSizeInput?.value) || 0,
        servingEquals: servingEqualsInput?.value || "Number",
        perQuantity: perQty,
        caloriesPerServing,
        fatPerServing,
        sodiumPerServing,
        carbsPerServing,
        fiberPerServing,
        sugarPerServing,
        proteinPerServing,
        qtyHaving: amtHaving,
        // Pre-computed effective totals for quick summaries
        calories: caloriesPerServing * multiplier,
        fat: fatPerServing * multiplier,
        sodium: sodiumPerServing * multiplier,
        carbs: carbsPerServing * multiplier,
        fiber: fiberPerServing * multiplier,
        sugar: sugarPerServing * multiplier,
        protein: proteinPerServing * multiplier
    };
}

function clearInputs() {
    foodNameInput.value = "";
    servingSizeInput.value = "";
    servingEqualsInput.value = "Number";
    perQuantityInput.value = "";
    caloriesInput.value = "";
    fatInput.value = "";
    sodiumInput.value = "";
    carbsInput.value = "";
    fiberInput.value = "";
    sugarInput.value = "";
    proteinInput.value = "";
    amountHavingInput.value = "";
    fractionInput.value = "";
    fractionResult.textContent = "";
    fractionBox.classList.add("hidden");
    editingIndex = -1;
    logDebug("Inputs cleared");
}

logDebug("Batch 2 loaded");
// =============================================================
// Batch 3 — ADD, LOAD EDIT MODE, DELETE ITEMS, UPDATE TABLE
// =============================================================

// ADD FOOD
function handleAddFoodClick() {
    console.log("Click to Add pressed");

    const amtRaw = Number(amountHavingInput?.value);
    const amtHaving = amtRaw > 0 ? amtRaw : 1; // default to 1 if blank/invalid

    const name = (foodNameInput?.value || "").trim();
    if (!name) {
        resultBox.textContent = "Enter a food name before adding.";
        return;
    }

    const perQty = Number(perQuantityInput?.value) || 1;

    // Log raw inputs for debugging
    console.log("Amount having:", amtHaving);
    console.log("Raw nutrition per serving", {
        calories: Number(caloriesInput?.value) || 0,
        fat: Number(fatInput?.value) || 0,
        sodium: Number(sodiumInput?.value) || 0,
        carbs: Number(carbsInput?.value) || 0,
        fiber: Number(fiberInput?.value) || 0,
        sugar: Number(sugarInput?.value) || 0,
        protein: Number(proteinInput?.value) || 0
    });

    // Temporarily set the amount so collectFoodItem picks it up
    if (amountHavingInput) amountHavingInput.value = amtHaving;

    const item = collectFoodItem();

    // Ensure perQuantity and qtyHaving reflect our defaults
    item.perQuantity = perQty;
    item.qtyHaving = amtHaving;

    // Recompute effective totals with final values
    const multiplier = perQty ? amtHaving / perQty : 0;
    item.calories = item.caloriesPerServing * multiplier;
    item.fat = item.fatPerServing * multiplier;
    item.sodium = item.sodiumPerServing * multiplier;
    item.carbs = item.carbsPerServing * multiplier;
    item.fiber = item.fiberPerServing * multiplier;
    item.sugar = item.sugarPerServing * multiplier;
    item.protein = item.proteinPerServing * multiplier;

    console.log("Adding item", item);

    if (editingIndex >= 0) {
        foodItems[editingIndex] = item;
        editingIndex = -1;
        editConfirmBar?.classList.add("hidden");
        logDebug(`Item updated: ${item.name}`);
    } else {
        foodItems.push(item);
        logDebug(`Item added: ${item.name}`);
    }

    updateTable();
    updateTotalsAndSummary();
    updateResults();
    updateTimeline();

    const totalsAfter = calculateTotals();
    console.log("Totals after add", totalsAfter);

    // Success message with key macros
    resultBox.innerHTML = `Added ${item.name}: ` +
        `Carbs ${Math.round(item.carbs)} g, ` +
        `Fat ${Math.round(item.fat)} g, ` +
        `Protein ${Math.round(item.protein)} g`;

    // Clear only the amount field; keep Step 1 values
    if (amountHavingInput) amountHavingInput.value = "";

    // Prep for next entry and reset OCR/Step 1 inputs
    resetAfterMealAdded();
}

addFoodBtn?.addEventListener("click", handleAddFoodClick);

// Reset Step 1 inputs and OCR fields after a meal is logged
function resetAfterMealAdded() {
    const nameEl = document.getElementById("foodNameInput");
    const step1Ids = [
        "servingSize",    // Serving Size (g or mL)
        "perQuantity",    // Per Quantity (per label)
        "calories",       // Calories
        "fat",            // Fat (g)
        "sodium",         // Sodium (mg)
        "carbs",          // Carbs (g)
        "fiber",          // Fiber (g)
        "sugar",          // Sugar (g)
        "protein"         // Protein (g)
    ];

    if (nameEl) {
        nameEl.value = "";
        nameEl.focus();
    }

    step1Ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    // OCR file inputs
    const frontFile = document.getElementById("ocrFrontInput");
    const backFile = document.getElementById("ocrBackInput");
    if (frontFile) frontFile.value = "";
    if (backFile) backFile.value = "";

    // OCR image previews
    const frontPreview = document.getElementById("ocrFrontPreview");
    const backPreview = document.getElementById("ocrBackPreview");
    if (frontPreview) {
        frontPreview.src = "";
        frontPreview.style.display = "none";
    }
    if (backPreview) {
        backPreview.src = "";
        backPreview.style.display = "none";
    }

    // OCR status messages and JSON box
    const foodOcrStatus = document.getElementById("ocrFrontStatus");
    const nutrOcrStatus = document.getElementById("ocrBackStatus");
    const nutritionJson = document.getElementById("ocrOutput");

    if (foodOcrStatus) foodOcrStatus.textContent = "";
    if (nutrOcrStatus) nutrOcrStatus.textContent = "";
    if (nutritionJson) nutritionJson.value = "";
}

// LOAD EDIT MODE
function loadForEdit(index) {
    const item = foodItems[index];
    if (!item) return;

    editingIndex = index;

    foodNameInput.value = item.name;
    mealTypeInput.value = item.mealType;
    servingSizeInput.value = item.servingSize;
    servingEqualsInput.value = item.servingEquals;
    perQuantityInput.value = item.perQuantity;

    caloriesInput.value = item.caloriesPerServing;
    fatInput.value = item.fatPerServing;
    sodiumInput.value = item.sodiumPerServing;
    carbsInput.value = item.carbsPerServing;
    fiberInput.value = item.fiberPerServing;
    sugarInput.value = item.sugarPerServing;
    proteinInput.value = item.proteinPerServing;

    amountHavingInput.value = item.qtyHaving;

    editConfirmBar.classList.remove("hidden");

    logDebug(`Loaded for edit: ${item.name} (index ${index})`);
}

// SAVE CHANGES (Edit mode)
saveEditBtn?.addEventListener("click", () => {
    if (editingIndex < 0) return;

    const amtRaw = Number(amountHavingInput?.value);
    const amtHaving = amtRaw > 0 ? amtRaw : 1;

    const name = (foodNameInput?.value || "").trim();
    if (!name) {
        resultBox.textContent = "Enter a food name before saving.";
        return;
    }

    const perQty = Number(perQuantityInput?.value) || 1;

    // Collect updated item data
    const item = collectFoodItem();
    item.perQuantity = perQty;
    item.qtyHaving = amtHaving;

    // Recompute effective totals
    const multiplier = perQty ? amtHaving / perQty : 0;
    item.calories = item.caloriesPerServing * multiplier;
    item.fat = item.fatPerServing * multiplier;
    item.sodium = item.sodiumPerServing * multiplier;
    item.carbs = item.carbsPerServing * multiplier;
    item.fiber = item.fiberPerServing * multiplier;
    item.sugar = item.sugarPerServing * multiplier;
    item.protein = item.proteinPerServing * multiplier;

    // Update the item in foodItems array
    foodItems[editingIndex] = item;
    logDebug(`Item updated: ${item.name}`);

    // Exit edit mode
    editingIndex = -1;
    editConfirmBar?.classList.add("hidden");

    // Refresh table and all totals
    updateTable();
    updateTotalsAndSummary();
    updateResults();
    updateTimeline();

    // Success message
    resultBox.innerHTML = `Updated ${item.name}: ` +
        `Carbs ${Math.round(item.carbs)} g, ` +
        `Fat ${Math.round(item.fat)} g, ` +
        `Protein ${Math.round(item.protein)} g`;

    logDebug("Save Changes completed");
});

// CANCEL EDIT
cancelEditBtn?.addEventListener("click", () => {
    if (editingIndex < 0) return;

    editingIndex = -1;
    editConfirmBar?.classList.add("hidden");

    // Clear inputs
    foodNameInput.value = "";
    servingSizeInput.value = "";
    servingEqualsInput.value = "Number";
    perQuantityInput.value = "";
    caloriesInput.value = "";
    fatInput.value = "";
    sodiumInput.value = "";
    carbsInput.value = "";
    fiberInput.value = "";
    sugarInput.value = "";
    proteinInput.value = "";
    amountHavingInput.value = "";

    resultBox.textContent = "Edit cancelled.";
    logDebug("Edit cancelled");
});

// DELETE ITEM
function deleteItem(index) {
    const item = foodItems[index];
    if (!item) return;

    if (editingIndex === index) {
        editingIndex = -1;
        editConfirmBar.classList.add("hidden");
    }

    foodItems.splice(index, 1);
    logDebug(`Deleted: ${item.name}`);

    updateTable();
    updateTotalsAndSummary();
    updateResults();
    updateTimeline();
}

// RENDER TABLE
function updateTable() {
    foodLogBody.innerHTML = "";

    foodItems.forEach((item, i) => {
        const mult = item.qtyHaving / item.perQuantity;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.servingSize}</td>
            <td>${Math.round(item.caloriesPerServing * mult)}</td>
            <td>${Math.round(item.fatPerServing * mult)}</td>
            <td>${Math.round(item.sodiumPerServing * mult)}</td>
            <td>${Math.round(item.carbsPerServing * mult)}</td>
            <td>${Math.round(item.fiberPerServing * mult)}</td>
            <td>${Math.round(item.sugarPerServing * mult)}</td>
            <td>${Math.round(item.proteinPerServing * mult)}</td>
            <td>${item.qtyHaving}</td>
            <td><button class="btn-secondary small-btn" onclick="loadForEdit(${i})">✏</button></td>
            <td><button class="btn-secondary small-btn" onclick="deleteItem(${i})">X</button></td>
        `;
        foodLogBody.appendChild(tr);
    });

    logDebug("Table updated");
}

logDebug("Batch 3 loaded");
// =============================================================
// Batch 4 — TOTALS, RESULTS, TIMELINE, HISTORY, INIT
// =============================================================

// -------------------------------------------------------------
// TOTALS
// -------------------------------------------------------------
function calculateTotals() {
    const totals = {
        calories: 0,
        sodium: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        protein: 0
    };

    foodItems.forEach(item => {
        const mult = item.qtyHaving / item.perQuantity;

        totals.calories += item.caloriesPerServing * mult;
        totals.sodium += item.sodiumPerServing * mult;
        totals.fat += item.fatPerServing * mult;
        totals.carbs += item.carbsPerServing * mult;
        totals.fiber += item.fiberPerServing * mult;
        totals.sugar += item.sugarPerServing * mult;
        totals.protein += item.proteinPerServing * mult;
    });

    return totals;
}

// -------------------------------------------------------------
// UPDATE TOTALS + SUMMARY TEXT
// -------------------------------------------------------------
function updateTotalsAndSummary() {
    const totals = calculateTotals();

    // track totals for AI/floating summaries
    currentTotals = { ...totals };

    if (totalsStrip) {
        totalsStrip.textContent =
            `TOTAL CARBS: ${Math.round(totals.carbs)} g\n` +
            `TOTAL FAT: ${Math.round(totals.fat)} g\n` +
            `TOTAL PROTEIN: ${Math.round(totals.protein)} g`;
    }

    if (totalsTableRow) {
        totalsTableRow.innerHTML = `
            <td><strong>TOTAL</strong></td>
            <td>-</td>
            <td>${Math.round(totals.calories)}</td>
            <td>${Math.round(totals.fat)}</td>
            <td>${Math.round(totals.sodium)}</td>
            <td>${Math.round(totals.carbs)}</td>
            <td>${Math.round(totals.fiber)}</td>
            <td>${Math.round(totals.sugar)}</td>
            <td>${Math.round(totals.protein)}</td>
            <td>-</td>
            <td></td>
            <td></td>
        `;
    }

    if (foodSummaryDiv) {
        foodSummaryDiv.textContent =
            `TOTAL CARBS: ${Math.round(totals.carbs)} g   ` +
            `TOTAL FAT: ${Math.round(totals.fat)} g   ` +
            `TOTAL PROTEIN: ${Math.round(totals.protein)} g`;
    }

    if (floatTotalsText) {
        floatTotalsText.textContent =
            `Carbs ${Math.round(totals.carbs)} g, Fat ${Math.round(totals.fat)} g, Protein ${Math.round(totals.protein)} g`;
    }

    logDebug("Totals updated");
}

// -------------------------------------------------------------
// RESULT GUIDANCE LOGIC
// -------------------------------------------------------------
function updateResults() {
    const totals = calculateTotals();
    const carbs = totals.carbs;
    const fat = totals.fat;
    const bsl = parseFloat(bslInput.value) || 120;
    const mealType = mealTypeInput.value;

    if (!carbs || carbs <= 0) {
        resultBox.textContent = "Add at least one food item to generate guidance.";
        return;
    }

    // Pre-bolus logic (using BSL ranges you specified)
let preBolus;

if (!bslInput.value) {
    preBolus = "ADD BSL to continue!";
} else {
    const bslVal = parseFloat(bslInput.value);

    if (bslVal <= 109) {
        preBolus = "No Pre-Bolus, Dose with First Bite";
    } else if (bslVal <= 140) {
        preBolus = "0-3 minutes";
    } else if (bslVal <= 170) {
        preBolus = "3-5 minutes";
    } else if (bslVal <= 200) {
        preBolus = "6-8 minutes";
    } else if (bslVal <= 234) {
        preBolus = "10-12 minutes";
    } else {
        preBolus = "15-20 minutes";
    }
}

    // Fat-based split logic
    let splitNeeded = fat >= 15 || mealType === "Fast Food" || mealType === "Packaged Meal";

    let splitRecommendation = splitNeeded ? "Yes" : "No";
    let splitPercent = splitNeeded ? "55/45" : "100/0";
    let splitDuration = splitNeeded ? "3 hours" : "Standard";
    let reason = splitNeeded ? "High fat or slow digesting meal." : "Standard carb meal.";

    resultBox.innerHTML = `
        Pre Bolus Time: ${preBolus}<br>
        Split Recommendation: ${splitRecommendation}<br>
        Suggested Split Percent: ${splitPercent}<br>
        Split Duration: ${splitDuration}<br>
        Reason: ${reason}
    `;

    // FIX 3: Update floating box pre-bolus to match
    if (floatPrebolusText) floatPrebolusText.textContent = preBolus;

    logDebug("Results updated");
}

// Heuristic meal classifier to decide split/extended bolus guidance
function classifyMealForSplit(totals) {
  const carbs = totals.carbs || 0;
  const fat = totals.fat || 0;
  const protein = totals.protein || 0;

  // Thresholds
  const highCarb = carbs >= 45;              // pasta, big rice bowls, etc.
  const veryHighCarb = carbs >= 70;          // huge carb load
  const highFatOrProtein = fat >= 18 || protein >= 25;
  const lowCarb = carbs < 25;

  // 1) Very high simple carb, low fat or protein, usually front loaded
  if (veryHighCarb && !highFatOrProtein) {
    return {
      category: "simple-carb-heavy",
      splitRecommendation: "Usually 100 percent now. Small tail split only if user prefers.",
      suggestedPercent: "100% now (or short 85/15 split if user prefers).",
      splitDuration: "0 to 45 minutes.",
      reason: "Large simple carb load with low fat and protein, absorption is usually fast."
    };
  }

  // 2) High carb with significant fat or protein, default to split
  if (highCarb && highFatOrProtein) {
    return {
      category: "heavy-split",
      splitRecommendation: "Yes, use a split bolus.",
      suggestedPercent: "40% now, 60% extended.",
      splitDuration: "About 1.5 hours.",
      reason: "Higher fat or protein with significant carbs, likely delayed absorption."
    };
  }

  // 3) Moderate carbs, modest fat or protein
  if (!lowCarb) {
    return {
      category: "moderate-carb",
      splitRecommendation: "Usually no split.",
      suggestedPercent: "100% now.",
      splitDuration: "N/A.",
      reason: "Moderate carbs with only modest fat and protein."
    };
  }

  // 4) Low carb or mostly protein meals
  return {
    category: "low-carb",
    splitRecommendation: "No split.",
    suggestedPercent: "100% now.",
    splitDuration: "N/A.",
    reason: "Low carb or protein dominant meal."
  };
}

// AI guidance summary + narrative
function runAiAnalysis() {
    if (!aiNotesBox) return;

    const bsl = bslInput ? parseFloat(bslInput.value) : NaN;
    const totals = currentTotals || calculateTotals();
    const carbs = Math.round(totals.carbs || 0);
    const fat = Math.round(totals.fat || 0);
    const protein = Math.round(totals.protein || 0);

    const mealProfile = classifyMealForSplit(totals);

    if (!bsl || Number.isNaN(bsl)) {
        prebolusSpan && (prebolusSpan.textContent = "ADD BSL to continue!");
        splitRecSpan && (splitRecSpan.textContent = mealProfile.splitRecommendation);
        splitPercentSpan && (splitPercentSpan.textContent = mealProfile.suggestedPercent);
        splitDurationSpan && (splitDurationSpan.textContent = mealProfile.splitDuration);
        splitReasonSpan && (splitReasonSpan.textContent = `${mealProfile.reason} Enter a BSL value to refine guidance.`);
        if (doseSpan) {
            doseSpan.textContent = "Use your usual insulin-to-carb and correction formulas. This tool does not calculate insulin units.";
        }
        aiNotesBox.value = "Add the current BSL (mg/dL) at the top of the page, then click \"Run AI Analysis\" again.";
        
        // Update AI Guidance Results QC layer even when BSL is missing
        updateAiGuidanceResults("ADD BSL to continue!", mealProfile.suggestedPercent, mealProfile.splitDuration);
        
        return;
    }

    // 1. Pre-bolus window based on BSL
let prebolus;

// NOTE: at this point bsl is already a number.
// If BSL was missing, the earlier guard in runAiAnalysis()
// should have set "ADD BSL" and returned. These ranges
// only run when we actually have a BSL value.

if (bsl <= 109) {
    prebolus = "No Pre-Bolus, Dose with First Bite";
} else if (bsl <= 140) {
    prebolus = "0-3 minutes";
} else if (bsl <= 170) {
    prebolus = "3-5 minutes";
} else if (bsl <= 200) {
    prebolus = "6-8 minutes";
} else if (bsl <= 234) {
    prebolus = "10-12 minutes";
} else { // 235-250+
    prebolus = "15-20 minutes";
}

if (prebolusSpan) prebolusSpan.textContent = prebolus;

    // 2. Split recommendation (use heuristic defaults; can be overridden by AI later if added)
    const splitRec = mealProfile.splitRecommendation;
    const splitPercent = mealProfile.suggestedPercent;
    const splitDuration = mealProfile.splitDuration;
    const splitReason = mealProfile.reason;

    if (splitRecSpan) splitRecSpan.textContent = splitRec;
    if (splitPercentSpan) splitPercentSpan.textContent = splitPercent;
    if (splitDurationSpan) splitDurationSpan.textContent = splitDuration;
    if (splitReasonSpan) splitReasonSpan.textContent = splitReason;

    // Update AI Guidance Results QC layer
    updateAiGuidanceResults(prebolus, splitPercent, splitDuration);

    if (doseSpan) {
        doseSpan.textContent =
            "Use your usual insulin-to-carb ratio to calculate a meal dose from " +
            carbs + " g carbs, then apply your correction factor if BSL is above target. Final dose is meal dose plus any correction.";
    }

    aiNotesBox.value =
        `BSL: ${bsl} mg/dL\n` +
        `Totals: Carbs ${carbs} g, Fat ${fat} g, Protein ${protein} g\n\n` +
        `Heuristic meal profile: ${mealProfile.category}, split recommendation: ${splitRec}, suggested percent: ${splitPercent}, split duration: ${splitDuration}.\n` +
        `Pre-bolus: ${prebolus}\n` +
        `Split: ${splitRec} (${splitPercent}, ${splitDuration})\n` +
        `Reason: ${splitReason}\n\n` +
        `Dose note: ${doseSpan ? doseSpan.textContent : "Use your usual insulin formulas."}`;

    logDebug("AI analysis updated");
}

// Recalculate guidance when BSL changes
bslInput?.addEventListener("input", () => {
    updateResults();
    updateTimeline();
});

runAiButton?.addEventListener("click", runAiAnalysis);

// -------------------------------------------------------------
// AI GUIDANCE QC LAYER
// -------------------------------------------------------------

// Update AI Guidance Results table with new recommendations
function updateAiGuidanceResults(preBolusText, suggestedPercentText, splitDurationText) {
    aiGuidanceState.recommended.prebolus = preBolusText || 'N/A';
    aiGuidanceState.recommended.splitPercent = suggestedPercentText || 'N/A';
    aiGuidanceState.recommended.splitDuration = splitDurationText || 'N/A';

    const preRecEl = document.getElementById('aiPrebolusRecommended');
    const splitRecEl = document.getElementById('aiSplitPercentRecommended');
    const durRecEl = document.getElementById('aiSplitDurationRecommended');

    if (preRecEl) preRecEl.textContent = aiGuidanceState.recommended.prebolus;
    if (splitRecEl) splitRecEl.textContent = aiGuidanceState.recommended.splitPercent;
    if (durRecEl) durRecEl.textContent = aiGuidanceState.recommended.splitDuration;

    resetAiOverrideControls();
    recomputeDoseGuidance();
}

// Reset all KEEP selects to "yes" and clear/disable override inputs
function resetAiOverrideControls() {
    const controls = [
        { keepId: 'aiPrebolusKeep', overrideId: 'aiPrebolusOverride' },
        { keepId: 'aiSplitPercentKeep', overrideId: 'aiSplitPercentOverride' },
        { keepId: 'aiSplitDurationKeep', overrideId: 'aiSplitDurationOverride' }
    ];

    controls.forEach(({ keepId, overrideId }) => {
        const keepEl = document.getElementById(keepId);
        const overrideEl = document.getElementById(overrideId);
        
        if (keepEl) keepEl.value = 'yes';
        if (overrideEl) {
            overrideEl.value = '';
            overrideEl.disabled = true;
        }
    });
}

// Choose between recommended and override value based on KEEP setting
function chooseValue(keepId, overrideId, recommendedValue) {
    const keepEl = document.getElementById(keepId);
    const overrideEl = document.getElementById(overrideId);
    const keep = keepEl ? keepEl.value : 'yes';
    const overrideVal = overrideEl ? overrideEl.value.trim() : '';

    if (keep === 'no' && overrideVal) {
        return overrideVal;
    }
    return recommendedValue || 'N/A';
}

// Recompute dose guidance based on KEEP/override settings
function recomputeDoseGuidance() {
    const using = aiGuidanceState.using;
    const rec = aiGuidanceState.recommended;

    using.prebolus = chooseValue('aiPrebolusKeep', 'aiPrebolusOverride', rec.prebolus);
    using.splitPercent = chooseValue('aiSplitPercentKeep', 'aiSplitPercentOverride', rec.splitPercent);
    using.splitDuration = chooseValue('aiSplitDurationKeep', 'aiSplitDurationOverride', rec.splitDuration);

    const preEl = document.getElementById('doseGuidancePrebolus');
    const splitEl = document.getElementById('doseGuidanceSplitPercent');
    const durEl = document.getElementById('doseGuidanceSplitDuration');

    if (preEl) preEl.textContent = 'Pre-Bolus: ' + (using.prebolus || 'N/A');
    if (splitEl) splitEl.textContent = 'Suggested Percent: ' + (using.splitPercent || 'N/A');
    if (durEl) durEl.textContent = 'Split Duration: ' + (using.splitDuration || 'N/A');

    updateFloatingSummaryFromDoseGuidance();
}

// Update floating summary box to reflect final "using" values
function updateFloatingSummaryFromDoseGuidance() {
    const using = aiGuidanceState.using;
    
    if (floatPrebolusText) {
        const prebolusText = using.prebolus && using.prebolus !== 'N/A'
            ? using.prebolus
            : 'N/A';
        floatPrebolusText.textContent = prebolusText;
    }

    if (floatSplitText) {
        const splitPercentPart = using.splitPercent && using.splitPercent !== 'N/A'
            ? using.splitPercent
            : '';
        const splitDurationPart = using.splitDuration && using.splitDuration !== 'N/A'
            ? using.splitDuration
            : '';

        let splitLine = 'N/A';
        if (splitPercentPart && splitDurationPart) {
            splitLine = splitPercentPart + ' over ' + splitDurationPart;
        } else if (splitPercentPart) {
            splitLine = splitPercentPart;
        } else if (splitDurationPart) {
            splitLine = splitDurationPart;
        }

        floatSplitText.textContent = splitLine;
    }
}

// OCR combined action - handled by ocr.js
// extractAllBtn listener is defined in ocr.js

// -------------------------------------------------------------
// TIMELINE CHART
// -------------------------------------------------------------
function updateTimeline() {
    if (!timelineCanvas || typeof Chart === "undefined") {
        logDebug("Chart.js missing, timeline not drawn");
        return;
    }

    const totals = calculateTotals();
    const carbs = totals.carbs;
    const bslStart = parseFloat(bslInput.value) || 120;

    if (!carbs || carbs <= 0) {
        if (timelineChart) {
            timelineChart.destroy();
            timelineChart = null;
        }
        logDebug("Timeline cleared, no carbs");
        return;
    }

    // Placeholder curve
    const peakRise = carbs * 1.5;
    const peak = bslStart + peakRise;

    const points = [
        bslStart,
        bslStart + peakRise * 0.5,
        bslStart + peakRise * 0.8,
        peak,
        bslStart + peakRise * 0.3,
        bslStart + peakRise * 0.15,
        bslStart + peakRise * 0.05
    ];

    const labels = ["0m", "30m", "60m", "90m", "120m", "180m", "240m"];

    const ctx = timelineCanvas.getContext("2d");
    if (timelineChart) timelineChart.destroy();

    timelineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Predicted BSL",
                    data: points,
                    borderColor: "#0c7bd9",
                    backgroundColor: "rgba(12,123,217,0.1)",
                    tension: 0.35,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#f7d35c"
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time after meal",
                        color: "#ffff00",
                        font: { size: 12 }
                    },
                    ticks: {
                        color: "#ffff00",
                        padding: 8      // small gap above bottom border
                    },
                    grid: {
                        color: "rgba(255, 255, 0, 0.15)"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Blood glucose (mg/dL)",
                        color: "#ffff00",
                        font: { size: 12 }
                    },
                    ticks: {
                        color: "#ffff00"
                    },
                    grid: {
                        color: "rgba(255, 255, 0, 0.15)"
                    }
                }
            }
        }
    });

    logDebug("Timeline updated");

}

// -------------------------------------------------------------
// SAVE HISTORY (with timestamp support)
// -------------------------------------------------------------
saveHistoryButton?.addEventListener("click", () => {
    if (foodItems.length === 0) {
        alert("Nothing to save to history.");
        return;
    }

    // Get current timestamp as string
    const timestamp = Date.now();
    
    // Get current meal type from dropdown
    const currentMealType = mealTypeInput?.value || "-";

    // Read existing history from localStorage
    const HISTORY_KEY = "t1d_food_history";
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

    // Helper to check if entry already exists (duplicate check)
    function isDuplicate(newEntry, existingEntries) {
        return existingEntries.some(entry => 
            entry.name === newEntry.name &&
            entry.mealType === newEntry.mealType &&
            entry.servingSize === newEntry.servingSize &&
            entry.caloriesPerServing === newEntry.caloriesPerServing &&
            entry.carbsPerServing === newEntry.carbsPerServing &&
            entry.proteinPerServing === newEntry.proteinPerServing
        );
    }

    // Process each food item from the logged items array
    let addedCount = 0;
    foodItems.forEach(item => {
        const historyEntry = {
            timestamp,
            name: item.name,
            mealType: currentMealType,
            servingSize: item.servingSize,
            qtyHaving: item.qtyHaving,
            caloriesPerServing: item.caloriesPerServing,
            sodiumPerServing: item.sodiumPerServing,
            fatPerServing: item.fatPerServing,
            carbsPerServing: item.carbsPerServing,
            fiberPerServing: item.fiberPerServing,
            sugarPerServing: item.sugarPerServing,
            proteinPerServing: item.proteinPerServing
        };

        // Only add if not a duplicate
        if (!isDuplicate(historyEntry, history)) {
            history.push(historyEntry);
            addedCount++;
        }
    });

    // Save updated history back to localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    if (addedCount > 0) {
        alert(`Saved ${addedCount} item(s) to history.`);
        logDebug(`History saved: ${addedCount} items at ${timestamp}`);
        
        // Reload page to clear all fields
        location.reload();
    } else {
        alert("All items already exist in history (duplicates skipped).");
    }
});

if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener("click", () => {
        window.location.href = "history.html";
    });
}

// -------------------------------------------------------------
// MEAL TYPE QUICK SELECT BUTTONS
// -------------------------------------------------------------
const quickButtons = document.querySelectorAll(".quick-btn");

quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Get the meal type from data attribute
        const mealType = btn.getAttribute("data-meal");
        
        // Update selectedMealType variable
        selectedMealType = mealType;
        
        // Remove active class from all buttons
        quickButtons.forEach(b => {
            b.style.background = "";
            b.style.color = "";
        });
        
        // Add active styling to clicked button
        btn.style.background = "#f5c518";
        btn.style.color = "#000";
        
        // Update the meal type dropdown to match
        if (mealType === "Breakfast" || mealType === "Lunch" || mealType === "Dinner") {
            mealTypeInput.value = "Home Meal";
        } else if (mealType === "Snack") {
            mealTypeInput.value = "Snack";
        } else if (mealType === "Fast Food") {
            mealTypeInput.value = "Fast Food";
        } else if (mealType === "Custom") {
            mealTypeInput.value = "Packaged Meal";
        }
        
        logDebug(`Meal type selected: ${mealType}`);
    });
});

// -------------------------------------------------------------
// INITIALIZE APP
// -------------------------------------------------------------
(function initApp() {
    logDebug("Initializing app");
    updateTable();
    updateTotalsAndSummary();
    updateResults();
    updateTimeline();

    // Set up AI Guidance QC layer event listeners
    const aiControls = [
        { keepId: 'aiPrebolusKeep', overrideId: 'aiPrebolusOverride' },
        { keepId: 'aiSplitPercentKeep', overrideId: 'aiSplitPercentOverride' },
        { keepId: 'aiSplitDurationKeep', overrideId: 'aiSplitDurationOverride' }
    ];

    aiControls.forEach(({ keepId, overrideId }) => {
        const keepEl = document.getElementById(keepId);
        const overrideEl = document.getElementById(overrideId);

        if (keepEl) {
            keepEl.addEventListener('change', () => {
                if (overrideEl) {
                    if (keepEl.value === 'yes') {
                        overrideEl.value = '';
                        overrideEl.disabled = true;
                    } else {
                        overrideEl.disabled = false;
                    }
                }
                recomputeDoseGuidance();
            });
        }

        if (overrideEl) {
            overrideEl.addEventListener('input', () => {
                recomputeDoseGuidance();
            });
        }
    });
})();

// =============================================================
// FIX 2 — FOOD NAME AUTOCOMPLETE FROM HISTORY
// =============================================================

// Create autocomplete dropdown container
const autocompleteContainer = document.createElement("div");
autocompleteContainer.id = "autocompleteDropdown";
autocompleteContainer.style.cssText = `
    position: absolute;
    background: #1a2533;
    border: 1px solid #3a4b61;
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
`;

// Insert dropdown after food name input
if (foodNameInput && foodNameInput.parentElement) {
    foodNameInput.parentElement.style.position = "relative";
    foodNameInput.parentElement.appendChild(autocompleteContainer);
}

// Handle food name input - show suggestions
foodNameInput?.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (!query || query.length < 2) {
        autocompleteContainer.style.display = "none";
        return;
    }
    
    // Get unique food items from history
    const matches = [];
    const seenNames = new Set();
    
    historyData.forEach(item => {
        const itemName = (item.name || "").toLowerCase();
        if (itemName.includes(query) && !seenNames.has(item.name)) {
            seenNames.add(item.name);
            matches.push(item);
        }
    });
    
    if (matches.length === 0) {
        autocompleteContainer.style.display = "none";
        return;
    }
    
    // Build dropdown items
    autocompleteContainer.innerHTML = "";
    matches.slice(0, 8).forEach(item => {
        const div = document.createElement("div");
        div.textContent = item.name;
        div.style.cssText = `
            padding: 10px 12px;
            cursor: pointer;
            color: #e8f0f6;
            border-bottom: 1px solid #2d3b4d;
        `;
        div.addEventListener("mouseover", () => {
            div.style.background = "#243447";
        });
        div.addEventListener("mouseout", () => {
            div.style.background = "";
        });
        div.addEventListener("click", () => {
            // Auto-fill Step 1 fields
            foodNameInput.value = item.name;
            mealTypeInput.value = item.mealType || "Home Meal";
            servingSizeInput.value = item.servingSize || "";
            perQuantityInput.value = item.perQuantity || 1;
            caloriesInput.value = item.caloriesPerServing || "";
            fatInput.value = item.fatPerServing || "";
            sodiumInput.value = item.sodiumPerServing || "";
            carbsInput.value = item.carbsPerServing || "";
            fiberInput.value = item.fiberPerServing || "";
            sugarInput.value = item.sugarPerServing || "";
            proteinInput.value = item.proteinPerServing || "";
            
            // Hide dropdown
            autocompleteContainer.style.display = "none";
            
            logDebug(`Auto-filled from history: ${item.name}`);
        });
        autocompleteContainer.appendChild(div);
    });
    
    // Position and show dropdown
    const rect = foodNameInput.getBoundingClientRect();
    const parentRect = foodNameInput.parentElement.getBoundingClientRect();
    autocompleteContainer.style.top = (foodNameInput.offsetTop + foodNameInput.offsetHeight) + "px";
    autocompleteContainer.style.left = foodNameInput.offsetLeft + "px";
    autocompleteContainer.style.width = foodNameInput.offsetWidth + "px";
    autocompleteContainer.style.display = "block";
});

// Hide dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (e.target !== foodNameInput && !autocompleteContainer.contains(e.target)) {
        autocompleteContainer.style.display = "none";
    }
});
