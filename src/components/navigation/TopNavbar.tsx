import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import ProfilePicture from '../common/ProfilePicture';
import { Button } from '../common/Button';
import NotificationBadge from '../common/NotificationBadge';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.75; // 75% of screen width

interface ActionButton {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface TopNavbarProps {
  title?: string;
  variant?: 'default' | 'modal' | 'back' | 'custom';
  showBackButton?: boolean;
  showMenu?: boolean;
  showProfile?: boolean;
  onBackPress?: () => void;
  backButtonText?: string;
  actionButton?: ActionButton;
  leftAction?: {
    text: string;
    onPress: () => void;
  };
  rightAction?: {
    text: string;
    onPress: () => void;
  };
}

const TopNavbar: React.FC<TopNavbarProps> = ({ 
  title = 'Seattle Chinatown Book Club',
  variant = 'default',
  showBackButton = false,
  showMenu = true,
  showProfile = true,
  onBackPress,
  backButtonText = '← Back',
  actionButton,
  leftAction,
  rightAction,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const openMenu = () => {
    setIsMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -MENU_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuVisible(false);
    });
  };

  const handleProfilePress = () => {
    if (user) {
      navigation.navigate('UserProfile', { userId: user.id });
    }
  };

  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  const handleMenuItemPress = (action: () => void) => {
    closeMenu();
    // Small delay to let the menu close animation finish
    setTimeout(action, 100);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const menuGroups = [
    {
      id: 'bookclub',
      title: 'Book Club',
      items: [
        {
          title: 'Announcements',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('Announcements');
          }),
        },
        {
          title: 'Monthly Meeting Details',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('MonthlyBook');
          }),
        },
        {
          title: 'Events',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('Events');
          }),
        },
      ]
    },
    {
      id: 'community',
      title: 'Community',
      items: [
        {
          title: 'My Friends',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('Friends');
          }),
        },
        {
          title: 'WhatsApp Community Chat',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('WhatsAppCommunity');
          }),
        },
        {
          title: 'E-Mail Signup',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('EmailSignup');
          }),
        },
      ]
    },
    {
      id: 'support',
      title: 'Support & Info',
      items: [
        {
          title: 'About Us',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('AboutSCBC');
          }),
        },
        {
          title: 'Contact Us',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('ContactInfo');
          }),
        },
        {
          title: 'Frequently Asked Questions',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('FAQ');
          }),
        },
        {
          title: 'Leave Feedback',
          onPress: () => handleMenuItemPress(() => {
            navigation.navigate('Feedback');
          }),
        },
      ]
    },
  ];

  const dynamicStyles = StyleSheet.create({
    safeArea: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    navbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
    },
    hamburgerLine: {
      width: 20,
      height: 2,
      backgroundColor: theme.textSecondary,
      marginVertical: 2,
      borderRadius: 1,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: variant === 'back' || variant === 'modal' ? 'center' : 'center',
      marginHorizontal: 12,
    },
    backButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      minWidth: 60,
    },
    backButtonText: {
      fontSize: 16,
      color: variant === 'modal' ? theme.textSecondary : theme.primary,
      fontWeight: '500',
    },
    leftActionButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      minWidth: 60,
    },
    leftActionText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    rightActionButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      minWidth: 60,
    },
    rightActionText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlay,
    },
    menuContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: MENU_WIDTH,
      backgroundColor: theme.surface,
      shadowColor: theme.shadow,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    menuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    closeButtonText: {
      fontSize: 18,
      color: theme.textTertiary,
      fontWeight: 'bold',
    },
    menuItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    groupTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    chevron: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: 'bold',
    },
    groupItems: {
      backgroundColor: theme.surface,
    },
    subMenuItem: {
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    subMenuItemText: {
      fontSize: 15,
      color: theme.textSecondary,
      fontWeight: '400',
    },
    userInfoSection: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 14,
      color: theme.textTertiary,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    notificationButton: {
      position: 'relative',
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    notificationIcon: {
      fontSize: 16,
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
    },
  });

  const renderLeftContent = () => {
    if (leftAction) {
      return (
        <TouchableOpacity
          style={dynamicStyles.leftActionButton}
          onPress={leftAction.onPress}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.leftActionText}>{leftAction.text}</Text>
        </TouchableOpacity>
      );
    }
    
    if (showBackButton || variant === 'back' || variant === 'modal') {
      return (
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.backButtonText}>
            {variant === 'modal' ? '✕' : backButtonText}
          </Text>
        </TouchableOpacity>
      );
    }
    
    if (showMenu) {
      return (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openMenu}
          activeOpacity={0.7}
        >
          <View style={dynamicStyles.hamburgerLine} />
          <View style={dynamicStyles.hamburgerLine} />
          <View style={dynamicStyles.hamburgerLine} />
        </TouchableOpacity>
      );
    }
    
    return <View style={{ minWidth: 60 }} />;
  };

  const renderRightContent = () => {
    if (rightAction) {
      return (
        <TouchableOpacity
          style={dynamicStyles.rightActionButton}
          onPress={rightAction.onPress}
        >
          <Text style={dynamicStyles.rightActionText}>{rightAction.text}</Text>
        </TouchableOpacity>
      );
    }

    if (actionButton) {
      return (
        <Button
          title={actionButton.title}
          onPress={actionButton.onPress}
          variant={actionButton.variant}
          loading={actionButton.loading}
          disabled={actionButton.disabled}
          size={actionButton.size || 'small'}
        />
      );
    }

    if (showProfile && user) {
      return (
        <View style={dynamicStyles.profileSection}>
          {/* Notification Bell */}
          <TouchableOpacity
            style={dynamicStyles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons 
              name="notifications-outline" 
              size={18} 
              color={theme.textSecondary} 
            />
            <NotificationBadge 
              size="small" 
              style={dynamicStyles.notificationBadge}
            />
          </TouchableOpacity>
          
          {/* Profile Picture */}
          <TouchableOpacity onPress={handleProfilePress}>
            <ProfilePicture
              imageUrl={user.profilePicture}
              displayName={user.displayName}
              size="small"
              showBorder
            />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <>
      <SafeAreaView style={dynamicStyles.safeArea}>
        <View style={dynamicStyles.navbar}>
          {renderLeftContent()}

          {/* Title */}
          <Text 
            style={dynamicStyles.title} 
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {title}
          </Text>

          {renderRightContent()}
        </View>
      </SafeAreaView>

      {/* Side Menu Modal - Only show if menu is enabled */}
      {showMenu && (
        <Modal
          visible={isMenuVisible}
          transparent
          animationType="none"
          onRequestClose={closeMenu}
        >
          <View style={dynamicStyles.modalOverlay}>
            {/* Backdrop */}
            <TouchableOpacity
              style={dynamicStyles.backdrop}
              onPress={closeMenu}
              activeOpacity={1}
            />

            {/* Menu Content */}
            <Animated.View
              style={[
                dynamicStyles.menuContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <SafeAreaView style={styles.menuSafeArea}>
                {/* Menu Header */}
                <View style={dynamicStyles.menuHeader}>
                  <Text style={dynamicStyles.menuTitle}>Menu</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeMenu}
                    activeOpacity={0.7}
                  >
                    <Text style={dynamicStyles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View style={styles.menuItems}>
                  {menuGroups.map((group) => (
                    <View key={group.id}>
                      {/* Group Header */}
                      <TouchableOpacity
                        style={dynamicStyles.groupHeader}
                        onPress={() => toggleGroup(group.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={dynamicStyles.groupTitle}>{group.title}</Text>
                        <Text style={dynamicStyles.chevron}>
                          {expandedGroups[group.id] ? '▼' : '▶'}
                        </Text>
                      </TouchableOpacity>

                      {/* Group Items */}
                      {expandedGroups[group.id] && (
                        <View style={dynamicStyles.groupItems}>
                          {group.items.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              style={dynamicStyles.subMenuItem}
                              onPress={item.onPress}
                              activeOpacity={0.7}
                            >
                              <Text style={dynamicStyles.subMenuItemText}>{item.title}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {/* User Info at Bottom */}
                {user && (
                  <View style={dynamicStyles.userInfoSection}>
                    <View style={dynamicStyles.userInfo}>
                      <ProfilePicture
                        imageUrl={user.profilePicture}
                        displayName={user.displayName}
                        size="medium"
                        showBorder
                      />
                      <View style={styles.userDetails}>
                        <Text style={dynamicStyles.userName}>{user.displayName}</Text>
                        <Text style={dynamicStyles.userEmail}>{user.email}</Text>
                      </View>
                    </View>
                    
                    {/* User Action Buttons */}
                    <View style={styles.userActions}>
                      <TouchableOpacity
                        style={styles.userActionButton}
                        onPress={() => handleMenuItemPress(() => {
                          if (user) {
                            navigation.navigate('UserProfile', { userId: user.id });
                          }
                        })}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.userActionText}>My Profile</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.userActionButton}
                        onPress={() => handleMenuItemPress(() => {
                          navigation.navigate('Settings');
                        })}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.userActionText}>Settings</Text>
                      </TouchableOpacity>
                      
                      {user.role === 'admin' && (
                        <TouchableOpacity
                          style={styles.userActionButton}
                          onPress={() => handleMenuItemPress(() => {
                            navigation.navigate('Admin');
                          })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.userActionText}>Admin Panel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </SafeAreaView>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  profileButton: {
    padding: 4,
  },
  menuSafeArea: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  userActionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center',
  },
  userActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
});

export default TopNavbar; 