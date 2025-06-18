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
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getEventRole = (event: BookClubEvent): 'hosting' | 'attending' => {
    return event.createdBy === user?.id ? 'hosting' : 'attending';
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
      backgroundColor: '#8b5cf6',
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
    hostAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
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
    hostText: {
      fontSize: 14,
      color: theme.textTertiary,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.success,
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      color: theme.success,
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
      marginBottom: 32,
      lineHeight: 24,
    },
    createButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
    },
    createButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
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
      color: '#8b5cf6',
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
    listHostAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 6,
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
  });

  const EventListItem: React.FC<{ event: BookClubEvent }> = ({ event }) => {
    const role = getEventRole(event);
    
    return (
      <TouchableOpacity
        onPress={() => navigateToEventDetails(event.id)}
        style={dynamicStyles.listItem}
      >
        {/* Role Badge */}
        <View 
          style={[
            dynamicStyles.listRoleBadge,
            role === 'hosting' ? dynamicStyles.hostingBadge : dynamicStyles.attendingBadge
          ]}
        >
          <Text style={dynamicStyles.listRoleBadgeText}>
            {role === 'hosting' ? '🏠' : '✅'}
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
          <Text style={dynamicStyles.emoji}>🕐</Text>
          <Text style={dynamicStyles.listDetailText} numberOfLines={1}>
            {formatTime(event.time)}
          </Text>
        </View>
        
        <View style={dynamicStyles.listDetails}>
          <Text style={dynamicStyles.emoji}>📍</Text>
          <Text style={dynamicStyles.listDetailText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        {/* Host and Status */}
        <View style={dynamicStyles.listHost}>
          <View style={dynamicStyles.hostInfo}>
            {event.hostProfilePicture ? (
              <Image
                source={{ uri: event.hostProfilePicture }}
                style={dynamicStyles.listHostAvatar}
              />
            ) : (
              <View style={[dynamicStyles.listHostAvatar, dynamicStyles.hostAvatarPlaceholder]}>
                <Text style={[dynamicStyles.hostInitial, { fontSize: 10 }]}>
                  {event.hostName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={dynamicStyles.listHostText}>
              {role === 'hosting' ? 'You' : event.hostName}
            </Text>
          </View>
          
          <View style={dynamicStyles.listStatus}>
            <View style={dynamicStyles.listStatusDot} />
            <Text style={dynamicStyles.listStatusText}>Active</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EventCard: React.FC<{ event: BookClubEvent }> = ({ event }) => {
    const role = getEventRole(event);
    
    return (
      <TouchableOpacity
        onPress={() => navigateToEventDetails(event.id)}
        style={dynamicStyles.eventCard}
      >
        {/* Role Badge */}
        <View style={dynamicStyles.roleBadgeContainer}>
          <View 
            style={[
              dynamicStyles.roleBadge,
              role === 'hosting' ? dynamicStyles.hostingBadge : dynamicStyles.attendingBadge
            ]}
          >
            <Text style={dynamicStyles.roleBadgeText}>
              {role === 'hosting' ? '🏠 Hosting' : '✅ Going'}
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
            <Text style={dynamicStyles.bookEmoji}>📚</Text>
          </View>
        )}
        
        {/* Event Content */}
        <View style={dynamicStyles.cardContent}>
          {/* Title */}
          <Text style={dynamicStyles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          
          {/* Date and Time */}
          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.emoji}>📅</Text>
            <Text style={dynamicStyles.eventDetail}>
              {formatDate(event.date)} at {formatTime(event.time)}
            </Text>
          </View>
          
          {/* Location */}
          <View style={[dynamicStyles.row, { marginBottom: 12 }]}>
            <Text style={dynamicStyles.emoji}>📍</Text>
            <Text style={[dynamicStyles.eventDetail, dynamicStyles.flex1]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          
          {/* Host Info */}
          <View style={dynamicStyles.hostRow}>
            <View style={dynamicStyles.row}>
              {event.hostProfilePicture ? (
                <Image
                  source={{ uri: event.hostProfilePicture }}
                  style={dynamicStyles.hostAvatar}
                />
              ) : (
                <View style={[dynamicStyles.hostAvatar, dynamicStyles.hostAvatarPlaceholder]}>
                  <Text style={dynamicStyles.hostInitial}>
                    {event.hostName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={dynamicStyles.hostText}>
                {role === 'hosting' ? 'You are hosting' : `Hosted by ${event.hostName}`}
              </Text>
            </View>
            
            {/* Event Status Indicator */}
            <View style={dynamicStyles.row}>
              <View style={dynamicStyles.statusDot} />
              <Text style={dynamicStyles.statusText}>Active</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={dynamicStyles.emptyState}>
      <Text style={dynamicStyles.emptyEmoji}>📅</Text>
      <Text style={dynamicStyles.emptyTitle}>
        No Events Yet
      </Text>
      <Text style={dynamicStyles.emptySubtitle}>
        You haven't RSVP'd to any events or created any events yet. Start by browsing all events or creating your own!
      </Text>
      
      <TouchableOpacity
        onPress={navigateToCreateEvent}
        style={dynamicStyles.createButton}
      >
        <Text style={dynamicStyles.createButtonText}>Create Your First Event</Text>
      </TouchableOpacity>
    </View>
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
        <EmptyState />
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
                  📋
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
                  📄
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
            {userEvents.map((event) => 
              viewMode === 'card' ? (
                <EventCard key={event.id} event={event} />
              ) : (
                <EventListItem key={event.id} event={event} />
              )
            )}
            
            {/* Summary Stats */}
            <View style={dynamicStyles.statsContainer}>
              <Text style={dynamicStyles.statsTitle}>Your Event Summary</Text>
              <View style={dynamicStyles.statsRow}>
                <View style={dynamicStyles.statItem}>
                  <Text style={[dynamicStyles.statNumber, dynamicStyles.hostingStatNumber]}>
                    {userEvents.filter(event => event.createdBy === user?.id).length}
                  </Text>
                  <Text style={dynamicStyles.statLabel}>Hosting</Text>
                </View>
                <View style={dynamicStyles.statItem}>
                  <Text style={[dynamicStyles.statNumber, dynamicStyles.attendingStatNumber]}>
                    {userEvents.filter(event => event.createdBy !== user?.id).length}
                  </Text>
                  <Text style={dynamicStyles.statLabel}>Attending</Text>
                </View>
                <View style={dynamicStyles.statItem}>
                  <Text style={[dynamicStyles.statNumber, dynamicStyles.totalStatNumber]}>
                    {userEvents.length}
                  </Text>
                  <Text style={dynamicStyles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MyEventsTab; 