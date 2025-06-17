import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';

export interface Theme {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // UI colors
  primary: string;
  primaryLight: string;
  border: string;
  borderLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Special colors
  shadow: string;
  overlay: string;
}

const lightTheme: Theme = {
  // Background colors
  background: '#f9fafb',      // gray-50
  surface: '#ffffff',         // white
  card: '#ffffff',           // white
  
  // Text colors
  text: '#1f2937',           // gray-900
  textSecondary: '#374151',   // gray-700
  textTertiary: '#6b7280',    // gray-600
  
  // UI colors
  primary: '#ec4899',         // pink-500
  primaryLight: '#fdf2f8',    // pink-50
  border: '#e5e7eb',         // gray-200
  borderLight: '#f3f4f6',    // gray-100
  
  // Status colors
  success: '#10b981',        // emerald-500
  warning: '#f59e0b',        // amber-500
  error: '#ef4444',          // red-500
  
  // Special colors
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkTheme: Theme = {
  // Background colors
  background: '#111827',      // gray-900
  surface: '#1f2937',        // gray-800
  card: '#374151',           // gray-700
  
  // Text colors
  text: '#f9fafb',           // gray-50
  textSecondary: '#e5e7eb',   // gray-200
  textTertiary: '#9ca3af',    // gray-400
  
  // UI colors
  primary: '#ec4899',         // pink-500 (same as light)
  primaryLight: '#831843',    // pink-900
  border: '#4b5563',         // gray-600
  borderLight: '#374151',    // gray-700
  
  // Status colors
  success: '#10b981',        // emerald-500
  warning: '#f59e0b',        // amber-500
  error: '#ef4444',          // red-500
  
  // Special colors
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let shouldUseDark = false;

    switch (settings.theme) {
      case 'dark':
        shouldUseDark = true;
        break;
      case 'light':
        shouldUseDark = false;
        break;
      case 'system':
        shouldUseDark = systemColorScheme === 'dark';
        break;
    }

    setIsDark(shouldUseDark);
    setCurrentTheme(shouldUseDark ? darkTheme : lightTheme);
  }, [settings.theme, systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}; 