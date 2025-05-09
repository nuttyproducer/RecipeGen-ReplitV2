
import { Recipe } from '@/types/recipe';
import { supabase } from '@/services/supabase';
import { generateRecipeWithDeepSeek } from './deepseek';

export const fetchRecipesFromDeepSeek = async (
  dish_type: string,
  cuisines: string[],
  dietaryTags: string[] = []
): Promise<Recipe[]> => {
  try {
    const prompt = generatePrompt(dish_type, cuisines, dietaryTags);
    const recipes = await generateRecipeWithDeepSeek(dish_type, cuisines, dietaryTags);
    
    // Save recipes to database
    for (const recipe of recipes) {
      await saveRecipeToDatabase(recipe);
    }
    
    return recipes;
  } catch (error) {
    console.error('Error generating recipes:', error);
    // Use fallback mock data in development
    if (process.env.NODE_ENV === 'development') {
      return generateMockRecipes(dish_type, cuisines, dietaryTags);
    }
    throw new Error('Failed to generate recipes. Please try again later.');
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

const generatePrompt = (
  dish_type: string,
  cuisines: string[],
  dietary_tags: string[]
): string => {
  let prompt = `Generate two unique ${dish_type} recipes`;

  if (cuisines.length > 0) {
    prompt += ` with a fusion of ${cuisines.join(' and ')} cuisines`;
  }

  if (dietary_tags.length > 0) {
    prompt += `\nMust follow these dietary requirements: ${dietary_tags.join(', ')}`;
  }

  return prompt;
};

// Temporary mock implementation until DeepSeek API is integrated
const generateMockRecipes = (
  dish_type: string,
  cuisines: string[],
  dietary_tags: string[]
): Promise<Recipe[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recipes: Recipe[] = [
        {
          id: `recipe-${Date.now()}-1`,
          title: `${cuisines.join('-')} ${dish_type}`,
          ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
          steps: ['Step 1', 'Step 2', 'Step 3'],
          dish_type: dish_type as any,
          prep_time_min: 30,
          cooking_time: '30 minutes',
          flavor_text: 'A delicious fusion recipe',
          cuisines: cuisines,
          dietary_tags: dietary_tags
        },
        {
          id: `recipe-${Date.now()}-2`,
          title: `Alternative ${cuisines.join('-')} ${dish_type}`,
          ingredients: ['Ingredient A', 'Ingredient B', 'Ingredient C'],
          steps: ['Step A', 'Step B', 'Step C'],
          dish_type: dish_type as any,
          prep_time_min: 45,
          cooking_time: '45 minutes',
          flavor_text: 'Another delicious fusion recipe',
          cuisines: cuisines,
          dietary_tags: dietary_tags
        }
      ];
      resolve(recipes);
    }, 1000);
  });
};
