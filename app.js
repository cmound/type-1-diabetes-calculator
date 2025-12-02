/* -------------------------------------------------------------
    GLOBAL STATE
------------------------------------------------------------- */
let foodItems = [];
let editingIndex = -1;

// Load history from localStorage
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];

/* -------------------------------------------------------------
    ELEMENT REFERENCES
------------------------------------------------------------- */
const nameInput = document.getElementById("name");
const bslInput = document.getElementById("bsl");
const foodNameInput = document.getElementById("foodNameInput");
const mealTypeInput = document.getElementById("mealTypeInput");
const servingSizeInput = document.getElementById("servingSizeInput");
const servingEqualsInput = document.getElementById("servingEqualsInput");

const QtyPiecesInput = document.getElementById("QtyPieces");
const PerMeasurementInput = document.getElementById("PerMeasurement");

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
const foodLogBody = document.getElementById("foodLogBody");

const fractionBox = document.getElementById("fractionBox");
const fractionInput = document.getElementById("fractionInput");
const convertFractionBtn = document.getElementById("convertFractionBtn");

const saveToHistoryBtn = document.getElementById("saveToHistoryBtn");

/* -------------------------------------------------------------
    AUTOCOMPLETE FROM HISTORY
------------------------------------------------------------- */
function loadAutocomplete() {
    const datalist = document.getElementById("foodNameSuggestions");
    datalist.innerHTML = "";

    let names = [...new Set(historyData.map(item => item.name))];

    names.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        datalist.appendChild(opt);
    });
}

loadAutocomplete();

/* -------------------------------------------------------------
    FRACTION CONVERT LOGIC
------------------------------------------------------------- */
servingEqualsInput.addEventListener("change", () => {
    if (servingEqualsInput.value === "Fraction") {
        fractionBox.classList.remove("hidden");
    } else {
        fractionBox.classList.add("hidden");
    }
});

convertFractionBtn.addEventListener("click", () => {
    try {
        let input = fractionInput.value.trim(); // e.g. 1/4
        if (!input.includes("/")) return;

        let [num, den] = input.split("/");
        let dec = parseFloat(num) / parseFloat(den);

        QtyPiecesInput.value = dec;
        fractionInput.value = "";
    } catch (e) {
        alert("Invalid fraction.");
    }
});

/* -------------------------------------------------------------
    CLICK TO ADD FOOD ITEM
------------------------------------------------------------- */
addFoodBtn.addEventListener("click", () => {
    let qtyHaving = parseFloat(amountHavingInput.value);
    if (isNaN(qtyHaving) || qtyHaving <= 0) {
        alert("Enter a valid amount having.");
        return;
    }

    let entry = {
        name: foodNameInput.value.trim(),
        mealType: mealTypeInput.value,
        servingSize: parseFloat(servingSizeInput.value) || 0,
        servingEquals: servingEqualsInput.value,
        qtyPieces: QtyPiecesInput.value.trim(),
        perMeasurement: PerMeasurementInput.value.trim(),

        calories: parseFloat(caloriesInput.value) || 0,
        fat: parseFloat(fatInput.value) || 0,
        sodium: parseFloat(sodiumInput.value) || 0,
        carbs: parseFloat(carbsInput.value) || 0,
        fiber: parseFloat(fiberInput.value) || 0,
        sugar: parseFloat(sugarInput.value) || 0,
        protein: parseFloat(proteinInput.value) || 0,

        qtyHaving: qtyHaving
    };

    foodItems.push(entry);
    updateSummary();
    updateResults();
    updateTable();
});

/* -------------------------------------------------------------
    UPDATE SUMMARY BOX
------------------------------------------------------------- */
function updateSummary() {
    if (foodItems.length === 0) {
        foodSummaryDiv.innerHTML = "";
        return;
    }

    let last = foodItems[foodItems.length - 1];

    let totalCarbs = last.carbs * last.qtyHaving;
    let totalFat = last.fat * last.qtyHaving;
    let totalProtein = last.protein * last.qtyHaving;

    foodSummaryDiv.innerHTML = `
        <strong>TOTAL CARBS:</strong> ${totalCarbs}g<br>
        <strong>TOTAL FAT:</strong> ${totalFat}g<br>
        <strong>TOTAL PROTEIN:</strong> ${totalProtein}g
    `;
}

/* -------------------------------------------------------------
    RESULT LOGIC / MEAL TYPE INTELLIGENCE
------------------------------------------------------------- */
function updateResults() {
    if (foodItems.length === 0) {
        resultsDiv.innerHTML = "";
        return;
    }

    let last = foodItems[foodItems.length - 1];

    let carbLoad = last.carbs * last.qtyHaving;
    let fatLoad = last.fat * last.qtyHaving;

    // Pre-bolus logic
    let preBolus = "5–7 mins";
    if (carbLoad > 70) preBolus = "10–12 mins";
    if (carbLoad < 15) preBolus = "0–2 mins";

    // Split dose logic
    let splitDose = "No split needed";
    let reason = "Meal is balanced";

    if (fatLoad >= 15 && carbLoad >= 20) {
        splitDose = "Split 50/50 over 1.5 hrs";
        reason = "High fat delays carb absorption";
    }

    resultsDiv.innerHTML = `
        <strong>Pre-Bolus:</strong> ${preBolus}<br>
        <strong>Split Dose:</strong> ${splitDose}<br>
        <strong>Food Type:</strong> ${last.mealType}<br>
        <strong>Reason:</strong> ${reason}
    `;
}

/* -------------------------------------------------------------
    UPDATE TABLE (LOGGED FOOD ITEMS)
------------------------------------------------------------- */
function updateTable() {
    foodLogBody.innerHTML = "";

    let totalServing = 0,
        totalCalories = 0,
        totalSodium = 0,
        totalFat = 0,
        totalCarbs = 0,
        totalFiber = 0,
        totalSugar = 0,
        totalProtein = 0;

    foodItems.forEach((item, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <button onclick="removeItem(${index})">❌</button>
            </td>
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

        totalServing += item.servingSize;
        totalCalories += item.calories;
        totalSodium += item.sodium;
        totalFat += item.fat;
        totalCarbs += item.carbs;
        totalFiber += item.fiber;
        totalSugar += item.sugar;
        totalProtein += item.protein;
    });

    document.getElementById("totalServingSize").innerText = totalServing;
    document.getElementById("totalCalories").innerText = totalCalories;
    document.getElementById("totalSodium").innerText = totalSodium;
    document.getElementById("totalFat").innerText = totalFat;
    document.getElementById("totalCarbs").innerText = totalCarbs;
    document.getElementById("totalFiber").innerText = totalFiber;
    document.getElementById("totalSugar").innerText = totalSugar;
    document.getElementById("totalProtein").innerText = totalProtein;
}

/* -------------------------------------------------------------
    REMOVE ITEM
------------------------------------------------------------- */
function removeItem(i) {
    foodItems.splice(i, 1);
    updateSummary();
    updateResults();
    updateTable();
}

/* -------------------------------------------------------------
    SAVE LAST ITEM TO HISTORY PAGE
------------------------------------------------------------- */
saveToHistoryBtn.addEventListener("click", () => {
    if (foodItems.length === 0) {
        alert("Nothing to save.");
        return;
    }

    let last = foodItems[foodItems.length - 1];

    let saveEntry = {
        name: last.name,
        mealType: last.mealType,
        servingEquals: last.servingEquals,
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

    historyData.push(saveEntry);
    localStorage.setItem("t1d_food_history", JSON.stringify(historyData));

    loadAutocomplete();
    alert("Saved to History Page");
});
