import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { subscribeToNotificationStats } from '../../services/internalNotificationService';
import { NotificationStats, NotificationType } from '../../types/notifications';

interface NotificationBadgeProps {
  size?: 'small' | 'medium';
  style?: any;
}

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

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  size = 'medium',
  style 
}) => {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [stats, setStats] = useState<NotificationStats>(createEmptyStats());

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotificationStats(user.id, setStats);
    return unsubscribe;
  }, [user]);

  if (!user || stats.totalUnread === 0) {
    return null;
  }

  const styles = createStyles(theme, size);
  const displayCount = stats.totalUnread > 99 ? '99+' : stats.totalUnread.toString();

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </View>
  );
};

const createStyles = (theme: any, size: 'small' | 'medium') => {
  const isSmall = size === 'small';
  
  return StyleSheet.create({
    badge: {
      backgroundColor: theme.error || '#ef4444',
      borderRadius: isSmall ? 8 : 10,
      minWidth: isSmall ? 16 : 20,
      height: isSmall ? 16 : 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isSmall ? 4 : 6,
      borderWidth: 2,
      borderColor: theme.surface || '#ffffff',
    },
    badgeText: {
      color: 'white',
      fontSize: isSmall ? 10 : 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
};

export default NotificationBadge; 