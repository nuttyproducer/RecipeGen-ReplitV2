import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { Heart, Clock, Users, ChevronRight } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DietaryTag = 'Vegan' | 'Vegetarian' | 'Halal' | 'Kosher' | 'Gluten-Free';

interface RecipeCardProps {
  title: string;
  image: string;
  cookingTime: string;
  servings: number;
  dietaryTags: DietaryTag[];
  rating?: number;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function RecipeCard({
  title,
  image,
  cookingTime,
  servings,
  dietaryTags,
  rating,
  onPress,
  onFavorite,
  isFavorite = false,
}: RecipeCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const favoriteScale = useSharedValue(1);
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
    backgroundColor: interpolateColor(
      favoriteScale.value,
      [1, 1.2],
      ['transparent', 'rgba(255, 0, 0, 0.1)']
    ),
  }));

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1);
  };

  const handleFavoritePress = () => {
    setLocalFavorite(!localFavorite);
    favoriteScale.value = withSpring(1.2, {}, () => {
      favoriteScale.value = withSpring(1);
    });
    onFavorite?.();
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              { color: star <= rating ? '#FFD700' : '#D3D3D3' }
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Image
        source={image}
        style={styles.image}
        contentFit="cover"
        transition={1000}
      />

      <Animated.View
        style={[styles.favoriteButton, favoriteAnimatedStyle]}
      >
        <Pressable onPress={handleFavoritePress}>
          <Heart
            size={24}
            color={localFavorite ? '#FF0000' : '#666666'}
            fill={localFavorite ? '#FF0000' : 'none'}
          />
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.tagsContainer}>
          {dietaryTags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Clock size={16} color="#666666" />
            <Text style={styles.infoText}>{cookingTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <Users size={16} color="#666666" />
            <Text style={styles.infoText}>{servings} servings</Text>
          </View>
        </View>

        {rating !== undefined && renderStars(rating)}

        <Pressable style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View Recipe</Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  image: {
    width: '100%',
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: '#666666',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 18,
    marginRight: 2,
  },
  viewButton: {
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});