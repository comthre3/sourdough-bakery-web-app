export interface Recipe {
  id?: string;
  name: string;
  description: string;
  category: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  mixingTime: number; // in minutes
  proofingTime: number; // in minutes
  ingredients: Ingredient[];
  instructions: string[];
  yield: {
    quantity: number;
    unit: string;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  weight: number; // in grams
  isFlour: boolean; // to calculate hydration
  isLiquid: boolean; // to calculate hydration
  percentage?: number; // baker's percentage
}

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface RecipeFilter {
  category?: string;
  searchTerm?: string;
  isActive?: boolean;
}

export interface HydrationCalculation {
  totalFlourWeight: number;
  totalLiquidWeight: number;
  hydrationPercentage: number;
}
