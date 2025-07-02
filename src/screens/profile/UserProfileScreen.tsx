import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import { useTheme } from '../../contexts/ThemeContext';
import TopNavbar from '../../components/navigation/TopNavbar';
import { 
  getUserWebUrl, 
  getUserAppUrl, 
  getDisplayUsername,
  type SocialPlatform 
} from '../../utils/socialMediaUtils';
import SocialIcon from '../../components/common/SocialIcon';
import FriendRequestButton from '../../components/friends/FriendRequestButton';
import ProfileCommentWall from '../../components/profile/ProfileCommentWall';
import ReportButton from '../../components/common/ReportButton';

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
  const { theme } = useTheme();

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

  const handleSocialLinkPress = async (username: string, platform: SocialPlatform) => {
    try {
      // First try to open the app (mobile deep link)
      const appUrl = getUserAppUrl(username, platform);
      if (appUrl) {
        const canOpenApp = await Linking.canOpenURL(appUrl);
        if (canOpenApp) {
          await Linking.openURL(appUrl);
          return;
        }
      }

      // Fall back to web URL
      const webUrl = getUserWebUrl(username, platform);
      if (webUrl) {
        const canOpenWeb = await Linking.canOpenURL(webUrl);
        if (canOpenWeb) {
          await Linking.openURL(webUrl);
          return;
        }
      }

      // If both fail, show error
      Alert.alert(
        'Cannot Open Link',
        `Unable to open ${platform} profile. Please check the username.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to open ${platform} profile.`,
        [{ text: 'OK' }]
      );
    }
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

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavbar
          title="Profile"
          variant="back"
          showMenu={false}
          showProfile={false}
          onBackPress={() => navigation.goBack()}
          backButtonText="← Back"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavbar
          title="Profile"
          variant="back"
          showMenu={false}
          showProfile={false}
          onBackPress={() => navigation.goBack()}
          backButtonText="← Back"
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar
        title={isOwnProfile ? 'My Profile' : 'Profile'}
        variant="back"
        showMenu={false}
        showProfile={false}
        onBackPress={() => navigation.goBack()}
        backButtonText="← Back"
        rightAction={isOwnProfile ? {
          text: 'Edit',
          onPress: () => navigation.navigate('EditProfile')
        } : undefined}
      />

      <KeyboardAwareScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={0}
        extraScrollHeight={20}
        resetScrollToCoords={undefined}
        enableResetScrollToCoords={false}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
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

          {/* Friend Request and Report Buttons */}
          <View style={styles.profileActions}>
            <FriendRequestButton
              targetUserId={profileUser.id}
              targetUserName={profileUser.displayName}
              targetUserProfilePicture={profileUser.profilePicture}
              style={styles.friendButton}
            />
            
            {/* Report Profile Button for other users */}
            {!isOwnProfile && (
              <ReportButton
                contentType="profile"
                contentId={profileUser.id}
                contentOwnerId={profileUser.id}
                contentOwnerName={profileUser.displayName}
                contentPreview={`Profile: ${profileUser.displayName} - ${profileUser.bio?.substring(0, 100) || 'User profile'}`}
                variant="text"
                size="small"
              />
            )}
          </View>

          {/* Social Media Links */}
          {profileUser.socialLinks && Object.values(profileUser.socialLinks).some(link => link) && (
            <View style={styles.socialLinksSection}>
              <Text style={styles.sectionTitle}>Connect</Text>
              <View style={styles.socialLinksContainer}>
                {profileUser.socialLinks.instagram && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profileUser.socialLinks!.instagram!, 'instagram')}
                  >
                    <View style={styles.socialLinkContent}>
                      <SocialIcon platform="instagram" size={14} />
                      <Text style={styles.socialLinkText}>
                        {getDisplayUsername(profileUser.socialLinks!.instagram!, 'instagram')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {profileUser.socialLinks.x && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profileUser.socialLinks!.x!, 'x')}
                  >
                    <View style={styles.socialLinkContent}>
                      <SocialIcon platform="x" size={14} />
                      <Text style={styles.socialLinkText}>
                        {getDisplayUsername(profileUser.socialLinks!.x!, 'x')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {profileUser.socialLinks.linkedin && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profileUser.socialLinks!.linkedin!, 'linkedin')}
                  >
                    <View style={styles.socialLinkContent}>
                      <SocialIcon platform="linkedin" size={14} />
                      <Text style={styles.socialLinkText}>
                        {getDisplayUsername(profileUser.socialLinks!.linkedin!, 'linkedin')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
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

        {/* Profile Comment Wall */}
        <View style={styles.commentWallCard}>
          <ProfileCommentWall
            profileUserId={profileUser.id}
            profileUserName={profileUser.displayName}
            isOwnProfile={isOwnProfile}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.error,
  },
  profileHeader: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: theme.primary,
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
    color: theme.textTertiary,
  },
  profileActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  friendButton: {
    marginTop: 0,
  },
  socialLinksSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  socialLink: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  socialLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLinkText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  bioCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  interestsCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tagText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  eventsCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.text,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeTab: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  noEventsText: {
    fontSize: 16,
    color: theme.textTertiary,
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
    color: theme.textSecondary,
    marginBottom: 8,
  },
  commentWallCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default UserProfileScreen; 