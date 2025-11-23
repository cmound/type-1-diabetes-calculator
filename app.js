let foodItems = [];

document.getElementById("servingEquals").addEventListener("change", function () {
    const value = this.value;
    const fractionInput = document.getElementById("fractionInputContainer");
    if (value === "fraction") {
        fractionInput.style.display = "inline-block";
    } else {
        fractionInput.style.display = "none";
    }
});

function convertFraction() {
    const fraction = document.getElementById("fractionInput").value.trim();
    try {
        let result = eval(fraction.replace(/[^-()\d/*+.]/g, ''));
        if (!isNaN(result)) {
            document.getElementById("servingCount").value = result.toFixed(3);
        } else {
            alert("Invalid fraction.");
        }
    } catch (e) {
        alert("Error converting fraction.");
    }
}

function calculateResults() {
    let totalCarbs = 0, totalFat = 0, totalProtein = 0;

    foodItems.forEach(item => {
        totalCarbs += item.carbs * item.qty;
        totalFat += item.fat * item.qty;
        totalProtein += item.protein * item.qty;
    });

    const bsl = parseFloat(document.getElementById("bsl").value);
    const mealType = document.getElementById("mealType").value;
    const preBolus = getPreBolusTime(bsl);
    const split = bsl >= 200 ? "60/40" : "40/60";
    const splitTime = totalFat > 15 ? "Over 1 hour 30 mins" : "No split needed";
    const reason = totalFat > 15 ? "High fat meal" : "Standard meal";

    document.getElementById("results").innerHTML = `
        <strong>Total carbs:</strong> ${totalCarbs.toFixed(1)} g<br>
        <strong>Total fat:</strong> ${totalFat.toFixed(1)} g<br>
        <strong>Total protein:</strong> ${totalProtein.toFixed(1)} g<br>
        <strong>Pre-bolus:</strong> ${preBolus}<br>
        <strong>Split:</strong> ${split}<br>
        <strong>Split time:</strong> ${splitTime}<br>
        <strong>Food type:</strong> ${mealType}<br>
        <strong>Reason:</strong> ${reason}<br>
    `;
}

function getPreBolusTime(bsl) {
    if (bsl < 90) return "0 min";
    if (bsl < 120) return "2–3 min";
    if (bsl < 160) return "3–5 min";
    if (bsl < 200) return "6–8 min";
    return "10+ min";
}

function addFoodItem() {
    const name = document.getElementById("foodName").value;
    const size = parseFloat(document.getElementById("servingSize").value);
    const calories = parseFloat(document.getElementById("calories").value);
    const sodium = parseFloat(document.getElementById("sodium").value);
    const fat = parseFloat(document.getElementById("fat").value);
    const carbs = parseFloat(document.getElementById("carbs").value);
    const fiber = parseFloat(document.getElementById("fiber").value);
    const sugar = parseFloat(document.getElementById("sugar").value);
    const protein = parseFloat(document.getElementById("protein").value);
    const qty = parseFloat(document.getElementById("quantity").value);

    const item = { name, size, calories, sodium, fat, carbs, fiber, sugar, protein, qty };
    foodItems.push(item);
    renderTable();
    calculateResults();
}

function renderTable() {
    const tbody = document.getElementById("loggedItemsBody");
    tbody.innerHTML = "";
    foodItems.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
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
    document.getElementById("quantity").value = item.qty;
}

function deleteItem(index) {
    foodItems.splice(index, 1);
    renderTable();
    calculateResults();
}
