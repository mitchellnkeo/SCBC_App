import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet
} from 'react-native';
import EventCardSkeleton from '../common/EventCardSkeleton';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { formatPSTDate, getEventStatus } from '../../utils/timezone';

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

  // Use PST-aware formatting
  const formatDate = (date: Date) => {
    return formatPSTDate(date);
  };

  const formatTime = (startTime?: string, endTime?: string): string => {
    // Format with start and end times
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    } else if (startTime) {
      return startTime;
    }
    
    return 'Time TBD';
  };

  // Get event status with PST awareness
  const getEventStatusInfo = (event: BookClubEvent) => {
    return getEventStatus(event.date);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.borderLight,
      borderRadius: 8,
      padding: 2,
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 40,
      alignItems: 'center',
    },
    toggleButtonActive: {
      backgroundColor: theme.primary,
    },
    toggleButtonInactive: {
      backgroundColor: 'transparent',
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
    },
    toggleTextActive: {
      color: 'white',
    },
    toggleTextInactive: {
      color: theme.textSecondary,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
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
      opacity: 0.9, // Slightly faded to indicate past event
    },
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 8,
      marginBottom: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      opacity: 0.9, // Slightly faded to indicate past event
    },
    headerImage: {
      width: '100%',
      height: 192,
      opacity: 0.8, // Faded for past events
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
    listTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceBetween: {
      justifyContent: 'space-between',
    },
    emoji: {
      fontSize: 18,
      marginRight: 8,
    },
    smallEmoji: {
      fontSize: 14,
      marginRight: 6,
    },
    eventDetail: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    listDetail: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    pastLabel: {
      fontSize: 12,
      color: theme.textTertiary,
      fontStyle: 'italic',
      marginTop: 4,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    hostAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    hostAvatarSmall: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 6,
    },
    hostAvatarPlaceholder: {
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hostInitial: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    hostInitialSmall: {
      fontSize: 10,
    },
    hostText: {
      fontSize: 14,
      color: theme.textTertiary,
    },
    hostTextSmall: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.textTertiary, // Muted for past events
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      color: theme.textTertiary,
      fontWeight: '500',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  // Event list item component (compact view)
  const EventListItem: React.FC<{ event: BookClubEvent }> = ({ event }) => (
    <TouchableOpacity
      style={dynamicStyles.listItem}
      onPress={() => navigateToEventDetails(event.id)}
      activeOpacity={0.7}
    >
      <View style={[dynamicStyles.row, dynamicStyles.spaceBetween]}>
        <View style={{ flex: 1 }}>
          <Text style={dynamicStyles.listTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.smallEmoji}>📅</Text>
            <Text style={dynamicStyles.listDetail}>
              {formatDate(event.date)} • {formatTime(event.startTime, event.endTime)}
            </Text>
          </View>
          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.smallEmoji}>📍</Text>
            <Text style={dynamicStyles.listDetail} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <Text style={dynamicStyles.pastLabel}>Past Event</Text>
        </View>
        
        <View style={[dynamicStyles.row, { marginLeft: 12 }]}>
          {event.hostProfilePicture ? (
            <Image source={{ uri: event.hostProfilePicture }} style={dynamicStyles.hostAvatarSmall} />
          ) : (
            <View style={[dynamicStyles.hostAvatarSmall, dynamicStyles.hostAvatarPlaceholder]}>
              <Text style={[dynamicStyles.hostInitial, dynamicStyles.hostInitialSmall]}>
                {event.hostName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={dynamicStyles.row}>
            <View style={dynamicStyles.statusDot} />
            <Text style={dynamicStyles.statusText}>Completed</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Event card component (detailed view)
  const EventCard: React.FC<{ event: BookClubEvent }> = ({ event }) => (
    <TouchableOpacity
      style={dynamicStyles.eventCard}
      onPress={() => navigateToEventDetails(event.id)}
      activeOpacity={0.7}
    >
      {/* Header Image Placeholder */}
      <View style={[dynamicStyles.headerImage, dynamicStyles.placeholderHeader]}>
        <Text style={dynamicStyles.bookEmoji}>📚</Text>
      </View>

      {/* Event Details */}
      <View style={dynamicStyles.cardContent}>
        <Text style={dynamicStyles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Date and Time */}
        <View style={[dynamicStyles.row, { marginBottom: 8 }]}>
          <Text style={dynamicStyles.emoji}>📅</Text>
          <Text style={dynamicStyles.eventDetail}>
            {formatDate(event.date)} • {formatTime(event.startTime, event.endTime)}
          </Text>
        </View>

        {/* Location */}
        <View style={[dynamicStyles.row, { marginBottom: 8 }]}>
          <Text style={dynamicStyles.emoji}>📍</Text>
          <Text style={dynamicStyles.eventDetail} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Host and Status */}
        <View style={dynamicStyles.hostRow}>
          <View style={dynamicStyles.row}>
            {event.hostProfilePicture ? (
              <Image source={{ uri: event.hostProfilePicture }} style={dynamicStyles.hostAvatar} />
            ) : (
              <View style={[dynamicStyles.hostAvatar, dynamicStyles.hostAvatarPlaceholder]}>
                <Text style={dynamicStyles.hostInitial}>
                  {event.hostName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={dynamicStyles.hostText}>Hosted by {event.hostName}</Text>
          </View>
          
          <View style={dynamicStyles.row}>
            <View style={dynamicStyles.statusDot} />
            <Text style={dynamicStyles.statusText}>Completed</Text>
          </View>
        </View>
        
        <Text style={dynamicStyles.pastLabel}>Past Event</Text>
      </View>
    </TouchableOpacity>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={dynamicStyles.emptyState}>
      <Text style={dynamicStyles.emptyEmoji}>📜</Text>
      <Text style={dynamicStyles.emptyTitle}>No Past Events</Text>
      <Text style={dynamicStyles.emptySubtitle}>
        Past events will appear here once they've been completed. Check back after attending some book club events!
      </Text>
    </View>
  );

  // Loading skeleton
  if (isPastLoading && pastEvents.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerText}>Past Events</Text>
        </View>
        <ScrollView style={dynamicStyles.scrollView}>
          {[...Array(3)].map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Header with view toggle */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerText}>
          Past Events ({pastEvents.length})
        </Text>
        <View style={dynamicStyles.viewToggle}>
          <TouchableOpacity
            style={[
              dynamicStyles.toggleButton,
              viewMode === 'card' ? dynamicStyles.toggleButtonActive : dynamicStyles.toggleButtonInactive
            ]}
            onPress={() => setViewMode('card')}
            activeOpacity={0.7}
          >
            <Text style={[
              dynamicStyles.toggleText,
              viewMode === 'card' ? dynamicStyles.toggleTextActive : dynamicStyles.toggleTextInactive
            ]}>
              📋
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.toggleButton,
              viewMode === 'list' ? dynamicStyles.toggleButtonActive : dynamicStyles.toggleButtonInactive
            ]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.7}
          >
            <Text style={[
              dynamicStyles.toggleText,
              viewMode === 'list' ? dynamicStyles.toggleTextActive : dynamicStyles.toggleTextInactive
            ]}>
              📄
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Events List */}
      <ScrollView 
        style={dynamicStyles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {pastEvents.length === 0 ? (
          <EmptyState />
        ) : (
          pastEvents.map((event) => (
            viewMode === 'card' ? (
              <EventCard key={event.id} event={event} />
            ) : (
              <EventListItem key={event.id} event={event} />
            )
          ))
        )}
        
        {isPastLoading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PastEventsTab; 