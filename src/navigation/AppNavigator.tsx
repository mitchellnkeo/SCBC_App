import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// This would normally come from your auth state management
// For now, we'll use a simple boolean to simulate logged in state
const useAuth = () => {
  // TODO: Replace with real auth state from Zustand store
  const isLoggedIn = false; // Back to false for development
  const user = null;
  return { isLoggedIn, user };
};

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 