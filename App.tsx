import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { AuthProvider } from './src/components/providers/AuthProvider';
import { ThemeProvider } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
