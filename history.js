/* ============================================================
   LOAD HISTORY FROM LOCALSTORAGE
============================================================ */

let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];
const tableBody = document.getElementById("historyTableBody");

/* ============================================================
   BUILD TABLE
============================================================ */

function loadHistory() {
    tableBody.innerHTML = "";

    if (historyData.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="13" style="text-align:center;">No saved items yet.</td>`;
        tableBody.appendChild(row);
        return;
    }

    historyData
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(entry => {
            const dateStr = new Date(entry.timestamp).toLocaleString();

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${entry.name}</td>
                <td>${entry.qtyPieces || "-"}</td>
                <td>${entry.perMeasurement || "-"}</td>
                <td>${entry.servingSize}</td>
                <td>${entry.calories}</td>
                <td>${entry.sodium}</td>
                <td>${entry.fat}</td>
                <td>${entry.carbs}</td>
                <td>${entry.fiber}</td>
                <td>${entry.sugar}</td>
                <td>${entry.protein}</td>
                <td>${entry.qtyHaving}</td>
            `;

            tableBody.appendChild(row);
        });
}

loadHistory();
