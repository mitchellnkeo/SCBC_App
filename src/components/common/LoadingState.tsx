import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createCommonStyles } from '../../styles/commonStyles';

interface LoadingStateProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  text = 'Loading...',
  size = 'large',
  color,
  style,
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  return (
    <View style={[commonStyles.loadingContainer, style]}>
      <ActivityIndicator 
        size={size} 
        color={color || theme.primary} 
      />
      {text && (
        <Text style={commonStyles.loadingText}>{text}</Text>
      )}
    </View>
  );
};

export default LoadingState; 