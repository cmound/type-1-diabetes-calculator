// =====================================================
// GLOBALS
// =====================================================
let foodItems = [];
let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];

// For autocomplete
let nameSuggestions = historyData.map(item => item.name);


// =====================================================
// AUTOCOMPLETE MATCH FUNCTION
// =====================================================
function autocompleteMatch(input) {
    if (!input) return [];
    return nameSuggestions.filter(name =>
        name.toLowerCase().includes(input.toLowerCase())
    );
}


// =====================================================
// AUTOCOMPLETE UI HANDLER (simple)
// =====================================================
document.getElementById("foodNameInput").addEventListener("input", function () {
    const val = this.value.trim();
    const matches = autocompleteMatch(val);

    if (matches.length === 1 && matches[0].toLowerCase() === val.toLowerCase()) {
        fillFormFromHistory(matches[0]);
    }
});


// =====================================================
// FILL FORM FROM HISTORY
// =====================================================
function fillFormFromHistory(name) {
    const match = historyData.find(item => item.name === name);
    if (!match) return;

    document.getElementById("mealType").value = match.mealType || "Home Meal";
    document.getElementById("servingSizeInput").value = match.servingSize || "";
    document.getElementById("servingEqualsInput").value = match.servingEquals || "Number";

    document.getElementById("QtyPieces").value = match.qtyPieces || "";
    document.getElementById("PerMeasurement").value = match.perMeasurement || "";

    document.getElementById("caloriesInput").value = match.calories || "";
    document.getElementById("fatInput").value = match.fat || "";
    document.getElementById("sodiumInput").value = match.sodium || "";
    document.getElementById("carbsInput").value = match.carbs || "";
    document.getElementById("fiberInput").value = match.fiber || "";
    document.getElementById("sugarInput").value = match.sugar || "";
    document.getElementById("proteinInput").value = match.protein || "";
}


// =====================================================
// CLICK TO ADD FOOD ITEM
// =====================================================
document.getElementById("addFoodButton").addEventListener("click", () => {
    const name = document.getElementById("foodNameInput").value.trim();
    if (!name) {
        alert("Enter a food name");
        return;
    }

    const servingSize = parseFloat(document.getElementById("servingSizeInput").value) || 0;
    const servingEquals = document.getElementById("servingEqualsInput").value;

    const qtyPieces = document.getElementById("QtyPieces").value;
    const perMeasurement = document.getElementById("PerMeasurement").value;

    // Add user-typed measurement to list
    updateMeasurementList(perMeasurement);

    const calories = parseFloat(document.getElementById("caloriesInput").value) || 0;
    const fat = parseFloat(document.getElementById("fatInput").value) || 0;
    const sodium = parseFloat(document.getElementById("sodiumInput").value) || 0;
    const carbs = parseFloat(document.getElementById("carbsInput").value) || 0;
    const fiber = parseFloat(document.getElementById("fiberInput").value) || 0;
    const sugar = parseFloat(document.getElementById("sugarInput").value) || 0;
    const protein = parseFloat(document.getElementById("proteinInput").value) || 0;

    const qtyHaving = parseFloat(document.getElementById("qtyHavingInput").value) || 0;

    const item = {
        name,
        mealType: document.getElementById("mealType").value,
        servingSize,
        servingEquals,
        qtyPieces,
        perMeasurement,
        calories,
        fat,
        sodium,
        carbs,
        fiber,
        sugar,
        protein,
        qtyHaving
    };

    foodItems.push(item);
    renderFoodTable();
    updateTotals();
    updateResults();
});


// =====================================================
// UPDATE MEASUREMENT LIST (SAVE NEW OPTIONS)
// =====================================================
function updateMeasurementList(value) {
    if (!value) return;

    const list = document.getElementById("measurementList");
    const exists = [...list.options].some(o => o.value.toLowerCase() === value.toLowerCase());

    if (!exists) {
        const newOpt = document.createElement("option");
        newOpt.value = value;
        list.appendChild(newOpt);
    }
}


// =====================================================
// RENDER TABLE
// =====================================================
function renderFoodTable() {
    const tbody = document.querySelector("#foodLogTable tbody");
    tbody.innerHTML = "";

    foodItems.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <button onclick="editItem(${index})">Edit</button>
                <button onclick="removeItem(${index})">Remove</button>
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

        tbody.appendChild(tr);
    });
}


// =====================================================
// EDIT ITEM
// =====================================================
function editItem(index) {
    const i = foodItems[index];

    document.getElementById("foodNameInput").value = i.name;
    document.getElementById("mealType").value = i.mealType;
    document.getElementById("servingSizeInput").value = i.servingSize;
    document.getElementById("servingEqualsInput").value = i.servingEquals;

    document.getElementById("QtyPieces").value = i.qtyPieces;
    document.getElementById("PerMeasurement").value = i.perMeasurement;

    document.getElementById("caloriesInput").value = i.calories;
    document.getElementById("fatInput").value = i.fat;
    document.getElementById("sodiumInput").value = i.sodium;
    document.getElementById("carbsInput").value = i.carbs;
    document.getElementById("fiberInput").value = i.fiber;
    document.getElementById("sugarInput").value = i.sugar;
    document.getElementById("proteinInput").value = i.protein;

    document.getElementById("qtyHavingInput").value = i.qtyHaving;

    foodItems.splice(index, 1);
    renderFoodTable();
    updateTotals();
    updateResults();
}


// =====================================================
// REMOVE ITEM
// =====================================================
function removeItem(index) {
    foodItems.splice(index, 1);
    renderFoodTable();
    updateTotals();
    updateResults();
}


// =====================================================
// TOTALS
// =====================================================
function updateTotals() {
    let totals = {
        calories: 0,
        fat: 0,
        sodium: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        protein: 0
    };

    foodItems.forEach(i => {
        totals.calories += i.calories;
        totals.fat += i.fat;
        totals.sodium += i.sodium;
        totals.carbs += i.carbs;
        totals.fiber += i.fiber;
        totals.sugar += i.sugar;
        totals.protein += i.protein;
    });

    document.getElementById("totalsBox").innerHTML = `
        <p><strong>Calories:</strong> ${totals.calories.toFixed(1)}</p>
        <p><strong>Fat:</strong> ${totals.fat.toFixed(1)} g</p>
        <p><strong>Sodium:</strong> ${totals.sodium.toFixed(1)} mg</p>
        <p><strong>Carbs:</strong> ${totals.carbs.toFixed(1)} g</p>
        <p><strong>Fiber:</strong> ${totals.fiber.toFixed(1)} g</p>
        <p><strong>Sugar:</strong> ${totals.sugar.toFixed(1)} g</p>
        <p><strong>Protein:</strong> ${totals.protein.toFixed(1)} g</p>
    `;
}


// =====================================================
// REASON ENGINE
// =====================================================
function computeReason() {
    if (foodItems.length === 0)
        return "No food logged yet.";

    let totalFat = 0, totalCarbs = 0, totalProtein = 0;
    let names = [];

    foodItems.forEach(i => {
        totalFat += i.fat;
        totalCarbs += i.carbs;
        totalProtein += i.protein;
        names.push(i.name.toLowerCase());
    });

    const highFat = totalFat > 20 || totalFat > totalCarbs * 0.5;
    const lowCarb = totalCarbs < 15;

    // Keyword rules
    if (names.some(n => n.includes("lasagna") || n.includes("pizza") || n.includes("fried")))
        return "Split recommended. Processed carbs and fats delay glucose rise.";

    if (lowCarb)
        return "No split needed. Low carb meal.";

    if (highFat)
        return "Split recommended due to high fat content.";

    return "Standard coverage recommended.";
}


// =====================================================
// RESULTS SECTION
// =====================================================
function updateResults() {
    if (foodItems.length === 0) {
        document.getElementById("resultsBox").innerHTML = "";
        return;
    }

    const reason = computeReason();

    document.getElementById("resultsBox").innerHTML = `
        <p><strong>Pre-Bolus:</strong> 0–10 minutes based on BSL</p>
        <p><strong>Split Dose:</strong> Determined by nutrient balance</p>
        <p><strong>Food Type:</strong> Based on carbs, fat, and protein</p>
        <p><strong>Reason:</strong> <input type="text" id="reasonBox" value="${reason}" style="width:100%"></p>
    `;
}


// =====================================================
// SAVE TO HISTORY
// =====================================================
document.getElementById("saveToHistoryBtn").addEventListener("click", () => {
    if (foodItems.length === 0) {
        alert("No items to save.");
        return;
    }

    const last = foodItems[foodItems.length - 1];

    const original = {
        name: last.name,
        mealType: last.mealType,
        servingEquals: last.servingEquals,
        servingSize: last.servingSize,
        calories: last.calories,
        sodium: last.sodium,
        fat: last.fat,
        carbs: last.carbs,
        fiber: last.fiber,
        sugar: last.sugar,
        protein: last.protein,
        qtyPieces: last.qtyPieces,
        perMeasurement: last.perMeasurement,
        qtyHaving: last.qtyHaving,
        reason: document.getElementById("reasonBox")?.value || "",
        timestamp: Date.now()
    };

    historyData.push(original);
    localStorage.setItem("tid_food_history", JSON.stringify(historyData));

    // Refresh autocomplete list
    nameSuggestions = historyData.map(i => i.name);

    alert("Saved to History Page");
});
