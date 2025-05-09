import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, ActivityIndicator, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { RecipeCard } from '@/components/RecipeCard';

type Recipe = {
  id: string;
  title: string;
  description: string;
  cooking_time: string;
  difficulty: string;
  dietary_tags: string[];
  created_at: string;
  is_favorite: boolean;
};

export default function FavoritesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, [user?.id, showFavoritesOnly]);

  const fetchRecipes = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (showFavoritesOnly) {
        query = query.eq('is_favorite', true);
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

  const toggleFavorite = async (recipeId: string) => {
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

      // Refetch if we're showing favorites only and we just unfavorited a recipe
      if (showFavoritesOnly && recipe.is_favorite) {
        fetchRecipes();
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleWrapper}>
            <View style={styles.titleContainer}>
              <Heart size={24} color={theme.colors.primary} fill={theme.colors.primary} />
              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                Favorite Recipes
              </Text>
            </View>
          </View>
          <View style={styles.filterContainer}>
            <Text style={{ color: theme.colors.onBackground }}>Show Favorites Only</Text>
            <Switch
              value={showFavoritesOnly}
              onValueChange={setShowFavoritesOnly}
              color={theme.colors.primary}
            />
          </View>
        </View>

        {error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color={theme.colors.primary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.onBackground }]}>
              No favorite recipes yet!
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.onBackground }]}>
              Start adding recipes to your favorites
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
                onFavorite={() => toggleFavorite(item.id)}
                isFavorite={item.is_favorite}
              />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    gap: 16,
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  list: {
    padding: 16,
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
    marginTop: 16,
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