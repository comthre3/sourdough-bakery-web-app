// API Service for Sourdough Bakery Web App
const ApiService = {
  // Current user
  currentUser: JSON.parse(localStorage.getItem('sourdough_current_user') || 'null'),
  
  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  },
  
  // Get current user
  getCurrentUser() {
    return this.currentUser;
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('sourdough_current_user');
    window.location.href = '/index.html';
  },
  
  // Login user
  async login(email, password) {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }
      
      const userData = await response.json();
      localStorage.setItem('sourdough_current_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Recipe methods
  async getRecipes() {
    try {
      const response = await fetch('/api/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },
  
  async getRecipe(id) {
    try {
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching recipe ${id}:`, error);
      return null;
    }
  },
  
  async createRecipe(recipeData) {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      if (!response.ok) {
        throw new Error('Failed to create recipe');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },
  
  async updateRecipe(id, recipeData) {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating recipe ${id}:`, error);
      throw error;
    }
  },
  
  async deleteRecipe(id) {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting recipe ${id}:`, error);
      throw error;
    }
  },
  
  async clearAllRecipes() {
    try {
      const response = await fetch('/api/recipes', {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to clear recipes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error clearing recipes:', error);
      throw error;
    }
  },
  
  async importRecipesFromCSV(csvData) {
    try {
      const response = await fetch('/api/recipes/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import CSV');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  },
  
  // Ingredient methods
  async getIngredients() {
    try {
      const response = await fetch('/api/ingredients');
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
  },
  
  async getIngredient(id) {
    try {
      const response = await fetch(`/api/ingredients/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ingredient');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ingredient ${id}:`, error);
      return null;
    }
  },
  
  async createIngredient(ingredientData) {
    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredientData)
      });
      if (!response.ok) {
        throw new Error('Failed to create ingredient');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  },
  
  async updateIngredient(id, ingredientData) {
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredientData)
      });
      if (!response.ok) {
        throw new Error('Failed to update ingredient');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating ingredient ${id}:`, error);
      throw error;
    }
  },
  
  async deleteIngredient(id) {
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete ingredient');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting ingredient ${id}:`, error);
      throw error;
    }
  },
  
  async clearAllIngredients() {
    try {
      const response = await fetch('/api/ingredients', {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to clear ingredients');
      }
      return await response.json();
    } catch (error) {
      console.error('Error clearing ingredients:', error);
      throw error;
    }
  },
  
  async importIngredientsFromCSV(csvData) {
    try {
      const response = await fetch('/api/ingredients/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import CSV');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }
};
