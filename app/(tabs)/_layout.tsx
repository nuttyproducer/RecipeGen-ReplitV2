import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Chrome as Home, User, CirclePlus as PlusCircle, Book, Heart, Search } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#0891b2',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#6b7280' : '#9ca3af',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="all-recipes"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-recipes"
        options={{
          title: 'My Recipes',
          tabBarIcon: ({ color, size }) => <Book size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}