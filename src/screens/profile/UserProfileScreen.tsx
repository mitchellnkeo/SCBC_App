import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { User, BookClubEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../stores/authStore';
import { 
  getUserUpcomingEvents,
  getUserPastEvents
} from '../../services';
import { getUserProfile } from '../../services/userService';
import ProfilePicture from '../../components/common/ProfilePicture';
import { handleError } from '../../utils/errorHandler';
import EventCard from '../../components/common/EventCard';

type UserProfileScreenNavigationProp = StackNavigationProp<MainStackParamList>;
type UserProfileScreenRouteProp = RouteProp<MainStackParamList, 'UserProfile'>;



interface UserEvents {
  upcoming: {
    hosting: BookClubEvent[];
    attending: BookClubEvent[];
  };
  past: {
    hosting: BookClubEvent[];
    attending: BookClubEvent[];
  };
}

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute<UserProfileScreenRouteProp>();
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userEvents, setUserEvents] = useState<UserEvents>({
    upcoming: { hosting: [], attending: [] },
    past: { hosting: [], attending: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const isOwnProfile = currentUser?.id === userId;

  const loadUserProfile = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Load user profile and events in parallel
      const [user, upcomingEvents, pastEvents] = await Promise.all([
        getUserProfile(userId),
        getUserUpcomingEvents(userId, 5),
        getUserPastEvents(userId, 5),
      ]);

      if (!user) {
        Alert.alert(
          'User Not Found',
          'This user profile could not be found.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setProfileUser(user);
      setUserEvents({
        upcoming: upcomingEvents,
        past: pastEvents,
      });
    } catch (error) {
      await handleError(error, {
        showAlert: true,
        logError: true,
        autoRetry: false,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const handleRefresh = () => {
    loadUserProfile(true);
  };

  const formatJoinDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };



  const renderEventsSection = () => {
    const currentEvents = userEvents[activeTab];
    const hasHostingEvents = currentEvents.hosting.length > 0;
    const hasAttendingEvents = currentEvents.attending.length > 0;
    const hasAnyEvents = hasHostingEvents || hasAttendingEvents;

    return (
      <View style={styles.eventsCard}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>Events</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
              onPress={() => setActiveTab('upcoming')}
            >
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                Upcoming
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'past' && styles.activeTab]}
              onPress={() => setActiveTab('past')}
            >
              <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                Past
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!hasAnyEvents ? (
          <Text style={styles.noEventsText}>
            {activeTab === 'upcoming' 
              ? 'No upcoming events' 
              : 'No past events'
            }
          </Text>
        ) : (
          <View style={styles.eventsContent}>
            {hasHostingEvents && (
              <View style={styles.eventSection}>
                <Text style={styles.eventSectionTitle}>
                  {activeTab === 'upcoming' ? 'Hosting' : 'Hosted'} ({currentEvents.hosting.length})
                </Text>
                {currentEvents.hosting.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showHost={false}
                    compact={true}
                  />
                ))}
              </View>
            )}

            {hasAttendingEvents && (
              <View style={styles.eventSection}>
                <Text style={styles.eventSectionTitle}>
                  {activeTab === 'upcoming' ? 'Attending' : 'Attended'} ({currentEvents.attending.length})
                </Text>
                {currentEvents.attending.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showHost={true}
                    compact={true}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'My Profile' : 'Profile'}
        </Text>
        {isOwnProfile && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <ProfilePicture
            imageUrl={profileUser.profilePicture}
            displayName={profileUser.displayName}
            size="xlarge"
            showBorder
          />
          <Text style={styles.displayName}>{profileUser.displayName}</Text>
          <Text style={styles.email}>{profileUser.email}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profileUser.role}</Text>
          </View>
          
          <Text style={styles.joinDate}>
            Member since {formatJoinDate(profileUser.createdAt)}
          </Text>
        </View>

        {/* Bio Section */}
        {profileUser.bio && (
          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{profileUser.bio}</Text>
          </View>
        )}

        {/* Interests */}
        {profileUser.hobbies && profileUser.hobbies.length > 0 && (
          <View style={styles.interestsCard}>
            <Text style={styles.interestsTitle}>Hobbies & Interests</Text>
            <View style={styles.tagsContainer}>
              {profileUser.hobbies.map((hobby, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Favorite Books */}
        {profileUser.favoriteBooks && profileUser.favoriteBooks.length > 0 && (
          <View style={styles.interestsCard}>
            <Text style={styles.interestsTitle}>Favorite Books</Text>
            <View style={styles.tagsContainer}>
              {profileUser.favoriteBooks.map((book, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{book}</Text>
                </View>
              ))}
            </View>
          </View>
        )}



        {/* Events Section */}
        {renderEventsSection()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ec4899',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ec4899',
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  joinDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  bioCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  interestsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },

  eventsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ec4899',
  },
  tabText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  noEventsText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  eventsContent: {
    gap: 16,
  },
  eventSection: {
    marginBottom: 16,
  },
  eventSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default UserProfileScreen; 