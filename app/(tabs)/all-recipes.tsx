import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Pressable } from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Filter } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/Button';
import { FilterPanel, FilterOptions } from '@/components/FilterPanel';

type Recipe = {
  id: string;
  title: string;
  description: string;
  cooking_time: string;
  difficulty: string;
  dietary_tags: string[];
  created_at: string;
  is_favorite: boolean;
  creator: {
    username: string;
  };
};

type Profile = {
  subscription_status: 'free' | 'active' | 'cancelled';
  pantry_items: string[];
};

const filterOptions: FilterOptions = {
  dishTypes: [
    'Breakfast', 'Brunch', 'Lunch', 'Dinner',
    'Dessert', 'Snack', 'Appetizer', 'Side Dish'
  ],
  dietaryTags: [
    'Vegan', 'Vegetarian', 'Halal', 'Kosher',
    'Gluten-Free', 'Dairy-Free', 'Nut-Free'
  ],
  cookingTimes: [
    { label: 'Under 30min', value: '30' },
    { label: '30-60min', value: '60' },
    { label: 'Over 60min', value: '61' }
  ],
  sortOptions: [
    { label: 'Newest', value: 'newest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Quick & Easy', value: 'quick' }
  ]
};

export default function AllRecipesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    dishType: null as string | null,
    dietaryTags: [] as string[],
    cookingTime: null as string | null,
    sortBy: 'newest' as string
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecipes();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, pantry_items')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      let query = supabase
        .from('recipes')
        .select(`
          *,
          creator:profiles(username)
        `);

      // Apply filters
      if (activeFilters.dishType) {
        query = query.contains('cuisines', [activeFilters.dishType]);
      }
      
      if (activeFilters.dietaryTags.length > 0) {
        query = query.contains('dietary_tags', activeFilters.dietaryTags);
      }

      // Apply sorting
      switch (activeFilters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          // This would ideally use a rating count or view count
          query = query.order('created_at', { ascending: false });
          break;
        case 'quick':
          query = query.order('cooking_time', { ascending: true });
          break;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRecipes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters: {
    dishType: string | null;
    dietaryTags: string[];
    cookingTime: string | null;
    sortBy: string | null;
  }) => {
    setActiveFilters(filters);
    fetchRecipes();
  };

  const handleFavorite = async (recipeId: string) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const { error: updateError } = await supabase
        .from('recipes')
        .update({ is_favorite: !recipe.is_favorite })
        .eq('id', recipeId);

      if (updateError) throw updateError;

      setRecipes(prev =>
        prev.map(r =>
          r.id === recipeId ? { ...r, is_favorite: !r.is_favorite } : r
        )
      );
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (!user || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (profile?.subscription_status !== 'active') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.subscriptionContainer}>
          <Lock size={48} color={theme.colors.primary} />
          <Text style={[styles.subscriptionTitle, { color: theme.colors.onBackground }]}>
            Upgrade to Access All Recipes
          </Text>
          <Text style={[styles.subscriptionText, { color: theme.colors.onBackground }]}>
            Get unlimited access to our entire recipe collection
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/subscription')}
            style={styles.upgradeButton}
          >
            Upgrade Now
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Discover
        </Text>
        <Button
          mode="outlined"
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
          icon={() => <Filter size={20} color={theme.colors.primary} />}
        >
          Filters
        </Button>
      </View>

      <Searchbar
        placeholder="Search recipes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FilterPanel
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        options={filterOptions}
        onApplyFilters={handleApplyFilters}
        isDarkMode={isDarkMode}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.onBackground }]}>
            No recipes found
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.onBackground }]}>
            Try adjusting your filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard
              title={item.title}
              image="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
              cookingTime={item.cooking_time}
              servings={4}
              dietaryTags={item.dietary_tags}
              onPress={() => router.push(`/recipe/${item.id}`)}
              onFavorite={() => handleFavorite(item.id)}
              isFavorite={item.is_favorite}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    position: 'absolute',
    right: 16,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    padding: 16,
  },
  subscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  subscriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subscriptionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  upgradeButton: {
    width: '100%',
    maxWidth: 300,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
});