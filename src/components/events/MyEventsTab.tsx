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
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { getUserEvents, subscribeToUserEvents } from '../../services/eventService';
import { formatPSTDate, getEventStatus as getTimezoneEventStatus } from '../../utils/timezone';
import { formatTimeRange } from '../../utils/dateTimeUtils';
import { Button } from '../common/Button';
import EmptyState from '../common/EmptyState';
import ProfilePicture from '../common/ProfilePicture';

const MyEventsTab: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  
  const [userEvents, setUserEvents] = useState<BookClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    if (user) {
      loadUserEvents();
      const unsubscribe = subscribeToUserEvents(user.id, setUserEvents);
      return unsubscribe;
    }
  }, [user]);

  const loadUserEvents = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const events = await getUserEvents(user.id);
      setUserEvents(events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your events');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load your events');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUserEvents();
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

  const getEventRole = (event: BookClubEvent): 'hosting' | 'attending' => {
    return event.createdBy === user?.id ? 'hosting' : 'attending';
  };

  // Get event status with PST awareness (same as AllEventsTab)
  const getEventStatusInfo = (event: BookClubEvent) => {
    return getTimezoneEventStatus(event.date, event.startTime, event.endTime);
  };

  // Helper function to check if an event is in the past (using timezone-aware logic)
  const isEventPast = (event: BookClubEvent): boolean => {
    const status = getEventStatusInfo(event);
    return status.status === 'past';
  };

  // Categorize events into upcoming and past
  const categorizeEvents = (events: BookClubEvent[]) => {
    const upcoming: BookClubEvent[] = [];
    const past: BookClubEvent[] = [];
    
    events.forEach(event => {
      if (isEventPast(event)) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });
    
    // Sort upcoming events by date (earliest first)
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Sort past events by date (most recent first)
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { upcoming, past };
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
      position: 'relative',
      borderWidth: 1,
      borderColor: theme.border,
    },
    roleBadgeContainer: {
      position: 'absolute',
      top: 12,
      right: 12,
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

    statsContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 32,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    hostingStatNumber: {
      color: '#dc2626',
    },
    attendingStatNumber: {
      color: theme.success,
    },
    totalStatNumber: {
      color: theme.primary,
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
      position: 'relative',
    },
    listRoleBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    listRoleBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
      paddingRight: 60, // Space for role badge
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
      backgroundColor: theme.success,
      marginRight: 4,
    },
    listStatusText: {
      fontSize: 10,
      color: theme.success,
      fontWeight: '500',
    },
    listContent: {
      flex: 1,
      paddingLeft: 12,
    },
    listStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    listTime: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    listLocation: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
  });

  const EventListItem: React.FC<{ event: BookClubEvent }> = ({ event }) => {
    const role = getEventRole(event);
    const status = getEventDisplayStatus(event);

    return (
      <TouchableOpacity
        onPress={() => navigateToEventDetails(event.id)}
        style={dynamicStyles.listItem}
      >
        {/* Role Badge */}
        <View style={[
          dynamicStyles.listRoleBadge,
          role === 'hosting' ? dynamicStyles.hostingBadge : dynamicStyles.attendingBadge
        ]}>
          <Text style={dynamicStyles.listRoleBadgeText}>
            {role === 'hosting' ? 'Hosting' : 'Attending'}
          </Text>
        </View>

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
              {role === 'hosting' ? 'You are hosting' : event.hostName}
            </Text>
          </View>
          
          <View style={dynamicStyles.listStatus}>
            <View style={[dynamicStyles.listStatusDot, { backgroundColor: status.color }]} />
            <Text style={[dynamicStyles.listStatusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EventCard: React.FC<{ event: BookClubEvent }> = ({ event }) => {
    const role = getEventRole(event);
    const status = getEventDisplayStatus(event);

    return (
      <TouchableOpacity
        style={dynamicStyles.eventCard}
        onPress={() => navigateToEventDetails(event.id)}
        activeOpacity={0.8}
      >
        {/* Role Badge */}
        <View style={dynamicStyles.roleBadgeContainer}>
          <View style={[
            dynamicStyles.roleBadge,
            role === 'hosting' ? dynamicStyles.hostingBadge : dynamicStyles.attendingBadge
          ]}>
            <Text style={dynamicStyles.roleBadgeText}>
              {role === 'hosting' ? 'Hosting' : 'Attending'}
            </Text>
          </View>
        </View>

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
                {role === 'hosting' ? 'You are hosting' : `Hosted by ${event.hostName}`}
              </Text>
            </View>
            
            {/* Event Status Indicator */}
            <View style={dynamicStyles.row}>
              <View style={[dynamicStyles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[dynamicStyles.statusText, { color: status.color }]}>{status.text}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      emoji="📅"
      title="No Events Yet"
      subtitle="You haven't RSVP'd to any events or created any events yet. Start by browsing all events or creating your own!"
      buttonTitle="Create Your First Event"
      onButtonPress={navigateToCreateEvent}
      buttonVariant="error"
    />
  );

  if (isLoading) {
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
      {userEvents.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header with View Toggle */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>My Events</Text>
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
            {(() => {
              const { upcoming, past } = categorizeEvents(userEvents);
              
              return (
                <>
                  {/* Upcoming Events Section */}
                  {upcoming.length > 0 && (
                    <>
                      <View style={dynamicStyles.sectionHeader}>
                        <Text style={dynamicStyles.sectionTitle}>Upcoming Events</Text>
                        <Text style={dynamicStyles.sectionSubtitle}>
                          {upcoming.length} event{upcoming.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      {upcoming.map((event) => 
                        viewMode === 'card' ? (
                          <EventCard key={event.id} event={event} />
                        ) : (
                          <EventListItem key={event.id} event={event} />
                        )
                      )}
                    </>
                  )}

                  {/* Past Events Section */}
                  {past.length > 0 && (
                    <>
                      <View style={dynamicStyles.sectionHeader}>
                        <Text style={dynamicStyles.sectionTitle}>Past Events</Text>
                        <Text style={dynamicStyles.sectionSubtitle}>
                          {past.length} event{past.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      {past.map((event) => 
                        viewMode === 'card' ? (
                          <EventCard key={event.id} event={event} />
                        ) : (
                          <EventListItem key={event.id} event={event} />
                        )
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MyEventsTab; 