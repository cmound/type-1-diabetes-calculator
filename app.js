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
    const entry = historyData.find(
        x => x.name.toLowerCase() === foodNameInput.value.toLowerCase()
    );
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
   FRACTION CONVERTER
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
    const value = document.getElementById("fractionInput").value.trim();
    if (!value.includes("/")) return alert("Enter fraction like 1/3");

    const [top, bottom] = value.split("/").map(Number);
    if (!bottom) return alert("Invalid fraction");

    qtyPiecesInput.value = (top / bottom).toFixed(3);
});

/* ============================================================
   ADD FOOD ITEM TO LOG
============================================================ */
addFoodBtn.addEventListener("click", () => {
    const qtyHad = Number(amountHavingInput.value || 0);
    if (qtyHad <= 0) return alert("Enter amount having.");

    const base = {
        name: foodNameInput.value.trim(),
        qtyPieces: qtyPiecesInput.value.trim(),
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
   RENDER TABLE + TOTALS + SUMMARY
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

    // Display summary
    foodSummaryDiv.innerHTML = `
        TOTAL CARBS: ${totals.carbs.toFixed(1)}g<br>
        TOTAL FAT: ${totals.fat.toFixed(1)}g<br>
        TOTAL PROTEIN: ${totals.protein.toFixed(1)}g
    `;

    // Display simplified placeholder results
    resultsDiv.innerHTML = `
        Pre-Bolus: 5–7 mins<br>
        Split Dose: 50/50 over 1.5 hrs<br>
        Meal Type: Home Meal<br>
        Reason: Based on nutrition pattern
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

    // Add + persist
    historyData.push(entry);
    localStorage.setItem("tid_food_history", JSON.stringify(historyData));

    rebuildAutocompleteList();

    alert("Saved to history.");
});

/* ============================================================
   DARK MODE
============================================================ */

const darkToggle = document.getElementById("darkToggle");

if (darkToggle) {
    darkToggle.addEventListener("change", () => {
        document.body.classList.toggle("dark", darkToggle.checked);
        localStorage.setItem("theme", darkToggle.checked ? "dark" : "light");
    });

    // Load theme from saved setting
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        darkToggle.checked = true;
        document.body.classList.add("dark");
    }
}

/* ============================================================
   NUTRITION LOOKUP FROM BARCODE — OpenFoodFacts
============================================================ */

async function lookupNutritionFromBarcode(upc) {
    try {
        const url = `https://world.openfoodfacts.org/api/v2/product/${upc}.json`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data.product) {
            alert("Barcode scanned, but nutrition data unavailable.");
            return null;
        }

        const p = data.product;

        return {
            name: p.product_name || "",
            servingSize: p.serving_size || "",
            calories: p.nutriments["energy-kcal_100g"] || "",
            fat: p.nutriments["fat_100g"] || "",
            sodium: p.nutriments["sodium_100g"] || "",
            carbs: p.nutriments["carbohydrates_100g"] || "",
            fiber: p.nutriments["fiber_100g"] || "",
            sugar: p.nutriments["sugars_100g"] || "",
            protein: p.nutriments["proteins_100g"] || ""
        };
    } catch (err) {
        console.error(err);
        alert("Nutrition lookup failed.");
        return null;
    }
}

/* ============================================================
   BARCODE SCAN HANDLER (from scanner.js)
============================================================ */
window.addEventListener("barcodeDetected", async (e) => {

    const upc = e.detail;
    console.log("Scanned UPC:", upc);

    // Autofill name with UPC until nutrition arrives
    foodNameInput.value = upc;

    const info = await lookupNutritionFromBarcode(upc);
    if (!info) return;

    // Autofill name if API had product name
    if (info.name) foodNameInput.value = info.name;

    // Clean serving size
    if (info.servingSize) {
        const clean = info.servingSize.replace(/[^0-9.]/g, "");
        servingSizeInput.value = clean;
    }

    if (info.calories) caloriesInput.value = info.calories;
    if (info.fat) fatInput.value = info.fat;
    if (info.sodium) sodiumInput.value = info.sodium;
    if (info.carbs) carbsInput.value = info.carbs;
    if (info.fiber) fiberInput.value = info.fiber;
    if (info.sugar) sugarInput.value = info.sugar;
    if (info.protein) proteinInput.value = info.protein;

    alert("Nutrition loaded from barcode!");
});

/* ============================================================
   CONNECT SCAN BUTTON → scanner.js
============================================================ */

if (scanBarcodeBtn) {
    scanBarcodeBtn.addEventListener("click", () => {
        try {
            startBarcodeScan();
        } catch (err) {
            alert("Scanner error: " + err);
        }
    });
}
