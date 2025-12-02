let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];

const tbody = document.querySelector("#historyTable tbody");
tbody.innerHTML = "";

historyData.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.servingSize}</td>
        <td>${item.qtyPieces}</td>
        <td>${item.perMeasurement}</td>
        <td>${item.calories}</td>
        <td>${item.sodium}</td>
        <td>${item.fat}</td>
        <td>${item.carbs}</td>
        <td>${item.fiber}</td>
        <td>${item.sugar}</td>
        <td>${item.protein}</td>
        <td>${item.reason || ""}</td>
    `;

    tbody.appendChild(tr);
});
