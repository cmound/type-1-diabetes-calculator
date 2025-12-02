/* ============================================================
   GLOBAL STATE
============================================================ */

let foodItems = [];
let editingIndex = -1;

// Load history or start clean
let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];

/* ============================================================
   ELEMENT REFERENCES
============================================================ */

const nameInput = document.getElementById("name");
const bslInput = document.getElementById("bsl");
const foodNameInput = document.getElementById("foodNameInput");
const autocompleteList = document.getElementById("foodNameSuggestions");

const servingEqualsInput = document.getElementById("servingEqualsInput");
const qtyPiecesInput = document.getElementById("qtyPieces");
const perMeasurementInput = document.getElementById("perMeasurement");

const servingSizeInput = document.getElementById("servingSizeInput");

const caloriesInput = document.getElementById("caloriesInput");
const fatInput = document.getElementById("fatInput");
const sodiumInput = document.getElementById("sodiumInput");
const carbsInput = document.getElementById("carbsInput");
const fiberInput = document.getElementById("fiberInput");
const sugarInput = document.getElementById("sugarInput");
const proteinInput = document.getElementById("proteinInput");

const amountHavingInput = document.getElementById("amountHavingInput");
const addFoodBtn = document.getElementById("addFoodBtn");

const foodLogBody = document.getElementById("foodLogBody");
const totalsRow = document.getElementById("totalsRow");

const resultsDiv = document.getElementById("results");
const foodSummaryDiv = document.getElementById("foodSummary");

const saveToHistoryBtn = document.getElementById("saveToHistoryBtn");

/* Fraction converter */
const fractionRow = document.getElementById("fractionRow");
const fractionInput = document.getElementById("fractionInput");
const convertFractionBtn = document.getElementById("convertFractionBtn");

/* View History Button */
const viewHistoryBtn = document.getElementById("viewHistoryButton");

/* ============================================================
   AUTOCOMPLETE (READS FROM HISTORY)
============================================================ */

let nameSuggestions = historyData.map(item => item.name);

function autocompleteMatch(input) {
    if (!input) return [];
    return nameSuggestions.filter(n =>
        n.toLowerCase().includes(input.toLowerCase())
    );
}

foodNameInput.addEventListener("input", () => {
    const matches = autocompleteMatch(foodNameInput.value);
    autocompleteList.innerHTML = "";

    matches.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        autocompleteList.appendChild(option);
    });
});

/* ============================================================
   SHOW FRACTION BOX WHEN SERVING EQUALS = FRACTION
============================================================ */

servingEqualsInput.addEventListener("change", () => {
    if (servingEqualsInput.value === "Fraction") {
        fractionRow.classList.remove("hidden-row");
        servingSizeInput.value = "";
    } else {
        fractionRow.classList.add("hidden-row");
    }
});

/* Convert fraction to decimal */
convertFractionBtn.addEventListener("click", () => {
    const input = fractionInput.value.trim();
    if (!input.includes("/")) {
        alert("Enter a valid fraction like 1/2 or 3/4");
        return;
    }

    const [num, den] = input.split("/");
    const result = parseFloat(num) / parseFloat(den);

    servingSizeInput.value = result.toFixed(3);
});

/* ============================================================
   ADD FOOD ITEM TO TABLE
============================================================ */

addFoodBtn.addEventListener("click", () => {
    if (!foodNameInput.value.trim()) {
        alert("Enter a food name.");
        return;
    }
    if (!amountHavingInput.value.trim()) {
        alert("Enter the quantity consumed.");
        return;
    }

    const item = {
        name: foodNameInput.value.trim(),
        servingSize: servingSizeInput.value.trim(),
        calories: parseFloat(caloriesInput.value) || 0,
        sodium: parseFloat(sodiumInput.value) || 0,
        fat: parseFloat(fatInput.value) || 0,
        carbs: parseFloat(carbsInput.value) || 0,
        fiber: parseFloat(fiberInput.value) || 0,
        sugar: parseFloat(sugarInput.value) || 0,
        protein: parseFloat(proteinInput.value) || 0,
        qtyHaving: parseFloat(amountHavingInput.value) || 0,
        qtyPieces: qtyPiecesInput.value.trim(),
        perMeasurement: perMeasurementInput.value.trim()
    };

    foodItems.push(item);
    updateTable();
    updateTotals();
    showResults(item);

    /* Make new names appear in autocomplete */
    if (!nameSuggestions.includes(item.name)) {
        nameSuggestions.push(item.name);
    }
});

/* ============================================================
   UPDATE TABLE
============================================================ */

function updateTable() {
    foodLogBody.innerHTML = "";

    foodItems.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><button onclick="removeItem(${index})">X</button></td>
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

        foodLogBody.appendChild(row);
    });
}

function removeItem(index) {
    foodItems.splice(index, 1);
    updateTable();
    updateTotals();
}

/* ============================================================
   UPDATE TOTALS
============================================================ */

function updateTotals() {
    const totals = foodItems.reduce(
        (acc, item) => {
            acc.calories += item.calories * item.qtyHaving;
            acc.sodium += item.sodium * item.qtyHaving;
            acc.fat += item.fat * item.qtyHaving;
            acc.carbs += item.carbs * item.qtyHaving;
            acc.fiber += item.fiber * item.qtyHaving;
            acc.sugar += item.sugar * item.qtyHaving;
            acc.protein += item.protein * item.qtyHaving;
            return acc;
        },
        { calories: 0, sodium: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, protein: 0 }
    );

    totalsRow.innerHTML = `
        <td><strong>Totals</strong></td>
        <td>-</td>
        <td>${totals.calories}</td>
        <td>${totals.sodium}</td>
        <td>${totals.fat}</td>
        <td>${totals.carbs}</td>
        <td>${totals.fiber}</td>
        <td>${totals.sugar}</td>
        <td>${totals.protein}</td>
        <td>-</td>
    `;
}

/* ============================================================
   RESULT LOGIC + REASONING ENGINE
============================================================ */

function showResults(item) {
    let reason = "";

    /* Very simple reasoning — can expand later */
    if (item.fat > 20 || item.sodium > 800) {
        reason = "Split recommended due to heavy fat or sodium.";
    } else if (item.carbs < 10) {
        reason = "No split because carbs are low.";
    } else {
        reason = "Standard meal. Split optional.";
    }

    resultsDiv.innerHTML = `
        Pre-Bolus: 5–7 mins<br>
        Split Dose: Based on meal composition<br>
        Food Type: Auto-detected<br>
        <strong>Reason: ${reason}</strong>
    `;
}

/* ============================================================
   SAVE TO HISTORY
============================================================ */

saveToHistoryBtn.addEventListener("click", () => {
    if (foodItems.length === 0) {
        alert("No items to save.");
        return;
    }

    const last = foodItems[foodItems.length - 1];

    const entry = {
        name: last.name,
        servingSize: last.servingSize,
        calories: last.calories,
        fat: last.fat,
        sodium: last.sodium,
        carbs: last.carbs,
        fiber: last.fiber,
        sugar: last.sugar,
        protein: last.protein,
        qtyHaving: last.qtyHaving,
        qtyPieces: last.qtyPieces,
        perMeasurement: last.perMeasurement,
        timestamp: Date.now()
    };

    historyData.push(entry);
    localStorage.setItem("tid_food_history", JSON.stringify(historyData));

    alert("Saved to History Page");
});

/* ============================================================
   VIEW HISTORY BUTTON
============================================================ */

viewHistoryBtn.addEventListener("click", () => {
    window.location.href = "history.html";
});
