/* ============================================================
   T1D CALCULATOR — HISTORY PAGE LOGIC
   Handles:
   ✓ Load history from localStorage
   ✓ Populate table
   ✓ Delete selected items
   ✓ Export JSON
   ✓ Export CSV
   ✓ Import JSON
   ✓ Sync dark mode
============================================================ */

/* ------------------------------------------------------------
   LOAD HISTORY FROM LOCAL STORAGE
------------------------------------------------------------ */
let historyData = JSON.parse(localStorage.getItem("tid_food_history")) || [];

const tableBody = document.getElementById("historyTableBody");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

const exportJsonBtn = document.getElementById("exportJsonBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const importHistoryBtn = document.getElementById("importHistoryBtn");
const importHistoryInput = document.getElementById("importHistoryInput");

/* ============================================================
   RENDER HISTORY TABLE
============================================================ */
function renderHistoryTable() {
    tableBody.innerHTML = "";

    historyData.forEach((entry, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><input type="checkbox" class="deleteCheck" data-index="${index}"></td>
            <td>${entry.name || ""}</td>
            <td>${entry.servingSize || ""}</td>
            <td>${entry.calories || ""}</td>
            <td>${entry.sodium || ""}</td>
            <td>${entry.fat || ""}</td>
            <td>${entry.carbs || ""}</td>
            <td>${entry.fiber || ""}</td>
            <td>${entry.sugar || ""}</td>
            <td>${entry.protein || ""}</td>
        `;

        tableBody.appendChild(tr);
    });
}

renderHistoryTable();

/* ============================================================
   DELETE SELECTED ENTRIES
============================================================ */
deleteSelectedBtn.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".deleteCheck");

    // Build new history excluding checked ones
    const filtered = [];
    checkboxes.forEach(cb => {
        const index = Number(cb.dataset.index);
        if (!cb.checked) filtered.push(historyData[index]);
    });

    historyData = filtered;

    // Save to localStorage
    localStorage.setItem("tid_food_history", JSON.stringify(historyData));

    renderHistoryTable();
    alert("Selected items deleted.");
});

/* ============================================================
   EXPORT JSON
============================================================ */
exportJsonBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(historyData, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "T1D_History.json";
    a.click();

    URL.revokeObjectURL(url);
});

/* ============================================================
   EXPORT CSV
============================================================ */
exportCsvBtn.addEventListener("click", () => {
    if (!historyData.length) return alert("History is empty.");

    const headers = [
        "Name", "Serving Size", "Calories", "Sodium", "Fat",
        "Carbs", "Fiber", "Sugar", "Protein"
    ];

    const rows = historyData.map(item => [
        item.name || "",
        item.servingSize || "",
        item.calories || "",
        item.sodium || "",
        item.fat || "",
        item.carbs || "",
        item.fiber || "",
        item.sugar || "",
        item.protein || ""
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach(r => {
        csv += r.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "T1D_History.csv";
    a.click();

    URL.revokeObjectURL(url);
});

/* ============================================================
   IMPORT JSON
============================================================ */
importHistoryBtn.addEventListener("click", () => {
    importHistoryInput.click();
});

importHistoryInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);

            if (!Array.isArray(imported)) {
                alert("Invalid file format.");
                return;
            }

            // Merge + remove duplicates
            const existingNames = new Set(historyData.map(x => x.name.toLowerCase()));

            imported.forEach(item => {
                if (!existingNames.has(item.name.toLowerCase())) {
                    historyData.push(item);
                }
            });

            // Save
            localStorage.setItem("tid_food_history", JSON.stringify(historyData));

            renderHistoryTable();
            alert("History imported successfully.");

        } catch (err) {
            alert("Error importing file.");
        }
    };

    reader.readAsText(file);
});

/* ============================================================
   DARK MODE — Sync with index.html
============================================================ */
const darkToggle = document.getElementById("darkToggle");

if (darkToggle) {
    // Apply saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        darkToggle.checked = true;
        document.body.classList.add("dark");
    }

    darkToggle.addEventListener("change", () => {
        if (darkToggle.checked) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    });
}
