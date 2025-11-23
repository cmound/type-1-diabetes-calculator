let foodLog = [];

function convertFraction() {
    const fraction = document.getElementById("fractionInput").value.trim();
    const piecesInput = document.getElementById("pieces");

    if (fraction.includes(" ")) {
        let [whole, frac] = fraction.split(" ");
        let [num, denom] = frac.split("/");
        piecesInput.value = parseFloat(whole) + parseFloat(num) / parseFloat(denom);
    } else if (fraction.includes("/")) {
        let [num, denom] = fraction.split("/");
        piecesInput.value = parseFloat(num) / parseFloat(denom);
    } else {
        piecesInput.value = parseFloat(fraction);
    }
}

function toggleFractionInput() {
    const mode = document.getElementById("servingEquals").value;
    const fractionBox = document.getElementById("fractionInputContainer");
    fractionBox.style.display = mode === "Fraction" ? "block" : "none";
}

function addFoodItem() {
    const item = {
        name: document.getElementById("foodName").value,
        mealType: document.getElementById("mealType").value,
        servingSize: parseFloat(document.getElementById("servingSize").value),
        calories: parseFloat(document.getElementById("calories").value),
        fat: parseFloat(document.getElementById("fat").value),
        sodium: parseFloat(document.getElementById("sodium").value),
        carbs: parseFloat(document.getElementById("carbs").value),
        fiber: parseFloat(document.getElementById("fiber").value),
        sugar: parseFloat(document.getElementById("sugar").value),
        protein: parseFloat(document.getElementById("protein").value),
        qty: parseFloat(document.getElementById("amountHaving").value),
    };

    foodLog.push(item);
    updateTables();
    resetInputs();
}

function updateTables() {
    const summary = {
        carbs: 0, fat: 0, protein: 0
    };

    let tbody = "";
    foodLog.forEach((item, index) => {
        summary.carbs += item.carbs * item.qty;
        summary.fat += item.fat * item.qty;
        summary.protein += item.protein * item.qty;

        tbody += `
        <tr>
            <td>
                <button onclick="editItem(${index})">✏️</button>
                <button onclick="deleteItem(${index})">❌</button>
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
            <td>${item.qty}</td>
        </tr>`;
    });

    document.getElementById("foodLogBody").innerHTML = tbody;
    updateResults(summary);
}

function updateResults(summary) {
    const bsl = parseInt(document.getElementById("bsl").value) || 0;
    const mealType = document.getElementById("mealType").value;

    const preBolus = getPreBolusTime(bsl);
    const split = bsl > 200 ? "60/40" : "40/60";

    document.getElementById("results").innerHTML = `
        <strong>Total carbs:</strong> ${summary.carbs.toFixed(1)} g<br>
        <strong>Total fat:</strong> ${summary.fat.toFixed(1)} g<br>
        <strong>Total protein:</strong> ${summary.protein.toFixed(1)} g<br>
        <strong>Pre-bolus:</strong> ${preBolus}<br>
        <strong>Split:</strong> ${split}<br>
        <strong>Split time:</strong> Over 1 hour 30 mins<br>
        <strong>Food type:</strong> ${mealType}<br>
        <strong>Reason:</strong> High fat meal
    `;
}

function getPreBolusTime(bsl) {
    if (bsl < 70) return "0 min";
    if (bsl < 90) return "1–2 min";
    if (bsl < 130) return "2–3 min";
    if (bsl < 150) return "3–5 min";
    if (bsl < 180) return "5–7 min";
    if (bsl < 210) return "8–10 min";
    return "10–12 min";
}

function resetInputs() {
    [
        "foodName", "servingSize", "calories", "fat", "sodium",
        "carbs", "fiber", "sugar", "protein", "amountHaving"
    ].forEach(id => document.getElementById(id).value = "");
}

function editItem(index) {
    const item = foodLog[index];
    document.getElementById("foodName").value = item.name;
    document.getElementById("mealType").value = item.mealType;
    document.getElementById("servingSize").value = item.servingSize;
    document.getElementById("calories").value = item.calories;
    document.getElementById("fat").value = item.fat;
    document.getElementById("sodium").value = item.sodium;
    document.getElementById("carbs").value = item.carbs;
    document.getElementById("fiber").value = item.fiber;
    document.getElementById("sugar").value = item.sugar;
    document.getElementById("protein").value = item.protein;
    document.getElementById("amountHaving").value = item.qty;

    foodLog.splice(index, 1);
    updateTables();
}

function deleteItem(index) {
    foodLog.splice(index, 1);
    updateTables();
}
