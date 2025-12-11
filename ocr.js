/* ============================================================
   OCR MODULE — OPENAI VISION API (Front + Back)
   Uses Chat Completions with image_url for Vision
   ============================================================ */

// const OPENAI_API_KEY = "YOUR_PRIVATE_KEY_HERE"; // private only, removed in public build
const OPENAI_API_KEY = null;

/* ===== Utility: File -> Base64 data URL body ===== */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* ===== Utility: simple helper to call OpenAI Chat Completion ===== */
async function callOpenAIVision({ systemPrompt, userPrompt, base64Image, expectJson }) {
    throw new Error("OpenAI OCR is disabled in the public version. Use the private local build for OCR.");
}

// No longer needed - OCR now returns servingGrams and servingQuantity directly

/* ============================================================
   HELPER FUNCTIONS — Extract Food Name and Nutrition
   ============================================================ */

/**
 * Extract food name from an image and populate the Food Name input
 */
async function runFrontOcrAndFillName(file) {
    const status = document.getElementById("ocrFrontStatus");
    const preview = document.getElementById("ocrFrontPreview");

    status.textContent = "OCR is disabled in the public version. Please enter values manually in Step 1.";
    status.style.color = "#ff7360";

    // Hide preview
    if (preview) {
        preview.style.display = "none";
    }

    alert("OCR is only available in the private local version. Please type the values in.");
    return;
}

/**
 * Extract nutrition facts from an image and populate Step 1 nutrition fields
 */
async function runBackOcrAndFillNutrition(file) {
    const status = document.getElementById("ocrBackStatus");
    const preview = document.getElementById("ocrBackPreview");

    status.textContent = "OCR is disabled in the public version. Please enter values manually in Step 1.";
    status.style.color = "#ff7360";

    // Hide preview
    if (preview) {
        preview.style.display = "none";
    }

    alert("OCR is only available in the private local version. Please type the values in.");
    return;
}

/* ============================================================
   UNIFIED EXTRACT INFO BUTTON
   ============================================================ */

const extractInfoBtn = document.getElementById("extractAllBtn");
const frontImageInput = document.getElementById("ocrFrontInput");
const backImageInput = document.getElementById("ocrBackInput");

if (extractInfoBtn) {
    extractInfoBtn.addEventListener("click", async () => {
        const frontFile = frontImageInput?.files[0] || null;
        const backFile = backImageInput?.files[0] || null;

        if (!frontFile && !backFile) {
            alert("Please upload at least one nutrition label image before extracting info.");
            return;
        }

        // Clear status messages
        const frontStatus = document.getElementById("ocrFrontStatus");
        const backStatus = document.getElementById("ocrBackStatus");
        if (frontStatus) frontStatus.textContent = "";
        if (backStatus) backStatus.textContent = "";

        // Case 1: both images provided
        if (frontFile && backFile) {
            await runFrontOcrAndFillName(frontFile);
            await runBackOcrAndFillNutrition(backFile);
        }
        // Case 2: only front image provided
        else if (frontFile) {
            await runFrontOcrAndFillName(frontFile);
            await runBackOcrAndFillNutrition(frontFile); // single image used for both
        }
        // Case 3: only back image provided
        else if (backFile) {
            await runFrontOcrAndFillName(backFile);      // single image used for both
            await runBackOcrAndFillNutrition(backFile);
        }
    });
}
