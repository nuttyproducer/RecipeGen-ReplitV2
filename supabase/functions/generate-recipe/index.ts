import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.ai/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get request body
    const { dish_type, cuisines, dietary_tags } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Missing required Supabase environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get DeepSeek API key from secrets table
    const { data: secretData, error: secretError } = await supabaseClient
      .from('secrets')
      .select('deepseek_api_key')
      .limit(1)
      .single();

    if (secretError || !secretData?.deepseek_api_key) {
      console.error('Secret fetch error:', secretError);
      throw new Error('Failed to fetch DeepSeek API key');
    }

    const prompt = generatePrompt(dish_type, cuisines, dietary_tags);

    console.log('Making request to DeepSeek API...');
    
    // Call DeepSeek API with proper error handling
    const response = await fetch(DEEPSEEK_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretData.deepseek_api_key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef specializing in fusion cuisine. Generate detailed recipes in the exact format requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const recipes = parseRecipeResponse(data);

    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generatePrompt(
  dish_type: string,
  cuisines: string[],
  dietary_tags: string[] = []
): string {
  let prompt = cuisines.length === 1
    ? `Create an authentic ${dish_type} recipe that truly captures the essence of ${cuisines[0]} cuisine.`
    : `Create an innovative ${dish_type} recipe that harmoniously fuses ${cuisines.join(' and ')} cuisines, combining traditional elements from each culinary tradition.`;

  if (dietary_tags.length > 0) {
    prompt += `\nThe recipe must strictly adhere to these dietary requirements: ${dietary_tags.join(', ')}. Ensure all ingredients and preparation methods comply with these restrictions.`;
  }

  prompt += `\nEnsure the recipe is practical for home cooks while maintaining authenticity. Include precise measurements and clear instructions.

Return the response in this exact JSON format:
{
  "recipes": [{
    "title": "A creative and descriptive name that reflects the fusion of cuisines",
    "flavor_text": "A compelling description (2-3 sentences) highlighting the unique flavor combinations, textures, and cultural fusion",
    "ingredients": [
      "Precise ingredient with exact measurement (e.g., '2 tablespoons soy sauce')",
      "Each ingredient should include quantity and any specific notes"
    ],
    "steps": [
      "Detailed step with timing and specific techniques (e.g., 'Sauté onions over medium heat for 5 minutes until translucent')",
      "Each step should be clear and actionable"
    ],
    "cooking_time": "Total time in format: 1 hour 30 minutes",
    "prep_time_min": 45,
    "cuisines": ${JSON.stringify(cuisines)},
    "dietary_tags": ${JSON.stringify(dietary_tags)},
    "dish_type": "${dish_type}"
  }]
}`;

  return prompt;
}

function parseRecipeResponse(data: any): any {
  try {
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const responseContent = data.choices[0].message.content;
    const parsedData = JSON.parse(responseContent);

    if (!parsedData.recipes || !Array.isArray(parsedData.recipes)) {
      throw new Error('Invalid recipe format received');
    }

    return parsedData.recipes.map((recipe: any) => ({
      ...recipe,
      id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      difficulty: 'medium' // Default difficulty
    }));
  } catch (error) {
    console.error('Error parsing DeepSeek response:', error);
    throw new Error('Failed to parse recipe data');
  }
}