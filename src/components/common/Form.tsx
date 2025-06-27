import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface FormProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export interface FormRowProps {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}

export const Form: React.FC<FormProps> = ({ children, style }) => {
  return (
    <View style={[styles.form, style]}>
      {children}
    </View>
  );
};

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  style,
  titleStyle 
}) => {
  const { theme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
  });

  return (
    <View style={[styles.section, style]}>
      {title && (
        <Text style={[dynamicStyles.sectionTitle, titleStyle]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

export const FormRow: React.FC<FormRowProps> = ({ 
  children, 
  gap = 12, 
  style 
}) => {
  return (
    <View style={[styles.row, { gap }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    // Base form container - can be customized per use case
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default Form; 