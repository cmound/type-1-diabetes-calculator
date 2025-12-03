/* ============================================================================
   OCR MODULE, TESSERACT ENHANCED
   Handles image selection, OCR extraction, cleaning, and item parsing
   ============================================================================ */

const ocrInput = document.getElementById("ocrInput");
const ocrPreview = document.getElementById("ocrPreview");
const ocrResult = document.getElementById("ocrResult");
const ocrExtractBtn = document.getElementById("ocrExtractBtn");
const ocrStatus = document.getElementById("ocrStatus");

/* Simple sanitizer */
function cleanText(text) {
    return text
        .replace(/\n+/g, " ")
        .replace(/\s\s+/g, " ")
        .trim();
}

/* Detects a nutrition label pattern and extracts calories, carbs, fat, protein, sodium, sugar */
function parseNutrition(text) {
    const data = {
        calories: null,
        carbs: null,
        fat: null,
        protein: null,
        sodium: null,
        sugar: null
    };

    function grab(pattern) {
        const match = text.match(pattern);
        return match ? parseFloat(match[1]) : null;
    }

    data.calories = grab(/calories[^0-9]*([0-9]+)/i);
    data.carbs = grab(/carb[^0-9]*([0-9]+)/i);
    data.fat = grab(/fat[^0-9]*([0-9]+)/i);
    data.protein = grab(/protein[^0-9]*([0-9]+)/i);
    data.sodium = grab(/sodium[^0-9]*([0-9]+)/i);
    data.sugar = grab(/sugar[^0-9]*([0-9]+)/i);

    return data;
}

/* Display preview */
ocrInput?.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
        ocrPreview.src = evt.target.result;
        ocrPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

/* Run OCR */
ocrExtractBtn?.addEventListener("click", async () => {
    if (!ocrInput.files[0]) {
        alert("Select an image first.");
        return;
    }

    ocrStatus.textContent = "Processing...";
    ocrStatus.style.color = "yellow";

    try {
        const worker = await Tesseract.createWorker("eng");

        const {
            data: { text }
        } = await worker.recognize(ocrPreview.src);

        await worker.terminate();

        const cleaned = cleanText(text);
        const nutrition = parseNutrition(cleaned);

        ocrResult.value = cleaned;
        ocrStatus.textContent = "Done";
        ocrStatus.style.color = "lightgreen";

        /* Auto populate nutrient fields if detected */
        if (nutrition.calories !== null) document.getElementById("calories")?.value = nutrition.calories;
        if (nutrition.carbs !== null) document.getElementById("carbs")?.value = nutrition.carbs;
        if (nutrition.fat !== null) document.getElementById("fat")?.value = nutrition.fat;
        if (nutrition.protein !== null) document.getElementById("protein")?.value = nutrition.protein;
        if (nutrition.sodium !== null) document.getElementById("sodium")?.value = nutrition.sodium;
        if (nutrition.sugar !== null) document.getElementById("sugar")?.value = nutrition.sugar;

        alert("OCR extraction complete and fields updated.");

    } catch (err) {
        console.error(err);
        ocrStatus.textContent = "Error";
        ocrStatus.style.color = "red";
        alert("OCR failed. Try a clearer photo.");
    }
});
