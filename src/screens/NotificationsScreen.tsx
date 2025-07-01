import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import {
  getUserNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToUserNotifications,
  subscribeToNotificationStats,
} from '../services/internalNotificationService';
import { Notification, NotificationStats, NotificationType } from '../types/notifications';
import { MainStackParamList } from '../navigation/MainNavigator';
import ProfilePicture from '../components/common/ProfilePicture';
import { Button } from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { formatDistanceToNow } from 'date-fns';

type NavigationProp = StackNavigationProp<MainStackParamList>;

// Helper function to create empty stats
const createEmptyStats = (): NotificationStats => ({
  totalUnread: 0,
  unreadByType: {
    mention: 0,
    event_update: 0,
    event_approved: 0,
    event_rejected: 0,
    rsvp_update: 0,
    comment_reply: 0,
    admin_message: 0,
  } as Record<NotificationType, number>
});

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>(createEmptyStats());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const loadNotifications = async (showRefresh = false) => {
    if (!user) return;
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const [notificationsData, statsData] = await Promise.all([
        getUserNotifications(user.id, 100),
        getNotificationStats(user.id),
      ]);

      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Subscribe to real-time updates when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      // Initial load
      loadNotifications();

      // Set up real-time subscriptions
      const notificationsUnsubscribe = subscribeToUserNotifications(user.id, setNotifications);
      const statsUnsubscribe = subscribeToNotificationStats(user.id, setStats);

      return () => {
        notificationsUnsubscribe();
        statsUnsubscribe();
      };
    }, [user])
  );

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      // Navigate based on notification type
      if (notification.eventId) {
        navigation.navigate('EventDetails', { eventId: notification.eventId });
      } else if (notification.fromUserId) {
        // Navigate to user profile for any notification with a fromUserId
        navigation.navigate('UserProfile', { userId: notification.fromUserId });
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || stats.totalUnread === 0) return;

    try {
      setIsMarkingAllRead(true);
      await markAllNotificationsAsRead(user.id);
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark notifications as read');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'mention':
        return '💬';
      case 'event_update':
        return '📅';
      case 'event_approved':
        return '✅';
      case 'event_rejected':
        return '❌';
      case 'rsvp_update':
        return '🎫';
      case 'comment_reply':
        return '💭';
      case 'friend_request':
        return '👥';
      case 'friend_accepted':
        return '🤝';
      case 'profile_comment':
        return '💬';
      case 'admin_message':
        return '📢';
      default:
        return '🔔';
    }
  };

  const formatNotificationTime = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const groupedNotifications = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {stats.totalUnread > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Text style={styles.markAllButtonText}>Mark All Read</Text>
            )}
          </TouchableOpacity>
        )}
        {stats.totalUnread === 0 && <View style={styles.placeholder} />}
      </View>

      {/* Stats Bar */}
      {hasNotifications && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {stats.totalUnread > 0 
              ? `${stats.totalUnread} unread notification${stats.totalUnread !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadNotifications(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {!hasNotifications ? (
          <EmptyState
            emoji="🔔"
            title="No notifications yet"
            subtitle="You'll see notifications here when someone interacts with your events or mentions you in comments."
          />
        ) : (
          <View style={styles.notificationsList}>
            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
              <View key={dateGroup} style={styles.dateGroup}>
                <Text style={styles.dateGroupTitle}>{dateGroup}</Text>
                {groupNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.isRead && styles.unreadNotification
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationIcon}>
                      <Text style={styles.iconText}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                    </View>
                    
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.isRead && styles.unreadText
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatNotificationTime(notification.createdAt)}
                        </Text>
                      </View>
                      
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      
                      {notification.fromUserId && notification.fromUserName && (
                        <View style={styles.fromUser}>
                          <ProfilePicture
                            imageUrl={notification.fromUserProfilePicture}
                            displayName={notification.fromUserName}
                            size="small"
                          />
                          <Text style={styles.fromUserName}>
                            {notification.fromUserName}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {!notification.isRead && (
                      <View style={styles.unreadIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.surface,
  },
  markAllButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.primary,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  statsText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 8,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  unreadNotification: {
    backgroundColor: theme.primaryLight || theme.surface,
    borderColor: theme.primary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    color: theme.primary,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  fromUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fromUserName: {
    fontSize: 12,
    color: theme.textTertiary,
    marginLeft: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginLeft: 8,
    marginTop: 8,
  },
});

export default NotificationsScreen; 