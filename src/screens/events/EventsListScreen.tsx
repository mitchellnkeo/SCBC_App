import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import TopNavbar from '../../components/navigation/TopNavbar';
import AllEventsTab from '../../components/events/AllEventsTab';
import MyEventsTab from '../../components/events/MyEventsTab';
import { MainStackParamList } from '../../navigation/MainNavigator';

const Tab = createMaterialTopTabNavigator();

const EventsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-white">
      <TopNavbar />
      
      {/* Create New Event Button */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreateEvent}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Create New Event</Text>
        </TouchableOpacity>
      </View>
      
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
  createButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  createButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
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

export default EventsListScreen; 