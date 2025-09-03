import React, { useEffect, ReactNode, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { initialize, isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Starting authentication initialization...');
        
        // Check if we have a stored user first
        const storedUser = await AsyncStorage.getItem('auth-user');
        if (storedUser) {
          console.log('Found stored user, restoring session...');
          const userData = JSON.parse(storedUser);
          // Update the store with stored user data
          useAuthStore.setState({ 
            user: userData, 
            isAuthenticated: true, 
            isLoading: false 
          });
        }
        
        // Initialize Firebase auth (this will override stored data if user is still valid)
        await initialize();
        console.log('Authentication initialization complete');
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear any invalid stored data
        await AsyncStorage.removeItem('auth-user');
        useAuthStore.setState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [initialize]);

  // Handle user state changes and persist to AsyncStorage
  useEffect(() => {
    if (user && isAuthenticated) {
      // Store user when authenticated
      AsyncStorage.setItem('auth-user', JSON.stringify(user)).catch(console.warn);
    } else if (!user && !isAuthenticated) {
      // Remove user when not authenticated
      AsyncStorage.removeItem('auth-user').catch(console.warn);
    }
  }, [user, isAuthenticated]);

  // Show loading screen while initializing
  if (isInitializing || isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          {isInitializing ? 'Initializing app...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}; 