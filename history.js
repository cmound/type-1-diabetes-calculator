// ========================================================================
// Batch 15 — Full Replacement history.js (Dark Theme + Timestamp + Delete)
// ========================================================================

// Key used in localStorage
const HISTORY_KEY = "t1d_food_history";

// Load existing history
let historyData = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

// Table body reference
const historyTableBody = document.getElementById("historyTableBody");

// Clear history button
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ========================================================================
// Utility: Safe number formatting
// ========================================================================
function safe(n) {
    return isNaN(n) ? "-" : Math.round(n);
}

// ========================================================================
// Utility: Format timestamp
// ========================================================================
function formatTimestamp(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

// ========================================================================
// Normalize items that may have missing fields (older saves)
// ========================================================================
function normalizeHistory() {
    let changed = false;

    historyData = historyData.map(item => {
        if (!item.timestamp) {
            item.timestamp = Date.now();
            changed = true;
        }
        if (!item.name) item.name = "-";
        if (!item.mealType) item.mealType = "-";
        if (!item.qtyHaving) item.qtyHaving = 0;
        return item;
    });

    if (changed) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    }
}

// ========================================================================
// Remove a single entry
// ========================================================================
function deleteHistoryEntry(index) {
    if (!confirm("Delete this entry?")) return;

    historyData.splice(index, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    renderHistory();
}

// ========================================================================
// Render table rows
// ========================================================================
function renderHistory() {
    historyTableBody.innerHTML = "";

    if (historyData.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align:center; padding:20px; opacity:0.6;">
                    No history saved yet.
                </td>
            </tr>
        `;
        return;
    }

    // Sort newest first
    historyData.sort((a, b) => b.timestamp - a.timestamp);

    historyData.forEach((entry, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${formatTimestamp(entry.timestamp)}</td>
            <td>${entry.name || "-"}</td>
            <td>${entry.mealType || "-"}</td>
            <td>${entry.servingSize || "-"}</td>
            <td>${safe(entry.caloriesPerServing)}</td>
            <td>${safe(entry.sodiumPerServing)}</td>
            <td>${safe(entry.fatPerServing)}</td>
            <td>${safe(entry.carbsPerServing)}</td>
            <td>${safe(entry.fiberPerServing)}</td>
            <td>${safe(entry.sugarPerServing)}</td>
            <td>${safe(entry.proteinPerServing)}</td>

            <td>
                <button class="delete-entry-btn" data-index="${index}">
                    Delete
                </button>
            </td>
        `;

        historyTableBody.appendChild(row);
    });

    // Attach delete listeners
    document.querySelectorAll(".delete-entry-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const idx = parseInt(e.target.dataset.index);
            deleteHistoryEntry(idx);
        });
    });
}

// ========================================================================
// Clear all history
// ========================================================================
clearHistoryBtn?.addEventListener("click", () => {
    if (!confirm("This will delete ALL saved history. Continue?")) return;

    historyData = [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    renderHistory();
});

// ========================================================================
// Init
// ========================================================================
(function initHistoryPage() {
    normalizeHistory();
    renderHistory();
})();
