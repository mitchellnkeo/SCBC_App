import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventsListScreen from '../screens/events/EventsListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AdminScreen from '../screens/admin/AdminScreen';

export type MainTabParamList = {
  Events: undefined;
  Profile: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  // TODO: Get user role from auth state
  const userRole: 'admin' | 'member' = 'member'; // Properly typed now

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#ec4899', // Using our primary color from tailwind.config
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="Events" 
        component={EventsListScreen}
        options={{
          tabBarLabel: 'Events',
          // TODO: Add icons later
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          // TODO: Add icons later
        }}
      />
      {userRole === 'admin' && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{
            tabBarLabel: 'Admin',
            // TODO: Add icons later
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator; 