
document.addEventListener("DOMContentLoaded", function () {
  const servingType = document.getElementById("servingType");
  const fractionContainer = document.getElementById("fractionContainer");
  const fractionInput = document.getElementById("fractionInput");
  const convertButton = document.getElementById("convertButton");
  const servingAmount = document.getElementById("servingAmount");
  const addButton = document.getElementById("addButton");

  function convertFractionToDecimal(fractionStr) {
    try {
      if (fractionStr.includes(" ")) {
        const [whole, frac] = fractionStr.split(" ");
        const [num, denom] = frac.split("/");
        return parseFloat(whole) + parseFloat(num) / parseFloat(denom);
      } else if (fractionStr.includes("/")) {
        const [num, denom] = fractionStr.split("/");
        return parseFloat(num) / parseFloat(denom);
      } else {
        return parseFloat(fractionStr);
      }
    } catch {
      return null;
    }
  }

  servingType.addEventListener("change", function () {
    if (servingType.value === "Fraction") {
      fractionContainer.style.display = "block";
    } else {
      fractionContainer.style.display = "none";
    }
  });

  convertButton.addEventListener("click", function () {
    const decimal = convertFractionToDecimal(fractionInput.value);
    if (!isNaN(decimal)) {
      document.getElementById("numPieces").value = decimal.toFixed(3);
    } else {
      alert("Invalid fraction");
    }
  });

  addButton.addEventListener("click", function () {
    const name = document.getElementById("name").value;
    const bsl = parseFloat(document.getElementById("bsl").value);
    const totalCarbs = parseFloat(document.getElementById("totalCarbs").innerText.split(": ")[1]);
    const totalFat = parseFloat(document.getElementById("totalFat").innerText.split(": ")[1]);
    const totalProtein = parseFloat(document.getElementById("totalProtein").innerText.split(": ")[1]);

    let preBolusTime = "";
    if (bsl <= 70) preBolusTime = "Eat first";
    else if (bsl <= 120) preBolusTime = "0–2 min";
    else if (bsl <= 150) preBolusTime = "3–5 min";
    else if (bsl <= 180) preBolusTime = "6–8 min";
    else if (bsl <= 200) preBolusTime = "9–10 min";
    else if (bsl <= 250) preBolusTime = "10–15 min";
    else preBolusTime = "15+ min";

    document.getElementById("preBolus").innerText = `Pre-bolus: ${preBolusTime}`;
  });
});
