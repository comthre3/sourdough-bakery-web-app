const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  time: { type: Number, required: true },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    cost: { type: Number }
  }],
  instructions: { type: String, required: true },
  tags: [{ type: String }],
  nutritionFacts: {
    weight: { type: Number },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number }
  },
  totalCost: { type: Number },
  isComposite: { type: Boolean, default: false },
  componentRecipes: [{
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    quantity: { type: Number }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
