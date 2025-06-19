import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import TopNavbar from '../../components/navigation/TopNavbar';
import AllEventsTab from '../../components/events/AllEventsTab';
import MyEventsTab from '../../components/events/MyEventsTab';
import PastEventsTab from '../../components/events/PastEventsTab';
import { MainStackParamList } from '../../navigation/MainNavigator';

const Tab = createMaterialTopTabNavigator();

const EventsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { theme } = useTheme();

  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    createButtonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    createButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    createButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <TopNavbar />
      
      {/* Create New Event Button */}
      <View style={dynamicStyles.createButtonContainer}>
        <TouchableOpacity
          style={dynamicStyles.createButton}
          onPress={navigateToCreateEvent}
          activeOpacity={0.8}
        >
          <Text style={dynamicStyles.createButtonText}>+ Create New Event</Text>
        </TouchableOpacity>
      </View>
      
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: theme.primary,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: theme.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          },
          tabBarScrollEnabled: true,
        }}
      >
        <Tab.Screen 
          name="AllEvents" 
          component={AllEventsTab}
          options={{
            tabBarLabel: 'Current/Upcoming',
          }}
        />
        <Tab.Screen 
          name="MyEvents" 
          component={MyEventsTab}
          options={{
            tabBarLabel: 'My Events',
          }}
        />
        <Tab.Screen 
          name="PastEvents" 
          component={PastEventsTab}
          options={{
            tabBarLabel: 'Past Events',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default EventsListScreen; 