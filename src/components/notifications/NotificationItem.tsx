import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Notification, NotificationType } from '../../types/notifications';
import ProfilePicture from '../common/ProfilePicture';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const getNotificationIcon = (type: NotificationType, status?: string): string => {
    switch (type) {
      case 'comment_reply':
        return '💬';
      case 'event_update':
        return '📅';
      case 'event_approved':
        return '✅';
      case 'event_rejected':
        return '❌';
      case 'mention':
        return '@';
      case 'rsvp_update':
        return '👥';
      case 'admin_message':
        return '📢';
      case 'friend_request':
        return '👥';
      case 'friend_request_accepted':
        return '✅';
      case 'profile_comment':
        return '💬';
      case 'profile_comment_reply':
        return '↩️';
      case 'new_report':
        return '🚩';
      case 'report_resolved':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'mention':
        return '#dc2626';
      case 'event_update':
        return '#3b82f6';
      case 'event_approved':
        return '#10b981';
      case 'event_rejected':
        return '#ef4444';
      case 'rsvp_update':
        return '#f59e0b';
      case 'comment_reply':
        return '#dc2626';
      case 'admin_message':
        return '#f97316';
      case 'friend_request':
        return '#3b82f6';
      case 'friend_request_accepted':
        return '#10b981';
      case 'profile_comment':
        return '#ec4899';
      case 'profile_comment_reply':
        return '#ec4899';
      case 'new_report':
        return '#ef4444';
      case 'report_resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handlePress = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onPress(notification);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Unread indicator */}
      {!notification.isRead && <View style={styles.unreadIndicator} />}
      
      {/* Left icon/avatar */}
      <View style={styles.leftSection}>
        {notification.fromUserProfilePicture ? (
          <ProfilePicture
            imageUrl={notification.fromUserProfilePicture}
            displayName={notification.fromUserName || 'User'}
            size="medium"
          />
        ) : (
          <View 
            style={[
              styles.typeIcon,
              { backgroundColor: getNotificationColor(notification.type) + '20' }
            ]}
          >
            <Text style={styles.typeIconText}>
              {getNotificationIcon(notification.type)}
            </Text>
          </View>
        )}
      </View>
      
      {/* Content */}
      <View style={styles.contentSection}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.title,
              !notification.isRead && styles.unreadTitle
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.timeAgo}>
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.message,
            !notification.isRead && styles.unreadMessage
          ]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        
        {/* Type badge */}
        <View style={styles.footer}>
          <View 
            style={[
              styles.typeBadge,
              { backgroundColor: getNotificationColor(notification.type) }
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {notification.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: '#fefefe',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  leftSection: {
    marginRight: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconText: {
    fontSize: 20,
  },
  contentSection: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  unreadTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadMessage: {
    color: '#4b5563',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
});

export default NotificationItem; 