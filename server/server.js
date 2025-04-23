const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json({ limit: '50mb' }));

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper function to read data from file
function readData(file) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing ${file}:`, error);
    return [];
  }
}

// Helper function to write data to file
function writeData(file, data) {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is working!' });
});

// User login endpoint
app.post('/api/users/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // Demo accounts
  const demoAccounts = [
    {
      id: '1',
      email: 'admin@example.com',
      password: 'Admin123!',
      displayName: 'Admin User',
      role: 'admin'
    },
    {
      id: '2',
      email: 'manager@example.com',
      password: 'Manager123!',
      displayName: 'Manager User',
      role: 'manager'
    },
    {
      id: '3',
      email: 'baker@example.com',
      password: 'Baker123!',
      displayName: 'Baker User',
      role: 'baker'
    },
    {
      id: '4',
      email: 'trainee@example.com',
      password: 'Trainee123!',
      displayName: 'Trainee User',
      role: 'trainee'
    },
    {
      id: '5',
      email: 'ahmed@fromniu.com',
      password: 'banak123',
      displayName: 'Ahmed',
      role: 'admin'
    }
  ];
  
  // Find user
  let foundUser = null;
  for (let i = 0; i < demoAccounts.length; i++) {
    if (demoAccounts[i].email === email && demoAccounts[i].password === password) {
      foundUser = demoAccounts[i];
      break;
    }
  }
  
  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Create a safe user object without the password
  const safeUser = {
    id: foundUser.id,
    email: foundUser.email,
    displayName: foundUser.displayName,
    role: foundUser.role
  };
  
  res.json(safeUser);
});

// Recipe routes
app.get('/api/recipes', (req, res) => {
  try {
    const recipes = readData('recipes.json');
    res.json(recipes);
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ error: 'Error getting recipes' });
  }
});

app.get('/api/recipes/:id', (req, res) => {
  try {
    const recipes = readData('recipes.json');
    const recipe = recipes.find(r => r.id === req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error getting recipe:', error);
    res.status(500).json({ error: 'Error getting recipe' });
  }
});

app.post('/api/recipes', (req, res) => {
  try {
    const recipes = readData('recipes.json');
    const newRecipe = {
      id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      ingredients: req.body.ingredients || [],
      instructions: req.body.instructions || [],
      prepTime: req.body.prepTime,
      cookTime: req.body.cookTime,
      yield: req.body.yield,
      difficulty: req.body.difficulty,
      tags: req.body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    recipes.push(newRecipe);
    writeData('recipes.json', recipes);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Error creating recipe' });
  }
});

app.put('/api/recipes/:id', (req, res) => {
  try {
    const recipes = readData('recipes.json');
    const index = recipes.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const updatedRecipe = {
      ...recipes[index],
      name: req.body.name || recipes[index].name,
      description: req.body.description || recipes[index].description,
      ingredients: req.body.ingredients || recipes[index].ingredients,
      instructions: req.body.instructions || recipes[index].instructions,
      prepTime: req.body.prepTime || recipes[index].prepTime,
      cookTime: req.body.cookTime || recipes[index].cookTime,
      yield: req.body.yield || recipes[index].yield,
      difficulty: req.body.difficulty || recipes[index].difficulty,
      tags: req.body.tags || recipes[index].tags,
      updatedAt: new Date().toISOString()
    };
    
    recipes[index] = updatedRecipe;
    writeData('recipes.json', recipes);
    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Error updating recipe' });
  }
});

app.delete('/api/recipes/:id', (req, res) => {
  try {
    const recipes = readData('recipes.json');
    const index = recipes.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    recipes.splice(index, 1);
    writeData('recipes.json', recipes);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Error deleting recipe' });
  }
});

// Clear all recipes
app.delete('/api/recipes', (req, res) => {
  try {
    console.log('Clearing all recipes');
    const filePath = path.join(DATA_DIR, 'recipes.json');
    fs.writeFileSync(filePath, JSON.stringify([]));
    res.json({ message: 'All recipes cleared successfully' });
  } catch (error) {
    console.error('Error clearing recipes:', error);
    res.status(500).json({ error: 'Error clearing recipes: ' + error.message });
  }
});

// Import recipes from CSV
app.post('/api/recipes/import-csv', (req, res) => {
  try {
    console.log('Importing recipes from CSV');
    const csvData = req.body.csvData;
    
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }
    
    // Log the first 200 characters of the CSV data to help debug
    console.log('CSV data preview:', csvData.substring(0, 200));
    
    const lines = csvData.split('\n');
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file must have at least a header row and one data row' });
    }
    
    console.log(`CSV has ${lines.length} lines`);
    console.log('First line:', lines[0]);
    if (lines.length > 1) {
      console.log('Second line:', lines[1]);
    }
    
    // Parse headers (first row)
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers:', headers);
    
    const importedRecipes = [];
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) {
        console.log(`Skipping empty line ${i}`);
        continue;
      }
      
      console.log(`Processing line ${i}: ${lines[i].substring(0, 50)}...`);
      
      // Split the line by comma, but handle quoted values properly
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      console.log(`Line ${i} has ${values.length} values and ${headers.length} headers`);
      
      // Skip if number of values doesn't match number of headers
      if (values.length !== headers.length) {
        console.warn(`Line ${i+1} has ${values.length} values but should have ${headers.length}. Attempting to process anyway.`);
        // Continue processing anyway, using available values
      }
      
      // Create recipe object from headers and values
      const recipe = {};
      for (let j = 0; j < Math.min(headers.length, values.length); j++) {
        recipe[headers[j]] = values[j];
      }
      
      console.log('Parsed recipe:', recipe);
      
      // Check if we have at least a name
      if (!recipe.Name && !recipe.name) {
        console.warn(`Line ${i+1} doesn't have a name. Skipping.`);
        continue;
      }
      
      // Process recipe data according to your specific format
      const processedRecipe = {
        id: Date.now().toString() + i,
        name: recipe.Name || recipe.name || 'Unnamed Recipe',
        description: recipe.Description || recipe.description || '',
        category: recipe.Category || recipe.category || 'bread',
        prepTime: parseInt(recipe['Prep Time (min)'] || recipe['Prep Time'] || recipe.prepTime || 0),
        cookTime: parseInt(recipe['Cook Time (min)'] || recipe['Cook Time'] || recipe.cookTime || 0),
        yield: recipe.Yield || recipe.yield || '',
        difficulty: recipe.Difficulty || recipe.difficulty || 'medium',
        tags: (recipe.Tags || recipe.tags) ? (recipe.Tags || recipe.tags).split(';').map(tag => tag.trim()) : [],
        ingredients: [],
        instructions: (recipe.Instructions || recipe.instructions) ? (recipe.Instructions || recipe.instructions).split(';').map(step => step.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Process ingredients
      if (recipe.Ingredients || recipe.ingredients) {
        const ingredientsList = (recipe.Ingredients || recipe.ingredients).split(';');
        processedRecipe.ingredients = ingredientsList.map(ing => {
          const match = ing.trim().match(/^([\d.]+)\s+(\w+)\s+(.+)$/);
          if (match) {
            return {
              amount: parseFloat(match[1]) || 0,
              unit: match[2] || '',
              name: match[3] || ''
            };
          } else {
            return {
              amount: 0,
              unit: '',
              name: ing.trim()
            };
          }
        });
      }
      
      importedRecipes.push(processedRecipe);
    }
    
    console.log(`Processed ${importedRecipes.length} recipes`);
    
    // Save imported recipes
    const recipes = readData('recipes.json');
    recipes.push(...importedRecipes);
    writeData('recipes.json', recipes);
    
    res.json({
      message: `Successfully imported ${importedRecipes.length} recipes`,
      recipes: importedRecipes
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Error importing CSV: ' + error.message });
  }
});

// Ingredients routes
app.get('/api/ingredients', (req, res) => {
  try {
    const ingredients = readData('ingredients.json');
    res.json(ingredients);
  } catch (error) {
    console.error('Error getting ingredients:', error);
    res.status(500).json({ error: 'Error getting ingredients' });
  }
});

app.get('/api/ingredients/:id', (req, res) => {
  try {
    const ingredients = readData('ingredients.json');
    const ingredient = ingredients.find(i => i.id === req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error getting ingredient:', error);
    res.status(500).json({ error: 'Error getting ingredient' });
  }
});

app.post('/api/ingredients', (req, res) => {
  try {
    const ingredients = readData('ingredients.json');
    const newIngredient = {
      id: Date.now().toString(),
      name: req.body.name,
      category: req.body.category || 'dry',
      price: req.body.price || 0,
      unit: req.body.unit || 'g',
      nutritionalInfo: req.body.nutritionalInfo || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ingredients.push(newIngredient);
    writeData('ingredients.json', ingredients);
    res.status(201).json(newIngredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Error creating ingredient' });
  }
});

app.put('/api/ingredients/:id', (req, res) => {
  try {
    const ingredients = readData('ingredients.json');
    const index = ingredients.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    const updatedIngredient = {
      ...ingredients[index],
      name: req.body.name || ingredients[index].name,
      category: req.body.category || ingredients[index].category,
      price: req.body.price || ingredients[index].price,
      unit: req.body.unit || ingredients[index].unit,
      nutritionalInfo: req.body.nutritionalInfo || ingredients[index].nutritionalInfo,
      updatedAt: new Date().toISOString()
    };
    
    ingredients[index] = updatedIngredient;
    writeData('ingredients.json', ingredients);
    res.json(updatedIngredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Error updating ingredient' });
  }
});

app.delete('/api/ingredients/:id', (req, res) => {
  try {
    const ingredients = readData('ingredients.json');
    const index = ingredients.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    ingredients.splice(index, 1);
    writeData('ingredients.json', ingredients);
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Error deleting ingredient' });
  }
});

// Clear all ingredients
app.delete('/api/ingredients', (req, res) => {
  try {
    console.log('Clearing all ingredients');
    const filePath = path.join(DATA_DIR, 'ingredients.json');
    fs.writeFileSync(filePath, JSON.stringify([]));
    res.json({ message: 'All ingredients cleared successfully' });
  } catch (error) {
    console.error('Error clearing ingredients:', error);
    res.status(500).json({ error: 'Error clearing ingredients: ' + error.message });
  }
});

// Import ingredients from CSV
app.post('/api/ingredients/import-csv', (req, res) => {
  try {
    console.log('Importing ingredients from CSV');
    const csvData = req.body.csvData;
    
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }
    
    // Log the first 200 characters of the CSV data to help debug
    console.log('CSV data preview:', csvData.substring(0, 200));
    
    const lines = csvData.split('\n');
    
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file must have at least a header row and one data row' });
    }
    
    console.log(`CSV has ${lines.length} lines`);
    console.log('First line:', lines[0]);
    if (lines.length > 1) {
      console.log('Second line:', lines[1]);
    }
    
    // Parse headers (first row)
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers:', headers);
    
    // Find column indices for your specific CSV format
    const nameIndex = headers.findIndex(h => h === 'Item Name');
    const pkgIndex = headers.findIndex(h => h === 'PKG');
    const unitIndex = headers.findIndex(h => h === 'Unit');
    const pricePkgIndex = headers.findIndex(h => h === 'Price/PKG');
    const priceUnitIndex = headers.findIndex(h => h === 'Price/Unit');
    const caloriesIndex = headers.findIndex(h => h === 'Calories/100g');
    const proteinIndex = headers.findIndex(h => h === 'Protein/100g');
    const carbsIndex = headers.findIndex(h => h === 'Carbs/100g');
    const fatIndex = headers.findIndex(h => h === 'Fat/100g');
    
    console.log('Column indices:', {
      nameIndex,
      pkgIndex,
      unitIndex,
      pricePkgIndex,
      priceUnitIndex,
      caloriesIndex,
      proteinIndex,
      carbsIndex,
      fatIndex
    });
    
    if (nameIndex === -1) {
      return res.status(400).json({ error: 'CSV must have an "Item Name" column' });
    }
    
    const importedIngredients = [];
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) {
        console.log(`Skipping empty line ${i}`);
        continue;
      }
      
      console.log(`Processing line ${i}: ${lines[i].substring(0, 50)}...`);
      
      // Split the line by comma, but handle quoted values properly
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      console.log(`Line ${i} has ${values.length} values and ${headers.length} headers`);
      
      // Skip if we don't have enough values
      if (values.length <= nameIndex) {
        console.warn(`Line ${i+1} doesn't have enough values. Skipping.`);
        continue;
      }
      
      // Get the item name
      const name = values[nameIndex];
      if (!name) {
        console.warn(`Line ${i+1} doesn't have a name. Skipping.`);
        continue;
      }
      
      // Determine category based on name (you can customize this logic)
      let category = 'dry';
      if (name.toLowerCase().includes('butter') || 
          name.toLowerCase().includes('oil') || 
          name.toLowerCase().includes('milk') || 
          name.toLowerCase().includes('water')) {
        category = 'wet';
      }
      
      // Process ingredient data according to your specific format
      const processedIngredient = {
        id: Date.now().toString() + i,
        name: name,
        category: category,
        price: priceUnitIndex !== -1 && values.length > priceUnitIndex ? parseFloat(values[priceUnitIndex]) || 0 : 0, // Price in KD per unit
        unit: unitIndex !== -1 && values.length > unitIndex ? values[unitIndex] : 'g',
        packageSize: pkgIndex !== -1 && values.length > pkgIndex ? parseFloat(values[pkgIndex]) || 0 : 0,
        packagePrice: pricePkgIndex !== -1 && values.length > pricePkgIndex ? parseFloat(values[pricePkgIndex]) || 0 : 0,
        nutritionalInfo: {
          calories: caloriesIndex !== -1 && values.length > caloriesIndex ? parseFloat(values[caloriesIndex]) || 0 : 0,
          protein: proteinIndex !== -1 && values.length > proteinIndex ? parseFloat(values[proteinIndex]) || 0 : 0,
          carbs: carbsIndex !== -1 && values.length > carbsIndex ? parseFloat(values[carbsIndex]) || 0 : 0,
          fat: fatIndex !== -1 && values.length > fatIndex ? parseFloat(values[fatIndex]) || 0 : 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Processed ingredient:', processedIngredient);
      importedIngredients.push(processedIngredient);
    }
    
    console.log(`Processed ${importedIngredients.length} ingredients`);
    
    // Save imported ingredients
    const ingredients = readData('ingredients.json');
    ingredients.push(...importedIngredients);
    writeData('ingredients.json', ingredients);
    
    res.json({
      message: `Successfully imported ${importedIngredients.length} ingredients`,
      ingredients: importedIngredients
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Error importing CSV: ' + error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
