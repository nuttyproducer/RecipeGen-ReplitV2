import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Chip, TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Plus, X, Check, Wand as Wand2, Search, ChefHat } from 'lucide-react-native';
import { ChipItem } from '@/components/ChipItem';
import { fetchRecipesFromDeepSeek } from '@/utils/recipeGenerator';
import { Recipe } from '@/types/recipe';
import { Image } from 'expo-image';

const DISH_TYPES = [
  'Breakfast', 'Brunch', 'Soups', 'Stews', 'Lunch', 'Dinner',
  'Side dish', 'Snack', 'Dessert', 'Drinks', 'Cocktails'
];

const CUISINES = [
  'Italian', 'Japanese', 'Mexican', 'Indian', 'French', 'Chinese',
  'Thai', 'Mediterranean', 'American', 'Korean', 'Vietnamese',
  'Spanish', 'Greek', 'Lebanese', 'Brazilian'
];

const MEDICAL_OPTIONS = ['Low Salt', 'Diabetic-Friendly'];
const LIFESTYLE_OPTIONS = ['Vegan', 'Vegetarian', 'Flexitarian', 'Keto', 'Gluten-Free', 'Nut-Free', 'Dairy-Free'];
const RELIGIOUS_OPTIONS = ['Halal', 'Kosher'];

type Profile = {
  medical_health_preferences: string[];
  lifestyle_dietary_preferences: string[];
  religious_preferences: string[];
  pantry_items: string[];
};

const DEFAULT_PROFILE: Profile = {
  medical_health_preferences: [],
  lifestyle_dietary_preferences: [],
  religious_preferences: [],
  pantry_items: []
};

export default function CreateRecipeScreen() {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [profileUpdates, setProfileUpdates] = useState<Partial<Profile> | null>(null);
  const [selectedDishType, setSelectedDishType] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedMedical, setSelectedMedical] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
  const [selectedReligious, setSelectedReligious] = useState<string[]>([]);
  const [selectedPantryItems, setSelectedPantryItems] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useProfilePrefs, setUseProfilePrefs] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'ai' | 'web' | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const channel = supabase
      .channel(`profile_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (!mounted || !payload.new) return;
          
          const updates = {
            medical_health_preferences: payload.new.medical_health_preferences || [],
            lifestyle_dietary_preferences: payload.new.lifestyle_dietary_preferences || [],
            religious_preferences: payload.new.religious_preferences || [],
            pantry_items: payload.new.pantry_items || []
          };

          setProfile(prev => ({
            ...prev,
            ...updates
          }));

          if (useProfilePrefs) {
            setSelectedMedical(updates.medical_health_preferences);
            setSelectedLifestyle(updates.lifestyle_dietary_preferences);
            setSelectedReligious(updates.religious_preferences);
          }
        }
      )
      .subscribe();

    fetchProfile();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, useProfilePrefs]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('medical_health_preferences, lifestyle_dietary_preferences, religious_preferences, pantry_items')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedProfile: Profile = {
        medical_health_preferences: data?.medical_health_preferences || [],
        lifestyle_dietary_preferences: data?.lifestyle_dietary_preferences || [],
        religious_preferences: data?.religious_preferences || [],
        pantry_items: data?.pantry_items || []
      };

      setProfile(updatedProfile);
      
      if (useProfilePrefs) {
        setSelectedMedical(updatedProfile.medical_health_preferences);
        setSelectedLifestyle(updatedProfile.lifestyle_dietary_preferences);
        setSelectedReligious(updatedProfile.religious_preferences);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      setError('Failed to load profile preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDishTypeSelect = (type: string) => {
    setSelectedDishType(selectedDishType === type ? null : type);
  };

  const handleCuisineSelect = (cuisine: string) => {
    setSelectedCuisines(prev => {
      if (prev.includes(cuisine)) {
        return prev.filter(c => c !== cuisine);
      }
      if (prev.length < 2) {
        return [...prev, cuisine];
      }
      return prev;
    });
  };

  const togglePreference = (
    type: 'medical' | 'lifestyle' | 'religious',
    value: string
  ) => {
    const setters = {
      medical: setSelectedMedical,
      lifestyle: setSelectedLifestyle,
      religious: setSelectedReligious
    };

    setters[type](prev => 
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  const togglePantryItem = (item: string) => {
    setSelectedPantryItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const addCustomIngredient = () => {
    if (newIngredient.trim()) {
      setCustomIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeCustomIngredient = (ingredient: string) => {
    setCustomIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const toggleProfilePreferences = () => {
    const newValue = !useProfilePrefs;
    setUseProfilePrefs(newValue);
    
    if (newValue) {
      setSelectedMedical(profile.medical_health_preferences);
      setSelectedLifestyle(profile.lifestyle_dietary_preferences);
      setSelectedReligious(profile.religious_preferences);
    } else {
      setSelectedMedical([]);
      setSelectedLifestyle([]);
      setSelectedReligious([]);
    }
  };

  const canGenerate = () => {
    if (!selectedMethod) return false;
    
    if (selectedMethod === 'ai') {
      return selectedDishType && selectedCuisines.length > 0;
    }
    
    return selectedDishType || selectedCuisines.length > 0 || customIngredients.length > 0;
  };

  const handleGenerate = async () => {
    if (!selectedDishType || selectedCuisines.length === 0) {
      setError('Please select a dish type and at least one cuisine');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedRecipes([]);

    try {
      const dietaryTags = [
        ...selectedMedical,
        ...selectedLifestyle,
        ...selectedReligious
      ];

      const recipes = await fetchRecipesFromDeepSeek(
        selectedDishType,
        selectedCuisines,
        dietaryTags
      );
      
      setGeneratedRecipes(recipes);
    } catch (err: any) {
      setError('Failed to generate recipes. Please try again.');
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipe(recipeId === selectedRecipe ? null : recipeId);
  };

  const renderRecipeCard = (recipe: Recipe) => (
    <Pressable
      key={recipe.id}
      style={[
        styles.recipeCard,
        selectedRecipe === recipe.id && styles.selectedRecipeCard,
        { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
      ]}
      onPress={() => handleRecipeSelect(recipe.id)}
    >
      <Image
        source={recipe.image_url}
        style={styles.recipeImage}
        contentFit="cover"
      />
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.recipeDishType}>
          {recipe.dish_type} • {recipe.prep_time_min} mins
        </Text>
        <View style={styles.ingredientPreview}>
          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText} numberOfLines={1}>
              • {ingredient}
            </Text>
          ))}
          {recipe.ingredients.length > 3 && (
            <Text style={styles.moreIngredients}>
              +{recipe.ingredients.length - 3} more ingredients
            </Text>
          )}
        </View>
        <Button
          mode={selectedRecipe === recipe.id ? "contained" : "outlined"}
          onPress={() => handleRecipeSelect(recipe.id)}
          style={styles.selectButton}
        >
          {selectedRecipe === recipe.id ? "Selected" : "Select"}
        </Button>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Create New Recipe
        </Text>

        <Card title="Choose Recipe Creation Method" content="Select how you want to create your recipe">
          <View style={styles.methodContainer}>
            <Pressable
              style={[
                styles.methodCard,
                selectedMethod === 'ai' && styles.selectedMethodCard,
                { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
              ]}
              onPress={() => setSelectedMethod('ai')}
            >
              <Wand2
                size={32}
                color={selectedMethod === 'ai' ? theme.colors.primary : theme.colors.onBackground}
              />
              <Text
                style={[
                  styles.methodTitle,
                  selectedMethod === 'ai' && { color: theme.colors.primary }
                ]}
              >
                AI Recipe Generator
              </Text>
              <Text style={styles.methodDescription}>
                Let AI create a unique fusion recipe based on your preferences
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.methodCard,
                selectedMethod === 'web' && styles.selectedMethodCard,
                { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }
              ]}
              onPress={() => setSelectedMethod('web')}
            >
              <Search
                size={32}
                color={selectedMethod === 'web' ? theme.colors.primary : theme.colors.onBackground}
              />
              <Text
                style={[
                  styles.methodTitle,
                  selectedMethod === 'web' && { color: theme.colors.primary }
                ]}
              >
                Web Recipe Search
              </Text>
              <Text style={styles.methodDescription}>
                Find existing recipes that match your preferences
              </Text>
            </Pressable>
          </View>
        </Card>

        <Card title="Dish Type" content="Select one type of dish">
          <View style={styles.chipContainer}>
            {DISH_TYPES.map((type) => (
              <ChipItem
                key={type}
                option={type}
                isSelected={selectedDishType === type}
                onPress={() => handleDishTypeSelect(type)}
                isDarkMode={isDarkMode}
                testID={`dish-type-${type}`}
              />
            ))}
          </View>
        </Card>

        <Card title="Cuisine Fusion" content="Select up to 2 cuisines to combine">
          <View style={styles.chipContainer}>
            {CUISINES.map((cuisine) => (
              <ChipItem
                key={cuisine}
                option={cuisine}
                isSelected={selectedCuisines.includes(cuisine)}
                onPress={() => handleCuisineSelect(cuisine)}
                isDarkMode={isDarkMode}
                testID={`cuisine-${cuisine}`}
              />
            ))}
          </View>
        </Card>

        <Button
          onPress={toggleProfilePreferences}
          mode="outlined"
          style={styles.profileButton}
          icon={useProfilePrefs ? () => <Check size={16} /> : undefined}
          testID="use-profile-prefs"
        >
          {useProfilePrefs ? '✓ Using profile preferences' : 'Use profile preferences'}
        </Button>

        <Card title="Medical Health Preferences" content="Toggle preferences from your profile">
          <View style={styles.chipContainer}>
            {MEDICAL_OPTIONS.map((option) => (
              <ChipItem
                key={option}
                option={option}
                isSelected={selectedMedical.includes(option)}
                onPress={() => togglePreference('medical', option)}
                isDarkMode={isDarkMode}
                testID={`medical-pref-${option}`}
              />
            ))}
          </View>
        </Card>

        <Card title="Lifestyle Preferences" content="Toggle preferences from your profile">
          <View style={styles.chipContainer}>
            {LIFESTYLE_OPTIONS.map((option) => (
              <ChipItem
                key={option}
                option={option}
                isSelected={selectedLifestyle.includes(option)}
                onPress={() => togglePreference('lifestyle', option)}
                isDarkMode={isDarkMode}
                testID={`lifestyle-pref-${option}`}
              />
            ))}
          </View>
        </Card>

        <Card title="Religious Preferences" content="Toggle preferences from your profile">
          <View style={styles.chipContainer}>
            {RELIGIOUS_OPTIONS.map((option) => (
              <ChipItem
                key={option}
                option={option}
                isSelected={selectedReligious.includes(option)}
                onPress={() => togglePreference('religious', option)}
                isDarkMode={isDarkMode}
                testID={`religious-pref-${option}`}
              />
            ))}
          </View>
        </Card>

        <Card title="Additional Ingredients" content="Add specific ingredients you'd like to use">
          <View style={styles.ingredientInput}>
            <TextInput
              mode="outlined"
              value={newIngredient}
              onChangeText={setNewIngredient}
              placeholder="Enter an ingredient"
              right={<TextInput.Icon icon={() => <Plus size={24} />} onPress={addCustomIngredient} />}
              onSubmitEditing={addCustomIngredient}
              style={{ backgroundColor: theme.colors.background }}
            />
          </View>
          <View style={styles.chipContainer}>
            {customIngredients.map((ingredient) => (
              <Chip
                key={ingredient}
                onClose={() => removeCustomIngredient(ingredient)}
                style={[styles.chip, { backgroundColor: isDarkMode ? '#1E4D3B' : '#F0FAF0' }]}
                textStyle={{ color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }}
                closeIcon={() => <X size={16} />}
              >
                {ingredient}
              </Chip>
            ))}
          </View>
        </Card>

        <Card title="Pantry Items" content="Select ingredients from your pantry">
          <View style={styles.chipContainer}>
            {profile.pantry_items.map((item) => (
              <ChipItem
                key={item}
                option={item}
                isSelected={selectedPantryItems.includes(item)}
                onPress={() => togglePantryItem(item)}
                isDarkMode={isDarkMode}
                testID={`pantry-item-${item}`}
              />
            ))}
          </View>
        </Card>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleGenerate}
          disabled={!canGenerate() || isGenerating}
          style={styles.generateButton}
          contentStyle={styles.generateButtonContent}
          icon={({ color }) => (
            <View style={styles.generateButtonIconContainer}>
              <ChefHat size={24} color={color} />
            </View>
          )}
        >
          {isGenerating ? 'Generating Recipes...' : (selectedMethod === 'ai' ? 'Generate AI Recipe' : 'Search Recipes')}
        </Button>

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Creating your fusion recipes...</Text>
          </View>
        )}

        {generatedRecipes.length > 0 && (
          <View style={styles.recipesContainer}>
            <Text style={styles.recipesTitle}>Choose Your Recipe</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesScroll}
            >
              {generatedRecipes.map(renderRecipeCard)}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  methodCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedMethodCard: {
    borderColor: '#0891b2',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  methodDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 32,
    backgroundColor: 'transparent',
    borderWidth: 1,
    margin: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  ingredientInput: {
    marginBottom: 16,
  },
  profileButton: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 24,
    marginBottom: 32,
    height: 56,
  },
  generateButtonContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonIconContainer: {
    marginRight: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  recipesContainer: {
    marginTop: 24,
  },
  recipesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  recipesScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  recipeCard: {
    width: 300,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  selectedRecipeCard: {
    borderWidth: 2,
    borderColor: '#0891b2',
  },
  recipeImage: {
    width: '100%',
    height: 160,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDishType: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  ingredientPreview: {
    marginBottom: 16,
  },
  ingredientText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  moreIngredients: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 4,
  },
  selectButton: {
    marginTop: 8,
  },
});