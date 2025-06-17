import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TopNavbar from '../../components/navigation/TopNavbar';
import AllEventsTab from '../../components/events/AllEventsTab';
import MyEventsTab from '../../components/events/MyEventsTab';

const Tab = createMaterialTopTabNavigator();

const EventsListScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-white">
      <TopNavbar />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#ec4899',
          tabBarInactiveTintColor: '#6b7280',
          tabBarIndicatorStyle: {
            backgroundColor: '#ec4899',
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: 'white',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          },
        }}
      >
        <Tab.Screen 
          name="AllEvents" 
          component={AllEventsTab}
          options={{
            tabBarLabel: 'All Events',
          }}
        />
        <Tab.Screen 
          name="MyEvents" 
          component={MyEventsTab}
          options={{
            tabBarLabel: 'My Events',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default EventsListScreen; 