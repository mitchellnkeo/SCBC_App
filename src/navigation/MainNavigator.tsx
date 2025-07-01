import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import EditEventScreen from '../screens/events/EditEventScreen';
import PendingEventsScreen from '../screens/admin/PendingEventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import { NotificationDemoScreen } from '../screens/NotificationDemoScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import AboutSCBCScreen from '../screens/info/AboutSCBCScreen';
import ContactInfoScreen from '../screens/info/ContactInfoScreen';
import EmailSignupScreen from '../screens/info/EmailSignupScreen';
import FeedbackScreen from '../screens/info/FeedbackScreen';
import FAQScreen from '../screens/info/FAQScreen';
import WhatsAppCommunityScreen from '../screens/info/WhatsAppCommunityScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MonthlyBookScreen from '../screens/books/MonthlyBookScreen';
import EditMonthlyBookScreen from '../screens/admin/EditMonthlyBookScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import { useAuthStore } from '../stores/authStore';

export type MainStackParamList = {
  Events: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  PendingEvents: undefined;
  Profile: undefined;
  Admin: undefined;
  UserManagement: undefined;
  NotificationDemo: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  UserProfile: { userId: string };
  AboutSCBC: undefined;
  ContactInfo: undefined;
  EmailSignup: undefined;
  Feedback: undefined;
  FAQ: undefined;
  WhatsAppCommunity: undefined;
  Settings: undefined;
  MonthlyBook: undefined;
  EditMonthlyBook: { bookId: string };
};

const Stack = createStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'member';
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#f9fafb' }
      }}
      initialRouteName="Events"
    >
      {/* Main Events Screen - This will be the home screen */}
      <Stack.Screen 
        name="Events" 
        component={EventsListScreen}
        options={{
          headerShown: false,
        }}
      />
      
      {/* Event Related Screens */}
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
      
      {/* Profile Related Screens */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false,
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
      
      {/* Admin Screens */}
      {userRole === 'admin' && (
        <>
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen 
            name="PendingEvents" 
            component={PendingEventsScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen 
            name="UserManagement" 
            component={UserManagementScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </>
      )}
      
      {/* Other Screens */}
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
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      
      {/* Info Screens */}
      <Stack.Screen 
        name="AboutSCBC" 
        component={AboutSCBCScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="ContactInfo" 
        component={ContactInfoScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="EmailSignup" 
        component={EmailSignupScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Feedback" 
        component={FeedbackScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="FAQ" 
        component={FAQScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="WhatsAppCommunity" 
        component={WhatsAppCommunityScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      
      {/* Book Screens */}
      <Stack.Screen 
        name="MonthlyBook" 
        component={MonthlyBookScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      
      {/* Admin Book Management */}
      {userRole === 'admin' && (
        <Stack.Screen 
          name="EditMonthlyBook" 
          component={EditMonthlyBookScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator; 