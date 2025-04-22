import { create } from 'zustand';
import { Recipe, RecipeFilter } from '../types/Recipe';

interface RecipeState {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  currentRecipe: Recipe | null;
  filter: RecipeFilter;
  loading: boolean;
  error: string | null;
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  setFilter: (filter: RecipeFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
}

const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  filteredRecipes: [],
  currentRecipe: null,
  filter: {},
  loading: false,
  error: null,
  
  setRecipes: (recipes) => {
    set((state) => {
      const filteredRecipes = filterRecipes(recipes, state.filter);
      return { recipes, filteredRecipes };
    });
  },
  
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  
  setFilter: (filter) => {
    set((state) => {
      const filteredRecipes = filterRecipes(state.recipes, filter);
      return { filter, filteredRecipes };
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  addRecipe: (recipe) => {
    set((state) => {
      const updatedRecipes = [...state.recipes, recipe];
      const filteredRecipes = filterRecipes(updatedRecipes, state.filter);
      return { recipes: updatedRecipes, filteredRecipes };
    });
  },
  
  updateRecipe: (recipe) => {
    set((state) => {
      const updatedRecipes = state.recipes.map((r) => 
        r.id === recipe.id ? recipe : r
      );
      const filteredRecipes = filterRecipes(updatedRecipes, state.filter);
      return { recipes: updatedRecipes, filteredRecipes };
    });
  },
  
  deleteRecipe: (recipeId) => {
    set((state) => {
      const updatedRecipes = state.recipes.filter((r) => r.id !== recipeId);
      const filteredRecipes = filterRecipes(updatedRecipes, state.filter);
      return { recipes: updatedRecipes, filteredRecipes };
    });
  },
}));

// Helper function to filter recipes based on filter criteria
const filterRecipes = (recipes: Recipe[], filter: RecipeFilter): Recipe[] => {
  return recipes.filter((recipe) => {
    // Filter by category
    if (filter.category && recipe.category !== filter.category) {
      return false;
    }
    
    // Filter by active status
    if (filter.isActive !== undefined && recipe.isActive !== filter.isActive) {
      return false;
    }
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchTermLower = filter.searchTerm.toLowerCase();
      const nameMatch = recipe.name.toLowerCase().includes(searchTermLower);
      const descriptionMatch = recipe.description.toLowerCase().includes(searchTermLower);
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }
    
    return true;
  });
};

export default useRecipeStore;
