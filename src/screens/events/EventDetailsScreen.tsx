import React, { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { EventComment, RSVP, Mention, UserSuggestion } from '../../types';
import ProfilePicture from '../../components/common/ProfilePicture';
import EventDetailsSkeleton from '../../components/common/EventDetailsSkeleton';
import MentionInput from '../../components/common/MentionInput';
import MentionText from '../../components/common/MentionText';
import ClickableUser from '../../components/common/ClickableUser';
import { handleError } from '../../utils/errorHandler';
import { getEventParticipantsForMentions } from '../../services/userService';
import AddressAction from '../../components/common/AddressAction';
import { BookClubEvent } from '../../types';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

type RouteParams = {
  EventDetails: {
    eventId: string;
  };
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  headerContainer: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 64,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editEventButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editEventText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteEventButton: {
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deleteEventText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 24,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 34,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostInfo: {
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  hostRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  callHostButton: {
    marginLeft: 'auto',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  callHostText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rsvpSection: {
    marginBottom: 32,
  },
  rsvpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  rsvpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rsvpButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  rsvpButtonGoing: {
    backgroundColor: 'white',
    borderColor: '#10b981',
  },
  rsvpButtonGoingSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  rsvpButtonMaybe: {
    backgroundColor: 'white',
    borderColor: '#f59e0b',
  },
  rsvpButtonMaybeSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  rsvpButtonNotGoing: {
    backgroundColor: 'white',
    borderColor: '#ef4444',
  },
  rsvpButtonNotGoingSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  rsvpButtonTextSelected: {
    color: 'white',
  },
  attendeesSection: {
    marginBottom: 24,
  },
  attendeesList: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  attendeeItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  attendeeClickable: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  attendeeName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  commentsSection: {
    marginBottom: 24,
  },
  addCommentContainer: {
    marginBottom: 24,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#111827',
  },
  sendCommentButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendCommentButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendCommentText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  commentsList: {
    gap: 16,
  },
  noCommentsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  commentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  replyItem: {
    marginLeft: 32,
    marginTop: 12,
    backgroundColor: '#f9fafb',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  deleteCommentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCommentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  replyButton: {
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 14,
    color: '#ec4899',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  replyInputContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  replyInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelReplyButton: {
    padding: 4,
  },
  cancelReplyText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  replyToUserText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  replySubmitButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  replySubmitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  replySubmitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

// Move CommentItem outside the main component to prevent re-creation on each render
const CommentItem: React.FC<{ 
  comment: EventComment; 
  isReply?: boolean;
  user: any;
  replyStates: Record<string, { isReplying: boolean; content: string; mentions: Mention[] }>;
  availableUsers: UserSuggestion[];
  isCommenting: boolean;
  onDeleteComment: (commentId: string) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: (commentId: string) => void;
  onReplyTextChange: (commentId: string, text: string, mentions: Mention[]) => void;
  onAddReply: (commentId: string) => void;
  onMentionPress: (mention: Mention) => void;
}> = memo(({ 
  comment, 
  isReply = false, 
  user, 
  replyStates, 
  availableUsers, 
  isCommenting,
  onDeleteComment,
  onStartReply,
  onCancelReply,
  onReplyTextChange,
  onAddReply,
  onMentionPress
}) => {
  const canDelete = user?.role === 'admin' || user?.id === comment.userId;
  const replyState = replyStates[comment.id] || { isReplying: false, content: '', mentions: [] };
  
  // Memoize the reply text change handler for this specific comment
  const handleThisReplyTextChange = useCallback((text: string, mentions: Mention[]) => {
    onReplyTextChange(comment.id, text, mentions);
  }, [comment.id, onReplyTextChange]);
  
  return (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentHeader}>
        <ClickableUser
          userId={comment.userId}
          displayName={comment.userName}
          profilePicture={comment.userProfilePicture}
          avatarSize="small"
          textStyle={styles.commentAuthor}
        />
        
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>
            {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {canDelete && (
          <TouchableOpacity
            onPress={() => onDeleteComment(comment.id)}
            style={styles.deleteCommentButton}
          >
            <Text style={styles.deleteCommentText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <MentionText 
        text={comment.content} 
        mentions={comment.mentions || []} 
        style={styles.commentContent}
        onMentionPress={onMentionPress}
      />
      
      {!isReply && (
        <TouchableOpacity
          onPress={() => onStartReply(comment.id)}
          style={styles.replyButton}
        >
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      )}

      {/* Reply Input Box - appears under this comment when replying */}
      {!isReply && replyState.isReplying && (
        <View style={styles.replyInputContainer}>
          <View style={styles.replyInputHeader}>
            <Text style={styles.replyToUserText}>Replying to {comment.userName}</Text>
            <TouchableOpacity
              onPress={() => onCancelReply(comment.id)}
              style={styles.cancelReplyButton}
            >
              <Text style={styles.cancelReplyText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.commentInputContainer}>
            <MentionInput
              key={`reply-${comment.id}`}
              value={replyState.content}
              onChangeText={handleThisReplyTextChange}
              placeholder="Write a reply..."
              users={availableUsers}
              multiline
              maxLength={500}
              style={styles.commentInput}
            />
            <TouchableOpacity
              onPress={() => onAddReply(comment.id)}
              disabled={!replyState.content.trim() || isCommenting}
              style={[
                styles.replySubmitButton,
                (!replyState.content.trim() || isCommenting) && styles.replySubmitButtonDisabled
              ]}
            >
              {isCommenting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.replySubmitText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Render replies */}
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem 
          key={reply.id} 
          comment={reply} 
          isReply={true}
          user={user}
          replyStates={replyStates}
          availableUsers={availableUsers}
          isCommenting={isCommenting}
          onDeleteComment={onDeleteComment}
          onStartReply={onStartReply}
          onCancelReply={onCancelReply}
          onReplyTextChange={onReplyTextChange}
          onAddReply={onAddReply}
          onMentionPress={onMentionPress}
        />
      ))}
    </View>
  );
});

const EventDetailsScreen: React.FC = memo(() => {
  const route = useRoute<RouteProp<RouteParams, 'EventDetails'>>();
  const navigation = useNavigation();
  const { eventId } = route.params;
  
  const { user } = useAuthStore();
  const {
    currentEvent,
    isLoading,
    isRsvping,
    isCommenting,
    error,
    loadEvent,
    updateRSVP,
    createComment,
    deleteComment,
    deleteEvent,
    clearError,
    subscribeToEventDetails
  } = useEventStore();

  const [newComment, setNewComment] = useState('');
  const [commentMentions, setCommentMentions] = useState<Mention[]>([]);
  const [replyStates, setReplyStates] = useState<Record<string, { isReplying: boolean; content: string; mentions: Mention[] }>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserSuggestion[]>([]);

  useEffect(() => {
    if (eventId && user) {
      loadEvent(eventId, user.id);
      
      // Load users for mentions
      loadUsersForMentions();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToEventDetails(eventId, user.id);
      return unsubscribe;
    }
  }, [eventId, user?.id]);

  const loadUsersForMentions = async () => {
    if (!eventId) return;
    
    try {
      const users = await getEventParticipantsForMentions(eventId);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users for mentions:', error);
      // Continue without mentions if loading fails
      setAvailableUsers([]);
    }
  };

  const handleRefresh = async () => {
    if (!eventId || !user) return;
    
    setIsRefreshing(true);
    try {
      await loadEvent(eventId, user.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRSVP = async (status: 'going' | 'maybe' | 'not-going') => {
    if (!user || !currentEvent) return;
    
    try {
      await updateRSVP(
        currentEvent.id,
        user.id,
        user.displayName,
        status,
        user.profilePicture
      );
    } catch (error) {
      await handleError(error, {
        showAlert: true,
        logError: true,
        autoRetry: true,
        maxRetries: 2,
      }, () => handleRSVP(status));
    }
  };

  const handleAddComment = async () => {
    if (!user || !currentEvent || !newComment.trim()) return;
    
    try {
      await createComment(
        currentEvent.id,
        user.id,
        user.displayName,
        { 
          content: newComment.trim(), 
          mentions: commentMentions 
        },
        user.profilePicture
      );
      
      setNewComment('');
      setCommentMentions([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!user || !currentEvent) return;
    
    const replyState = replyStates[parentCommentId];
    if (!replyState || !replyState.content.trim()) return;
    
    try {
      await createComment(
        currentEvent.id,
        user.id,
        user.displayName,
        { 
          content: replyState.content.trim(), 
          parentCommentId,
          mentions: replyState.mentions 
        },
        user.profilePicture
      );
      
      // Clear the reply state for this comment
      setReplyStates(prev => ({
        ...prev,
        [parentCommentId]: { isReplying: false, content: '', mentions: [] }
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to add reply. Please try again.');
    }
  };

  const handleMentionPress = (mention: Mention) => {
    // Navigate to user profile
    (navigation as any).navigate('UserProfile', { userId: mention.userId });
  };

  const handleCommentTextChange = useCallback((text: string, mentions: Mention[]) => {
    setNewComment(text);
    setCommentMentions(mentions);
  }, []);

  const handleReplyTextChange = useCallback((commentId: string, text: string, mentions: Mention[]) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: { ...prev[commentId], content: text, mentions }
    }));
  }, []);

  const handleStartReply = useCallback((commentId: string) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: { isReplying: true, content: '', mentions: [] }
    }));
  }, []);

  const handleCancelReply = useCallback((commentId: string) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: { isReplying: false, content: '', mentions: [] }
    }));
  }, []);

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteComment(commentId)
        }
      ]
    );
  };

  const handleDeleteEvent = () => {
    if (!currentEvent) return;
    
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this entire event? This will remove all RSVPs and comments. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Event',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(currentEvent.id);
              navigation.goBack();
              Alert.alert('Success', 'Event deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleCallHost = () => {
    // Placeholder for calling host
    Alert.alert('Call Host', 'Contact feature coming soon!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getRSVPButtonStyle = (status: 'going' | 'maybe' | 'not-going') => {
    const userStatus = currentEvent?.userRsvp?.status;
    const isSelected = userStatus === status;
    
    const baseStyle = [styles.rsvpButton];
    
    switch (status) {
      case 'going':
        return [...baseStyle, isSelected ? styles.rsvpButtonGoingSelected : styles.rsvpButtonGoing];
      case 'maybe':
        return [...baseStyle, isSelected ? styles.rsvpButtonMaybeSelected : styles.rsvpButtonMaybe];
      case 'not-going':
        return [...baseStyle, isSelected ? styles.rsvpButtonNotGoingSelected : styles.rsvpButtonNotGoing];
    }
  };

  const getRSVPTextStyle = (status: 'going' | 'maybe' | 'not-going') => {
    const userStatus = currentEvent?.userRsvp?.status;
    const isSelected = userStatus === status;
    
    return [styles.rsvpButtonText, isSelected && styles.rsvpButtonTextSelected];
  };

  if (isLoading || !currentEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <EventDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              if (eventId && user) {
                loadEvent(eventId, user.id);
              }
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          className="flex-1"
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Loading State */}
          {isLoading && !currentEvent && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ec4899" />
              <Text style={styles.loadingText}>Loading event...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  clearError();
                  if (eventId && user) loadEvent(eventId, user.id);
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Event Content */}
          {currentEvent && (
            <View>
              {/* Header Image */}
              <View style={styles.headerContainer}>
                {currentEvent.headerPhoto ? (
                  <Image
                    source={{ uri: currentEvent.headerPhoto }}
                    style={styles.headerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.headerPlaceholder}>
                  </View>
                )}
                
                {/* Header Overlay */}
                <View style={styles.headerOverlay}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                  >
                    <Text style={styles.backButtonText}>←</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.headerActions}>
                    {/* Edit button - show for event creator or admin */}
                    {(user?.id === currentEvent.createdBy || user?.role === 'admin') && (
                      <TouchableOpacity
                        onPress={() => (navigation as any).navigate('EditEvent', { eventId: currentEvent.id })}
                        style={styles.editEventButton}
                      >
                        <Text style={styles.editEventText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* Delete button - show only for admin */}
                    {user?.role === 'admin' && (
                      <TouchableOpacity
                        onPress={handleDeleteEvent}
                        style={styles.deleteEventButton}
                      >
                        <Text style={styles.deleteEventText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Event Content */}
              <View style={styles.content}>
                {/* Title */}
                <Text style={styles.eventTitle}>{currentEvent.title}</Text>
                
                {/* Date & Time */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoText}>
                      {formatDate(currentEvent.date)}
                    </Text>
                    <Text style={styles.infoSubtext}>
                      {formatTime(currentEvent.startTime, currentEvent.endTime)}
                    </Text>
                  </View>
                </View>
                
                {/* Location */}
                <AddressAction
                  address={currentEvent.address}
                  style={styles.infoRow}
                >
                  <Text style={styles.infoIcon}>📍</Text>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoText, styles.linkText]}>
                      {currentEvent.location}
                    </Text>
                    <Text style={styles.infoSubtext}>
                      {currentEvent.address}
                    </Text>
                  </View>
                </AddressAction>
                
                {/* Host */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>👤</Text>
                  <View style={styles.infoContent}>
                    <View style={styles.hostContainer}>
                      <Text style={styles.infoText}>Hosted by </Text>
                      <ClickableUser
                        userId={currentEvent.createdBy}
                        displayName={currentEvent.hostName}
                        profilePicture={currentEvent.hostProfilePicture}
                        showAvatar={false}
                        textStyle={[styles.infoText, styles.linkText]}
                      />
                    </View>
                    <Text style={styles.infoSubtext}>
                      Tap name to view profile
                    </Text>
                  </View>
                </View>
                
                {/* RSVP Section */}
                <View style={styles.rsvpSection}>
                  <Text style={styles.sectionTitle}>Will you be attending?</Text>
                  
                  <View style={styles.rsvpButtons}>
                    <TouchableOpacity
                      onPress={() => handleRSVP('going')}
                      disabled={isRsvping}
                      style={getRSVPButtonStyle('going')}
                    >
                      <Text style={getRSVPTextStyle('going')}>
                        ✓ Going ({currentEvent.stats.goingCount})
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleRSVP('maybe')}
                      disabled={isRsvping}
                      style={getRSVPButtonStyle('maybe')}
                    >
                      <Text style={getRSVPTextStyle('maybe')}>
                        ? Maybe ({currentEvent.stats.maybeCount})
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleRSVP('not-going')}
                      disabled={isRsvping}
                      style={getRSVPButtonStyle('not-going')}
                    >
                      <Text style={getRSVPTextStyle('not-going')}>
                        ✗ Can't Go ({currentEvent.stats.notGoingCount})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Attendees Section */}
                {currentEvent.stats.goingCount > 0 && (
                  <View style={styles.attendeesSection}>
                    <Text style={styles.sectionTitle}>
                      Who's Going ({currentEvent.stats.goingCount})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.attendeesList}>
                        {currentEvent.rsvps
                          .filter(rsvp => rsvp.status === 'going')
                          .map((rsvp) => (
                            <View key={rsvp.id} style={styles.attendeeItem}>
                              <ClickableUser
                                userId={rsvp.userId}
                                displayName={rsvp.userName}
                                profilePicture={rsvp.userProfilePicture}
                                avatarSize="medium"
                                showName={true}
                                textStyle={styles.attendeeName}
                                containerStyle={styles.attendeeClickable}
                              />
                            </View>
                          ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
                
                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>About This Event</Text>
                  <Text style={styles.description}>{currentEvent.description}</Text>
                </View>
                
                {/* Comments Section */}
                <View style={styles.commentsSection}>
                  <Text style={styles.sectionTitle}>
                    Discussion ({currentEvent.stats.commentsCount})
                  </Text>
                  
                  {/* Add Comment */}
                  <View style={styles.addCommentContainer}>
                    <View style={styles.commentInputContainer}>
                      <MentionInput
                        key="main-comment"
                        value={newComment}
                        onChangeText={handleCommentTextChange}
                        placeholder="Add a comment..."
                        users={availableUsers}
                        multiline
                        maxLength={500}
                        style={styles.commentInput}
                      />
                      <TouchableOpacity
                        onPress={handleAddComment}
                        disabled={!newComment.trim() || isCommenting}
                        style={[
                          styles.sendCommentButton,
                          (!newComment.trim() || isCommenting) && styles.sendCommentButtonDisabled
                        ]}
                      >
                        {isCommenting ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.sendCommentText}>Send</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Comments List */}
                  <View style={styles.commentsList}>
                    {currentEvent.comments.length === 0 ? (
                      <View style={styles.noCommentsContainer}>
                        <Text style={styles.noCommentsText}>
                          No comments yet. Be the first to start the discussion!
                        </Text>
                      </View>
                    ) : (
                      currentEvent.comments.map((comment) => (
                        <CommentItem 
                          key={comment.id} 
                          comment={comment}
                          user={user}
                          replyStates={replyStates}
                          availableUsers={availableUsers}
                          isCommenting={isCommenting}
                          onDeleteComment={handleDeleteComment}
                          onStartReply={handleStartReply}
                          onCancelReply={handleCancelReply}
                          onReplyTextChange={handleReplyTextChange}
                          onAddReply={handleAddReply}
                          onMentionPress={handleMentionPress}
                        />
                      ))
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

export default EventDetailsScreen; 