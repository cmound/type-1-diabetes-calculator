
function convertFraction() {
    const input = document.getElementById("fractionInput").value;
    const output = document.getElementById("decimalOutput");
    try {
        const parts = input.split('/');
        if (parts.length === 2) {
            const decimal = parseFloat(parts[0]) / parseFloat(parts[1]);
            output.textContent = decimal.toFixed(3);
        } else {
            output.textContent = "Invalid input";
        }
    } catch (e) {
        output.textContent = "Error";
    }
}

let foodItems = [];

function addFood() {
    const name = document.getElementById("foodName").value;
    const carbs = parseFloat(document.getElementById("carbs").value) || 0;
    const fat = parseFloat(document.getElementById("fat").value) || 0;
    const protein = parseFloat(document.getElementById("protein").value) || 0;
    const qty = parseFloat(document.getElementById("eatenAmount").value || document.getElementById("piecesEaten").value) || 1;

    const item = { name, carbs, fat, protein, qty };
    foodItems.push(item);
    updateFoodTable();
    updateTotals();
}

function updateFoodTable() {
    const table = document.getElementById("foodSummaryTable");
    table.innerHTML = "";
    foodItems.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${item.name}</td><td>${item.carbs}</td><td>${item.fat}</td><td>${item.protein}</td><td>${item.qty}</td>`;
        table.appendChild(row);
    });
}

function updateTotals() {
    let totalCarbs = 0, totalFat = 0, totalProtein = 0;
    foodItems.forEach(item => {
        totalCarbs += item.carbs * item.qty;
        totalFat += item.fat * item.qty;
        totalProtein += item.protein * item.qty;
    });

    document.getElementById("totalCarbs").textContent = totalCarbs.toFixed(1);
    document.getElementById("totalFat").textContent = totalFat.toFixed(1);
    document.getElementById("totalProtein").textContent = totalProtein.toFixed(1);

    const bsl = parseFloat(document.getElementById("bsl").value);
    const iob = parseFloat(document.getElementById("insulinOnBoard").value);
    const reduceInsulin = (bsl < 130 && iob > 0.5) ? "Yes" : "No";
    document.getElementById("insulinReduce").textContent = isNaN(bsl) || isNaN(iob) ? "--" : reduceInsulin;
}
