/* -------------------------------------------------------------
   HISTORY PAGE SCRIPT
   Loads saved nutrition items and displays them in a table
-------------------------------------------------------------- */

// Load saved history from localStorage
let historyData = JSON.parse(localStorage.getItem("t1d_food_history")) || [];

const historyBody = document.getElementById("historyBody");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

/* -------------------------------------------------------------
   RENDER HISTORY TABLE
-------------------------------------------------------------- */
function renderHistory() {
  historyBody.innerHTML = "";

  if (historyData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="9" style="text-align:center; padding:15px;">
        No items saved yet.
      </td>`;
    historyBody.appendChild(row);
    return;
  }

  historyData.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="left">${item.name}</td>
      <td>${item.servingSize}</td>
      <td>${item.calories}</td>
      <td>${item.sodium}</td>
      <td>${item.fat}</td>
      <td>${item.carbs}</td>
      <td>${item.fiber}</td>
      <td>${item.sugar}</td>
      <td>${item.protein}</td>
    `;

    historyBody.appendChild(row);
  });
}

/* -------------------------------------------------------------
   CLEAR HISTORY
-------------------------------------------------------------- */
clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to delete all saved items?")) {
    return;
  }

  historyData = [];
  localStorage.setItem("t1d_food_history", JSON.stringify(historyData));

  renderHistory();
});

/* -------------------------------------------------------------
   INITIAL LOAD
-------------------------------------------------------------- */
renderHistory();
