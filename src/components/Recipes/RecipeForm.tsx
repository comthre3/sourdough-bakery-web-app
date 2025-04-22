import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { Recipe, Ingredient, HydrationCalculation } from '../../types/Recipe';
import useRecipeStore from '../../store/recipeStore';
import { addRecipe, updateRecipe, getRecipeById, calculateHydration } from '../../services/recipeService';

// Default empty recipe
const emptyRecipe: Recipe = {
  name: '',
  description: '',
  category: '',
  prepTime: 0,
  cookTime: 0,
  mixingTime: 0,
  proofingTime: 0,
  ingredients: [],
  instructions: [''],
  yield: {
    quantity: 1,
    unit: 'loaf'
  },
  isActive: true
};

// Categories for select dropdown
const recipeCategories = [
  'Sourdough Bread',
  'Enriched Bread',
  'Flatbread',
  'Pastry',
  'Dessert',
  'Other'
];

// Yield units for select dropdown
const yieldUnits = [
  'loaf',
  'loaves',
  'roll',
  'rolls',
  'bun',
  'buns',
  'piece',
  'pieces',
  'gram',
  'grams',
  'kg'
];

const RecipeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addRecipe: addRecipeToStore, updateRecipe: updateRecipeInStore } = useRecipeStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydration, setHydration] = useState<HydrationCalculation>({
    totalFlourWeight: 0,
    totalLiquidWeight: 0,
    hydrationPercentage: 0
  });
  
  const isEditMode = Boolean(id);
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Recipe name is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    prepTime: Yup.number().min(0, 'Must be a positive number').required('Prep time is required'),
    cookTime: Yup.number().min(0, 'Must be a positive number').required('Cook time is required'),
    mixingTime: Yup.number().min(0, 'Must be a positive number').required('Mixing time is required'),
    proofingTime: Yup.number().min(0, 'Must be a positive number').required('Proofing time is required'),
    'yield.quantity': Yup.number().min(0.1, 'Must be greater than 0').required('Yield quantity is required'),
    'yield.unit': Yup.string().required('Yield unit is required')
  });
  
  const formik = useFormik({
    initialValues: emptyRecipe,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Filter out empty instructions
        const filteredInstructions = values.instructions.filter(instruction => instruction.trim() !== '');
        
        const recipeData: Recipe = {
          ...values,
          instructions: filteredInstructions
        };
        
        if (isEditMode && id) {
          // Update existing recipe
          await updateRecipe(id, recipeData);
          updateRecipeInStore({ ...recipeData, id });
        } else {
          // Add new recipe
          const newId = await addRecipe(recipeData);
          addRecipeToStore({ ...recipeData, id: newId });
        }
        
        // Navigate back to recipes list
        navigate('/recipes');
      } catch (err) {
        console.error('Error saving recipe:', err);
        setError('Failed to save recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });
  
  // Load recipe data if in edit mode
  useEffect(() => {
    const fetchRecipe = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const recipe = await getRecipeById(id);
          if (recipe) {
            formik.setValues(recipe);
            // Calculate hydration
            setHydration(calculateHydration(recipe));
          } else {
            setError('Recipe not found');
            navigate('/recipes');
          }
        } catch (err) {
          console.error('Error fetching recipe:', err);
          setError('Failed to load recipe data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchRecipe();
  }, [id, isEditMode, navigate]);
  
  // Recalculate hydration when ingredients change
  useEffect(() => {
    const recipe = formik.values;
    setHydration(calculateHydration(recipe));
  }, [formik.values.ingredients]);
  
  // Handle adding a new ingredient
  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: uuidv4(),
      name: '',
      weight: 0,
      isFlour: false,
      isLiquid: false
    };
    
    formik.setFieldValue('ingredients', [...formik.values.ingredients, newIngredient]);
  };
  
  // Handle removing an ingredient
  const handleRemoveIngredient = (id: string) => {
    const updatedIngredients = formik.values.ingredients.filter(
      ingredient => ingredient.id !== id
    );
    formik.setFieldValue('ingredients', updatedIngredients);
  };
  
  // Handle ingredient field change
  const handleIngredientChange = (id: string, field: keyof Ingredient, value: any) => {
    const updatedIngredients = formik.values.ingredients.map(ingredient => {
      if (ingredient.id === id) {
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    
    formik.setFieldValue('ingredients', updatedIngredients);
  };
  
  // Handle adding a new instruction step
  const handleAddInstruction = () => {
    formik.setFieldValue('instructions', [...formik.values.instructions, '']);
  };
  
  // Handle removing an instruction step
  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = [...formik.values.instructions];
    updatedInstructions.splice(index, 1);
    formik.setFieldValue('instructions', updatedInstructions);
  };
  
  // Handle instruction field change
  const handleInstructionChange = (index: number, value: string) => {
    const updatedInstructions = [...formik.values.instructions];
    updatedInstructions[index] = value;
    formik.setFieldValue('instructions', updatedInstructions);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/recipes')}
        sx={{ mb: 3 }}
      >
        Back to Recipes
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit Recipe' : 'New Recipe'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Recipe Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Recipe Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  label="Category"
                >
                  {recipeCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            {/* Timing Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Timing
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="prepTime"
                name="prepTime"
                label="Prep Time (minutes)"
                type="number"
                value={formik.values.prepTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.prepTime && Boolean(formik.errors.prepTime)}
                helperText={formik.touched.prepTime && formik.errors.prepTime}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="cookTime"
                name="cookTime"
                label="Cook Time (minutes)"
                type="number"
                value={formik.values.cookTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cookTime && Boolean(formik.errors.cookTime)}
                helperText={formik.touched.cookTime && formik.errors.cookTime}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="mixingTime"
                name="mixingTime"
                label="Mixing Time (minutes)"
                type="number"
                value={formik.values.mixingTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mixingTime && Boolean(formik.errors.mixingTime)}
                helperText={formik.touched.mixingTime && formik.errors.mixingTime}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="proofingTime"
                name="proofingTime"
                label="Proofing Time (minutes)"
                type="number"
                value={formik.values.proofingTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.proofingTime && Boolean(formik.errors.proofingTime)}
                helperText={formik.touched.proofingTime && formik.errors.proofingTime}
              />
            </Grid>
            
            {/* Yield Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Yield
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="yield.quantity"
                name="yield.quantity"
                label="Quantity"
                type="number"
                value={formik.values.yield.quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched['yield.quantity'] && Boolean(formik.errors['yield.quantity'])}
                helperText={formik.touched['yield.quantity'] && formik.errors['yield.quantity']}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="yield-unit-label">Unit</InputLabel>
                <Select
                  labelId="yield-unit-label"
                  id="yield.unit"
                  name="yield.unit"
                  value={formik.values.yield.unit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched['yield.unit'] && Boolean(formik.errors['yield.unit'])}
                  label="Unit"
                >
                  {yieldUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Ingredients */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Ingredients
                </Typography>
                <Box>
                  <Chip 
                    label={`Hydration: ${hydration.hydrationPercentage}%`} 
                    color="primary" 
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddIngredient}
                  >
                    Add Ingredient
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            {formik.values.ingredients.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </Typography>
              </Grid>
            ) : (
              formik.values.ingredients.map((ingredient, index) => (
                <React.Fragment key={ingredient.id}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Ingredient Name"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="Weight (g)"
                      type="number"
                      value={ingredient.weight}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'weight', Number(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">g</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={ingredient.isFlour ? 'flour' : ingredient.isLiquid ? 'liquid' : 'other'}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleIngredientChange(ingredient.id, 'isFlour', value === 'flour');
                          handleIngredientChange(ingredient.id, 'isLiquid', value === 'liquid');
                        }}
                        label="Type"
                      >
                        <MenuItem value="flour">Flour</MenuItem>
                        <MenuItem value="liquid">Liquid</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={1} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                      aria-label="remove ingredient"
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                  {index < formik.values.ingredients.length - 1 && (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  )}
                </React.Fragment>
              ))
            )}
            
            {/* Instructions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Instructions
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddInstruction}
                >
                  Add Step
                </Button>
              </Box>
            </Grid>
            
            {formik.values.instructions.map((instruction, index) => (
              <Grid item xs={12} key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ mr: 2, mt: 2, minWidth: '30px' }}>
                  <Typography variant="body1" fontWeight="bold">
                    {index + 1}.
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveInstruction(index)}
                  aria-label="remove step"
                  sx={{ ml: 1, mt: 1 }}
                >
                  <Delete />
                </IconButton>
              </Grid>
            ))}
            
            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                size="large"
              >
                {loading ? 'Saving...' : 'Save Recipe'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default RecipeForm;
