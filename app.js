// State
let meal = [];
let history = JSON.parse(localStorage.getItem("kai_history") || "[]");

function $(id){ return document.getElementById(id); }
function scaled(perServing, eaten, serving){ if(!serving || serving <= 0) return 0; return perServing * (eaten/serving); }

// Build datalist from history
function refreshFoodNameDatalist(){
  const dl = $("foodNames");
  dl.innerHTML = "";
  [...new Set(history.map(h => h.name))].sort().forEach(n => {
    const opt = document.createElement("option"); opt.value = n; dl.appendChild(opt);
  });
}

// Auto-fill Step 1 when Food Name matches history
function tryAutofillFromHistory(){
  const name = $("foodName").value.trim();
  const hit = history.find(h => h.name.toLowerCase() === name.toLowerCase());
  if(!hit) return;
  $("servingSize").value = hit.servingSize ?? 100;
  $("labelCalories").value = hit.calories ?? 0;
  $("labelFat").value      = hit.fat ?? 0;
  $("labelSodium").value   = hit.sodium ?? 0;
  $("labelCarbs").value    = hit.carbs ?? 0;
  $("labelFiber").value    = hit.fiber ?? 0;
  $("labelSugar").value    = hit.sugar ?? 0;
  $("labelProtein").value  = hit.protein ?? 0;
}

// Add the entered food to the current meal
function addItem(){
  const name = $("foodName").value.trim() || "Food";
  const servingSize   = parseFloat($("servingSize").value)   || 0;
  const amountEaten   = parseFloat($("amountEaten").value)   || 0;
  const cals = parseFloat($("labelCalories").value) || 0;
  const fat  = parseFloat($("labelFat").value)      || 0;
  const na   = parseFloat($("labelSodium").value)   || 0;
  const carbs= parseFloat($("labelCarbs").value)    || 0;
  const fib  = parseFloat($("labelFiber").value)    || 0;
  const sug  = parseFloat($("labelSugar").value)    || 0;
  const prot = parseFloat($("labelProtein").value)  || 0;

  const item = {
    name,
    calories: scaled(cals,  amountEaten, servingSize),
    fat:      scaled(fat,   amountEaten, servingSize),
    sodium:   scaled(na,    amountEaten, servingSize),
    carbs:    scaled(carbs, amountEaten, servingSize),
    fiber:    scaled(fib,   amountEaten, servingSize),
    sugar:    scaled(sug,   amountEaten, servingSize),
    protein:  scaled(prot,  amountEaten, servingSize),
    template: {name, servingSize, calories:cals, fat, sodium:na, carbs, fiber:fib, sugar:sug, protein:prot}
  };

  meal.push(item);
  renderMeal();

  // clear amount field to speed multi-entry
  $("amountEaten").value = "";
}

// Remove an item from the meal
function removeItem(i){ meal.splice(i,1); renderMeal(); }

// Draw meal table, totals, and results
function renderMeal(){
  const tb = $("mealBody"); tb.innerHTML = "";
  const totals = {calories:0,fat:0,sodium:0,carbs:0,fiber:0,sugar:0,protein:0};

  meal.forEach((it,i) => {
    totals.calories += it.calories;
    totals.fat      += it.fat;
    totals.sodium   += it.sodium;
    totals.carbs    += it.carbs;
    totals.fiber    += it.fiber;
    totals.sugar    += it.sugar;
    totals.protein  += it.protein;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.calories.toFixed(0)}</td>
      <td>${it.fat.toFixed(1)}g</td>
      <td>${it.sodium.toFixed(0)}mg</td>
      <td>${it.carbs.toFixed(1)}g</td>
      <td>${it.fiber.toFixed(1)}g</td>
      <td>${it.sugar.toFixed(1)}g</td>
      <td>${it.protein.toFixed(1)}g</td>
      <td><button onclick="removeItem(${i})">Remove</button></td>`;
    tb.appendChild(tr);
  });

  $("tCalories").textContent = totals.calories.toFixed(0);
  $("tFat").textContent      = `${totals.fat.toFixed(1)}g`;
  $("tSodium").textContent   = `${totals.sodium.toFixed(0)}mg`;
  $("tCarbs").textContent    = `${totals.carbs.toFixed(1)}g`;
  $("tFiber").textContent    = `${totals.fiber.toFixed(1)}g`;
  $("tSugar").textContent    = `${totals.sugar.toFixed(1)}g`;
  $("tProtein").textContent  = `${totals.protein.toFixed(1)}g`;

  $("rCarbs").textContent   = totals.carbs.toFixed(1);
  $("rFat").textContent     = totals.fat.toFixed(1);
  $("rProtein").textContent = totals.protein.toFixed(1);

  const bsl = parseFloat($("bsl").value) || 0;
  const iob = parseFloat($("iob").value) || 0;
  const ft  = classifyFood(totals);
  $("foodTypeOut").textContent = ft.type;
  $("reason").textContent      = ft.reason;
  $("prebolus").textContent    = preBolus(bsl, iob, ft.type);
  $("splitText").textContent   = splitRecommendation(totals.fat);
}

// Simple classifier for Food Type and Reason
function classifyFood(t){
  if (t.fat >= 25)                 return {type:"Plant-based Fat", reason:"High fat, slow digesting"};
  if (t.carbs >= 50 && t.fat <=10) return {type:"Simple Carbs",    reason:"High carbs, low fat"};
  if (t.fiber >= 8)                return {type:"Carbs with Fiber",reason:"Higher fiber content"};
  if (t.protein >= 30 && t.carbs < 25) return {type:"Protein", reason:"Protein dominant"};
  if (t.carbs < 10)                return {type:"Low-carb Veggies",reason:"Low total carbs"};
  return {type:"Carbs with Fiber", reason:"Balanced macros"};
}

// Split recommendation based on total fat
function splitRecommendation(totalFat){
  if (totalFat < 10) return "No split recommended";
  if (totalFat < 15) return "50/50 over 2 hours";
  if (totalFat < 18) return "45/55 over 2 hours 15 mins";
  if (totalFat < 20) return "45/55 over 2 hours 30 mins";
  if (totalFat < 25) return "45/55 over 3 hours";
  if (totalFat < 30) return "45/55 over 3 hours 15 mins";
  return "40/60 over 3 hours 30 mins";
}

// Pre-bolus suggestion, adjust later to your exact rules
function preBolus(bsl, iob, foodType){
  if (bsl < 90) return "No pre-bolus, treat low";
  if (iob >= 0.5) return "0–2 min";
  if (foodType === "Simple Carbs") return "6–8 min";
  if (foodType === "Plant-based Fat" || foodType === "Protein") return "0–2 min";
  return "4–6 min";
}

// Save current meal items as templates to history, then clear meal
function saveMealToHistory(){
  const map = new Map(history.map(h => [h.name.toLowerCase(), h]));
  meal.forEach(m => map.set(m.template.name.toLowerCase(), m.template));
  history = Array.from(map.values());
  localStorage.setItem("kai_history", JSON.stringify(history));
  meal = [];
  renderMeal(); renderHistory(); refreshFoodNameDatalist();
}

// Render history table
function renderHistory(){
  const hb = $("historyBody"); hb.innerHTML = "";
  history.forEach((h,i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.name}</td>
      <td>${h.servingSize ?? 0}</td>
      <td>${h.calories ?? 0}</td>
      <td>${h.fat ?? 0}</td>
      <td>${h.sodium ?? 0}</td>
      <td>${h.carbs ?? 0}</td>
      <td>${h.fiber ?? 0}</td>
      <td>${h.sugar ?? 0}</td>
      <td>${h.protein ?? 0}</td>
      <td><button onclick="removeHistory(${i})">Delete</button></td>`;
    hb.appendChild(tr);
  });
}

function removeHistory(i){
  history.splice(i,1);
  localStorage.setItem("kai_history", JSON.stringify(history));
  renderHistory(); refreshFoodNameDatalist();
}

// Tabs
function showTab(which){
  $("tabCurrent").classList.toggle("active", which === "current");
  $("tabHistory").classList.toggle("active", which === "history");
  $("currentView").classList.toggle("hidden", which !== "current");
  $("historyView").classList.toggle("hidden", which !== "history");
}

// Wire up
document.addEventListener("DOMContentLoaded", () => {
  $("addBtn").addEventListener("click", addItem);
  $("saveHistoryBtn").addEventListener("click", saveMealToHistory);
  $("clearHistoryBtn").addEventListener("click", () => {
    if (confirm("Clear all saved foods?")){
      history = []; localStorage.setItem("kai_history","[]");
      renderHistory(); refreshFoodNameDatalist();
    }
  });
  $("foodName").addEventListener("change", tryAutofillFromHistory);
  $("bsl").addEventListener("change", renderMeal);
  $("iob").addEventListener("change", renderMeal);
  $("tabCurrent").addEventListener("click", () => showTab("current"));
  $("tabHistory").addEventListener("click", () => showTab("history"));

  renderMeal();
  renderHistory();
  refreshFoodNameDatalist();
  showTab("current");
});
