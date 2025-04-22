const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ingredient = require('../models/Ingredient');

// @route   GET api/ingredients
// @desc    Get all ingredients
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.json(ingredients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/ingredients
// @desc    Create an ingredient
// @access  Private
router.post('/', auth, async (req, res) => {
  const { 
    name, type, unit, packageSize, packagePrice, 
    calories, protein, carbs, fat 
  } = req.body;

  try {
    // Calculate price per unit
    const pricePerUnit = packagePrice / packageSize;

    const newIngredient = new Ingredient({
      name,
      type,
      unit,
      packageSize,
      packagePrice,
      pricePerUnit,
      calories,
      protein,
      carbs,
      fat,
      createdBy: req.user.id
    });

    const ingredient = await newIngredient.save();
    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/ingredients/:id
// @desc    Update an ingredient
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { 
    name, type, unit, packageSize, packagePrice, 
    calories, protein, carbs, fat 
  } = req.body;

  try {
    let ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }

    // Calculate price per unit
    const pricePerUnit = packagePrice / packageSize;

    // Update fields
    ingredient.name = name;
    ingredient.type = type;
    ingredient.unit = unit;
    ingredient.packageSize = packageSize;
    ingredient.packagePrice = packagePrice;
    ingredient.pricePerUnit = pricePerUnit;
    ingredient.calories = calories;
    ingredient.protein = protein;
    ingredient.carbs = carbs;
    ingredient.fat = fat;

    await ingredient.save();
    res.json(ingredient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/ingredients/:id
// @desc    Delete an ingredient
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }

    await ingredient.remove();
    res.json({ msg: 'Ingredient removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/ingredients/bulk
// @desc    Bulk import ingredients
// @access  Private
router.post('/bulk', auth, async (req, res) => {
  const { ingredients } = req.body;

  try {
    const insertedIngredients = [];
    
    for (const ingredient of ingredients) {
      // Calculate price per unit
      const pricePerUnit = ingredient.packagePrice / ingredient.packageSize;
      
      const newIngredient = new Ingredient({
        name: ingredient.name,
        type: ingredient.type,
        unit: ingredient.unit,
        packageSize: ingredient.packageSize,
        packagePrice: ingredient.packagePrice,
        pricePerUnit,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fat: ingredient.fat,
        createdBy: req.user.id
      });
      
      const savedIngredient = await newIngredient.save();
      insertedIngredients.push(savedIngredient);
    }
    
    res.json(insertedIngredients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
