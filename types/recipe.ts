import { Database } from './supabase';

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  dish_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  prep_time_min: number;
  image_url?: string;
  cooking_time: string;
  flavor_text: string;
  cuisines: string[];
  dietary_tags: string[];
}

// Type for recipe data from the database
export type DatabaseRecipe = Database['public']['Tables']['recipes']['Row'];

// Converter function to transform database recipe to frontend recipe
export function convertDatabaseRecipe(dbRecipe: DatabaseRecipe): Recipe {
  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    ingredients: Object.values(dbRecipe.ingredients as any).flat(),
    steps: (dbRecipe.instructions as any).cooking,
    dish_type: dbRecipe.cuisines[0] as Recipe['dish_type'],
    prep_time_min: parseInt(dbRecipe.cooking_time.split(':')[1], 10),
    image_url: undefined, // Add image URL when available
    cooking_time: dbRecipe.cooking_time,
    flavor_text: dbRecipe.description || 'A delightful fusion of flavors and textures',
    cuisines: dbRecipe.cuisines,
    dietary_tags: dbRecipe.dietary_tags || []
  };
}