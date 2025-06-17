import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet
} from 'react-native';
import EventCardSkeleton from '../common/EventCardSkeleton';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { BookClubEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

const AllEventsTab: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuthStore();
  const { 
    events, 
    isLoading, 
    error, 
    loadEvents, 
    clearError,
    subscribeToEvents,
  } = useEventStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
      const unsubscribe = subscribeToEvents();
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadEvents();
    } finally {
      setIsRefreshing(false);
    }
  };

  const navigateToEventDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const EventCard: React.FC<{ event: BookClubEvent }> = ({ event }) => (
    <TouchableOpacity
      onPress={() => navigateToEventDetails(event.id)}
      style={[styles.eventCard]}
      className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden"
    >
      {/* Header Image */}
      {event.headerPhoto ? (
        <Image
          source={{ uri: event.headerPhoto }}
          style={styles.headerImage}
          className="w-full h-48"
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.headerImage, styles.placeholderHeader]} className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 items-center justify-center">
          <Text style={styles.bookEmoji} className="text-6xl">📚</Text>
        </View>
      )}
      
      {/* Event Content */}
      <View style={styles.cardContent} className="p-4">
        {/* Title */}
        <Text style={styles.eventTitle} className="text-xl font-bold text-gray-900 mb-2" numberOfLines={2}>
          {event.title}
        </Text>
        
        {/* Date and Time */}
        <View style={styles.row} className="flex-row items-center mb-2">
          <Text style={styles.emoji} className="text-lg mr-2">📅</Text>
          <Text style={styles.eventDetail} className="text-gray-700 font-medium">
            {formatDate(event.date)} at {formatTime(event.time)}
          </Text>
        </View>
        
        {/* Location */}
        <View style={styles.row} className="flex-row items-center mb-3">
          <Text style={styles.emoji} className="text-lg mr-2">📍</Text>
          <Text style={[styles.eventDetail, styles.flex1]} className="text-gray-700 flex-1" numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        {/* Host Info */}
        <View style={styles.hostRow} className="flex-row items-center justify-between">
          <View style={styles.row} className="flex-row items-center">
            {event.hostProfilePicture ? (
              <Image
                source={{ uri: event.hostProfilePicture }}
                style={styles.hostAvatar}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <View style={[styles.hostAvatar, styles.hostAvatarPlaceholder]} className="w-8 h-8 rounded-full bg-pink-500 items-center justify-center mr-2">
                <Text style={styles.hostInitial} className="text-white font-bold text-sm">
                  {event.hostName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.hostText} className="text-gray-600 text-sm">
              Hosted by {event.hostName}
            </Text>
          </View>
          
          {/* Event Status Indicator */}
          <View style={styles.row} className="flex-row items-center">
            <View style={styles.statusDot} className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <Text style={styles.statusText} className="text-green-600 text-xs font-medium">Active</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState} className="flex-1 items-center justify-center px-8">
      <Text style={styles.emptyEmoji} className="text-8xl mb-4">📚</Text>
      <Text style={styles.emptyTitle} className="text-2xl font-bold text-gray-900 mb-2 text-center">
        No Events Yet
      </Text>
      <Text style={styles.emptySubtitle} className="text-gray-600 text-center mb-8 leading-6">
        Be the first to create an event for the book club! Share reading discussions, meetups, and literary adventures.
      </Text>
      
      <TouchableOpacity
        onPress={navigateToCreateEvent}
        style={styles.createButton}
        className="bg-pink-500 px-8 py-4 rounded-xl"
      >
        <Text style={styles.createButtonText} className="text-white font-bold text-lg">Create First Event</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && events.length === 0) {
    return (
      <View style={styles.container} className="flex-1 bg-gray-50">
        <ScrollView style={styles.scrollView} className="flex-1 px-4 pt-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container} className="flex-1 bg-gray-50">
      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          className="flex-1 px-4 pt-6"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#ec4899']}
              tintColor="#ec4899"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          
          {/* Create Event Button */}
          <TouchableOpacity
            onPress={navigateToCreateEvent}
            style={styles.createEventButton}
            className="bg-pink-500 rounded-xl p-4 items-center mb-8 shadow-sm"
          >
            <Text style={styles.createEventText} className="text-white font-bold text-lg">+ Create New Event</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: 192,
  },
  placeholderHeader: {
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookEmoji: {
    fontSize: 48,
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  eventDetail: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  flex1: {
    flex: 1,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  hostAvatarPlaceholder: {
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hostText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  createEventButton: {
    backgroundColor: '#ec4899',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createEventText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AllEventsTab; 