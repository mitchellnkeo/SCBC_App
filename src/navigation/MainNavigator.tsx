import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import EditEventScreen from '../screens/events/EditEventScreen';
import PendingEventsScreen from '../screens/admin/PendingEventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import { NotificationDemoScreen } from '../screens/NotificationDemoScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import { useAuthStore } from '../stores/authStore';

export type MainTabParamList = {
  Events: undefined;
  Profile: undefined;
  Admin: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  PendingEvents: undefined;
  NotificationDemo: undefined;
  EditProfile: undefined;
  UserProfile: { userId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'member';

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

const MainNavigator: React.FC = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'member';
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditEvent" 
        component={EditEventScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      {userRole === 'admin' && (
        <Stack.Screen 
          name="PendingEvents" 
          component={PendingEventsScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      )}
      <Stack.Screen 
        name="NotificationDemo" 
        component={NotificationDemoScreen}
        options={{
          headerShown: true,
          title: 'Push Notifications',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator; 