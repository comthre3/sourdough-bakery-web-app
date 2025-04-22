// Unit Converter for Sourdough Bakery Web App
const UnitConverter = {
  // Conversion factors for weight
  weightConversions: {
    g: 1,           // base unit: grams
    kg: 1000,       // 1 kg = 1000 g
    oz: 28.35,      // 1 oz = 28.35 g
    lb: 453.59,     // 1 lb = 453.59 g
  },
  
  // Conversion factors for volume
  volumeConversions: {
    ml: 1,          // base unit: milliliters
    l: 1000,        // 1 l = 1000 ml
    tsp: 4.93,      // 1 tsp = 4.93 ml
    tbsp: 14.79,    // 1 tbsp = 14.79 ml
    cup: 236.59,    // 1 cup = 236.59 ml
    floz: 29.57,    // 1 fl oz = 29.57 ml
    pint: 473.18,   // 1 pint = 473.18 ml
    quart: 946.35,  // 1 quart = 946.35 ml
    gallon: 3785.41 // 1 gallon = 3785.41 ml
  },
  
  // Parse ingredient string to extract quantity, unit, and ingredient name
  parseIngredient(ingredientStr) {
    // Regular expression to match quantity, unit, and ingredient
    // Examples: "500g flour", "2 cups water", "1.5 tbsp salt"
    const regex = /^([\d.]+)\s*([a-zA-Z%]+)?\s+(.+)$/;
    const match = ingredientStr.match(regex);
    
    if (match) {
      return {
        quantity: parseFloat(match[1]),
        unit: match[2] ? match[2].toLowerCase() : '',
        ingredient: match[3].trim()
      };
    }
    
    // If no match, return the original string as the ingredient
    return {
      quantity: null,
      unit: '',
      ingredient: ingredientStr.trim()
    };
  },
  
  // Format ingredient with quantity, unit, and name
  formatIngredient(quantity, unit, ingredient) {
    if (quantity === null || isNaN(quantity)) {
      return ingredient;
    }
    
    // Format quantity to avoid unnecessary decimal places
    const formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
    
    return `${formattedQuantity}${unit ? ' ' + unit : ''} ${ingredient}`;
  },
  
  // Convert weight from one unit to another
  convertWeight(value, fromUnit, toUnit) {
    if (!this.weightConversions[fromUnit] || !this.weightConversions[toUnit]) {
      return value; // Return original value if units are not recognized
    }
    
    // Convert to grams first, then to target unit
    const grams = value * this.weightConversions[fromUnit];
    return grams / this.weightConversions[toUnit];
  },
  
  // Convert volume from one unit to another
  convertVolume(value, fromUnit, toUnit) {
    if (!this.volumeConversions[fromUnit] || !this.volumeConversions[toUnit]) {
      return value; // Return original value if units are not recognized
    }
    
    // Convert to milliliters first, then to target unit
    const milliliters = value * this.volumeConversions[fromUnit];
    return milliliters / this.volumeConversions[toUnit];
  },
  
  // Determine if a unit is a weight unit
  isWeightUnit(unit) {
    return unit in this.weightConversions;
  },
  
  // Determine if a unit is a volume unit
  isVolumeUnit(unit) {
    return unit in this.volumeConversions;
  },
  
  // Scale ingredient quantity by a factor
  scaleQuantity(quantity, scaleFactor) {
    if (quantity === null || isNaN(quantity)) {
      return quantity;
    }
    return quantity * scaleFactor;
  },
  
  // Convert ingredient to a different unit system
  convertIngredient(parsedIngredient, toUnit) {
    if (!parsedIngredient.quantity || !parsedIngredient.unit) {
      return parsedIngredient;
    }
    
    let convertedQuantity = parsedIngredient.quantity;
    let convertedUnit = parsedIngredient.unit;
    
    // Handle weight conversions
    if (this.isWeightUnit(parsedIngredient.unit) && this.isWeightUnit(toUnit)) {
      convertedQuantity = this.convertWeight(parsedIngredient.quantity, parsedIngredient.unit, toUnit);
      convertedUnit = toUnit;
    }
    // Handle volume conversions
    else if (this.isVolumeUnit(parsedIngredient.unit) && this.isVolumeUnit(toUnit)) {
      convertedQuantity = this.convertVolume(parsedIngredient.quantity, parsedIngredient.unit, toUnit);
      convertedUnit = toUnit;
    }
    
    return {
      quantity: convertedQuantity,
      unit: convertedUnit,
      ingredient: parsedIngredient.ingredient
    };
  },
  
  // Scale an ingredient by a factor
  scaleIngredient(parsedIngredient, scaleFactor) {
    if (!parsedIngredient.quantity) {
      return parsedIngredient;
    }
    
    return {
      quantity: this.scaleQuantity(parsedIngredient.quantity, scaleFactor),
      unit: parsedIngredient.unit,
      ingredient: parsedIngredient.ingredient
    };
  }
};
