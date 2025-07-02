import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { 
  getFriendStatus, 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend 
} from '../../services';
import { FriendStatus } from '../../types';
import { handleError } from '../../utils/errorHandler';

interface FriendRequestButtonProps {
  targetUserId: string;
  targetUserName: string;
  targetUserProfilePicture?: string;
  onStatusChange?: (status: FriendStatus) => void;
  style?: any;
}

const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  targetUserId,
  targetUserName,
  targetUserProfilePicture,
  onStatusChange,
  style
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [friendStatus, setFriendStatus] = useState<FriendStatus>({
    isFriend: false,
    hasIncomingRequest: false,
    hasOutgoingRequest: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    
    loadFriendStatus();
  }, [user?.id, targetUserId]);

  const loadFriendStatus = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const status = await getFriendStatus(user.id, targetUserId);
      setFriendStatus(status);
      onStatusChange?.(status);
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      await sendFriendRequest(
        user.id,
        user.displayName,
        user.profilePicture,
        targetUserId,
        targetUserName,
        targetUserProfilePicture
      );
      await loadFriendStatus();
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendStatus.requestId) return;
    
    try {
      setIsProcessing(true);
      await acceptFriendRequest(friendStatus.requestId);
      await loadFriendStatus();
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!friendStatus.requestId) return;
    
    Alert.alert(
      'Decline Friend Request',
      `Decline friend request from ${targetUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await declineFriendRequest(friendStatus.requestId!);
              await loadFriendStatus();
            } catch (error) {
              handleError(error, { showAlert: true });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelRequest = async () => {
    if (!friendStatus.requestId) return;
    
    Alert.alert(
      'Cancel Friend Request',
      `Cancel friend request to ${targetUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await cancelFriendRequest(friendStatus.requestId!);
              await loadFriendStatus();
            } catch (error) {
              handleError(error, { showAlert: true });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveFriend = async () => {
    if (!friendStatus.friendshipId) return;
    
    Alert.alert(
      'Remove Friend',
      `Remove ${targetUserName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await removeFriend(friendStatus.friendshipId!);
              await loadFriendStatus();
            } catch (error) {
              handleError(error, { showAlert: true });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Don't show button for own profile
  if (!user || user.id === targetUserId) {
    return null;
  }

  if (isLoading) {
    return (
      <TouchableOpacity style={[styles.button, styles.loadingButton, style]} disabled>
        <ActivityIndicator size="small" color={theme.textSecondary} />
      </TouchableOpacity>
    );
  }

  if (friendStatus.isFriend) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.friendButton, style]}
        onPress={handleRemoveFriend}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : (
          <Text style={styles.friendButtonText}>Friends ✓</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (friendStatus.hasIncomingRequest) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.acceptButton, style]}
        onPress={handleAcceptRequest}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.acceptButtonText}>Accept Request</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (friendStatus.hasOutgoingRequest) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.pendingButton, style]}
        onPress={handleCancelRequest}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : (
          <Text style={styles.pendingButtonText}>Request Sent</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles.addButton, style]}
      onPress={handleSendFriendRequest}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.addButtonText}>Add Friend</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: 36,
  },
  loadingButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  addButton: {
    backgroundColor: theme.primary,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: theme.success || theme.primary,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pendingButtonText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  friendButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  friendButtonText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FriendRequestButton; 