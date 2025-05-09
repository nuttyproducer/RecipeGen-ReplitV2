import { Recipe } from '@/types/recipe';
import { supabase } from '@/services/supabase';

export const fetchRecipesFromDeepSeek = async (
  dish_type: string,
  cuisines: string[],
  dietaryTags: string[] = []
): Promise<Recipe[]> => {
  try {
    console.log('Generating recipe with params:', { dish_type, cuisines, dietaryTags });

    const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl('');
    const baseUrl = publicUrl.split('/storage/v1')[0];
    
    const response = await fetch(`${baseUrl}/functions/v1/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        dish_type,
        cuisines,
        dietary_tags: dietaryTags
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function error response:', errorText);
      throw new Error(`Edge Function error: ${response.status}`);
    }

    const recipes = await response.json();

    if (!Array.isArray(recipes)) {
      console.error('Invalid response format:', recipes);
      throw new Error('Invalid response format from Edge Function');
    }

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

    if (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error saving recipe:', err);
    throw err;
  }
};