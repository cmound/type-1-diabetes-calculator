/* ============================================================
   GLOBAL STATE + LOAD HISTORY
============================================================ */
let foodItems = [];
let editingIndex = -1;

// Load entire history list (array of objects)
let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];

/* ============================================================
   ELEMENT REFERENCES
============================================================ */
const nameInput           = document.getElementById("name");
const bslInput            = document.getElementById("bsl");
const foodNameInput       = document.getElementById("foodNameInput");
const autoList            = document.getElementById("foodNameSuggestions");

const servingEqualsInput  = document.getElementById("servingEqualsInput");
const qtyPiecesInput      = document.getElementById("qtyPieces");
const perMeasInput        = document.getElementById("PerMeasurement");

const servingSizeInput    = document.getElementById("servingSizeInput");

const caloriesInput       = document.getElementById("caloriesInput");
const fatInput            = document.getElementById("fatInput");
const sodiumInput         = document.getElementById("sodiumInput");
const carbsInput          = document.getElementById("carbsInput");
const fiberInput          = document.getElementById("fiberInput");
const sugarInput          = document.getElementById("sugarInput");
const proteinInput        = document.getElementById("proteinInput");

const amountHavingInput   = document.getElementById("amountHaving");

const addFoodBtn          = document.getElementById("addFoodBtn");
const saveToHistoryBtn    = document.getElementById("saveToHistoryBtn");

const foodSummaryDiv      = document.getElementById("foodSummary");
const resultsDiv          = document.getElementById("results");
const foodLogBody         = document.getElementById("foodLogBody");

const scanBarcodeBtn      = document.getElementById("scanBarcodeBtn");

/* ============================================================
   AUTOCOMPLETE SUPPORT (LOAD FROM HISTORY)
============================================================ */
function rebuildAutocompleteList() {
    autoList.innerHTML = "";

    historyData.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.name;
        autoList.appendChild(opt);
    });
}

// Build autocomplete on page load
rebuildAutocompleteList();

/* When selecting a previously stored item, autofill all fields */
foodNameInput.addEventListener("input", () => {
    const entry = historyData.find(x => x.name.toLowerCase() === foodNameInput.value.toLowerCase());
    if (!entry) return;

    qtyPiecesInput.value     = entry.qtyPieces || "";
    perMeasInput.value       = entry.perMeasurement || "";
    servingEqualsInput.value = entry.servingEquals || "Number";

    servingSizeInput.value   = entry.servingSize || "";
    caloriesInput.value      = entry.calories || "";
    fatInput.value           = entry.fat || "";
    sodiumInput.value        = entry.sodium || "";
    carbsInput.value         = entry.carbs || "";
    fiberInput.value         = entry.fiber || "";
    sugarInput.value         = entry.sugar || "";
    proteinInput.value       = entry.protein || "";
});

/* ============================================================
   FRACTION CONVERTER (Number <-> Fraction)
============================================================ */
const fractionBox = document.getElementById("fractionBox");
servingEqualsInput.addEventListener("change", () => {
    if (servingEqualsInput.value === "Fraction") {
        fractionBox.classList.remove("hidden");
    } else {
        fractionBox.classList.add("hidden");
    }
});

document.getElementById("convertFractionBtn").addEventListener("click", () => {
    try {
        const value = document.getElementById("fractionInput").value.trim();
        if (!value.includes("/")) return alert("Enter fraction like 1/3");

        const [top, bottom] = value.split("/").map(Number);
        if (!bottom) return alert("Invalid fraction");

        qtyPiecesInput.value = (top / bottom).toFixed(3);
    } catch (e) {
        alert("Bad fraction");
    }
});

/* ============================================================
   ADD FOOD ITEM TO LOG
============================================================ */
addFoodBtn.addEventListener("click", () => {
    const qtyHad = Number(amountHavingInput.value || 0);
    if (qtyHad <= 0) return alert("Enter amount having.");

    const base = {
        name:        foodNameInput.value.trim(),
        qtyPieces:   qtyPiecesInput.value.trim(),
        perMeasurement: perMeasInput.value.trim(),
        servingEquals: servingEqualsInput.value,
        servingSize: servingSizeInput.value,

        calories: Number(caloriesInput.value || 0),
        fat:      Number(fatInput.value || 0),
        sodium:   Number(sodiumInput.value || 0),
        carbs:    Number(carbsInput.value || 0),
        fiber:    Number(fiberInput.value || 0),
        sugar:    Number(sugarInput.value || 0),
        protein:  Number(proteinInput.value || 0),

        qtyHaving: qtyHad
    };

    foodItems.push(base);
    renderLoggedTable();
});

/* ============================================================
   RENDER TABLE + TOTALS
============================================================ */
function renderLoggedTable() {
    foodLogBody.innerHTML = "";

    let totals = {
        calories: 0,
        sodium: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        protein: 0
    };

    foodItems.forEach(item => {
        totals.calories += item.calories * item.qtyHaving;
        totals.sodium   += item.sodium * item.qtyHaving;
        totals.fat      += item.fat * item.qtyHaving;
        totals.carbs    += item.carbs * item.qtyHaving;
        totals.fiber    += item.fiber * item.qtyHaving;
        totals.sugar    += item.sugar * item.qtyHaving;
        totals.protein  += item.protein * item.qtyHaving;
    });

    // Display totals in summary
    foodSummaryDiv.innerHTML = `
        TOTAL CARBS: ${totals.carbs}g<br>
        TOTAL FAT: ${totals.fat}g<br>
        TOTAL PROTEIN: ${totals.protein}g
    `;

    // Results placeholder
    resultsDiv.innerHTML = `
        Pre-Bolus: 5–7 mins<br>
        Split Dose: 50/50 over 1.5 hrs<br>
        Meal Type: Home Meal<br>
        Reason: Example logic placeholder
    `;

    // Render table rows
    foodItems.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.servingSize}</td>
            <td>${item.calories}</td>
            <td>${item.sodium}</td>
            <td>${item.fat}</td>
            <td>${item.carbs}</td>
            <td>${item.fiber}</td>
            <td>${item.sugar}</td>
            <td>${item.protein}</td>
            <td>${item.qtyHaving}</td>
        `;
        foodLogBody.appendChild(tr);
    });
}

/* ============================================================
   SAVE TO HISTORY
============================================================ */
saveToHistoryBtn.addEventListener("click", () => {
    if (!foodItems.length) return alert("Add at least one food first.");

    const last = foodItems[foodItems.length - 1];

    const entry = {
        name: last.name,
        qtyPieces: last.qtyPieces,
        perMeasurement: last.perMeasurement,
        servingEquals: last.servingEquals,
        servingSize: last.servingSize,

        calories: last.calories,
        fat: last.fat,
        sodium: last.sodium,
        carbs: last.carbs,
        fiber: last.fiber,
        sugar: last.sugar,
        protein: last.protein,

        timestamp: Date.now()
    };

    historyData.push(entry);
    localStorage.setItem("tid_food_history", JSON.stringify(historyData));
    rebuildAutocompleteList();

    alert("Saved to history.");
});

/* ============================================================
   DARK MODE
============================================================ */
const darkToggle = document.getElementById("darkToggle");
darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", darkToggle.checked);
});

/* ============================================================
   BARCODE SCANNING — CONNECT TO scanner.js
============================================================ */
if (scanBarcodeBtn) {
    scanBarcodeBtn.addEventListener("click", () => {
        try {
            startBarcodeScan(); // Provided by scanner.js
        } catch (err) {
            console.error("Scanner call failed:", err);
            alert("Camera unavailable.");
        }
    });
}

// Listen for barcode detection event
window.addEventListener("barcodeDetected", (e) => {
    const code = e.detail;

    console.log("Barcode detected:", code);

    // Put result into the food name box
    foodNameInput.value = code;

    alert("Barcode scanned: " + code);
});
