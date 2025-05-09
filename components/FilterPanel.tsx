import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Portal, Modal, IconButton } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { ChipItem } from '@/components/ChipItem';

export type FilterOptions = {
  dishTypes: string[];
  dietaryTags: string[];
  cookingTimes: Array<{ label: string; value: string }>;
  sortOptions: Array<{ label: string; value: string }>;
};

type FilterPanelProps = {
  visible: boolean;
  onDismiss: () => void;
  options: FilterOptions;
  onApplyFilters: (filters: {
    dishType: string | null;
    dietaryTags: string[];
    cookingTime: string | null;
    sortBy: string | null;
  }) => void;
  isDarkMode: boolean;
};

export function FilterPanel({
  visible,
  onDismiss,
  options,
  onApplyFilters,
  isDarkMode,
}: FilterPanelProps) {
  const [selectedDishType, setSelectedDishType] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>('relevance');

  const slideAnim = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(visible ? 0 : 400, {
          damping: 15,
          stiffness: 90,
          useNativeDriver: false
        }),
      },
    ],
    opacity: withTiming(visible ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }),
  }));

  const toggleDishType = (type: string) => {
    setSelectedDishType(selectedDishType === type ? null : type);
  };

  const toggleDietary = (preference: string) => {
    setSelectedDietary(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTime(selectedTime === time ? null : time);
  };

  const handleApply = () => {
    onApplyFilters({
      dishType: selectedDishType,
      dietaryTags: selectedDietary,
      cookingTime: selectedTime,
      sortBy: selectedSort,
    });
    onDismiss();
  };

  const handleReset = () => {
    setSelectedDishType(null);
    setSelectedDietary([]);
    setSelectedTime(null);
    setSelectedSort('relevance');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedDishType) count++;
    count += selectedDietary.length;
    if (selectedTime) count++;
    if (selectedSort && selectedSort !== 'relevance') count++;
    return count;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }
        ]}
      >
        <Animated.View style={[styles.content, slideAnim]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text
                style={[
                  styles.title,
                  { color: isDarkMode ? '#ffffff' : '#000000' }
                ]}
              >
                Filter Recipes
              </Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterCount}>
                  <Text style={styles.filterCountText}>
                    {getActiveFiltersCount()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <Button
                mode="text"
                onPress={handleReset}
                style={styles.resetButton}
                disabled={getActiveFiltersCount() === 0}
              >
                Reset
              </Button>
              <IconButton
                icon={() => <X size={24} />}
                onPress={onDismiss}
                style={styles.closeButton}
              />
            </View>
          </View>

          <ScrollView style={styles.scrollContent}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Dish Type
            </Text>
            <View style={styles.chipContainer}>
              {options.dishTypes.map((type) => (
                <ChipItem
                  key={type}
                  option={type}
                  isSelected={selectedDishType === type}
                  onPress={() => toggleDishType(type)}
                  isDarkMode={isDarkMode}
                  testID={`filter-dish-${type}`}
                />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Dietary Preferences
            </Text>
            <View style={styles.chipContainer}>
              {options.dietaryTags.map((tag) => (
                <ChipItem
                  key={tag}
                  option={tag}
                  isSelected={selectedDietary.includes(tag)}
                  onPress={() => toggleDietary(tag)}
                  isDarkMode={isDarkMode}
                  testID={`filter-dietary-${tag}`}
                />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Cooking Time
            </Text>
            <View style={styles.chipContainer}>
              {options.cookingTimes.map((time) => (
                <ChipItem
                  key={time.value}
                  option={time.label}
                  isSelected={selectedTime === time.value}
                  onPress={() => toggleTime(time.value)}
                  isDarkMode={isDarkMode}
                  testID={`filter-time-${time.value}`}
                />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Sort By
            </Text>
            <View style={styles.chipContainer}>
              {options.sortOptions.map((option) => (
                <ChipItem
                  key={option.value}
                  option={option.label}
                  isSelected={selectedSort === option.value}
                  onPress={() => setSelectedSort(option.value)}
                  isDarkMode={isDarkMode}
                  testID={`filter-sort-${option.value}`}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleApply}
              style={styles.applyButton}
            >
              Apply Filters
            </Button>
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#999',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterCount: {
    backgroundColor: '#0891b2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  filterCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    marginRight: 8,
  },
  closeButton: {
    margin: 0,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  applyButton: {
    marginBottom: 0,
  },
});