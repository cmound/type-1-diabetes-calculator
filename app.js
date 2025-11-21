document.addEventListener("DOMContentLoaded", () => {
  const fractionType = document.getElementById("fraction-type");
  const fractionFields = document.getElementById("fraction-fields");
  const fractionInput = document.getElementById("fraction-input");
  const fractionOutput = document.getElementById("fraction-output");
  const addButton = document.getElementById("add-button");
  const summaryBody = document.getElementById("food-summary-body");
  const loggedItemsBody = document.getElementById("logged-items-body");

  let totals = {
    carbs: 0,
    fat: 0,
    protein: 0
  };

  fractionType.addEventListener("change", () => {
    if (fractionType.value === "fraction") {
      fractionFields.style.display = "block";
    } else {
      fractionFields.style.display = "none";
    }
  });

  window.convertFraction = function () {
    const input = fractionInput.value;
    const [numerator, denominator] = input.split("/").map(Number);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      const result = (numerator / denominator).toFixed(3);
      fractionOutput.textContent = result;
      document.getElementById("serving-pieces").value = result;
    } else {
      fractionOutput.textContent = "Invalid fraction";
    }
  };

  addButton.addEventListener("click", () => {
    const name = document.getElementById("name").value;
    const bsl = parseInt(document.getElementById("bsl").value, 10);
    const iob = parseFloat(document.getElementById("iob").value);
    const foodName = document.getElementById("food-name").value;
    const mealType = document.getElementById("meal-type").value;
    const carbs = parseFloat(document.getElementById("carbs").value);
    const fat = parseFloat(document.getElementById("fat").value);
    const protein = parseFloat(document.getElementById("protein").value);
    const amount = parseFloat(document.getElementById("amount-eaten").value) || 1;

    const sodium = parseFloat(document.getElementById("sodium").value);
    const calories = parseFloat(document.getElementById("calories").value);
    const fiber = parseFloat(document.getElementById("fiber").value);
    const sugar = parseFloat(document.getElementById("sugar").value);
    const qtyHaving = amount.toFixed(2);

    const adjCarbs = (carbs * amount).toFixed(1);
    const adjFat = (fat * amount).toFixed(1);
    const adjProtein = (protein * amount).toFixed(1);

    // Update totals
    totals.carbs += parseFloat(adjCarbs);
    totals.fat += parseFloat(adjFat);
    totals.protein += parseFloat(adjProtein);

    // Determine recommendations
    let prebolus = "2–5 min";
    if (bsl >= 180 && bsl < 240) prebolus = "5–8 min";
    else if (bsl >= 240) prebolus = "8–10 min";

    let split = "None";
    let splitTime = "--";
    let reason = "Normal meal";

    if (totals.fat > 25 || totals.protein > 30) {
      split = "60/40";
      splitTime = "Over 1 hour 30 mins";
      reason = "High fat meal";
    }

    // Update summary and mirrored results
    document.getElementById("total-carbs").textContent = `${totals.carbs.toFixed(1)} g`;
    document.getElementById("total-fat").textContent = `${totals.fat.toFixed(1)} g`;
    document.getElementById("total-protein").textContent = `${totals.protein.toFixed(1)} g`;
    document.getElementById("prebolus-time").textContent = prebolus;
    document.getElementById("split-ratio").textContent = split;
    document.getElementById("split-time").textContent = splitTime;
    document.getElementById("food-type").textContent = mealType;
    document.getElementById("reason").textContent = reason;

    document.getElementById("mirror-total-carbs").textContent = `${totals.carbs.toFixed(1)} g`;
    document.getElementById("mirror-total-fat").textContent = `${totals.fat.toFixed(1)} g`;
    document.getElementById("mirror-total-protein").textContent = `${totals.protein.toFixed(1)} g`;
    document.getElementById("mirror-prebolus").textContent = prebolus;
    document.getElementById("mirror-split").textContent = split;
    document.getElementById("mirror-food-type").textContent = mealType;
    document.getElementById("mirror-reason").textContent = reason;

    const summaryRow = `
      <tr>
        <td>${foodName}</td>
        <td>${adjCarbs}</td>
        <td>${adjFat}</td>
        <td>${adjProtein}</td>
        <td>${qtyHaving}</td>
      </tr>`;
    summaryBody.innerHTML += summaryRow;

    const loggedRow = `
      <tr>
        <td>
          <button class="icon-btn">✏️</button>
          <button class="icon-btn">❌</button>
        </td>
        <td>${foodName}</td>
        <td>${document.getElementById("serving-size").value}</td>
        <td>${calories}</td>
        <td>${fat}</td>
        <td>${sodium}</td>
        <td>${carbs}</td>
        <td>${fiber}</td>
        <td>${sugar}</td>
        <td>${protein}</td>
        <td>${qtyHaving}</td>
      </tr>`;
    loggedItemsBody.innerHTML += loggedRow;
  });
});
