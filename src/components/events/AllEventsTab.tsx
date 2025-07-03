import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { formatPSTDate, getEventStatus } from '../../utils/timezone';
import { formatTimeRange } from '../../utils/dateTimeUtils';
import { Button } from '../common/Button';
import ProfilePicture from '../common/ProfilePicture';
import EventsGroupedList from '../common/EventsGroupedList';

const AllEventsTab: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { 
    events, 
    isLoading,
    hasMore,
    error, 
    loadEvents,
    loadMoreEvents,
    clearError,
    subscribeToEvents,
  } = useEventStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    if (user) {
      loadEvents(true); // Load fresh data
      const unsubscribe = subscribeToEvents();
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadEvents(true); // Refresh from start
    } finally {
      setIsRefreshing(false);
    }
  };

  const onEndReached = () => {
    if (!isLoading && hasMore) {
      loadMoreEvents();
    }
  };

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return (
      <View style={dynamicStyles.footerLoader}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  };

  const navigateToEventDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const formatDate = (date: Date) => {
    return formatPSTDate(date);
  };

  // Get event status with PST awareness
  const getEventStatusInfo = (event: BookClubEvent) => {
    return getEventStatus(event.date, event.startTime, event.endTime);
  };

  const getEventDisplayStatus = (event: BookClubEvent): { text: string; color: string } => {
    const statusInfo = getEventStatusInfo(event);
    
    switch (statusInfo.status) {
      case 'upcoming':
        return { text: statusInfo.description, color: theme.success };
      case 'current':
        return { text: statusInfo.description, color: theme.warning };
      case 'past':
        return { text: statusInfo.description, color: theme.textTertiary };
      default:
        return { text: 'Unknown', color: theme.textSecondary };
    }
  };

  const renderEventCard = (event: BookClubEvent) => {
    const statusInfo = getEventDisplayStatus(event);

    return (
      <TouchableOpacity
        style={dynamicStyles.eventCard}
        onPress={() => navigateToEventDetails(event.id)}
      >
        {event.headerPhoto ? (
          <Image
            source={{ uri: event.headerPhoto }}
            style={dynamicStyles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[dynamicStyles.headerImage, dynamicStyles.placeholderHeader]}>
            <Text style={dynamicStyles.bookEmoji}>📚</Text>
          </View>
        )}

        <View style={dynamicStyles.cardContent}>
          <Text style={dynamicStyles.eventTitle}>{event.title}</Text>

          <View style={[dynamicStyles.row, { marginBottom: 8 }]}>
            <Text style={dynamicStyles.emoji}>📅</Text>
            <Text style={dynamicStyles.eventDetail}>
              {formatDate(new Date(event.date))}
            </Text>
          </View>

          <View style={[dynamicStyles.row, { marginBottom: 8 }]}>
            <Text style={dynamicStyles.emoji}>⏰</Text>
            <Text style={dynamicStyles.eventDetail}>
              {formatTimeRange(event.startTime, event.endTime)}
            </Text>
          </View>

          <View style={[dynamicStyles.row, { marginBottom: 12 }]}>
            <Text style={dynamicStyles.emoji}>📍</Text>
            <Text style={dynamicStyles.eventDetail}>
              {event.location}
            </Text>
          </View>

          <View style={dynamicStyles.hostRow}>
            <View style={dynamicStyles.row}>
              <ProfilePicture
                size="small"
                imageUrl={event.hostProfilePicture}
                displayName={event.hostName}
                style={{ marginRight: 8 }}
              />
              <Text style={dynamicStyles.hostText}>
                Hosted by {event.hostName}
              </Text>
            </View>
            <View style={dynamicStyles.row}>
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventListItem = (event: BookClubEvent) => {
    const statusInfo = getEventDisplayStatus(event);

    return (
      <TouchableOpacity
        style={dynamicStyles.listItem}
        onPress={() => navigateToEventDetails(event.id)}
      >
        <View style={dynamicStyles.listContent}>
          <View style={dynamicStyles.listHeader}>
            <Text style={dynamicStyles.listTitle}>{event.title}</Text>
            <View style={dynamicStyles.row}>
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

          <View style={[dynamicStyles.row, { marginTop: 4 }]}>
            <Text style={dynamicStyles.emoji}>📅</Text>
            <Text style={dynamicStyles.listDetail}>
              {formatDate(new Date(event.date))}
            </Text>
            <Text style={dynamicStyles.emoji}>⏰</Text>
            <Text style={dynamicStyles.listDetail}>
              {formatTimeRange(event.startTime, event.endTime)}
            </Text>
          </View>

          <View style={[dynamicStyles.row, { marginTop: 4 }]}>
            <Text style={dynamicStyles.emoji}>📍</Text>
            <Text style={dynamicStyles.listDetail}>
              {event.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const dynamicStyles = StyleSheet.create({
    eventCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerImage: {
      width: '100%',
      height: 192,
    },
    placeholderHeader: {
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bookEmoji: {
      fontSize: 48,
    },
    cardContent: {
      padding: 16,
    },
    eventTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      lineHeight: 28,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    emoji: {
      fontSize: 18,
      marginRight: 8,
    },
    eventDetail: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    flex1: {
      flex: 1,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    hostText: {
      fontSize: 14,
      color: theme.textTertiary,
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
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    listDetail: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });

  // Use shared grouped list component for view toggle & year/month filtering
  return (
    <EventsGroupedList
      events={events}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      hasMore={hasMore}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      renderEventCard={renderEventCard}
      renderEventListItem={renderEventListItem}
      emptyStateMessage="No upcoming events found."
    />
  );
};

export default AllEventsTab; 