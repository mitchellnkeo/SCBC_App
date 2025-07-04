import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Alert,
  StyleSheet
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { formatPSTDate, getEventStatus } from '../../utils/timezone';
import { formatTimeRange } from '../../utils/dateTimeUtils';
import ProfilePicture from '../common/ProfilePicture';
import EventsGroupedList from '../common/EventsGroupedList';

const PastEventsTab: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { 
    pastEvents, 
    isPastLoading, 
    pastError, 
    loadPastEvents, 
    clearPastError,
    subscribeToPastEvents,
  } = useEventStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    if (user) {
      loadPastEvents();
      const unsubscribe = subscribeToPastEvents();
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (pastError) {
      Alert.alert('Error', pastError);
      clearPastError();
    }
  }, [pastError]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPastEvents();
    } finally {
      setIsRefreshing(false);
    }
  };

  const navigateToEventDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const formatDate = (date: Date) => {
    return formatPSTDate(date);
  };

  const getEventStatusInfo = (event: BookClubEvent) => {
    return getEventStatus(event.date, event.startTime, event.endTime);
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
      opacity: 0.9,
    },
    headerImage: {
      width: '100%',
      height: 192,
      opacity: 0.8,
    },
    placeholderHeader: {
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.8,
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
      opacity: 0.9,
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
  });

  const renderEventCard = (event: BookClubEvent) => {
    const statusInfo = getEventStatusInfo(event);

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
                  { backgroundColor: theme.textTertiary },
                ]}
              />
              <Text
                style={[
                  dynamicStyles.statusText,
                  { color: theme.textTertiary },
                ]}
              >
                {statusInfo.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventListItem = (event: BookClubEvent) => {
    const statusInfo = getEventStatusInfo(event);

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
                  { backgroundColor: theme.textTertiary },
                ]}
              />
              <Text
                style={[
                  dynamicStyles.statusText,
                  { color: theme.textTertiary },
                ]}
              >
                {statusInfo.description}
              </Text>
            </View>
          </View>

          <View style={[dynamicStyles.row, { marginTop: 4 }]}>
            <Text style={dynamicStyles.emoji}>📅</Text>
            <Text style={dynamicStyles.eventDetail}>
              {formatDate(new Date(event.date))}
            </Text>
            <Text style={dynamicStyles.emoji}>⏰</Text>
            <Text style={dynamicStyles.eventDetail}>
              {formatTimeRange(event.startTime, event.endTime)}
            </Text>
          </View>

          <View style={[dynamicStyles.row, { marginTop: 4 }]}>
            <Text style={dynamicStyles.emoji}>📍</Text>
            <Text style={dynamicStyles.eventDetail}>
              {event.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <EventsGroupedList
      events={pastEvents}
      isLoading={isPastLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      renderEventCard={renderEventCard}
      renderEventListItem={renderEventListItem}
      emptyStateMessage="No past events found"
      hasMore={false}
      onEndReached={() => {}}
    />
  );
};

export default PastEventsTab; 