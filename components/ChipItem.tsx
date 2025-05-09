import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { AnimatedPaperChip } from './AnimatedChip';

type ChipItemProps = {
  option: string;
  isSelected: boolean;
  onPress: () => void;
  isDarkMode: boolean;
  testID?: string;
};

export function ChipItem({ option, isSelected, onPress, isDarkMode, testID }: ChipItemProps) {
  const scale = useSharedValue(1);
  const checkmarkWidth = 16; // Width of checkmark icon
  const checkmarkGap = 4; // Gap between checkmark and text
  const horizontalPadding = 12; // Reduced horizontal padding

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    onPress();
  };

  return (
    <View style={styles.chipWrapper}>
      <AnimatedPaperChip
        selected={isSelected}
        onPress={handlePress}
        style={[
        styles.chip,
        isSelected && [
          styles.selectedChip,
          { backgroundColor: isDarkMode ? '#1E4D3B' : '#F0FAF0' }
        ],
        { borderColor: isDarkMode ? '#4A4A4A' : '#E0E0E0' },
        { minWidth: 140 },
        { pointerEvents: 'auto' }
      ]}
      animatedStyle={animatedStyle}
        textStyle={[
          styles.chipText,
          isSelected && [
            styles.selectedChipText,
            { color: isDarkMode ? '#4ADE80' : '#2E8B57' }
          ],
          { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' },
          {
            marginLeft: isSelected ? checkmarkWidth + checkmarkGap : 0,
            paddingHorizontal: horizontalPadding
          }
        ]}
        icon={isSelected ? () => (
          <View style={styles.checkmarkContainer}>
            <Check size={16} color={isDarkMode ? '#4ADE80' : '#2E8B57'} />
          </View>
        ) : undefined}
        showSelectedCheck={false}
        compact
        testID={testID}
      >
        {option}
      </AnimatedPaperChip>
    </View>
  );
}

const styles = StyleSheet.create({
  chipWrapper: {
    minWidth: 140,
    height: 32,
    marginVertical: 4,
    marginHorizontal: 4,
  },
  chip: {
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 0,
    position: 'relative',
  },
  selectedChip: {
    borderColor: '#2E8B57',
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  selectedChipText: {
    fontWeight: '600',
  },
  checkmarkContainer: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
  }
});