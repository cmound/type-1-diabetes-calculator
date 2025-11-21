/* final_app.js */
document.getElementById("convertBtn").addEventListener("click", function () {
    const fraction = document.getElementById("fractionInput").value;
    const result = convertFractionToDecimal(fraction);
    document.getElementById("decimalOutput").textContent = `Decimal: ${result}`;
    document.getElementById("servingEquals").value = result;
});

function convertFractionToDecimal(fraction) {
    if (!fraction.includes("/")) return parseFloat(fraction);
    const [numerator, denominator] = fraction.split("/").map(Number);
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return "Invalid";
    return (numerator / denominator).toFixed(3);
}
