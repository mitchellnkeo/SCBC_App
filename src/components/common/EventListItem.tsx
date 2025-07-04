import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { formatPSTDate } from '../../utils/timezone';
import { formatTimeRange } from '../../utils/dateTimeUtils';

interface EventListItemProps {
  event: BookClubEvent;
  onPress: (eventId: string) => void;
  statusInfo: { text: string; color: string };
  role?: {
    type: 'hosting' | 'attending';
    showBadge?: boolean;
  };
}

const EventListItem: React.FC<EventListItemProps> = ({
  event,
  onPress,
  statusInfo,
  role,
}) => {
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    return formatPSTDate(date);
  };

  const dynamicStyles = StyleSheet.create({
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    listContent: {
      padding: 12,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    emoji: {
      fontSize: 16,
      marginRight: 4,
    },
    listDetail: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    roleBadgeContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 10,
    },
    roleBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    hostingBadge: {
      backgroundColor: '#dc2626',
    },
    attendingBadge: {
      backgroundColor: theme.success,
    },
    roleBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  return (
    <TouchableOpacity
      style={dynamicStyles.listItem}
      onPress={() => onPress(event.id)}
    >
      {role?.showBadge && (
        <View style={dynamicStyles.roleBadgeContainer}>
          <View style={[
            dynamicStyles.roleBadge,
            role.type === 'hosting' ? dynamicStyles.hostingBadge : dynamicStyles.attendingBadge
          ]}>
            <Text style={dynamicStyles.roleBadgeText}>
              {role.type === 'hosting' ? 'Hosting' : 'Attending'}
            </Text>
          </View>
        </View>
      )}

      <View style={dynamicStyles.listContent}>
        <View style={dynamicStyles.listHeader}>
          <Text style={dynamicStyles.listTitle}>{event.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                dynamicStyles.statusDot,
                { backgroundColor: statusInfo.color },
              ]}
            />
            <Text
              style={[
                dynamicStyles.statusText,
                { color: statusInfo.color },
              ]}
            >
              {statusInfo.text}
            </Text>
          </View>
        </View>

        <View style={dynamicStyles.row}>
          <Text style={dynamicStyles.emoji}>📅</Text>
          <Text style={dynamicStyles.listDetail}>
            {formatDate(new Date(event.date))}
          </Text>
          <Text style={dynamicStyles.emoji}>⏰</Text>
          <Text style={dynamicStyles.listDetail}>
            {formatTimeRange(event.startTime, event.endTime)}
          </Text>
        </View>

        <View style={dynamicStyles.row}>
          <Text style={dynamicStyles.emoji}>📍</Text>
          <Text style={dynamicStyles.listDetail}>
            {event.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventListItem; 