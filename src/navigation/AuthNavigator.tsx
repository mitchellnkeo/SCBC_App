import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AccountRecoveryScreen from '../screens/auth/AccountRecoveryScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  AccountRecovery: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // We'll design custom headers
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 