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
import { formatTimeRange } from '../../utils/dateTimeUtils';
import { Button } from '../common/Button';
import EmptyState from '../common/EmptyState';
import ProfilePicture from '../common/ProfilePicture';

const AllEventsTab: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { 
    events, 
    isLoading, 
    error, 
    loadEvents, 
    clearError,
    subscribeToEvents,
  } = useEventStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    if (user) {
      loadEvents();
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
      await loadEvents();
    } finally {
      setIsRefreshing(false);
    }
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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 24,
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

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 50,
      alignItems: 'center',
    },
    activeToggle: {
      backgroundColor: theme.primary,
    },
    toggleText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    activeToggleText: {
      color: 'white',
      fontWeight: '600',
    },
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 8,
      marginBottom: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
      marginRight: 8,
    },
    listDate: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    listDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    listDetailText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 4,
      flex: 1,
    },
    listHost: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    hostInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },

    listHostText: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    listStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    listStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    },
    listStatusText: {
      fontSize: 10,
      fontWeight: '500',
    },
  });

  const EventListItem: React.FC<{ event: BookClubEvent }> = ({ event }) => (
    <TouchableOpacity
      onPress={() => navigateToEventDetails(event.id)}
      style={dynamicStyles.listItem}
    >
      {/* Header with title and date */}
      <View style={dynamicStyles.listHeader}>
        <Text style={dynamicStyles.listTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={dynamicStyles.listDate}>
          {formatDate(event.date)}
        </Text>
      </View>
      
      {/* Time and Location */}
      <View style={dynamicStyles.listDetails}>
        <Text style={dynamicStyles.listDetailText} numberOfLines={1}>
          {formatTimeRange(event.startTime, event.endTime)}
        </Text>
      </View>
      
      <View style={dynamicStyles.listDetails}>
        <Text style={dynamicStyles.listDetailText} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
      
      {/* Host and Status */}
      <View style={dynamicStyles.listHost}>
        <View style={dynamicStyles.hostInfo}>
          <ProfilePicture
            imageUrl={event.hostProfilePicture}
            displayName={event.hostName}
            size="small"
          />
          <Text style={dynamicStyles.listHostText}>
            {event.hostName}
          </Text>
        </View>
        
        <View style={dynamicStyles.listStatus}>
          <View style={[dynamicStyles.listStatusDot, { backgroundColor: getEventDisplayStatus(event).color }]} />
          <Text style={[dynamicStyles.listStatusText, { color: getEventDisplayStatus(event).color }]}>{getEventDisplayStatus(event).text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EventCard: React.FC<{ event: BookClubEvent }> = ({ event }) => (
    <TouchableOpacity
      onPress={() => navigateToEventDetails(event.id)}
      style={dynamicStyles.eventCard}
    >
      {/* Header Image */}
      {event.headerPhoto ? (
        <Image
          source={{ uri: event.headerPhoto }}
          style={dynamicStyles.headerImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[dynamicStyles.headerImage, dynamicStyles.placeholderHeader]}>
        </View>
      )}
      
      {/* Event Content */}
      <View style={dynamicStyles.cardContent}>
        {/* Title */}
        <Text style={dynamicStyles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        
        {/* Date and Time - Separate Lines */}
        <View style={[dynamicStyles.row, { marginBottom: 4 }]}>
          <Text style={[dynamicStyles.eventDetail, { flex: 1 }]} numberOfLines={1}>
            {formatDate(event.date)}
          </Text>
        </View>
        
        <View style={[dynamicStyles.row, { marginBottom: 8, marginLeft: 26 }]}>
          <Text style={[dynamicStyles.eventDetail, { flex: 1 }]} numberOfLines={1}>
            {formatTimeRange(event.startTime, event.endTime)}
          </Text>
        </View>
        
        {/* Location */}
        <View style={[dynamicStyles.row, { marginBottom: 12 }]}>
          <Text style={[dynamicStyles.eventDetail, dynamicStyles.flex1]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        {/* Host Info */}
        <View style={dynamicStyles.hostRow}>
          <View style={dynamicStyles.row}>
            <ProfilePicture
              imageUrl={event.hostProfilePicture}
              displayName={event.hostName}
              size="small"
            />
            <Text style={dynamicStyles.hostText}>
              Hosted by {event.hostName}
            </Text>
          </View>
          
          {/* Event Status Indicator */}
          <View style={dynamicStyles.row}>
            <View style={[dynamicStyles.statusDot, { backgroundColor: getEventDisplayStatus(event).color }]} />
            <Text style={[dynamicStyles.statusText, { color: getEventDisplayStatus(event).color }]}>{getEventDisplayStatus(event).text}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <EmptyState
      emoji="📚"
      title="No Events Yet"
      subtitle="Be the first to create an event for the book club! Share reading discussions, meetups, and literary adventures."
      buttonTitle="Create First Event"
      onButtonPress={navigateToCreateEvent}
      buttonVariant="error"
    />
  );

  if (isLoading && events.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <ScrollView style={dynamicStyles.scrollView}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {events.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header with View Toggle */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>All Events</Text>
            <View style={dynamicStyles.viewToggle}>
              <TouchableOpacity
                style={[
                  dynamicStyles.toggleButton,
                  viewMode === 'card' && dynamicStyles.activeToggle
                ]}
                onPress={() => setViewMode('card')}
              >
                <Text style={[
                  dynamicStyles.toggleText,
                  viewMode === 'card' && dynamicStyles.activeToggleText
                ]}>
                  Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.toggleButton,
                  viewMode === 'list' && dynamicStyles.activeToggle
                ]}
                onPress={() => setViewMode('list')}
              >
                <Text style={[
                  dynamicStyles.toggleText,
                  viewMode === 'list' && dynamicStyles.activeToggleText
                ]}>
                  List
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Events Content */}
          <ScrollView 
            style={dynamicStyles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {events.map((event) => 
              viewMode === 'card' ? (
                <EventCard key={event.id} event={event} />
              ) : (
                <EventListItem key={event.id} event={event} />
              )
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default AllEventsTab; 