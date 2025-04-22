const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // dry, wet, non-food
  unit: { type: String, required: true },
  packageSize: { type: Number, required: true },
  packagePrice: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  calories: { type: Number },
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
