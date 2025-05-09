import { Recipe } from '@/types/recipe';
import { supabase } from '@/services/supabase';
import { mockRecipes, generateMockRecipes } from './mockData';

export const fetchRecipesFromDeepSeek = async (
  dish_type: string,
  cuisines: string[],
  dietaryTags: string[] = []
): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-recipe', {
      body: {
        dish_type,
        cuisines,
        dietary_tags: dietaryTags
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Edge Function');
    }

    // Save recipes to database
    for (const recipe of data) {
      await saveRecipeToDatabase(recipe);
    }

    return data;
  } catch (error) {
    console.error('Error generating recipes:', error);
    // Use fallback mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data as fallback');
      return generateMockRecipes(dish_type, cuisines, dietaryTags);
    }
    throw error;
  }
};

const saveRecipeToDatabase = async (recipe: Recipe) => {
  try {
    const { error } = await supabase.from('recipes').insert({
      id: recipe.id,
      title: recipe.title,
      description: recipe.flavor_text,
      cuisines: recipe.cuisines,
      ingredients: { items: recipe.ingredients },
      instructions: { cooking: recipe.steps },
      dietary_tags: recipe.dietary_tags,
      cooking_time: recipe.cooking_time,
      difficulty: 'medium',
      is_favorite: false
    });

    if (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error saving recipe:', err);
    throw err;
  }
};