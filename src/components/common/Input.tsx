import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'small' | 'medium' | 'large';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: TextStyle;
  required?: boolean;
  showCharacterCount?: boolean;
  characterLimit?: number;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helpText,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  showCharacterCount = false,
  characterLimit,
  value = '',
  multiline = false,
  ...textInputProps
}, ref) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const sizeStyles = {
      small: { marginBottom: 12 },
      medium: { marginBottom: 16 },
      large: { marginBottom: 20 },
    };

    return {
      ...sizeStyles[size],
    };
  };

  const getLabelStyle = (): TextStyle => {
    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    return {
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      ...sizeStyles[size],
    };
  };

  const getInputStyle = (): any => {
    const baseStyle = {
      fontSize: 16,
      color: theme.text,
      borderRadius: 8,
      borderWidth: 1,
    };

    const sizeStyles = {
      small: { 
        padding: 8,
        fontSize: 14,
        minHeight: multiline ? 60 : 32,
      },
      medium: { 
        padding: 12,
        fontSize: 16,
        minHeight: multiline ? 80 : 44,
      },
      large: { 
        padding: 16,
        fontSize: 18,
        minHeight: multiline ? 100 : 52,
      },
    };

    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.surface,
        borderColor: error ? theme.error : theme.border,
      },
      filled: {
        backgroundColor: theme.background,
        borderColor: error ? theme.error : 'transparent',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: error ? theme.error : theme.border,
        borderWidth: 2,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(multiline && { textAlignVertical: 'top' as const }),
      ...(leftIcon && { paddingLeft: sizeStyles[size].padding + 32 }),
      ...(rightIcon && { paddingRight: sizeStyles[size].padding + 32 }),
    };
  };

  const getIconContainerStyle = (position: 'left' | 'right'): ViewStyle => {
    const sizeStyles = {
      small: { padding: 8 },
      medium: { padding: 12 },
      large: { padding: 16 },
    };

    return {
      position: 'absolute',
      top: 0,
      [position]: 0,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      ...sizeStyles[size],
      zIndex: 1,
    };
  };

  const characterCount = typeof value === 'string' ? value.length : 0;

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.error }}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={{ position: 'relative' }}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={getIconContainerStyle('left')}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={theme.textTertiary}
          value={value}
          multiline={multiline}
          maxLength={characterLimit}
          {...textInputProps}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={getIconContainerStyle('right')}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Character Count */}
      {showCharacterCount && characterLimit && (
        <Text style={styles.characterCount}>
          {characterCount}/{characterLimit}
        </Text>
      )}

      {/* Error Message */}
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error}
        </Text>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <Text style={[styles.helpText, { color: theme.textSecondary }]}>
          {helpText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  helpText: {
    fontSize: 14,
    marginTop: 4,
  },
});

Input.displayName = 'Input';

export default Input; 