import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'flat' | 'elevated' | 'outlined';
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle | ViewStyle[];
  margin?: boolean;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  size = 'medium',
  variant = 'default',
  style,
  contentStyle,
  margin = true,
  padding = true,
  ...props
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          borderRadius: 8,
          padding: padding ? 12 : 0,
          marginBottom: margin ? 8 : 0,
        };
      case 'medium':
        return {
          borderRadius: 12,
          padding: padding ? 16 : 0,
          marginBottom: margin ? 12 : 0,
        };
      case 'large':
        return {
          borderRadius: 16,
          padding: padding ? 20 : 0,
          marginBottom: margin ? 16 : 0,
        };
      case 'xlarge':
        return {
          borderRadius: 16,
          padding: padding ? 24 : 0,
          marginBottom: margin ? 20 : 0,
        };
      default:
        return {
          borderRadius: 12,
          padding: padding ? 16 : 0,
          marginBottom: margin ? 12 : 0,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case 'elevated':
        return {
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.border,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };

  const cardStyles = {
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  return (
    <View style={[cardStyles, style]} {...props}>
      {contentStyle ? (
        <View style={contentStyle}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
};

// Specialized card variants for common use cases
export const EventCard: React.FC<Omit<CardProps, 'size' | 'variant'> & { compact?: boolean }> = ({
  compact = false,
  ...props
}) => (
  <Card
    size={compact ? 'small' : 'medium'}
    variant="default"
    {...props}
  />
);

export const ProfileCard: React.FC<Omit<CardProps, 'size' | 'variant'>> = (props) => (
  <Card size="large" variant="default" {...props} />
);

export const InfoCard: React.FC<Omit<CardProps, 'size' | 'variant'>> = (props) => (
  <Card size="xlarge" variant="default" {...props} />
);

export const ListCard: React.FC<Omit<CardProps, 'size' | 'variant'>> = (props) => (
  <Card size="small" variant="flat" {...props} />
);

export default Card; 