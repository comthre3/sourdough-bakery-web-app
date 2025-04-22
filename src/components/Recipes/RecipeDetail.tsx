import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  AccessTime, 
  Restaurant, 
  Edit, 
  Delete, 
  ArrowBack,
  Timer,
  Opacity,
  CheckCircle
} from '@mui/icons-material';
import useRecipeStore from '../../store/recipeStore';
import { getRecipeById, deleteRecipe, calculateHydration } from '../../services/recipeService';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentRecipe, deleteRecipe: deleteRecipeFromStore } = useRecipeStore();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydration, setHydration] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const recipeData = await getRecipeById(id);
        
        if (recipeData) {
          setRecipe(recipeData);
          setCurrentRecipe(recipeData);
          setHydration(calculateHydration(recipeData));
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
    };
    
    fetchRecipe();
  }, [id, navigate, setCurrentRecipe]);
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await deleteRecipe(id);
      deleteRecipeFromStore(id);
      navigate('/recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe');
      setLoading(false);
    }
  };
  
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
  
  const calculateTotalTime = () => {
    if (!recipe) return 0;
    return recipe.prepTime + recipe.cookTime + recipe.mixingTime + recipe.proofingTime;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!recipe) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Recipe not found</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/recipes')}
        sx={{ mb: 3 }}
      >
        Back to Recipes
      </Button>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {recipe.name}
            </Typography>
            <Chip 
              label={recipe.category} 
              color="primary" 
              sx={{ mb: 2 }} 
            />
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Edit />}
              onClick={() => navigate(`/recipes/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" paragraph>
          {recipe.description}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Total Time: {formatTime(calculateTotalTime())}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Restaurant sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Yield: {recipe.yield.quantity} {recipe.yield.unit}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Opacity sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                Hydration: {hydration?.hydrationPercentage}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Timing
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Timer fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Prep Time" 
                  secondary={formatTime(recipe.prepTime)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Timer fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mixing Time" 
                  secondary={formatTime(recipe.mixingTime)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Timer fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Proofing Time" 
                  secondary={formatTime(recipe.proofingTime)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Timer fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Cook Time" 
                  secondary={formatTime(recipe.cookTime)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTime fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Total Time" 
                  secondary={formatTime(calculateTotalTime())} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                  secondaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ingredient
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Weight
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Type
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 1 }} />
            
            {recipe.ingredients.map((ingredient: any) => (
              <Grid container spacing={2} key={ingredient.id} sx={{ py: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {ingredient.name}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2">
                    {ingredient.weight}g
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Chip 
                    size="small" 
                    label={ingredient.isFlour ? 'Flour' : ingredient.isLiquid ? 'Liquid' : 'Other'} 
                    color={ingredient.isFlour ? 'primary' : ingredient.isLiquid ? 'info' : 'default'}
                  />
                </Grid>
              </Grid>
            ))}
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Flour: {hydration?.totalFlourWeight}g
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Liquid: {hydration?.totalLiquidWeight}g
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" fontWeight="bold">
                    Hydration: {hydration?.hydrationPercentage}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {recipe.instructions.map((instruction: string, index: number) => (
                <ListItem key={index} alignItems="flex-start" sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Step ${index + 1}`}
                    secondary={instruction}
                    primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecipeDetail;
