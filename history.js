let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];

const historyBody = document.getElementById("historyBody");

function renderHistory() {
    historyBody.innerHTML = "";

    historyData.forEach(entry => {
        const row = document.createElement("tr");

        const date = new Date(entry.timestamp).toLocaleString();

        row.innerHTML = `
            <td>${date}</td>
            <td>${entry.name}</td>
            <td>${entry.mealType}</td>
            <td>${entry.servingSize}</td>
            <td>${entry.calories}</td>
            <td>${entry.sodium}</td>
            <td>${entry.fat}</td>
            <td>${entry.carbs}</td>
            <td>${entry.fiber}</td>
            <td>${entry.sugar}</td>
            <td>${entry.protein}</td>
            <td>${entry.qtyPieces || ""}</td>
            <td>${entry.perMeasurement || ""}</td>
        `;

        historyBody.appendChild(row);
    });
}

renderHistory();
