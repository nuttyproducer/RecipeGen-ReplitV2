import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

type ButtonProps = {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
};

export function Button({ 
  mode = 'contained', 
  onPress, 
  children, 
  style,
  disabled = false 
}: ButtonProps) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      style={[styles.button, style]}
      labelStyle={styles.label}
      disabled={disabled}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 6,
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});