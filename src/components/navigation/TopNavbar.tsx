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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import ProfilePicture from '../common/ProfilePicture';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.75; // 75% of screen width

interface TopNavbarProps {
  title?: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ 
  title = 'Seattle Chinatown Book Club'
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));

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

  const handleMenuItemPress = (action: () => void) => {
    closeMenu();
    // Small delay to let the menu close animation finish
    setTimeout(action, 100);
  };

  const menuItems = [
    {
      icon: '',
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
      textAlign: 'center',
      marginHorizontal: 12,
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
  });

  return (
    <>
      <SafeAreaView style={dynamicStyles.safeArea}>
        <View style={dynamicStyles.navbar}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openMenu}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.hamburgerLine} />
            <View style={dynamicStyles.hamburgerLine} />
            <View style={dynamicStyles.hamburgerLine} />
          </TouchableOpacity>

          {/* Title */}
          <Text 
            style={dynamicStyles.title} 
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {title}
          </Text>

          {/* Profile Picture */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <ProfilePicture
              imageUrl={user?.profilePicture}
              displayName={user?.displayName || 'User'}
              size="small"
              showBorder
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Side Menu Modal */}
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
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={dynamicStyles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <Text style={dynamicStyles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
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