import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search, Add, Edit, Delete, AccessTime, Restaurant } from '@mui/icons-material';
import { Recipe, RecipeFilter } from '../../types/Recipe';
import useRecipeStore from '../../store/recipeStore';
import { getAllRecipes, getRecipesByCategory } from '../../services/recipeService';

const RecipeList = () => {
  const { 
    recipes, 
    filteredRecipes, 
    loading, 
    error, 
    setRecipes, 
    setFilter, 
    setLoading, 
    setError 
  } = useRecipeStore();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Load recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await getAllRecipes();
        setRecipes(recipesData);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(recipesData.map(recipe => recipe.category))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Failed to load recipes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [setRecipes, setLoading, setError]);
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setFilter({ ...useRecipeStore.getState().filter, searchTerm: value });
  };
  
  // Handle category filter
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedCategory(value);
    setFilter({ ...useRecipeStore.getState().filter, category: value || undefined });
  };
  
  // Calculate time display
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };
  
  // Calculate total time
  const calculateTotalTime = (recipe: Recipe) => {
    return recipe.prepTime + recipe.cookTime + recipe.mixingTime + recipe.proofingTime;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Recipes
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          href="/recipes/new"
        >
          New Recipe
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      ) : filteredRecipes.length === 0 ? (
        <Typography sx={{ my: 2 }}>
          No recipes found. Try adjusting your search or create a new recipe.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {recipe.name}
                  </Typography>
                  <Chip 
                    label={recipe.category} 
                    size="small" 
                    sx={{ mb: 2 }} 
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                    }}
                  >
                    {recipe.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Total: {formatTime(calculateTotalTime(recipe))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Restaurant fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Yield: {recipe.yield.quantity} {recipe.yield.unit}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    href={`/recipes/${recipe.id}`}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    href={`/recipes/${recipe.id}/edit`}
                    startIcon={<Edit />}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default RecipeList;
