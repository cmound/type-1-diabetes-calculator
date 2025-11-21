let foodItems = [];

function convertFraction() {
    const fractionInput = document.getElementById("fraction-input").value;
    const output = document.getElementById("decimal-output");
    const [numerator, denominator] = fractionInput.split("/").map(Number);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        const result = numerator / denominator;
        output.innerText = `Decimal: ${result.toFixed(3)}`;
        document.getElementById("serving-equals").value = result.toFixed(3);
    } else {
        output.innerText = "Invalid fraction";
    }
}

document.getElementById("serving-type").addEventListener("change", function () {
    const val = this.value;
    document.getElementById("fraction-group").style.display =
        val === "fraction" ? "block" : "none";
});

function updateResults() {
    const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = foodItems.reduce((sum, item) => sum + item.fat, 0);
    const totalProtein = foodItems.reduce((sum, item) => sum + item.protein, 0);
    const mealType = foodItems.length ? foodItems[0].mealType : "--";

    const bsl = parseFloat(document.getElementById("bsl").value) || 0;
    let preBolus = "2–5 min";
    if (bsl >= 180 && bsl < 240) preBolus = "5–8 min";
    else if (bsl >= 240) preBolus = "8–12 min";

    let split = "--";
    let splitTime = "--";
    let reason = "--";

    if (totalFat > 30 || totalProtein > 30) {
        split = "60/40";
        splitTime = "Over 1 hour 30 mins";
        reason = "High fat meal";
    } else {
        reason = "Normal meal";
        split = "None";
        splitTime = "--";
    }

    const resultHTML = `
        <p><strong>Total carbs:</strong> ${totalCarbs.toFixed(1)} g</p>
        <p><strong>Total fat:</strong> ${totalFat.toFixed(1)} g</p>
        <p><strong>Total protein:</strong> ${totalProtein.toFixed(1)} g</p>
        <p><strong>Pre-bolus:</strong> ${preBolus}</p>
        <p><strong>Split:</strong> ${split}</p>
        <p><strong>Split time:</strong> ${splitTime}</p>
        <p><strong>Food type:</strong> ${mealType}</p>
        <p><strong>Reason:</strong> ${reason}</p>
    `;

    document.getElementById("results").innerHTML = `<h3>Results</h3>${resultHTML}`;
    document.getElementById("mirrored-results").innerHTML = resultHTML;
}

document.getElementById("add-button").addEventListener("click", () => {
    const foodName = document.getElementById("food-name").value;
    const mealType = document.getElementById("meal-type").value;
    const servingSize = parseFloat(document.getElementById("serving-size").value);
    const calories = parseFloat(document.getElementById("calories").value);
    const fat = parseFloat(document.getElementById("fat").value);
    const sodium = parseFloat(document.getElementById("sodium").value);
    const carbs = parseFloat(document.getElementById("carbs").value);
    const fiber = parseFloat(document.getElementById("fiber").value);
    const sugar = parseFloat(document.getElementById("sugar").value);
    const protein = parseFloat(document.getElementById("protein").value);
    const qty = parseFloat(document.getElementById("qty-eaten").value) || 1;

    const item = {
        foodName,
        mealType,
        servingSize,
        calories: calories * qty,
        fat: fat * qty,
        sodium: sodium * qty,
        carbs: carbs * qty,
        fiber: fiber * qty,
        sugar: sugar * qty,
        protein: protein * qty,
        qty,
    };

    foodItems.push(item);
    renderTables();
    updateResults();
});

function renderTables() {
    const tbody = document.querySelector("#food-table tbody");
    const summary = document.querySelector("#summary-table tbody");
    tbody.innerHTML = "";
    summary.innerHTML = "";

    foodItems.forEach((item, index) => {
        const row = `<tr>
            <td>
                <button onclick="removeItem(${index})">✘</button>
            </td>
            <td>${item.foodName}</td>
            <td>${item.servingSize}</td>
            <td>${item.calories}</td>
            <td>${item.fat}</td>
            <td>${item.sodium}</td>
            <td>${item.carbs}</td>
            <td>${item.fiber}</td>
            <td>${item.sugar}</td>
            <td>${item.protein}</td>
            <td>${item.qty.toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;

        const summaryRow = `<tr>
            <td>${item.foodName}</td>
            <td>${item.carbs}</td>
            <td>${item.fat}</td>
            <td>${item.protein}</td>
            <td>${item.qty.toFixed(2)}</td>
        </tr>`;
        summary.innerHTML += summaryRow;
    });
}

function removeItem(index) {
    foodItems.splice(index, 1);
    renderTables();
    updateResults();
}
