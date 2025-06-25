import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { AuthProvider } from './src/components/providers/AuthProvider';
import { ThemeProvider } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { initializePerformanceOptimizations } from './src/utils/performanceOptimizer';

export default function App() {
  useEffect(() => {
    // Initialize performance optimizations early
    initializePerformanceOptimizations();
  }, []);

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
