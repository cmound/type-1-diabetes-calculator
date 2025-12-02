/* --------------------------------------------------------------------------
   GLOBAL STATE
-------------------------------------------------------------------------- */

let foodItems = [];
let editingIndex = -1;
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];

/* --------------------------------------------------------------------------
   ELEMENT REFERENCES
-------------------------------------------------------------------------- */

const nameInput = document.getElementById("name");
const bslInput = document.getElementById("bsl");
const foodNameInput = document.getElementById("foodNameInput");
const autocompleteBox = document.getElementById("autocompleteList");

const servingEqualsInput = document.getElementById("servingEqualsInput");
const qtyPiecesInput = document.getElementById("QtyPieces");
const perMeasurementInput = document.getElementById("PerMeasurement");
const servingSizeInput = document.getElementById("servingSizeInput");

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
const resultsDiv = document.getElementById("results");
const tableBody = document.getElementById("foodLogBody");

const saveToHistoryBtn = document.getElementById("saveToHistoryBtn");

const fractionBox = document.getElementById("fractionInputBox");
const fractionInput = document.getElementById("fractionInput");
const convertFractionBtn = document.getElementById("convertFractionBtn");

/* --------------------------------------------------------------------------
   AUTOCOMPLETE (LOADS FROM HISTORY)
-------------------------------------------------------------------------- */

function loadAutocompleteNames() {
    const names = historyData.map(entry => entry.name.toLowerCase());
    return [...new Set(names)];
}

function autocompleteMatch(input) {
    if (input.trim() === "") return [];
    const names = loadAutocompleteNames();
    return names.filter(n => n.includes(input.toLowerCase()));
}

function showAutocompleteMatches(input) {
    const matches = autocompleteMatch(input);
    autocompleteBox.innerHTML = "";

    matches.forEach(m => {
        const option = document.createElement("option");
        option.value = m;
        autocompleteBox.appendChild(option);
    });
}

foodNameInput.addEventListener("input", () => {
    showAutocompleteMatches(foodNameInput.value);
});

/* --------------------------------------------------------------------------
   FRACTION TO DECIMAL CONVERTER
-------------------------------------------------------------------------- */

servingEqualsInput.addEventListener("change", () => {
    const mode = servingEqualsInput.value;

    if (mode === "Fraction") {
        fractionBox.style.display = "block";
    } else {
        fractionBox.style.display = "none";
    }
});

convertFractionBtn.addEventListener("click", () => {
    try {
        const raw = fractionInput.value.trim();

        if (raw.includes("/")) {
            const [num, den] = raw.split("/").map(Number);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                qtyPiecesInput.value = num / den;
            }
        }
    } catch (e) {
        alert("Invalid fraction");
    }
});

/* --------------------------------------------------------------------------
   ADD FOOD ITEM
-------------------------------------------------------------------------- */

addFoodBtn.addEventListener("click", () => {
    if (!foodNameInput.value.trim()) {
        alert("Enter a food name");
        return;
    }

    let newItem = {
        name: foodNameInput.value.trim(),
        servingEquals: servingEqualsInput.value,
        qtyPieces: qtyPiecesInput.value.trim(),
        perMeasurement: perMeasurementInput.value.trim(),
        servingSize: Number(servingSizeInput.value) || 0,

        calories: Number(caloriesInput.value) || 0,
        fat: Number(fatInput.value) || 0,
        sodium: Number(sodiumInput.value) || 0,
        carbs: Number(carbsInput.value) || 0,
        fiber: Number(fiberInput.value) || 0,
        sugar: Number(sugarInput.value) || 0,
        protein: Number(proteinInput.value) || 0,

        qtyHaving: Number(amountHavingInput.value) || 0
    };

    foodItems.push(newItem);
    updateTable();
});

/* --------------------------------------------------------------------------
   UPDATE TABLE + TOTALS
-------------------------------------------------------------------------- */

function updateTable() {
    tableBody.innerHTML = "";

    let total = {
        serving: 0, calories: 0, sodium: 0, fat: 0,
        carbs: 0, fiber: 0, sugar: 0, protein: 0
    };

    foodItems.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><button onclick="editItem(${index})">✎</button>
                <button onclick="removeItem(${index})">🗑</button></td>
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
        tableBody.appendChild(tr);

        total.calories += item.calories;
        total.sodium += item.sodium;
        total.fat += item.fat;
        total.carbs += item.carbs;
        total.fiber += item.fiber;
        total.sugar += item.sugar;
        total.protein += item.protein;
    });

    document.getElementById("totalCalories").innerText = total.calories;
    document.getElementById("totalSodium").innerText = total.sodium;
    document.getElementById("totalFat").innerText = total.fat;
    document.getElementById("totalCarbs").innerText = total.carbs;
    document.getElementById("totalFiber").innerText = total.fiber;
    document.getElementById("totalSugar").innerText = total.sugar;
    document.getElementById("totalProtein").innerText = total.protein;

    updateFoodSummary();
    updateResults();
}

/* --------------------------------------------------------------------------
   UPDATE SUMMARY + RESULTS
-------------------------------------------------------------------------- */

function updateFoodSummary() {
    if (foodItems.length === 0) {
        foodSummaryDiv.innerHTML = "";
        return;
    }

    let latest = foodItems[foodItems.length - 1];

    foodSummaryDiv.innerHTML = `
        TOTAL CARBS: ${latest.carbs} g<br>
        TOTAL FAT: ${latest.fat} g<br>
        TOTAL PROTEIN: ${latest.protein} g
    `;
}

function updateResults() {
    if (foodItems.length === 0) {
        resultsDiv.innerHTML = "";
        return;
    }

    let item = foodItems[foodItems.length - 1];

    let reason = "";
    let split = "No split needed";
    let prebolus = "5 to 7 min";

    if (item.fat >= 15 || item.protein >= 20) {
        split = "Split dose recommended (50-50)";
        reason = "High fat or protein delays carb absorption";
    } else {
        reason = "Low fat meal, insulin absorbs normally";
    }

    resultsDiv.innerHTML = `
        <strong>Pre-Bolus:</strong> ${prebolus}<br>
        <strong>Split Dose:</strong> ${split}<br>
        <strong>Reason:</strong> ${reason}<br>
    `;
}

/* --------------------------------------------------------------------------
   REMOVE ITEM
-------------------------------------------------------------------------- */

function removeItem(i) {
    foodItems.splice(i, 1);
    updateTable();
}

/* --------------------------------------------------------------------------
   SAVE TO HISTORY
-------------------------------------------------------------------------- */

saveToHistoryBtn.addEventListener("click", () => {
    if (foodItems.length === 0) {
        alert("Nothing to save.");
        return;
    }

    let last = foodItems[foodItems.length - 1];

    const historyEntry = {
        name: last.name,
        servingEquals: last.servingEquals,
        qtyPieces: last.qtyPieces,
        perMeasurement: last.perMeasurement,
        servingSize: last.servingSize,

        calories: last.calories,
        fat: last.fat,
        sodium: last.sodium,
        carbs: last.carbs,
        fiber: last.fiber,
        sugar: last.sugar,
        protein: last.protein,

        qtyHaving: last.qtyHaving,
        timestamp: Date.now()
    };

    historyData.push(historyEntry);
    localStorage.setItem("t1d_food_history", JSON.stringify(historyData));

    alert("Saved to History!");
});
