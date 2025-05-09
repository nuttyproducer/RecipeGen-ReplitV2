import { Recipe } from '@/types/recipe';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Thai-Inspired Mediterranean Quinoa Bowl',
    ingredients: [
      '1 cup quinoa',
      '2 tablespoons olive oil',
      '1 can coconut milk',
      '2 cups mixed vegetables',
      'Fresh basil and mint',
      'Lemon juice',
      'Fish sauce (optional)'
    ],
    steps: [
      'Cook quinoa according to package instructions',
      'Sauté vegetables in olive oil',
      'Mix coconut milk with herbs and seasonings',
      'Combine all ingredients and serve warm'
    ],
    dish_type: 'Dinner',
    prep_time_min: 30,
    image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    cooking_time: '30 minutes',
    flavor_text: 'A fusion of Mediterranean freshness and Thai aromatics',
    cuisines: ['Thai', 'Mediterranean'],
    dietary_tags: ['Vegetarian', 'Gluten-Free']
  },
  {
    id: '2',
    title: 'Mexican-Japanese Sushi Tacos',
    ingredients: [
      'Sushi rice',
      'Nori sheets',
      'Fresh tuna',
      'Avocado',
      'Lime juice',
      'Wasabi',
      'Chipotle sauce'
    ],
    steps: [
      'Prepare sushi rice',
      'Cut nori sheets into taco shapes',
      'Prepare fish and toppings',
      'Assemble tacos with all ingredients'
    ],
    dish_type: 'Dinner',
    prep_time_min: 45,
    image_url: 'https://images.pexels.com/photos/8951199/pexels-photo-8951199.jpeg',
    cooking_time: '45 minutes',
    flavor_text: 'Where Tokyo meets Mexico City in every bite',
    cuisines: ['Japanese', 'Mexican'],
    dietary_tags: ['Gluten-Free']
  }
];

export const generateMockRecipes = (
  dish_type: string,
  cuisines: string[],
  dietary_tags: string[] = []
): Promise<Recipe[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Filter recipes based on parameters
      const filteredRecipes = mockRecipes.filter(recipe => {
        const matchesDishType = recipe.dish_type.toLowerCase() === dish_type.toLowerCase();
        const matchesCuisine = cuisines.some(cuisine => 
          recipe.cuisines.includes(cuisine)
        );
        const matchesDietary = dietary_tags.length === 0 || 
          dietary_tags.every(tag => recipe.dietary_tags.includes(tag));
        
        return matchesDishType && matchesCuisine && matchesDietary;
      });

      resolve(filteredRecipes.length > 0 ? filteredRecipes : mockRecipes);
    }, 1000);
  });
};