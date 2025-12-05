/* =========================================================================
   AI ANALYSIS MODULE
   Uses OpenAI API (client-side)
   Cost per call is low, but still real money
========================================================================= */

const OPENAI_API_KEY = "YOUR_API_KEY_HERE"; // put your real key here after pasting

/* =========================================================================
   RUN AI ANALYSIS
========================================================================= */
document.getElementById("runAiAnalysisBtn").addEventListener("click", async () => {
    const notesBox = document.getElementById("aiNotes");
    notesBox.value = "Analyzing... please wait.";

    try {
        const payload = buildAIPayload();
        const result = await callOpenAI(payload);

        notesBox.value = result;
        autoExpand(notesBox); // Resize box after response
    } catch (err) {
        console.error("AI error:", err);
        notesBox.value = "AI error: " + err.message;
        autoExpand(notesBox);
    }
});

/* =========================================================================
   COLLECT DATA FROM THE CALCULATOR
========================================================================= */
function buildAIPayload() {
    const BSL = Number(document.getElementById("currentBSL").value);
    const IOB = Number(document.getElementById("currentIOB").value);
    const mealType = document.getElementById("mealType").value;

    const totals = {
        carbs: Number(document.getElementById("totalCarbs").textContent),
        fat: Number(document.getElementById("totalFat").textContent),
        protein: Number(document.getElementById("totalProtein").textContent),
    };

    const results = {
        preBolus: document.getElementById("resultPreBolus").textContent,
        split: document.getElementById("resultSplit").textContent,
        splitPct: document.getElementById("resultSplitPercent").textContent,
        splitDur: document.getElementById("resultSplitDuration").textContent,
        reason: document.getElementById("resultReason").textContent,
        mealDose: document.getElementById("resultMealDose").textContent,
        correction: document.getElementById("resultCorrection").textContent,
        finalDose: document.getElementById("resultFinalDose").textContent
    };

    return { BSL, IOB, mealType, totals, results };
}

/* =========================================================================
   OPENAI CALL
========================================================================= */
async function callOpenAI(payload) {
    const systemPrompt = `
You are a diabetes management assistant helping a parent dose insulin for a 12 year old boy with Type 1 diabetes who uses a pump.

Rules:
• Never give medical instructions outside meal guidance.
• Use simple, concise language.
• Base all reasoning on the totals, BSL, meal type, fat load, and standard meal timing patterns.
• Focus on trends, timing, glucose rise expectations, and digestion speed.

Summaries must be short, practical, and instantly usable.
    `;

    const userPrompt = `
Meal Analysis Request:

Current BSL: ${payload.BSL}
IOB: ${payload.IOB}
Meal Type: ${payload.mealType}

Totals:
• Carbs: ${payload.totals.carbs} g
• Fat: ${payload.totals.fat} g
• Protein: ${payload.totals.protein} g

Calculator Recommendations:
• Pre Bolus: ${payload.results.preBolus}
• Split: ${payload.results.split}
• Split Percent: ${payload.results.splitPct}
• Split Duration: ${payload.results.splitDur}
• Reason: ${payload.results.reason}
• Meal Dose: ${payload.results.mealDose}
• Correction: ${payload.results.correction}
• Final Dose: ${payload.results.finalDose}

Provide:
1. What to anticipate with post meal trends
2. Why the guidance makes sense
3. Any adjustments to watch for
4. Key warnings or timing sensitivities
    `;

    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_output_tokens: 250
        })
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error("API error " + response.status + ": " + errText);
    }

    const data = await response.json();
    console.log("AI Response:", data);

    // 1) New Responses API convenience field
    if (typeof data.output_text === "string" && data.output_text.trim()) {
        return data.output_text.trim();
    }

    // 2) Structured Responses API output
    if (Array.isArray(data.output) && data.output.length > 0) {
        const first = data.output[0];
        if (first && Array.isArray(first.content)) {
            const parts = first.content.map(part => {
                if (typeof part.text === "string") return part.text;
                if (typeof part.value === "string") return part.value;
                if (part.text && typeof part.text.value === "string") return part.text.value;
                return "";
            });
            const joined = parts.join("\n").trim();
            if (joined) return joined;
        }
    }

    // 3) Backward compatibility for chat/completions style payloads
    if (Array.isArray(data.choices) && data.choices.length > 0) {
        const msg = data.choices[0].message;
        if (msg) {
            if (typeof msg.content === "string") return msg.content.trim();
            if (Array.isArray(msg.content)) {
                const joined = msg.content
                    .map(c => (typeof c.text === "string" ? c.text : ""))
                    .join("\n")
                    .trim();
                if (joined) return joined;
            }
        }
    }

    throw new Error("Invalid AI response format");
}

/* =========================================================================
   AUTO-EXPAND TEXTAREA
========================================================================= */
function autoExpand(el) {
    el.style.height = "auto";
    el.style.height = (el.scrollHeight + 5) + "px";
}
