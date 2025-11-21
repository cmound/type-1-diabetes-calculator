let entries = [];

function addEntry() {
  const foodName = document.getElementById("foodName").value;
  const carbs = parseFloat(document.getElementById("carbs").value) || 0;
  const fat = parseFloat(document.getElementById("fat").value) || 0;
  const protein = parseFloat(document.getElementById("protein").value) || 0;
  const qty = parseFloat(document.getElementById("amountHaving").value) || 1;

  const entry = { foodName, carbs, fat, protein, qty };
  entries.push(entry);

  updateSummary();
  updateResults();
  renderHistory();
}

function updateSummary() {
  const tbody = document.querySelector("#foodSummaryTable tbody");
  tbody.innerHTML = "";
  entries.forEach(entry => {
    const row = `<tr><td>${entry.foodName}</td><td>${entry.carbs}</td><td>${entry.fat}</td><td>${entry.protein}</td></tr>`;
    tbody.innerHTML += row;
  });
}

function updateResults() {
  const totalCarbs = entries.reduce((sum, e) => sum + e.carbs * e.qty, 0).toFixed(1);
  const totalFat = entries.reduce((sum, e) => sum + e.fat * e.qty, 0).toFixed(1);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein * e.qty, 0).toFixed(1);
  const bsl = parseFloat(document.getElementById("currentBSL").value) || 0;

  let prebolus = "2–5 min";
  if (bsl > 150 && bsl <= 200) prebolus = "5–8 min";
  else if (bsl > 200 && bsl <= 240) prebolus = "8–10 min";
  else if (bsl > 240) prebolus = "10–15 min";

  let split = "None";
  let splitTime = "";
  if (totalFat > 25 || totalProtein > 30) {
    split = "60/40";
    splitTime = " over 1 hour 30 mins";
  }

  const foodType = document.getElementById("mealType").value;
  let reason = "Normal meal";
  if (totalFat > 25) reason = "High fat meal";
  else if (totalCarbs > 50) reason = "High carb meal";

  const html = `
    <p>Total carbs: ${totalCarbs} g</p>
    <p>Total fat: ${totalFat} g</p>
    <p>Total protein: ${totalProtein} g</p>
    <p>Pre-bolus: ${prebolus}</p>
    <p>Split: ${split}${splitTime}</p>
    <p>Food type: ${foodType}</p>
    <p>Reason: ${reason}</p>
  `;
  document.getElementById("resultsBox").innerHTML = html;
  document.getElementById("mirroredResultsBox").innerHTML = html;
}

function renderHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";
  entries.forEach((entry, index) => {
    const row = `
      <tr>
        <td>
          <button onclick="editEntry(${index})">✏️</button>
          <button onclick="deleteEntry(${index})">🗑️</button>
        </td>
        <td>${entry.foodName}</td>
        <td>–</td>
        <td>–</td>
        <td>${entry.fat}</td>
        <td>–</td>
        <td>${entry.carbs}</td>
        <td>–</td>
        <td>–</td>
        <td>${entry.protein}</td>
        <td>${entry.qty}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

function deleteEntry(index) {
  entries.splice(index, 1);
  updateSummary();
  updateResults();
  renderHistory();
}

function editEntry(index) {
  const entry = entries[index];
  document.getElementById("foodName").value = entry.foodName;
  document.getElementById("carbs").value = entry.carbs;
  document.getElementById("fat").value = entry.fat;
  document.getElementById("protein").value = entry.protein;
  document.getElementById("amountHaving").value = entry.qty;
  deleteEntry(index);
}

function saveToHistory() {
  entries = [];
  updateSummary();
  updateResults();
  renderHistory();
}
