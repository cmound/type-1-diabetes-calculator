let foodItems = [];

function handleServingEqualsChange() {
  const type = document.getElementById("servingEquals").value;
  document.getElementById("fractionConverter").classList.toggle("hidden", type !== "Fraction");
}

function convertFraction() {
  const fraction = document.getElementById("fractionInput").value;
  try {
    const [numerator, denominator] = fraction.split("/").map(Number);
    const decimal = numerator / denominator;
    document.getElementById("servingQty").value = decimal.toFixed(3);
  } catch {
    alert("Invalid fraction format.");
  }
}

function addFood() {
  const food = {
    name: document.getElementById("foodName").value,
    servingSize: +document.getElementById("servingSize").value,
    calories: +document.getElementById("calories").value,
    sodium: +document.getElementById("sodium").value,
    fat: +document.getElementById("fat").value,
    carbs: +document.getElementById("carbs").value,
    fiber: +document.getElementById("fiber").value,
    sugar: +document.getElementById("sugar").value,
    protein: +document.getElementById("protein").value,
    qty: +document.getElementById("amountHaving").value || 1
  };

  foodItems.push(food);
  updateSummary();
  updateResults();
  updateTable();
}

function updateSummary() {
  const totalCarbs = sum("carbs");
  const totalFat = sum("fat");
  const totalProtein = sum("protein");

  document.getElementById("summary").innerHTML = `
    <strong>Total carbs:</strong> ${totalCarbs.toFixed(1)} g<br/>
    <strong>Total fat:</strong> ${totalFat.toFixed(1)} g<br/>
    <strong>Total protein:</strong> ${totalProtein.toFixed(1)} g
  `;
}

function updateResults() {
  const totalCarbs = sum("carbs");
  const totalFat = sum("fat");
  const totalProtein = sum("protein");
  const bsl = +document.getElementById("bsl").value;
  const mealType = document.getElementById("mealType").value;

  let preBolus = "0–2 min";
  if (bsl >= 120 && bsl <= 150) preBolus = "2–4 min";
  else if (bsl >= 151 && bsl < 200) preBolus = "5–7 min";
  else if (bsl >= 200) preBolus = "8–10 min";

  const split = bsl > 200 ? "60/40" : "40/60";

  document.getElementById("results").innerHTML = `
    <strong>Total carbs:</strong> ${totalCarbs.toFixed(1)} g<br/>
    <strong>Total fat:</strong> ${totalFat.toFixed(1)} g<br/>
    <strong>Total protein:</strong> ${totalProtein.toFixed(1)} g<br/>
    <strong>Pre-bolus:</strong> ${preBolus}<br/>
    <strong>Split:</strong> ${split}<br/>
    <strong>Split time:</strong> Over 1 hour 30 mins<br/>
    <strong>Food type:</strong> ${mealType}<br/>
    <strong>Reason:</strong> High fat meal
  `;
}

function updateTable() {
  const tbody = document.querySelector("#foodTable tbody");
  tbody.innerHTML = "";
  foodItems.forEach((item, index) => {
    const row = `
      <tr>
        <td>
          <button onclick="editItem(${index})">✎</button>
          <button onclick="removeItem(${index})">✖</button>
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
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function removeItem(index) {
  foodItems.splice(index, 1);
  updateSummary();
  updateResults();
  updateTable();
}

function sum(field) {
  return foodItems.reduce((acc, item) => acc + (item[field] * item.qty), 0);
}
