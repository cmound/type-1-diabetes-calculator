let foodItems = [];
let editingIndex = -1;

function toggleFractionInput() {
    const value = document.getElementById('servingEquals').value;
    const fractionContainer = document.getElementById('fractionInputContainer');
    fractionContainer.style.display = value === 'Fraction' ? 'block' : 'none';
}

function convertFraction() {
    const input = document.getElementById('fractionInput').value;
    const piecesInput = document.getElementById('pieces');

    try {
        const [whole, fraction] = input.includes(' ') ? input.split(' ') : [0, input];
        const [num, denom] = fraction.split('/');
        const decimal = (parseInt(whole) || 0) + parseInt(num) / parseInt(denom);
        piecesInput.value = decimal.toFixed(3);
    } catch (e) {
        alert("Invalid fraction format. Use forms like 1/2 or 2 1/4");
    }
}

function calculateTotals(item, qty) {
    const factor = qty || 1;
    return {
        calories: (item.calories || 0) * factor,
        fat: (item.fat || 0) * factor,
        sodium: (item.sodium || 0) * factor,
        carbs: (item.carbs || 0) * factor,
        fiber: (item.fiber || 0) * factor,
        sugar: (item.sugar || 0) * factor,
        protein: (item.protein || 0) * factor
    };
}

function addFoodItem() {
    const item = {
        name: document.getElementById('foodName').value,
        mealType: document.getElementById('mealType').value,
        servingSize: parseFloat(document.getElementById('servingSize').value),
        pieces: parseFloat(document.getElementById('pieces').value),
        calories: parseFloat(document.getElementById('calories').value),
        fat: parseFloat(document.getElementById('fat').value),
        sodium: parseFloat(document.getElementById('sodium').value),
        carbs: parseFloat(document.getElementById('carbs').value),
        fiber: parseFloat(document.getElementById('fiber').value),
        sugar: parseFloat(document.getElementById('sugar').value),
        protein: parseFloat(document.getElementById('protein').value),
        qtyHaving: parseFloat(document.getElementById('amountHaving').value)
    };

    if (editingIndex > -1) {
        foodItems[editingIndex] = item;
        editingIndex = -1;
    } else {
        foodItems.push(item);
    }

    renderFoodLog();
    renderSummary();
    renderResults();
    resetInputFields();
}

function editItem(index) {
    const item = foodItems[index];
    document.getElementById('foodName').value = item.name;
    document.getElementById('mealType').value = item.mealType;
    document.getElementById('servingSize').value = item.servingSize;
    document.getElementById('pieces').value = item.pieces;
    document.getElementById('calories').value = item.calories;
    document.getElementById('fat').value = item.fat;
    document.getElementById('sodium').value = item.sodium;
    document.getElementById('carbs').value = item.carbs;
    document.getElementById('fiber').value = item.fiber;
    document.getElementById('sugar').value = item.sugar;
    document.getElementById('protein').value = item.protein;
    document.getElementById('amountHaving').value = item.qtyHaving;
    editingIndex = index;
}

function deleteItem(index) {
    foodItems.splice(index, 1);
    renderFoodLog();
    renderSummary();
    renderResults();
}

function renderFoodLog() {
    const tbody = document.getElementById('foodLogBody');
    tbody.innerHTML = "";

    foodItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button onclick="editItem(${index})">✏️</button>
                <button onclick="deleteItem(${index})">🗑️</button>
            </td>
            <td>${item.name}</td>
            <td>${item.servingSize}</td>
            <td>${(item.calories * item.qtyHaving).toFixed(1)}</td>
            <td>${(item.sodium * item.qtyHaving).toFixed(1)}</td>
            <td>${(item.fat * item.qtyHaving).toFixed(1)}</td>
            <td>${(item.carbs * item.qtyHaving).toFixed(1)}</td>
            <td>${(item.fiber * item.qtyHaving).toFixed(1)}</td>
            <td>${(item.sugar * item.qtyHaving).toFixed(1)}</td>
            <td>${(item.protein * item.qtyHaving).toFixed(1)}</td>
            <td>${item.qtyHaving}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderSummary() {
    const div = document.getElementById('foodSummary');
    const totals = foodItems.reduce((acc, item) => {
        const partial = calculateTotals(item, item.qtyHaving);
        Object.keys(acc).forEach(key => acc[key] += partial[key]);
        return acc;
    }, { calories: 0, fat: 0, sodium: 0, carbs: 0, fiber: 0, sugar: 0, protein: 0 });

    div.innerHTML = `
        <p><strong>Total:</strong></p>
        <p>Calories: ${totals.calories.toFixed(1)}</p>
        <p>Fat: ${totals.fat.toFixed(1)}g, Carbs: ${totals.carbs.toFixed(1)}g, Fiber: ${totals.fiber.toFixed(1)}g</p>
        <p>Sugar: ${totals.sugar.toFixed(1)}g, Protein: ${totals.protein.toFixed(1)}g, Sodium: ${totals.sodium.toFixed(1)}mg</p>
    `;
}

function renderResults() {
    const bsl = parseFloat(document.getElementById('bsl').value);
    const mealType = document.getElementById('mealType').value;

    let preBolusTime = "2-5 mins";
    let splitDose = "No";

    if (bsl > 200) {
        preBolusTime = "8-10 mins";
        splitDose = "Yes (60/40)";
    } else if (bsl > 150) {
        preBolusTime = "5-7 mins";
        splitDose = "Maybe (50/50)";
    } else if (bsl > 120) {
        preBolusTime = "3-5 mins";
    } else if (bsl > 100) {
        preBolusTime = "2-3 mins";
    } else {
        preBolusTime = "0-2 mins";
    }

    document.getElementById('results').innerHTML = `
        <p><strong>Pre-Bolus:</strong> ${preBolusTime}</p>
        <p><strong>Split Dose:</strong> ${splitDose}</p>
        <p><strong>Food Type:</strong> ${mealType}</p>
    `;
}

function resetInputFields() {
    const ids = [
        'foodName', 'servingSize', 'pieces', 'calories', 'fat',
        'sodium', 'carbs', 'fiber', 'sugar', 'protein', 'amountHaving'
    ];
    ids.forEach(id => document.getElementById(id).value = '');

    const foodInput = document.getElementById('foodName');
    foodInput.focus();
    foodInput.select();
}

document.getElementById('bsl').addEventListener('input', renderResults);
document.getElementById('mealType').addEventListener('change', renderResults);
