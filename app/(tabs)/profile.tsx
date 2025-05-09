import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, TextInput as PaperInput, IconButton } from 'react-native-paper';
import Animated, { withSpring, withTiming, withSequence, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CreditCard as Edit, Save, Plus, X, Check } from 'lucide-react-native';
import { AnimatedPaperChip } from '@/components/AnimatedChip';

const MEDICAL_OPTIONS = ['Low Salt', 'Diabetic-Friendly'];
const LIFESTYLE_OPTIONS = ['Vegan', 'Vegetarian', 'Flexitarian', 'Keto', 'Gluten-Free', 'Nut-Free', 'Dairy-Free'];
const RELIGIOUS_OPTIONS = ['Halal', 'Kosher'];

type Profile = {
  username: string;
  medical_health_preferences: string[];
  lifestyle_dietary_preferences: string[];
  religious_preferences: string[];
  pantry_items: string[];
  metric_system: boolean;
  temperature_unit: '°C' | '°F';
  recipe_count?: number;
};

const DEFAULT_PROFILE: Omit<Profile, 'username'> = {
  medical_health_preferences: [],
  lifestyle_dietary_preferences: [],
  religious_preferences: [],
  pantry_items: [],
  metric_system: true,
  temperature_unit: '°C',
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [profileUpdates, setProfileUpdates] = useState<Partial<Profile> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [newPantryItem, setNewPantryItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (saveSuccess && !hasChanges) {
      scale.value = 1;
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.05, { damping: 15, stiffness: 180 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    }
  }, [saveSuccess, hasChanges]);

  useEffect(() => {
    if (user) {
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
            if (payload.new) {
              setProfileUpdates(payload.new);
            }
          }
        )
        .subscribe();

      fetchProfile();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  // Apply profile updates when they arrive
  useEffect(() => {
    if (profileUpdates) {
      setProfile(prevProfile => ({
        ...prevProfile,
        ...profileUpdates,
      }));
      setOriginalProfile(prevProfile => ({
        ...prevProfile,
        ...profileUpdates,
      }));
      setProfileUpdates(null);
    }
  }, [profileUpdates]);

  useEffect(() => {
    if (profile && originalProfile) {
      const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile);
      setHasChanges(changed);
      if (changed) {
        setSaveSuccess(false);
      }
    }
  }, [profile, originalProfile]);

  const createProfile = async () => {
    try {
      const defaultUsername = `user_${user?.id.slice(0, 8)}`;
      const newProfile = {
        id: user?.id,
        username: defaultUsername,
        ...DEFAULT_PROFILE
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile]);

      if (insertError) throw insertError;

      setProfile({ ...newProfile, username: defaultUsername });
      setOriginalProfile({ ...newProfile, username: defaultUsername });
      setEditedUsername(defaultUsername);
      setIsEditing(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const [profileResponse, recipeCountResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single(),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', user?.id)
      ]);

      if (profileResponse.error) {
        if (profileResponse.error.message.includes('rows returned')) {
          await createProfile();
        } else {
          throw profileResponse.error;
        }
      } else {
        const profileData = {
          ...profileResponse.data,
          recipe_count: recipeCountResponse.count || 0
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
        setEditedUsername(profileResponse.data.username);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const handleUsernameSubmit = async () => {
    if (editedUsername === profile?.username) {
      setIsEditing(false);
      return;
    }

    await updateProfile({ username: editedUsername });
    setIsEditing(false);
  };

  const togglePreference = (type: keyof Profile, value: string) => {
    if (!profile) return;

    const currentPreferences = profile[type] as string[];
    const newPreferences = currentPreferences.includes(value)
      ? currentPreferences.filter(p => p !== value)
      : [...currentPreferences, value];

    setProfile(prev => prev ? { ...prev, [type]: newPreferences } : null);
  };

  const addPantryItem = () => {
    if (!newPantryItem.trim() || !profile) return;

    const newItems = [...profile.pantry_items, newPantryItem.trim()];
    setProfile(prev => prev ? { ...prev, pantry_items: newItems } : null);
    setNewPantryItem('');
  };

  const removePantryItem = (item: string) => {
    if (!profile) return;

    const newItems = profile.pantry_items.filter(i => i !== item);
    setProfile(prev => prev ? { ...prev, pantry_items: newItems } : null);
  };

  const saveAllPreferences = async () => {
    if (!profile) return;

    setSaveLoading(true);
    setError(null);

    try {
      const updates = {
        medical_health_preferences: profile.medical_health_preferences,
        lifestyle_dietary_preferences: profile.lifestyle_dietary_preferences,
        religious_preferences: profile.religious_preferences,
        pantry_items: profile.pantry_items,
        metric_system: profile.metric_system,
        temperature_unit: profile.temperature_unit
      };

      const success = await updateProfile(updates);

      if (success) {
        setSaveSuccess(true);
        setHasChanges(false);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const renderChip = (option: string, isSelected: boolean, onPress: () => void, showClose?: boolean) => (
    <AnimatedPaperChip
      key={option}
      selected={isSelected}
      onPress={onPress}
      onClose={showClose ? () => removePantryItem(option) : undefined}
      style={[
        styles.chip,
        isSelected && [
          styles.selectedChip,
          { backgroundColor: isDarkMode ? '#1E4D3B' : '#F0FAF0' }
        ],
        { borderColor: isDarkMode ? '#4A4A4A' : '#E0E0E0' }
      ]}
      textStyle={[
        styles.chipText,
        isSelected && [
          styles.selectedChipText,
          { color: isDarkMode ? '#4ADE80' : '#2E8B57' }
        ],
        { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }
      ]}
      icon={isSelected ? () => <Check size={16} color={isDarkMode ? '#4ADE80' : '#2E8B57'} /> : undefined}
      showSelectedCheck={false}
    >
      {option}
    </AnimatedPaperChip>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <PaperInput
                value={editedUsername}
                onChangeText={setEditedUsername}
                style={styles.usernameInput}
                right={<PaperInput.Icon icon={() => <Save size={24} />} onPress={handleUsernameSubmit} />}
              />
            </View>
          ) : (
            <View style={styles.welcomeContainer}>
              <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
                Welcome, {profile?.username}
              </Text>
              <IconButton
                icon={() => <Edit size={24} />}
                onPress={() => setIsEditing(true)}
              />
            </View>
          )}
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
            {profile?.recipe_count} {profile?.recipe_count === 1 ? 'Recipe' : 'Recipes'} Created
          </Text>
        </View>

        <Card title="Preferences" content="">
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceRow}>
              <Text style={{ color: theme.colors.onBackground }}>Dark Mode</Text>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
            <View style={styles.preferenceRow}>
              <Text style={{ color: theme.colors.onBackground }}>Metric System</Text>
              <Switch
                value={profile?.metric_system}
                onValueChange={(value) => setProfile(prev => prev ? { ...prev, metric_system: value } : null)}
              />
            </View>
            <View style={styles.preferenceRow}>
              <Text style={{ color: theme.colors.onBackground }}>Temperature Unit</Text>
              <View style={styles.temperatureToggle}>
                <AnimatedPaperChip
                  selected={profile?.temperature_unit === '°C'}
                  onPress={() => setProfile(prev => prev ? { ...prev, temperature_unit: '°C' } : null)}
                >
                  °C
                </AnimatedPaperChip>
                <AnimatedPaperChip
                  selected={profile?.temperature_unit === '°F'}
                  onPress={() => setProfile(prev => prev ? { ...prev, temperature_unit: '°F' } : null)}
                >
                  °F
                </AnimatedPaperChip>
              </View>
            </View>
          </View>
        </Card>

        <Card title="Medical Health Preferences" content="">
          <View style={styles.chipContainer}>
            {MEDICAL_OPTIONS.map((option) => 
              renderChip(
                option,
                profile?.medical_health_preferences.includes(option),
                () => togglePreference('medical_health_preferences', option)
              )
            )}
          </View>
        </Card>

        <Card title="Lifestyle Preferences" content="">
          <View style={styles.chipContainer}>
            {LIFESTYLE_OPTIONS.map((option) =>
              renderChip(
                option,
                profile?.lifestyle_dietary_preferences.includes(option),
                () => togglePreference('lifestyle_dietary_preferences', option)
              )
            )}
          </View>
        </Card>

        <Card title="Religious Preferences" content="">
          <View style={styles.chipContainer}>
            {RELIGIOUS_OPTIONS.map((option) =>
              renderChip(
                option,
                profile?.religious_preferences.includes(option),
                () => togglePreference('religious_preferences', option)
              )
            )}
          </View>
        </Card>

        <Card title="Pantry Items" content="">
          <View style={styles.pantryContainer}>
            <View style={styles.pantryInput}>
              <PaperInput
                value={newPantryItem}
                onChangeText={setNewPantryItem}
                placeholder="Add ingredient"
                right={<PaperInput.Icon icon={() => <Plus size={24} />} onPress={addPantryItem} />}
                onSubmitEditing={addPantryItem}
              />
            </View>
            <View style={styles.chipContainer}>
              {profile?.pantry_items.map((item) =>
                renderChip(item, true, () => {}, true)
              )}
            </View>
          </View>
        </Card>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Button
          mode="contained"
          onPress={saveAllPreferences}
          loading={saveLoading}
          disabled={saveLoading || (!hasChanges && !saveSuccess)}
          style={styles.saveButton}
        >
          {saveSuccess && !hasChanges ? (
            <Animated.View style={[styles.successContainer, animatedStyles]}>
              <Check size={20} color="#fff" style={styles.checkIcon} />
              <Text style={styles.successText}>All preferences updated</Text>
            </Animated.View>
          ) : (
            'Save all preferences'
          )}
        </Button>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  usernameInput: {
    flex: 1,
  },
  preferencesContainer: {
    gap: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temperatureToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  selectedChip: {
    borderColor: '#2E8B57',
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
  },
  selectedChipText: {
    fontWeight: '600',
  },
  pantryContainer: {
    gap: 16,
  },
  pantryInput: {
    flexDirection: 'row',
    gap: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkIcon: {
    marginRight: 4,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});