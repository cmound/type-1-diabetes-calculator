function updateFoodSummary() {
    const totalCarbs = calculateTotal("carbs");
    const totalFat = calculateTotal("fat");
    const totalProtein = calculateTotal("protein");
    const prebolus = calculatePrebolus();
    const splitInfo = determineSplitLogic();
    const splitReason = determineSplitReason();

    document.getElementById("foodSummary").innerHTML = `
        <div class="summary-grid">
            <div><strong>TOTAL CARBS:</strong> ${totalCarbs} g</div>
            <div><strong>TOTAL FAT:</strong> ${totalFat} g</div>
            <div><strong>TOTAL PROTEIN:</strong> ${totalProtein} g</div>
            <hr>
            <div><strong>PRE-BOLUS:</strong> ${prebolus} mins</div>
            <div><strong>SPLIT:</strong> ${splitInfo}</div>
            <div><strong>SPLIT DURATION:</strong> 15 mins</div>
            <div><strong>SPLIT REASON:</strong> ${splitReason}</div>
        </div>
    `;
}

function updateTotalsFooter() {
    document.getElementById("totalFat").textContent = calculateTotal("fat");
    document.getElementById("totalCarbs").textContent = calculateTotal("carbs");
    document.getElementById("totalProtein").textContent = calculateTotal("protein");
    document.getElementById("totalServingSize").textContent = calculateTotal("servingSize");
}

function calculateTotal(field) {
    let total = 0;
    foodLog.forEach(item => {
        total += (parseFloat(item[field]) || 0) * (parseFloat(item.amountHaving) || 1);
    });
    return total.toFixed(1);
}

function calculatePrebolus() {
    const bsl = parseInt(document.getElementById("bsl").value);
    if (bsl < 120) return 0;
    if (bsl < 150) return 3;
    if (bsl < 180) return 5;
    if (bsl < 200) return 8;
    return 10;
}

function determineSplitLogic() {
    const bsl = parseInt(document.getElementById("bsl").value);
    if (bsl > 200) return "60/40";
    return "40/60";
}

function determineSplitReason() {
    const bsl = parseInt(document.getElementById("bsl").value);
    return bsl > 200 ? "High BSL adjustment" : "Standard slow-acting food";
}
