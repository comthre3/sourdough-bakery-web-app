import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Recipe } from '../types/Recipe';
import { useAuth } from '../context/AuthContext';

// Collection reference
const recipesCollectionRef = collection(db, 'recipes');

// Convert Firestore data to Recipe object
const convertFirestoreDataToRecipe = (doc: any): Recipe => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    category: data.category,
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    mixingTime: data.mixingTime,
    proofingTime: data.proofingTime,
    ingredients: data.ingredients,
    instructions: data.instructions,
    yield: data.yield,
    isActive: data.isActive,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    createdBy: data.createdBy
  };
};

// Get all recipes
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const querySnapshot = await getDocs(recipesCollectionRef);
    return querySnapshot.docs.map(convertFirestoreDataToRecipe);
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

// Get recipes by category
export const getRecipesByCategory = async (category: string): Promise<Recipe[]> => {
  try {
    const q = query(recipesCollectionRef, where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreDataToRecipe);
  } catch (error) {
    console.error('Error getting recipes by category:', error);
    throw error;
  }
};

// Get recipe by ID
export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreDataToRecipe(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

// Add new recipe
export const addRecipe = async (recipe: Recipe): Promise<string> => {
  try {
    const { currentUser } = useAuth();
    
    const recipeToAdd = {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser?.uid || null
    };
    
    const docRef = await addDoc(recipesCollectionRef, recipeToAdd);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

// Update recipe
export const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<void> => {
  try {
    const docRef = doc(db, 'recipes', id);
    
    const recipeToUpdate = {
      ...recipe,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, recipeToUpdate);
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

// Delete recipe
export const deleteRecipe = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'recipes', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// Calculate hydration percentage
export const calculateHydration = (recipe: Recipe) => {
  const totalFlourWeight = recipe.ingredients
    .filter(ingredient => ingredient.isFlour)
    .reduce((sum, ingredient) => sum + ingredient.weight, 0);
    
  const totalLiquidWeight = recipe.ingredients
    .filter(ingredient => ingredient.isLiquid)
    .reduce((sum, ingredient) => sum + ingredient.weight, 0);
    
  const hydrationPercentage = totalFlourWeight > 0 
    ? (totalLiquidWeight / totalFlourWeight) * 100 
    : 0;
    
  return {
    totalFlourWeight,
    totalLiquidWeight,
    hydrationPercentage: Math.round(hydrationPercentage * 10) / 10 // Round to 1 decimal place
  };
};

// Scale recipe
export const scaleRecipe = (recipe: Recipe, scaleFactor: number): Recipe => {
  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    weight: Math.round(ingredient.weight * scaleFactor * 10) / 10 // Round to 1 decimal place
  }));
  
  const scaledYield = {
    quantity: Math.round(recipe.yield.quantity * scaleFactor * 10) / 10, // Round to 1 decimal place
    unit: recipe.yield.unit
  };
  
  return {
    ...recipe,
    ingredients: scaledIngredients,
    yield: scaledYield
  };
};
