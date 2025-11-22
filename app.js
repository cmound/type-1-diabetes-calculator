// Updated app.js with: fix for qtyHaving, insulin reduction logic, fraction converter
document.getElementById("convertFraction").addEventListener("click", function () {
    const input = document.getElementById("fractionInput").value.trim();
    const output = document.getElementById("convertedDecimal");

    if (!input.includes("/")) {
        output.textContent = "Invalid fraction";
        return;
    }

    const [num, denom] = input.split("/").map(Number);
    if (isNaN(num) || isNaN(denom) || denom === 0) {
        output.textContent = "Invalid fraction";
        return;
    }

    const decimal = (num / denom).toFixed(3);
    output.textContent = `Decimal: ${decimal}`;
});

function clearInputFields() {
    document.getElementById("servingSize").value = '';
    document.getElementById("servingCount").value = '';
    document.getElementById("calories").value = '';
    document.getElementById("fat").value = '';
    document.getElementById("sodium").value = '';
    document.getElementById("carbs").value = '';
    document.getElementById("fiber").value = '';
    document.getElementById("sugar").value = '';
    document.getElementById("protein").value = '';
    document.getElementById("qtyHaving").value = '';
    document.getElementById("foodName").focus();
}

// And the rest of your logic...
