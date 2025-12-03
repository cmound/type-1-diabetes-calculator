/* ------------------------------------------------------------------------
   GLOBAL STATE
------------------------------------------------------------------------ */
let foodItems = [];
let editingIndex = -1;

// History storage
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];

/* ------------------------------------------------------------------------
   ELEMENT REFERENCES
------------------------------------------------------------------------ */
const nameInput = document.getElementById("name");
const bslInput = document.getElementById("bslInput");

const foodNameInput = document.getElementById("foodNameInput");
const mealTypeInput = document.getElementById("mealTypeInput");
const servingSizeInput = document.getElementById("servingSizeInput");

const servingEqualsInput = document.getElementById("servingEqualsInput");
const qtyPiecesInput = document.getElementById("qtyPieces");
const perMeasurementInput = document.getElementById("PerMeasurement");

const caloriesInput = document.getElementById("caloriesInput");
const fatInput = document.getElementById("fatInput");
const sodiumInput = document.getElementById("sodiumInput");
const carbsInput = document.getElementById("carbsInput");
const fiberInput = document.getElementById("fiberInput");
const sugarInput = document.getElementById("sugarInput");
const proteinInput = document.getElementById("proteinInput");

const amountHavingInput = document.getElementById("amountHaving");
const addFoodBtn = document.getElementById("addFoodBtn");

const foodSummaryDiv = document.getElementById("foodSummary");
const resultDiv = document.getElementById("resultBox");
const foodLogBody = document.getElementById("foodLogBody");

const totalsRow = document.getElementById("totalsRow");

// Fraction converter
const fractionBox = document.getElementById("fractionBox");
const convertFractionBtn = document.getElementById("convertFractionBtn");
const fractionInput = document.getElementById("fractionInput");

/* ------------------------------------------------------------------------
   FRACTION HANDLING
------------------------------------------------------------------------ */
servingEqualsInput.addEventListener("change", () => {
    if (servingEqualsInput.value === "Fraction") {
        fractionBox.classList.remove("hidden");
    } else {
        fractionBox.classList.add("hidden");
    }
});

// Convert fraction to decimal and insert into qtyPieces box
convertFractionBtn.addEventListener("click", () => {
    let input = fractionInput.value.trim();

    if (!input.includes("/")) {
        alert("Enter a valid fraction like 1/2 or 2 1/3");
        return;
    }

    let value = convertFractionToDecimal(input);
    qtyPiecesInput.value = value;
});

/** Converts "1/3", "2 1/3", etc. into decimal */
function convertFractionToDecimal(frac) {
    try {
        if (frac.includes(" ")) {
            let [whole, part] = frac.split(" ");
            let [num, den] = part.split("/");
            return (parseFloat(whole) + (parseFloat(num) / parseFloat(den))).toFixed(3);
        } else {
            let [num, den] = frac.split("/");
            return (parseFloat(num) / parseFloat(den)).toFixed(3);
        }
    } catch {
        alert("Invalid fraction format");
        return "";
    }
}

/* ------------------------------------------------------------------------
   OCR INTEGRATION (AUTOFILL)
------------------------------------------------------------------------ */
document.addEventListener("ocrCompleted", (event) => {
    let data = event.detail;

    // Autofill fields intelligently
    if (data.name) foodNameInput.value = data.name;
    if (data.servingSize) servingSizeInput.value = data.servingSize;
    if (data.calories) caloriesInput.value = data.calories;
    if (data.fat) fatInput.value = data.fat;
    if (data.sodium) sodiumInput.value = data.sodium;
    if (data.carbs) carbsInput.value = data.carbs;
    if (data.fiber) fiberInput.value = data.fiber;
    if (data.sugar) sugarInput.value = data.sugar;
    if (data.protein) proteinInput.value = data.protein;

    // Fraction detection (example: "2 1/3 cups")
    if (data.detectedFraction) {
        servingEqualsInput.value = "Fraction";
        fractionInput.value = data.detectedFraction;
        fractionBox.classList.remove("hidden");
    }

    alert("OCR auto-fill complete!");
});

/* ------------------------------------------------------------------------
   ADD FOOD ITEM TO SUMMARY + TABLE
------------------------------------------------------------------------ */
addFoodBtn.addEventListener("click", () => {
    let amount = parseFloat(amountHavingInput.value);

    if (!amount || amount <= 0) {
        alert("Enter amount having.");
        return;
    }

    let item = collectFoodItem();
    foodItems.push(item);

    updateFoodSummary(item);
    updateFoodLog();
    updateTotals();
});

/* Collects current UI values into a structured object */
function collectFoodItem() {
    return {
        name: foodNameInput.value.trim(),
        mealType: mealTypeInput.value,
        servingSize: parseFloat(servingSizeInput.value) || 0,
        servingEquals: servingEqualsInput.value,
        qtyPerLabel: parseFloat(qtyPiecesInput.value) || 1,
        perMeasurement: perMeasurementInput.value.trim(),

        calories: parseFloat(caloriesInput.value) || 0,
        fat: parseFloat(fatInput.value) || 0,
        sodium: parseFloat(sodiumInput.value) || 0,
        carbs: parseFloat(carbsInput.value) || 0,
        fiber: parseFloat(fiberInput.value) || 0,
        sugar: parseFloat(sugarInput.value) || 0,
        protein: parseFloat(proteinInput.value) || 0,

        qtyHaving: parseFloat(amountHavingInput.value) || 1
    };
}

/* ------------------------------------------------------------------------
   UPDATE FOOD SUMMARY
------------------------------------------------------------------------ */
function updateFoodSummary(item) {
    let servingMultiplier = item.qtyHaving / item.qtyPerLabel;

    foodSummaryDiv.textContent =
        `${item.name}: ${item.qtyHaving} × serving(s) = 
        ${Math.round(item.carbs * servingMultiplier)}g carbs, 
        ${Math.round(item.fat * servingMultiplier)}g fat, 
        ${Math.round(item.protein * servingMultiplier)}g protein`;
}

/* ------------------------------------------------------------------------
   UPDATE TABLE VIEW
------------------------------------------------------------------------ */
function updateFoodLog() {
    foodLogBody.innerHTML = "";

    foodItems.forEach((item, idx) => {
        let mult = item.qtyHaving / item.qtyPerLabel;

        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.servingSize}</td>
            <td>${Math.round(item.calories * mult)}</td>
            <td>${Math.round(item.sodium * mult)}</td>
            <td>${Math.round(item.fat * mult)}</td>
            <td>${Math.round(item.carbs * mult)}</td>
            <td>${Math.round(item.fiber * mult)}</td>
            <td>${Math.round(item.sugar * mult)}</td>
            <td>${Math.round(item.protein * mult)}</td>
            <td>${item.qtyHaving}</td>
        `;
        foodLogBody.appendChild(row);
    });
}

/* ------------------------------------------------------------------------
   UPDATE TOTALS
------------------------------------------------------------------------ */
function updateTotals() {
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
        let mult = item.qtyHaving / item.qtyPerLabel;

        totals.calories += item.calories * mult;
        totals.sodium += item.sodium * mult;
        totals.fat += item.fat * mult;
        totals.carbs += item.carbs * mult;
        totals.fiber += item.fiber * mult;
        totals.sugar += item.sugar * mult;
        totals.protein += item.protein * mult;
    });

    totalsRow.innerHTML = `
        <td>Totals</td>
        <td>-</td>
        <td>${Math.round(totals.calories)}</td>
        <td>${Math.round(totals.sodium)}</td>
        <td>${Math.round(totals.fat)}</td>
        <td>${Math.round(totals.carbs)}</td>
        <td>${Math.round(totals.fiber)}</td>
        <td>${Math.round(totals.sugar)}</td>
        <td>${Math.round(totals.protein)}</td>
        <td>-</td>
    `;
}

/* ------------------------------------------------------------------------
   HISTORY SAVER
------------------------------------------------------------------------ */
document.getElementById("saveHistoryButton")?.addEventListener("click", () => {
    if (foodItems.length === 0) {
        alert("Nothing to save.");
        return;
    }

    let last = foodItems[foodItems.length - 1];
    historyData.push(last);

    localStorage.setItem("t1d_food_history", JSON.stringify(historyData));
    alert("Saved to history!");
});
