document.addEventListener("DOMContentLoaded", () => {
  const foodTableBody = document.getElementById("foodTableBody");
  const resultsBox = document.getElementById("dynamicResults");
  const nameInput = document.getElementById("name");
  const bslInput = document.getElementById("bsl");
  const iobInput = document.getElementById("iob");
  const foodNameInput = document.getElementById("foodName");
  const foodTypeInput = document.getElementById("foodType");
  const portionInput = document.getElementById("portion");
  const portionTypeInput = document.getElementById("portionType");
  const portionAmountInput = document.getElementById("portionAmount");
  const convertBtn = document.getElementById("convertBtn");
  const decimalOutput = document.getElementById("decimalOutput");
  const servingSizeInput = document.getElementById("servingSize");
  const caloriesInput = document.getElementById("calories");
  const sodiumInput = document.getElementById("sodium");
  const fatInput = document.getElementById("fat");
  const carbsInput = document.getElementById("carbs");
  const fiberInput = document.getElementById("fiber");
  const sugarInput = document.getElementById("sugar");
  const proteinInput = document.getElementById("protein");
  const qtyHavingInput = document.getElementById("qtyHaving");
  const addButton = document.getElementById("addBtn");
  const summaryTableBody = document.getElementById("summaryTableBody");

  let foodItems = [];

  function updatePrebolus(bsl, totalFat, foodType) {
    let time = "2–5 min";
    if (bsl >= 180 && totalFat >= 15) time = "8–12 min";
    else if (bsl >= 180) time = "5–10 min";
    else if (bsl <= 90) time = "0–2 min";

    if (foodType.toLowerCase().includes("fast")) {
      time = bsl >= 180 ? "10–15 min" : "5–10 min";
    }

    return time;
  }

  function updateSummary() {
    let totalCarbs = 0, totalFat = 0, totalProtein = 0;
    foodItems.forEach(item => {
      totalCarbs += item.carbs * item.qty;
      totalFat += item.fat * item.qty;
      totalProtein += item.protein * item.qty;
    });

    const bsl = parseFloat(bslInput.value);
    const foodType = foodTypeInput.value;

    const prebolus = updatePrebolus(bsl, totalFat, foodType);

    resultsBox.innerHTML = `
      <h3>Results</h3>
      <p><strong>Total carbs:</strong> ${totalCarbs.toFixed(1)} g</p>
      <p><strong>Total fat:</strong> ${totalFat.toFixed(1)} g</p>
      <p><strong>Total protein:</strong> ${totalProtein.toFixed(1)} g</p>
      <p><strong>Pre-bolus:</strong> ${prebolus}</p>
      <p><strong>Split:</strong> 60/40</p>
      <p><strong>Split time:</strong> Over 1 hour 30 mins</p>
      <p><strong>Food type:</strong> ${foodType}</p>
      <p><strong>Reason:</strong> High fat meal</p>
    `;
  }

  function renderTable() {
    foodTableBody.innerHTML = "";
    summaryTableBody.innerHTML = "";

    foodItems.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button onclick="removeItem(${index})">✗</button></td>
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
      `;
      foodTableBody.appendChild(row);

      const summaryRow = document.createElement("tr");
      summaryRow.innerHTML = `
        <td>${item.name}</td>
        <td>${item.carbs}</td>
        <td>${item.fat}</td>
        <td>${item.protein}</td>
        <td>${item.qty}</td>
      `;
      summaryTableBody.appendChild(summaryRow);
    });

    updateSummary();
  }

  window.removeItem = function(index) {
    foodItems.splice(index, 1);
    renderTable();
  };

  addButton.addEventListener("click", () => {
    const newItem = {
      name: foodNameInput.value,
      servingSize: servingSizeInput.value,
      calories: parseFloat(caloriesInput.value),
      sodium: parseFloat(sodiumInput.value),
      fat: parseFloat(fatInput.value),
      carbs: parseFloat(carbsInput.value),
      fiber: parseFloat(fiberInput.value),
      sugar: parseFloat(sugarInput.value),
      protein: parseFloat(proteinInput.value),
      qty: parseFloat(qtyHavingInput.value)
    };

    foodItems.push(newItem);
    renderTable();

    // Reset inputs
    servingSizeInput.value = "";
    caloriesInput.value = "";
    sodiumInput.value = "";
    fatInput.value = "";
    carbsInput.value = "";
    fiberInput.value = "";
    sugarInput.value = "";
    proteinInput.value = "";

    // Refocus to food name input
    foodNameInput.focus();
    foodNameInput.select();
  });

  convertBtn.addEventListener("click", () => {
    const fraction = portionAmountInput.value.trim();
    if (fraction.includes("/")) {
      const [numerator, denominator] = fraction.split("/");
      const decimal = parseFloat(numerator) / parseFloat(denominator);
      portionInput.value = decimal.toFixed(3);
      decimalOutput.textContent = `Decimal: ${decimal.toFixed(3)}`;
    }
  });

  // Initialize
  bslInput.addEventListener("input", updateSummary);
});
