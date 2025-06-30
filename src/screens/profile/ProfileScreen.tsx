import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../stores/authStore';
import type { MainStackParamList } from '../../navigation/MainNavigator';
import ProfilePicture from '../../components/common/ProfilePicture';
import ProfileSkeleton from '../../components/common/ProfileSkeleton';
import { ProfileCard, ListCard } from '../../components/common/Card';
import SocialIcon from '../../components/common/SocialIcon';
import { 
  getUserWebUrl, 
  getUserAppUrl, 
  getDisplayUsername,
  type SocialPlatform 
} from '../../utils/socialMediaUtils';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const ProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuthStore();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
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

  // Show skeleton while loading or user data is not available
  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>
        Manage your book club profile
      </Text>
      
      {/* User Information */}
      {user && (
        <View style={styles.userInfoSection}>
          <ProfileCard>
            <View style={styles.userHeader}>
              <ProfilePicture
                imageUrl={user.profilePicture}
                displayName={user.displayName || 'User'}
                size="large"
                showBorder
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
              </View>
            </View>
            
            {/* Bio Section */}
            {user.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioLabel}>About</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}
            
            {/* Hobbies Section */}
            {user.hobbies && user.hobbies.length > 0 && (
              <View style={styles.interestsSection}>
                <Text style={styles.interestsLabel}>Hobbies & Interests</Text>
                <View style={styles.tagsContainer}>
                  {user.hobbies.map((hobby, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{hobby}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Favorite Books Section */}
            {user.favoriteBooks && user.favoriteBooks.length > 0 && (
              <View style={styles.interestsSection}>
                <Text style={styles.interestsLabel}>Favorite Books</Text>
                <View style={styles.tagsContainer}>
                  {user.favoriteBooks.map((book, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{book}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Social Media Links */}
            {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
              <View style={styles.socialLinksSection}>
                <Text style={styles.interestsLabel}>Connect</Text>
                <View style={styles.socialLinksContainer}>
                  {user.socialLinks.instagram && (
                    <TouchableOpacity
                      style={styles.socialLink}
                      onPress={() => handleSocialLinkPress(user.socialLinks!.instagram!, 'instagram')}
                    >
                      <View style={styles.socialLinkContent}>
                        <SocialIcon platform="instagram" size={14} />
                        <Text style={styles.socialLinkText}>
                          {getDisplayUsername(user.socialLinks!.instagram!, 'instagram')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  {user.socialLinks.x && (
                    <TouchableOpacity
                      style={styles.socialLink}
                      onPress={() => handleSocialLinkPress(user.socialLinks!.x!, 'x')}
                    >
                      <View style={styles.socialLinkContent}>
                        <SocialIcon platform="x" size={14} />
                        <Text style={styles.socialLinkText}>
                          {getDisplayUsername(user.socialLinks!.x!, 'x')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  {user.socialLinks.linkedin && (
                    <TouchableOpacity
                      style={styles.socialLink}
                      onPress={() => handleSocialLinkPress(user.socialLinks!.linkedin!, 'linkedin')}
                    >
                      <View style={styles.socialLinkContent}>
                        <SocialIcon platform="linkedin" size={14} />
                        <Text style={styles.socialLinkText}>
                          {getDisplayUsername(user.socialLinks!.linkedin!, 'linkedin')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <View style={styles.userStats}>
              <Text style={styles.userID}>User ID: {user.id}</Text>
            </View>
            
            {/* View My Profile Button */}
            <TouchableOpacity 
              style={styles.viewProfileButton}
              onPress={() => (navigation as any).navigate('UserProfile', { userId: user.id })}
            >
              <Text style={styles.viewProfileButtonText}>View My Profile</Text>
            </TouchableOpacity>
          </ProfileCard>
        </View>
      )}
      
      {/* Profile Actions */}
      <View style={styles.actionsSection}>
        <ListCard>
          <TouchableOpacity>
            <Text style={styles.actionText}>Reading History</Text>
          </TouchableOpacity>
        </ListCard>
        
        <ListCard>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </ListCard>
        
        <ListCard>
          <TouchableOpacity>
            <Text style={styles.actionText}>My Books</Text>
          </TouchableOpacity>
        </ListCard>
        
        <ListCard>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
        </ListCard>
        
        <ListCard>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationDemo')}>
            <Text style={styles.actionText}>Push Notifications</Text>
            <Text style={styles.actionSubtext}>Test notification features</Text>
          </TouchableOpacity>
        </ListCard>
      </View>
      
      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutButtonText}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  userInfoSection: {
    marginBottom: 32,
  },

  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userStats: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  userID: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  viewProfileButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  viewProfileSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  actionsSection: {
    flex: 1,
  },

  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  logoutSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bioSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    marginBottom: 16,
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  interestsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    marginBottom: 16,
  },
  interestsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  socialLinksSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    marginBottom: 16,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialLink: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  socialLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLinkText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
});

export default ProfileScreen; 