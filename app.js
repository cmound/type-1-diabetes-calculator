document.addEventListener("DOMContentLoaded", function () {
  let foodItems = [];

  function updateSummary() {
    let totalCarbs = 0, totalFat = 0, totalProtein = 0;
    foodItems.forEach(item => {
      totalCarbs += item.carbs * item.qty;
      totalFat += item.fat * item.qty;
      totalProtein += item.protein * item.qty;
    });

    const bsl = parseFloat(document.getElementById("bsl").value) || 0;

    let prebolus;
    if (bsl >= 250) {
      prebolus = "15–20 min";
    } else if (bsl >= 180) {
      prebolus = "10–15 min";
    } else if (bsl >= 120) {
      prebolus = "8–12 min";
    } else if (bsl >= 80) {
      prebolus = "5–10 min";
    } else {
      prebolus = "2–5 min";
    }

    document.getElementById("summary").innerHTML = `
      <strong>Total carbs:</strong> ${totalCarbs.toFixed(1)} g<br>
      <strong>Total fat:</strong> ${totalFat.toFixed(1)} g<br>
      <strong>Total protein:</strong> ${totalProtein.toFixed(1)} g<br>
      <strong>Pre-bolus:</strong> ${prebolus}<br>
      <strong>Split:</strong> 60/40<br>
      <strong>Split time:</strong> Over 1 hour 30 mins<br>
      <strong>Food type:</strong> Home Meal<br>
      <strong>Reason:</strong> High fat meal
    `;
  }

  document.getElementById("addButton").addEventListener("click", function () {
    const itemName = document.getElementById("foodName").value;
    const qty = parseFloat(document.getElementById("qtyHaving").value) || 1;
    const servingSize = document.getElementById("servingSize").value;
    const calories = parseFloat(document.getElementById("calories").value) || 0;
    const sodium = parseFloat(document.getElementById("sodium").value) || 0;
    const fat = parseFloat(document.getElementById("fat").value) || 0;
    const carbs = parseFloat(document.getElementById("carbs").value) || 0;
    const fiber = parseFloat(document.getElementById("fiber").value) || 0;
    const sugar = parseFloat(document.getElementById("sugar").value) || 0;
    const protein = parseFloat(document.getElementById("protein").value) || 0;

    const item = {
      itemName,
      servingSize,
      calories,
      sodium,
      fat,
      carbs,
      fiber,
      sugar,
      protein,
      qty
    };

    foodItems.push(item);
    updateSummary();
    renderTable();

    // Clear input fields
    [
      "servingSize", "servingPieces", "calories", "fat", "sodium",
      "carbs", "fiber", "sugar", "protein"
    ].forEach(id => document.getElementById(id).value = "");

    // Set focus back to foodName
    document.getElementById("foodName").focus();
  });

  function renderTable() {
    const tableBody = document.getElementById("foodTableBody");
    tableBody.innerHTML = "";

    foodItems.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <button onclick="editItem(${index})">✎</button>
          <button onclick="deleteItem(${index})">✖</button>
        </td>
        <td>${item.itemName}</td>
        <td>${item.servingSize}</td>
        <td>${item.calories}</td>
        <td>${item.fat}</td>
        <td>${item.sodium}</td>
        <td>${item.carbs}</td>
        <td>${item.fiber}</td>
        <td>${item.sugar}</td>
        <td>${item.protein}</td>
        <td>${item.qty.toFixed(2)}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  window.deleteItem = function (index) {
    foodItems.splice(index, 1);
    renderTable();
    updateSummary();
  };

  window.editItem = function (index) {
    const item = foodItems[index];
    document.getElementById("foodName").value = item.itemName;
    document.getElementById("servingSize").value = item.servingSize;
    document.getElementById("calories").value = item.calories;
    document.getElementById("sodium").value = item.sodium;
    document.getElementById("fat").value = item.fat;
    document.getElementById("carbs").value = item.carbs;
    document.getElementById("fiber").value = item.fiber;
    document.getElementById("sugar").value = item.sugar;
    document.getElementById("protein").value = item.protein;
    document.getElementById("qtyHaving").value = item.qty;
    foodItems.splice(index, 1); // remove and update later
  };

  // Recalculate when BSL changes
  document.getElementById("bsl").addEventListener("input", updateSummary);
});
