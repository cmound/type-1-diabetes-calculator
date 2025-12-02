/* -------------------------------------------------------------
    LOAD HISTORY
------------------------------------------------------------- */
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];

const listDiv = document.getElementById("historyList");

renderHistory();

/* -------------------------------------------------------------
    RENDER HISTORY
------------------------------------------------------------- */
function renderHistory() {
    listDiv.innerHTML = "";

    if (historyData.length === 0) {
        listDiv.innerHTML = "<p>No saved history yet.</p>";
        return;
    }

    historyData
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach((item, index) => {

        let box = document.createElement("div");
        box.className = "summary-box";

        let date = new Date(item.timestamp).toLocaleString();

        box.innerHTML = `
            <strong>${item.name}</strong><br>
            <em>${date}</em><br><br>

            Meal Type: ${item.mealType}<br>
            Serving Equals: ${item.servingEquals}<br>
            Serving Size: ${item.servingSize}<br>
            Qty Per Label: ${item.qtyPieces}<br>
            Per Measurement: ${item.perMeasurement}<br><br>

            Calories: ${item.calories}<br>
            Fat: ${item.fat}g<br>
            Sodium: ${item.sodium}mg<br>
            Carbs: ${item.carbs}g<br>
            Fiber: ${item.fiber}g<br>
            Sugar: ${item.sugar}g<br>
            Protein: ${item.protein}g<br><br>

            Qty Having: ${item.qtyHaving}
            <br><br>

            <button class="removeBtn" onclick="deleteItem(${index})">Delete</button>
        `;

        listDiv.appendChild(box);
    });
}

/* -------------------------------------------------------------
    DELETE ENTRY
------------------------------------------------------------- */
function deleteItem(i) {
    if (!confirm("Delete this entry?")) return;

    historyData.splice(i, 1);
    localStorage.setItem("t1d_food_history", JSON.stringify(historyData));
    renderHistory();
}
