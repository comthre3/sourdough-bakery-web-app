// API Service for Sourdough Bakery Web App
const API_URL = '/api';

const ApiService = {
  // Store token in localStorage
  setToken(token)  {
    localStorage.setItem('sourdough_token', token);
  },
  
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('sourdough_token');
  },
  
  // Clear token from localStorage
  clearToken() {
    localStorage.removeItem('sourdough_token');
  },
  
  // Common headers for API requests
  headers() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = this.getToken();
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    return headers;
  },
  
  // Authentication
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: this.headers()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get user');
      }
      
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Ingredients
  async getIngredients() {
    try {
      const response = await fetch(`${API_URL}/ingredients`, {
        method: 'GET',
        headers: this.headers()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get ingredients');
      }
      
      return data;
    } catch (error) {
      console.error('Get ingredients error:', error);
      throw error;
    }
  },
  
  async createIngredient(ingredientData) {
    try {
      const response = await fetch(`${API_URL}/ingredients`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(ingredientData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create ingredient');
      }
      
      return data;
    } catch (error) {
      console.error('Create ingredient error:', error);
      throw error;
    }
  },
  
  async updateIngredient(id, ingredientData) {
    try {
      const response = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(ingredientData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update ingredient');
      }
      
      return data;
    } catch (error) {
      console.error('Update ingredient error:', error);
      throw error;
    }
  },
  
  async deleteIngredient(id) {
    try {
      const response = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'DELETE',
        headers: this.headers()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to delete ingredient');
      }
      
      return data;
    } catch (error) {
      console.error('Delete ingredient error:', error);
      throw error;
    }
  },
  
  async bulkImportIngredients(ingredients) {
    try {
      const response = await fetch(`${API_URL}/ingredients/bulk`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ ingredients })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to import ingredients');
      }
      
      return data;
    } catch (error) {
      console.error('Bulk import ingredients error:', error);
      throw error;
    }
  },
  
  // Recipes
  async getRecipes() {
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'GET',
        headers: this.headers()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get recipes');
      }
      
      return data;
    } catch (error) {
      console.error('Get recipes error:', error);
      throw error;
    }
  },
  
  async getRecipe(id) {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'GET',
        headers: this.headers()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get recipe');
      }
      
      return data;
    } catch (error) {
      console.error('Get recipe error:', error);
      throw error;
    }
  },
  
  async createRecipe(recipeData) {
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(recipeData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create recipe');
      }
      
      return data;
    } catch (error) {
      console.error('Create recipe error:', error);
      throw error;
    }
  },
  
  async updateRecipe(id, recipeData) {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(recipeData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update recipe');
      }
      
      return data;
    } catch (error) {
      console.error('Update recipe error:', error);
      throw error;
    }
  },
  
  async deleteRecipe(id) {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE',
        headers: this.headers()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to delete recipe');
      }
      
      return data;
    } catch (error) {
      console.error('Delete recipe error:', error);
      throw error;
    }
  },
  
  async bulkImportRecipes(recipes) {
    try {
      const response = await fetch(`${API_URL}/recipes/bulk`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ recipes })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to import recipes');
      }
      
      return data;
    } catch (error) {
      console.error('Bulk import recipes error:', error);
      throw error;
    }
  }
  
  // Add similar methods for tasks, starters, and timers
};
