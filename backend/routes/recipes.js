const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

// @route   GET api/recipes
// @desc    Get all recipes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ title: 1 });
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/recipes/:id
// @desc    Get recipe by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/recipes
// @desc    Create a recipe
// @access  Private
router.post('/', auth, async (req, res) => {
  const { 
    title, category, difficulty, time, ingredients, 
    instructions, tags, nutritionFacts, totalCost,
    isComposite, componentRecipes
  } = req.body;

  try {
    const newRecipe = new Recipe({
      title,
      category,
      difficulty,
      time,
      ingredients,
      instructions,
      tags,
      nutritionFacts,
      totalCost,
      isComposite,
      componentRecipes,
      createdBy: req.user.id,
      updatedAt: Date.now()
    });

    const recipe = await newRecipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { 
    title, category, difficulty, time, ingredients, 
    instructions, tags, nutritionFacts, totalCost,
    isComposite, componentRecipes
  } = req.body;

  try {
    let recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Update fields
    recipe.title = title;
    recipe.category = category;
    recipe.difficulty = difficulty;
    recipe.time = time;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.tags = tags;
    recipe.nutritionFacts = nutritionFacts;
    recipe.totalCost = totalCost;
    recipe.isComposite = isComposite;
    recipe.componentRecipes = componentRecipes;
    recipe.updatedAt = Date.now();

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    await recipe.remove();
    res.json({ msg: 'Recipe removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/recipes/bulk
// @desc    Bulk import recipes
// @access  Private
router.post('/bulk', auth, async (req, res) => {
  const { recipes } = req.body;

  try {
    const insertedRecipes = [];
    
    for (const recipe of recipes) {
      const newRecipe = new Recipe({
        title: recipe.title,
        category: recipe.category || 'Other',
        difficulty: recipe.difficulty,
        time: recipe.time,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: recipe.tags || [],
        nutritionFacts: recipe.nutritionFacts || {},
        totalCost: recipe.totalCost || 0,
        isComposite: recipe.isComposite || false,
        componentRecipes: recipe.componentRecipes || [],
        createdBy: req.user.id,
        updatedAt: Date.now()
      });
      
      const savedRecipe = await newRecipe.save();
      insertedRecipes.push(savedRecipe);
    }
    
    res.json(insertedRecipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
