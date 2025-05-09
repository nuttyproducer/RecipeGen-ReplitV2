import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput as PaperInput, HelperText } from 'react-native-paper';
import { Video as LucideIcon } from 'lucide-react-native';

type TextInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  rightIcon?: LucideIcon;
  onRightIconPress?: () => void;
};

export function TextInput({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  disabled = false,
  rightIcon: RightIcon,
  onRightIconPress,
}: TextInputProps) {
  return (
    <View style={styles.container}>
      <PaperInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
        disabled={disabled}
        mode="outlined"
        right={RightIcon && (
          <PaperInput.Icon
            icon={() => <RightIcon size={24} />}
            onPress={onRightIconPress}
          />
        )}
      />
      {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
});