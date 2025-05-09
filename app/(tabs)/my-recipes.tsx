import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/Button';

type Recipe = {
  id: string;
  title: string;
  description: string;
  cooking_time: string;
  difficulty: string;
  dietary_tags: string[];
  created_at: string;
};

export default function MyRecipesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, [user?.id]);

  const fetchRecipes = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRecipes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (recipeId: string) => {
    // Implement favorite functionality
    console.log('Favorite:', recipeId);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            My Recipes
          </Text>
        </View>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.onBackground }]}>
            You haven't created any recipes yet!
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.onBackground }]}>
            Start by creating your first recipe
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
              dietaryTags={item.dietary_tags as any}
              onPress={() => router.push(`/recipe/${item.id}`)}
              onFavorite={() => handleFavorite(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Button
        mode="contained"
        onPress={() => router.push('/create')}
        style={styles.fab}
      >
        <Plus size={24} color="#fff" />
      </Button>
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
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