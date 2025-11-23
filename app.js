
let foodItems = [];

function handleServingEqualsChange() {
    const servingEquals = document.getElementById("servingEquals").value;
    const howManyInput = document.getElementById("howMany");
    const fractionResult = document.getElementById("fractionResult");

    if (servingEquals === "Fraction") {
        howManyInput.addEventListener("input", () => {
            const fraction = howManyInput.value.trim();
            if (fraction.includes('/')) {
                const parts = fraction.split('/');
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    const decimal = parseFloat(parts[0]) / parseFloat(parts[1]);
                    fractionResult.innerText = `Decimal: ${decimal.toFixed(3)}`;
                } else {
                    fractionResult.innerText = '';
                }
            } else {
                fractionResult.innerText = '';
            }
        });
    } else {
        fractionResult.innerText = '';
    }
}

function updatePrebolusTime() {
    const bsl = parseInt(document.getElementById("bsl").value);
    const totalFat = foodItems.reduce((sum, item) => sum + item.fat * item.qty, 0);
    const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs * item.qty, 0);

    let prebolus = "2–5 min";

    if (bsl >= 200 || totalFat >= 40 || totalCarbs >= 100) {
        prebolus = "Over 1 hour";
    } else if (bsl >= 150 || totalFat >= 30) {
        prebolus = "30–45 min";
    } else if (bsl >= 120) {
        prebolus = "15–20 min";
    }

    document.getElementById("results").innerHTML = generateResultsHTML(prebolus);
}

function addFoodItem() {
    const item = {
        name: document.getElementById("foodName").value,
        size: parseFloat(document.getElementById("servingSize").value),
        calories: parseFloat(document.getElementById("calories").value),
        sodium: parseFloat(document.getElementById("sodium").value),
        fat: parseFloat(document.getElementById("fat").value),
        carbs: parseFloat(document.getElementById("carbs").value),
        fiber: parseFloat(document.getElementById("fiber").value),
        sugar: parseFloat(document.getElementById("sugar").value),
        protein: parseFloat(document.getElementById("protein").value),
        qty: parseFloat(document.getElementById("qtyHaving").value) || 1
    };

    foodItems.push(item);
    renderTable();
    updatePrebolusTime();
    resetInputs();
}

function renderTable() {
    const tbody = document.querySelector("#foodTable tbody");
    tbody.innerHTML = "";

    foodItems.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="actions">
                <button onclick="editItem(${index})">✏️</button>
                <button onclick="deleteItem(${index})">❌</button>
            </td>
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.calories}</td>
            <td>${item.sodium}</td>
            <td>${item.fat}</td>
            <td>${item.carbs}</td>
            <td>${item.fiber}</td>
            <td>${item.sugar}</td>
            <td>${item.protein}</td>
            <td>${item.qty}</td>
        `;
        tbody.appendChild(row);
    });
}

function editItem(index) {
    const item = foodItems[index];
    document.getElementById("foodName").value = item.name;
    document.getElementById("servingSize").value = item.size;
    document.getElementById("calories").value = item.calories;
    document.getElementById("sodium").value = item.sodium;
    document.getElementById("fat").value = item.fat;
    document.getElementById("carbs").value = item.carbs;
    document.getElementById("fiber").value = item.fiber;
    document.getElementById("sugar").value = item.sugar;
    document.getElementById("protein").value = item.protein;
    document.getElementById("qtyHaving").value = item.qty;
    foodItems.splice(index, 1);
    renderTable();
    updatePrebolusTime();
}

function deleteItem(index) {
    foodItems.splice(index, 1);
    renderTable();
    updatePrebolusTime();
}

function resetInputs() {
    document.getElementById("foodName").focus();
    document.getElementById("foodName").select();
    [
        "servingSize", "calories", "sodium", "fat", "carbs",
        "fiber", "sugar", "protein", "qtyHaving"
    ].forEach(id => document.getElementById(id).value = "");
}

function generateResultsHTML(prebolusTime) {
    const total = {
        carbs: 0, fat: 0, protein: 0
    };

    foodItems.forEach(item => {
        total.carbs += item.carbs * item.qty;
        total.fat += item.fat * item.qty;
        total.protein += item.protein * item.qty;
    });

    return `
        <strong>Total carbs:</strong> ${total.carbs.toFixed(1)} g<br>
        <strong>Total fat:</strong> ${total.fat.toFixed(1)} g<br>
        <strong>Total protein:</strong> ${total.protein.toFixed(1)} g<br>
        <strong>Pre-bolus:</strong> ${prebolusTime}<br>
        <strong>Split:</strong> 60/40<br>
        <strong>Split time:</strong> Over 1 hour 30 mins<br>
        <strong>Food type:</strong> Fast Food<br>
        <strong>Reason:</strong> High fat meal
    `;
}
