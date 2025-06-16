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
import { User, RSVP, EventComment } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../stores/authStore';
import { 
  getUserProfile, 
  getUserRecentRSVPs, 
  getUserRecentComments, 
  getUserEventStats 
} from '../../services/userService';
import ProfilePicture from '../../components/common/ProfilePicture';
import { handleError } from '../../utils/errorHandler';

type UserProfileScreenNavigationProp = StackNavigationProp<MainStackParamList>;
type UserProfileScreenRouteProp = RouteProp<MainStackParamList, 'UserProfile'>;

interface UserStats {
  totalRSVPs: number;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  totalComments: number;
  eventsCreated: number;
}

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute<UserProfileScreenRouteProp>();
  const { userId } = route.params;
  const { user: currentUser } = useAuthStore();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentRSVPs, setRecentRSVPs] = useState<RSVP[]>([]);
  const [recentComments, setRecentComments] = useState<EventComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  const loadUserProfile = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Load user profile and stats in parallel
      const [user, stats, rsvps, comments] = await Promise.all([
        getUserProfile(userId),
        getUserEventStats(userId),
        getUserRecentRSVPs(userId, 5),
        getUserRecentComments(userId, 5),
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
      setUserStats(stats);
      setRecentRSVPs(rsvps);
      setRecentComments(comments);
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

  const renderStatsCard = () => {
    if (!userStats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Activity Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.eventsCreated}</Text>
            <Text style={styles.statLabel}>Events Created</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.goingCount}</Text>
            <Text style={styles.statLabel}>Events Attended</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.totalComments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.totalRSVPs}</Text>
            <Text style={styles.statLabel}>Total RSVPs</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => {
    const hasActivity = recentRSVPs.length > 0 || recentComments.length > 0;
    
    if (!hasActivity) {
      return (
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <Text style={styles.noActivityText}>No recent activity</Text>
        </View>
      );
    }

    return (
      <View style={styles.activityCard}>
        <Text style={styles.activityTitle}>Recent Activity</Text>
        
        {recentRSVPs.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.activitySectionTitle}>Recent RSVPs</Text>
            {recentRSVPs.slice(0, 3).map((rsvp) => (
              <View key={rsvp.id} style={styles.activityItem}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(rsvp.status) }]} />
                <Text style={styles.activityText}>
                  {rsvp.status === 'going' ? 'Going to' : 
                   rsvp.status === 'maybe' ? 'Maybe attending' : 'Not going to'} an event
                </Text>
                <Text style={styles.activityDate}>
                  {rsvp.createdAt.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {recentComments.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.activitySectionTitle}>Recent Comments</Text>
            {recentComments.slice(0, 3).map((comment) => (
              <View key={comment.id} style={styles.activityItem}>
                <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.activityText} numberOfLines={2}>
                  Commented: "{comment.content.substring(0, 50)}..."
                </Text>
                <Text style={styles.activityDate}>
                  {comment.createdAt.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'going':
        return '#10b981';
      case 'maybe':
        return '#f59e0b';
      case 'not-going':
        return '#ef4444';
      default:
        return '#6b7280';
    }
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

        {/* Stats */}
        {renderStatsCard()}

        {/* Recent Activity */}
        {renderRecentActivity()}

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
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
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
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  noActivityText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  activitySection: {
    marginBottom: 16,
  },
  activitySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  activityDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default UserProfileScreen; 