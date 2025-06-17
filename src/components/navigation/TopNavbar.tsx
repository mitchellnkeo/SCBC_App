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
      title: 'Monthly Book',
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
      title: 'About SCBC',
      onPress: () => handleMenuItemPress(() => {
        navigation.navigate('AboutSCBC');
      }),
    },
    {
      title: 'SCBC Contact Info',
      onPress: () => handleMenuItemPress(() => {
        navigation.navigate('ContactInfo');
      }),
    },
    {
      title: 'SCBC Feedback',
      onPress: () => handleMenuItemPress(() => {
        // TODO: Navigate to Feedback screen
        console.log('SCBC Feedback pressed');
      }),
    },
  ];

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openMenu}
            activeOpacity={0.7}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
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
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            onPress={closeMenu}
            activeOpacity={1}
          />

          {/* Menu Content */}
          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <SafeAreaView style={styles.menuSafeArea}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeMenu}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* User Info at Bottom */}
              {user && (
                <View style={styles.userInfoSection}>
                  <View style={styles.userInfo}>
                    <ProfilePicture
                      imageUrl={user.profilePicture}
                      displayName={user.displayName}
                      size="medium"
                      showBorder
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.displayName}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
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
  safeArea: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  menuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#374151',
    marginVertical: 2,
    borderRadius: 1,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  profileButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuSafeArea: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  userInfoSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  userActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  userActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ec4899',
    borderRadius: 8,
    alignItems: 'center',
  },
  userActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default TopNavbar; 