import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { BookClubEvent } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { formatDate, formatTimeRange } from '../../utils/dateTimeUtils';
import ProfilePicture from './ProfilePicture';

type NavigationProp = StackNavigationProp<MainStackParamList>;

interface EventCardProps {
  event: BookClubEvent;
  showHost?: boolean;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  showHost = true, 
  compact = false 
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const isPastEvent = event.date < new Date();

  return (
    <TouchableOpacity 
      style={[styles.card, compact && styles.compactCard]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {event.headerPhoto && !compact && (
        <Image source={{ uri: event.headerPhoto }} style={styles.headerImage} />
      )}
      
      <View style={[styles.content, compact && styles.compactContent]}>
        <View style={styles.header}>
          <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={compact ? 1 : 2}>
            {event.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
            <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
          </View>
        </View>

        <View style={styles.dateTimeContainer}>
          <Text style={[styles.date, isPastEvent && styles.pastDate]}>
            {formatDate(event.date)}
          </Text>
          <Text style={[styles.time, isPastEvent && styles.pastTime]}>
            {formatTimeRange(event.startTime, event.endTime)}
          </Text>
        </View>

        <Text style={[styles.location, compact && styles.compactLocation]} numberOfLines={1}>
          📍 {event.location}
        </Text>

        {!compact && event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        {showHost && (
          <View style={styles.hostContainer}>
            <ProfilePicture
              imageUrl={event.hostProfilePicture}
              displayName={event.hostName}
              size="small"
            />
            <Text style={styles.hostName}>Hosted by {event.hostName}</Text>
          </View>
        )}

        {isPastEvent && (
          <View style={styles.pastEventOverlay}>
            <Text style={styles.pastEventText}>Past Event</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  compactCard: {
    marginBottom: 8,
  },
  headerImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  compactContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
    marginRight: 12,
  },
  pastDate: {
    color: '#9ca3af',
  },
  time: {
    fontSize: 14,
    color: '#6b7280',
  },
  pastTime: {
    color: '#9ca3af',
  },
  location: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  compactLocation: {
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  hostName: {
    fontSize: 12,
    color: '#6b7280',
  },
  pastEventOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pastEventText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default EventCard; 