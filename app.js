let foodItems = [];

document.getElementById('servingInputType').addEventListener('change', function () {
  const type = this.value;
  document.getElementById('fractionInput').style.display = type === 'fraction' ? 'block' : 'none';
});

function convertFraction() {
  const frac = document.getElementById('fraction').value;
  try {
    const [num, den] = frac.split('/').map(Number);
    const decimal = (num / den).toFixed(3);
    document.getElementById('decimal').textContent = decimal;
    document.getElementById('piecesPerServing').value = decimal;
  } catch {
    document.getElementById('decimal').textContent = 'Invalid';
  }
}

function addItem() {
  const item = {
    name: document.getElementById('foodName').value,
    servingSize: +document.getElementById('servingSize').value,
    calories: +document.getElementById('calories').value,
    fat: +document.getElementById('fat').value,
    sodium: +document.getElementById('sodium').value,
    carbs: +document.getElementById('carbs').value,
    fiber: +document.getElementById('fiber').value,
    sugar: +document.getElementById('sugar').value,
    protein: +document.getElementById('protein').value,
    qty: +document.getElementById('amountHaving').value,
  };
  foodItems.push(item);
  updateTables();
  document.getElementById('foodName').focus();
}

function updateTables() {
  let totalCarbs = 0, totalFat = 0, totalProtein = 0;

  const tbody1 = document.querySelector('#summaryTable tbody');
  const tbody2 = document.querySelector('#foodTable tbody');
  tbody1.innerHTML = '';
  tbody2.innerHTML = '';

  foodItems.forEach((item, index) => {
    const carbs = item.carbs * item.qty;
    const fat = item.fat * item.qty;
    const protein = item.protein * item.qty;

    totalCarbs += carbs;
    totalFat += fat;
    totalProtein += protein;

    tbody1.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.carbs}</td>
        <td>${item.fat}</td>
        <td>${item.protein}</td>
        <td>${item.qty}</td>
      </tr>`;

    tbody2.innerHTML += `
      <tr>
        <td><button onclick="removeItem(${index})">🗑️</button></td>
        <td>${item.name}</td>
        <td>${item.servingSize}</td>
        <td>${item.calories}</td>
        <td>${item.fat}</td>
        <td>${item.sodium}</td>
        <td>${item.carbs}</td>
        <td>${item.fiber}</td>
        <td>${item.sugar}</td>
        <td>${item.protein}</td>
        <td>${item.qty}</td>
      </tr>`;
  });

  document.getElementById('totalCarbs').textContent = totalCarbs.toFixed(1);
  document.getElementById('totalFat').textContent = totalFat.toFixed(1);
  document.getElementById('totalProtein').textContent = totalProtein.toFixed(1);

  // Mock logic (replace with yours as needed)
  document.getElementById('prebolus').textContent = totalCarbs > 30 ? '2–5 min' : 'None';
  document.getElementById('split').textContent = totalFat > 20 ? '60/40' : '--';
  document.getElementById('type').textContent = document.getElementById('mealType').value;
  document.getElementById('reason').textContent = totalFat > 20 ? 'High fat meal' : 'Normal bolus';
}

function removeItem(index) {
  foodItems.splice(index, 1);
  updateTables();
}
