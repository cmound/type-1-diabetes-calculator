function addItem(){
  const name = $("foodName").value.trim() || "Food";

  // Label info (per serving on the nutrition label)
  const servingSize   = parseFloat($("servingSize").value)   || 0;   // grams or mL
  const servingPieces = parseFloat($("servingPieces")?.value) || 0;  // pieces per serving (optional)

  const labelCalories = parseFloat($("labelCalories").value) || 0;
  const labelFat      = parseFloat($("labelFat").value)      || 0;
  const labelSodium   = parseFloat($("labelSodium").value)   || 0;
  const labelCarbs    = parseFloat($("labelCarbs").value)    || 0;
  const labelFiber    = parseFloat($("labelFiber").value)    || 0;
  const labelSugar    = parseFloat($("labelSugar").value)    || 0;
  const labelProtein  = parseFloat($("labelProtein").value)  || 0;

  // Portion the user ate
  const amountEaten   = parseFloat($("amountEaten")?.value)   || 0;  // grams/mL
  const amountPieces  = parseFloat($("amountPieces")?.value)  || 0;  // pieces

  // Compute fraction of a serving
  let fraction = 0;
  if (servingPieces > 0 && amountPieces > 0) {
    // Example: label says 5 crackers per serving, user ate 8 crackers => 8/5
    fraction = amountPieces / servingPieces;
  } else if (servingSize > 0 && amountEaten > 0) {
    // Classic grams/mL path
    fraction = amountEaten / servingSize;
  } else {
    alert("Enter either grams/mL or pieces for the portion, and be sure the matching serving field is set.");
    return;
  }

  // Portion calculations
  const item = {
    name,
    calories: labelCalories * fraction,
    fat:      labelFat      * fraction,
    sodium:   labelSodium   * fraction,
    carbs:    labelCarbs    * fraction,
    fiber:    labelFiber    * fraction,
    sugar:    labelSugar    * fraction,
    protein:  labelProtein  * fraction,

    // save template so future “Food name” auto-fills
    template: {
      name, servingSize, servingPieces,
      calories: labelCalories, fat: labelFat, sodium: labelSodium,
      carbs: labelCarbs, fiber: labelFiber, sugar: labelSugar, protein: labelProtein
    }
  };

  meal.push(item);
  renderMeal();

  // Clear STEP 2 fields after add (your request)
  if ($("amountEaten"))  $("amountEaten").value  = "";
  if ($("amountPieces")) $("amountPieces").value = "";
}
