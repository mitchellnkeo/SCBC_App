import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createCommonStyles } from '../../styles/commonStyles';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  buttonVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'outline' | 'ghost';
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '📭',
  title,
  subtitle,
  buttonTitle,
  onButtonPress,
  buttonVariant = 'error',
  style,
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  return (
    <View style={[commonStyles.emptyStateCard, style]}>
      <Text style={commonStyles.emptyEmoji}>{emoji}</Text>
      <Text style={commonStyles.emptyTitle}>{title}</Text>
      {subtitle && (
        <Text style={commonStyles.emptySubtitle}>{subtitle}</Text>
      )}
      {buttonTitle && onButtonPress && (
        <View style={commonStyles.emptyButtonContainer}>
          <Button
            title={buttonTitle}
            onPress={onButtonPress}
            variant={buttonVariant}
            size="large"
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

export default EmptyState; 