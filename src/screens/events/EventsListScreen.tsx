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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { BookClubEvent, CreateEventFormData } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

const EventsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuthStore();
  const { 
    events, 
    isLoading, 
    error, 
    loadEvents, 
    clearError,
    subscribeToEvents,
    createEvent 
  } = useEventStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  useEffect(() => {
    // Only load events if user is authenticated
    if (user) {
      // Load events initially
      loadEvents();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToEvents();
      
      // Cleanup subscription
      return unsubscribe;
    }
  }, [user]); // Add user as dependency

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

  // TEMPORARY: Create test events function
  const createTestEvents = async () => {
    setIsCreatingTest(true);
    try {
      // Create 5 test events
      const testEvents = [
        {
          title: "The Seven Husbands of Evelyn Hugo",
          description: "Join us for an engaging discussion about Taylor Jenkins Reid's captivating novel. We'll explore themes of love, ambition, and the price of fame in Old Hollywood. Bring your favorite quotes and discussion questions!",
          date: new Date(2024, 2, 15), // March 15, 2024
          time: "7:00 PM",
          location: "Wing Luke Museum",
          address: "719 S King St, Seattle, WA 98104",
          maxAttendees: 25,
          headerPhoto: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"
        },
        {
          title: "Author Meet & Greet: Local Poetry",
          description: "Meet acclaimed local poet Sarah Chen as she discusses her latest collection 'Bridges Between Worlds.' Light refreshments will be served, and books will be available for purchase and signing.",
          date: new Date(2024, 2, 22), // March 22, 2024
          time: "6:30 PM",
          location: "Seattle Central Library",
          address: "1000 4th Ave, Seattle, WA 98104",
          maxAttendees: 40,
          headerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
        },
        {
          title: "Poetry Reading & Open Mic Night",
          description: "Share your favorite poems or read your own original work! This inclusive event welcomes readers of all experience levels. We'll start with featured readings, then open the mic for community participation.",
          date: new Date(2024, 2, 29), // March 29, 2024
          time: "7:30 PM",
          location: "Chinatown-International District",
          address: "657 S King St, Seattle, WA 98104",
          maxAttendees: 30,
          headerPhoto: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"
        },
        {
          title: "Book Club Potluck & Game Night",
          description: "Bring a dish to share and join us for literary-themed games and casual conversation. We'll play book trivia, charades with famous authors, and share recommendations for our next reads.",
          date: new Date(2024, 3, 5), // April 5, 2024
          time: "6:00 PM",
          location: "Community Center",
          address: "719 8th Ave S, Seattle, WA 98104",
          maxAttendees: 35,
          headerPhoto: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
        },
        {
          title: "Literary Walking Tour of Seattle",
          description: "Explore Seattle's rich literary history! We'll visit locations featured in local authors' works, discuss the city's influence on literature, and end at a cozy bookshop for coffee and conversation.",
          date: new Date(2024, 3, 12), // April 12, 2024
          time: "2:00 PM",
          location: "Pike Place Market",
          address: "85 Pike St, Seattle, WA 98101",
          maxAttendees: 20,
          headerPhoto: "https://images.unsplash.com/photo-1555116505-38ab61800975?w=800"
        }
      ];

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create each test event
      for (const eventData of testEvents) {
        await createEvent(
          eventData, 
          user.id, 
          user.displayName || 'Test User',
          user.role || 'member', // Pass user role
          user.profilePicture
        );
      }

      Alert.alert('Success', 'Test events created successfully!');
    } catch (error) {
      console.error('Error creating test events:', error);
      Alert.alert('Error', 'Failed to create test events. Please try again.');
    } finally {
      setIsCreatingTest(false);
    }
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
      
      {/* Test Events Button */}
      <TouchableOpacity
        onPress={createTestEvents}
        disabled={isCreatingTest}
        style={[styles.testButton, isCreatingTest && styles.testButtonDisabled]}
        className="bg-purple-500 px-8 py-4 rounded-xl mb-4"
      >
        {isCreatingTest ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.testButtonText} className="text-white font-bold text-lg ml-2">
              Creating Events...
            </Text>
          </View>
        ) : (
          <Text style={styles.testButtonText} className="text-white font-bold text-lg">
            ✨ Create Test Events ✨
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={navigateToCreateEvent}
        style={styles.createButton}
        className="bg-pink-500 px-8 py-4 rounded-xl"
      >
        <Text style={styles.createButtonText} className="text-white font-bold text-lg">Create First Event</Text>
      </TouchableOpacity>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorState} className="flex-1 items-center justify-center px-8">
      <Text style={styles.errorEmoji} className="text-6xl mb-4">😞</Text>
      <Text style={styles.errorTitle} className="text-xl font-bold text-gray-900 mb-2 text-center">
        Something went wrong
      </Text>
      <Text style={styles.errorMessage} className="text-gray-600 text-center mb-6">
        {error}
      </Text>
      <TouchableOpacity
        onPress={() => {
          clearError();
          loadEvents();
        }}
        style={styles.retryButton}
        className="bg-pink-500 px-6 py-3 rounded-lg"
      >
        <Text style={styles.retryButtonText} className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container} className="flex-1 bg-gray-50">
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={styles.header} className="px-6 py-4 bg-white border-b border-gray-100">
        <View style={styles.headerContent} className="flex-row items-center justify-between">
          <View>
            <Text style={styles.headerTitle} className="text-2xl font-bold text-gray-900">Book Club Events</Text>
            <Text style={styles.headerSubtitle} className="text-gray-600 mt-1">
              {events.length > 0 ? `${events.length} upcoming events` : 'No events scheduled'}
            </Text>
            {/* DEBUG: Show user role */}
            {user && (
              <Text className="text-xs text-blue-600 mt-1">
                DEBUG: {user.email} - Role: {user.role} - ID: {user.id.slice(-6)}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            onPress={navigateToCreateEvent}
            style={styles.newButton}
            className="bg-pink-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Text style={styles.newButtonText} className="text-white font-semibold mr-1">+</Text>
            <Text style={styles.newButtonText} className="text-white font-semibold">New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading && events.length === 0 ? (
        <View style={styles.loadingState} className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText} className="text-gray-600 mt-4">Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scrollView}
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#ec4899"
            />
          }
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // gray-100
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // gray-900
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    marginTop: 4,
  },
  newButton: {
    backgroundColor: '#ec4899', // pink-500
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: 192, // h-48
  },
  placeholderHeader: {
    backgroundColor: '#fce7f3', // pink-100
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#111827', // gray-900
    marginBottom: 8,
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
    color: '#374151', // gray-700
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
    backgroundColor: '#ec4899', // pink-500
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitial: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hostText: {
    fontSize: 14,
    color: '#6b7280', // gray-600
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10b981', // green-500
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#059669', // green-600
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280', // gray-600
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // gray-900
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  testButton: {
    backgroundColor: '#8b5cf6', // purple-500
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#d1d5db', // gray-300
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  createButton: {
    backgroundColor: '#ec4899', // pink-500
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827', // gray-900
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ec4899', // pink-500
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EventsListScreen; 