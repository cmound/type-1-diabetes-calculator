document.addEventListener("DOMContentLoaded", function () {
    const fractionInput = document.getElementById("fraction");
    const convertBtn = document.getElementById("convert");
    const decimalOutput = document.getElementById("decimal");
    const inputMode = document.getElementById("inputMode");
    const fractionSection = document.getElementById("fractionSection");
    const piecesSection = document.getElementById("piecesSection");
    const piecesInput = document.getElementById("pieces");

    inputMode.addEventListener("change", function () {
        if (inputMode.value === "Fraction") {
            fractionSection.style.display = "block";
            piecesSection.style.display = "none";
        } else {
            fractionSection.style.display = "none";
            piecesSection.style.display = "block";
        }
    });

    convertBtn.addEventListener("click", function () {
        const fraction = fractionInput.value;
        if (fraction.includes("/")) {
            const [numerator, denominator] = fraction.split("/");
            if (!isNaN(numerator) && !isNaN(denominator) && denominator != 0) {
                const decimal = (parseFloat(numerator) / parseFloat(denominator)).toFixed(3);
                decimalOutput.textContent = `Decimal: ${decimal}`;
                piecesInput.value = decimal;
            } else {
                decimalOutput.textContent = "Invalid fraction!";
            }
        } else {
            decimalOutput.textContent = "Enter a valid fraction (e.g., 1/3)";
        }
    });

    // Mirror results box
    const bslInput = document.getElementById("bsl");
    const updateResults = () => {
        const bsl = parseFloat(bslInput.value);
        const totalFat = parseFloat(document.getElementById("totalFat").textContent) || 0;
        const totalProtein = parseFloat(document.getElementById("totalProtein").textContent) || 0;
        const mirrorPrebolus = document.getElementById("mirrorPrebolus");
        const mirrorSplit = document.getElementById("mirrorSplit");

        // Pre-bolus logic
        let prebolus = "2–5 min";
        if (bsl > 160) prebolus = "5–15 min";
        if (bsl > 250) prebolus = "15–25 min";
        mirrorPrebolus.textContent = prebolus;

        // Split logic
        let split = "40/60 over 1.5 hrs";
        if (totalFat > 40 || totalProtein > 40) {
            split = "40/60 over 2 hrs";
        } else if (totalFat > 25 || totalProtein > 25) {
            split = "40/60 over 1.5 hrs";
        } else {
            split = "40/60 over 1 hr";
        }
        mirrorSplit.textContent = split;
    };

    bslInput.addEventListener("input", updateResults);
    setInterval(updateResults, 1000); // in case DOM changes after food added
});
