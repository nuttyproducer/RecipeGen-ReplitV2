import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

// Create an animated view component
const AnimatedView = Animated.createAnimatedComponent(View);

// Export the final animated paper chip component
export const AnimatedPaperChip = forwardRef<typeof Chip, any>((props, ref) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100, useNativeDriver: false }),
      withSpring(1, { damping: 15, stiffness: 300, useNativeDriver: false })
    );
    
    if (props.onPress) {
      props.onPress();
    }
  };

  return (
    <AnimatedView style={[{ overflow: 'hidden' }, animatedStyle]}>
      <Chip
        ref={ref}
        {...props}
        onPress={handlePress}
      />
    </AnimatedView>
  );
});

AnimatedPaperChip.displayName = 'AnimatedPaperChip';