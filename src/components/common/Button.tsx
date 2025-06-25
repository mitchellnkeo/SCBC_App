import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'error' 
  | 'warning'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 24,
      },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? theme.textTertiary : theme.primary,
      },
      secondary: {
        backgroundColor: disabled ? theme.borderLight : theme.surface,
        borderWidth: 1,
        borderColor: disabled ? theme.borderLight : theme.border,
      },
      success: {
        backgroundColor: disabled ? theme.textTertiary : theme.success,
      },
      error: {
        backgroundColor: disabled ? theme.textTertiary : theme.error,
      },
      warning: {
        backgroundColor: disabled ? theme.textTertiary : theme.warning,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.borderLight : theme.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseFontSize = {
      small: 12,
      medium: 14,
      large: 16,
    };

    const textColors: Record<ButtonVariant, string> = {
      primary: 'white',
      secondary: disabled ? theme.textTertiary : theme.text,
      success: 'white',
      error: 'white',
      warning: 'white',
      outline: disabled ? theme.textTertiary : theme.primary,
      ghost: disabled ? theme.textTertiary : theme.primary,
    };

    return {
      fontSize: baseFontSize[size],
      fontWeight: '600',
      color: textColors[variant],
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={variant === 'secondary' || variant === 'outline' || variant === 'ghost' 
              ? theme.primary 
              : 'white'
            } 
            style={{ marginRight: icon || title ? 8 : 0 }}
          />
          {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
        </>
      );
    }

    return (
      <>
        {icon && (
          <Text style={{ marginRight: title ? 6 : 0, fontSize: getTextStyle().fontSize }}>
            {icon}
          </Text>
        )}
        {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Additional helper components for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const ErrorButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="error" />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="success" />
);

export default Button; 