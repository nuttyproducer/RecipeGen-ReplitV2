import { Recipe } from '@/types/recipe';
import { supabase } from '@/services/supabase';
import { generateRecipeWithDeepSeek } from './deepseek';

export const fetchRecipesFromDeepSeek = async (
  dish_type: string,
  cuisines: string[],
  dietaryTags: string[] = []
): Promise<Recipe[]> => {
  try {
    const recipes = await generateRecipeWithDeepSeek(dish_type, cuisines, dietaryTags);
    
    // Save recipes to database
    for (const recipe of recipes) {
      await saveRecipeToDatabase(recipe);
    }
    
    return recipes;
  } catch (error) {
    console.error('Error generating recipes:', error);
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

    if (error) throw error;
  } catch (err) {
    console.error('Error saving recipe:', err);
    throw err;
  }
};