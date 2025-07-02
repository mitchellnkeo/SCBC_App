import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import {
  getProfileComments,
  getProfileCommentsPaginated,
  createProfileComment,
  deleteProfileComment,
  subscribeToProfileComments,
  getFriendStatus,
} from '../../services';
import { ProfileComment, FriendStatus } from '../../types';
import { handleError } from '../../utils/errorHandler';
import { formatTimeAgo } from '../../utils/dateTimeUtils';
import ProfilePicture from '../common/ProfilePicture';
import ClickableUser from '../common/ClickableUser';
import MentionText from '../common/MentionText';
import MentionInput from '../common/MentionInput';
import ReportButton from '../common/ReportButton';
import ImagePicker from '../common/ImagePicker';
import * as ImagePickerExpo from 'expo-image-picker';
import { Mention } from '../../types/mentions';
import { uploadCommentImage } from '../../services';

interface ProfileCommentWallProps {
  profileUserId: string;
  profileUserName: string;
  isOwnProfile: boolean;
}

const ProfileCommentWall: React.FC<ProfileCommentWallProps> = ({
  profileUserId,
  profileUserName,
  isOwnProfile,
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [usePagination, setUsePagination] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newCommentMentions, setNewCommentMentions] = useState<Mention[]>([]);
  const [newCommentImages, setNewCommentImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>({
    isFriend: false,
    hasIncomingRequest: false,
    hasOutgoingRequest: false,
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const styles = createStyles(theme);

  useEffect(() => {
    loadComments(true); // Initial load with reset
    checkCommentPermission();

    // Set up real-time subscription (this will override pagination for real-time updates)
    const unsubscribe = subscribeToProfileComments(profileUserId, (updatedComments) => {
      setComments(updatedComments);
      setUsePagination(false); // Disable pagination when using real-time updates
      setHasMore(false);
    });

    return () => unsubscribe();
  }, [profileUserId]);

  const loadComments = async (reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setLastVisible(null);
        setHasMore(true);
      }

      console.log('Loading comments for profile:', profileUserId);
      
      // Try paginated loading first, fall back to full loading if it fails
      try {
        const result = await getProfileCommentsPaginated(profileUserId, 10, reset ? null : lastVisible);
        
        if (reset) {
          setComments(result.comments);
        } else {
          setComments(prev => [...prev, ...result.comments]);
        }
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        setUsePagination(true);
        console.log('Loaded paginated comments:', result.comments.length, 'hasMore:', result.hasMore);
      } catch (paginationError: any) {
        console.log('Pagination failed, falling back to full load:', paginationError?.message || paginationError);
        
        // Check if it's an index building error
        if (paginationError?.message?.includes('index') || paginationError?.message?.includes('building')) {
          console.log('Firebase index is still building, using fallback method');
        }
        
        // Fall back to loading all comments
        try {
          const profileComments = await getProfileComments(profileUserId);
          setComments(profileComments);
          setUsePagination(false);
          setHasMore(false);
          console.log('Loaded all comments:', profileComments.length);
        } catch (fallbackError) {
          console.error('Both pagination and fallback failed:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Error in loadComments:', error);
      handleError(error, { showAlert: true });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (!hasMore || isLoadingMore || !usePagination) return;

    try {
      setIsLoadingMore(true);
      const result = await getProfileCommentsPaginated(profileUserId, 10, lastVisible);
      
      setComments(prev => [...prev, ...result.comments]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
      console.log('Loaded more comments:', result.comments.length, 'hasMore:', result.hasMore);
    } catch (error) {
      console.error('Error loading more comments:', error);
      handleError(error, { showAlert: true });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const checkCommentPermission = async () => {
    if (!user) return;

    if (isOwnProfile) {
      setCanComment(true);
      return;
    }

    try {
      const status = await getFriendStatus(user.id, profileUserId);
      setFriendStatus(status);
      setCanComment(status.isFriend);
    } catch (error) {
      console.error('Error checking friend status:', error);
      setCanComment(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadComments(true); // Reset pagination
    await checkCommentPermission();
    setIsRefreshing(false);
  };

  const handlePostComment = async () => {
    if (!user || (!newComment.trim() && newCommentImages.length === 0)) return;

    try {
      setIsPosting(true);
      await createProfileComment(
        profileUserId,
        user.id,
        user.displayName,
        user.profilePicture,
        {
          content: newComment.trim(),
          images: newCommentImages,
          mentions: newCommentMentions,
        }
      );

      setNewComment('');
      setNewCommentMentions([]);
      setNewCommentImages([]);
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelected = async (imageUri: string) => {
    if (!user) return;

    try {
      setIsUploadingImage(true);
      const result = await uploadCommentImage(imageUri, user.id);
      
      if (result.success && result.url) {
        setNewCommentImages(prev => [...prev, result.url!]);
      } else {
        Alert.alert('Upload Failed', result.error || 'Failed to upload image');
      }
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewCommentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteComment = (comment: ProfileComment) => {
    if (!user) return;

    // Only allow deletion if it's user's own comment or user's own profile
    const canDelete = comment.authorId === user.id || isOwnProfile;
    if (!canDelete) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfileComment(comment.id);
            } catch (error) {
              handleError(error, { showAlert: true });
            }
          },
        },
      ]
    );
  };

  const renderComment = ({ item: comment }: { item: ProfileComment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <ClickableUser
          userId={comment.authorId}
          displayName={comment.authorName}
          profilePicture={comment.authorProfilePicture}
          showAvatar
          avatarSize="medium"
        />
        <View style={styles.commentHeaderRight}>
          <Text style={styles.commentTime}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
          
          {/* Report button for other users' comments */}
          {user && comment.authorId !== user.id && (
            <ReportButton
              contentType="comment"
              contentId={comment.id}
              contentOwnerId={comment.authorId}
              contentOwnerName={comment.authorName}
              contentPreview={comment.content.substring(0, 100)}
              variant="icon"
              size="small"
            />
          )}
          
          {user && (comment.authorId === user.id || isOwnProfile) && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteComment(comment)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.commentContent}>
        <MentionText
          text={comment.content}
          mentions={comment.mentions || []}
          style={styles.commentText}
        />
        
        {/* Comment Images */}
        {comment.images && comment.images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.commentImagesContainer}
          >
            {comment.images.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  // In a full implementation, you might want to open a full-screen image viewer
                  Alert.alert('Image', 'Full image viewer would open here');
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.commentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Render replies if any */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <View key={reply.id} style={styles.replyContainer}>
              <View style={styles.replyHeader}>
                <ClickableUser
                  userId={reply.authorId}
                  displayName={reply.authorName}
                  profilePicture={reply.authorProfilePicture}
                  showAvatar
                  avatarSize="small"
                />
                                 <Text style={styles.replyTime}>
                   {formatTimeAgo(reply.createdAt)}
                 </Text>
              </View>
              <View style={styles.replyContent}>
                <MentionText
                  text={reply.content}
                  mentions={reply.mentions || []}
                  style={styles.replyText}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCommentInput = () => {
    if (!user || (!canComment && !isOwnProfile)) {
      if (!canComment && !isOwnProfile) {
        return (
          <View style={styles.permissionNotice}>
            <Text style={styles.permissionText}>
              {friendStatus.hasIncomingRequest
                ? 'Accept friend request to comment on this profile'
                : friendStatus.hasOutgoingRequest
                ? 'Friend request pending'
                : 'Add as friend to comment on this profile'}
            </Text>
          </View>
        );
      }
      return null;
    }

    return (
      <View style={styles.commentInputContainer}>
        <ProfilePicture
          imageUrl={user.profilePicture}
          displayName={user.displayName}
          size="medium"
        />
        <View style={styles.inputWrapper}>
          <MentionInput
            value={newComment}
            onChangeText={(text, mentions) => {
              setNewComment(text);
              setNewCommentMentions(mentions);
            }}
            users={availableUsers}
            placeholder={
              isOwnProfile
                ? 'Write something on your profile...'
                : `Write something on ${profileUserName}'s profile...`
            }
            style={styles.commentInput}
            multiline
            maxLength={500}
          />
          
          {/* Image Preview */}
          {newCommentImages.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagePreviewContainer}
            >
              {newCommentImages.map((imageUrl, index) => (
                <View key={index} style={styles.imagePreviewItem}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          
          <View style={styles.inputActions}>
            {(isUploadingImage || newCommentImages.length >= 3) ? (
              <TouchableOpacity 
                style={[styles.imagePickerButton, styles.imagePickerDisabled]}
                disabled
              >
                <Text style={styles.imagePickerDisabledText}>
                  {isUploadingImage ? 'Uploading...' : '3 images max'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={() => {
                  Alert.alert(
                    'Add Image',
                    'Choose how you\'d like to add a photo',
                    [
                      {
                        text: 'Camera',
                        onPress: async () => {
                          const result = await ImagePickerExpo.launchCameraAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            quality: 0.8,
                          });
                          if (!result.canceled && result.assets?.[0]) {
                            handleImageSelected(result.assets[0].uri);
                          }
                        },
                      },
                      {
                        text: 'Photo Library',
                        onPress: async () => {
                          const result = await ImagePickerExpo.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            quality: 0.8,
                          });
                          if (!result.canceled && result.assets?.[0]) {
                            handleImageSelected(result.assets[0].uri);
                          }
                        },
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.imagePickerText}>📷 Add Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.postButton,
                ((!newComment.trim() && newCommentImages.length === 0) || isPosting) && styles.postButtonDisabled,
              ]}
              onPress={handlePostComment}
              disabled={(!newComment.trim() && newCommentImages.length === 0) || isPosting}
            >
              <Text
                style={[
                  styles.postButtonText,
                  ((!newComment.trim() && newCommentImages.length === 0) || isPosting) && styles.postButtonTextDisabled,
                ]}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {isOwnProfile
          ? 'No comments on your profile yet'
          : `No comments on ${profileUserName}'s profile yet`}
      </Text>
      {canComment && (
        <Text style={styles.emptyStateSubtext}>
          Be the first to leave a comment!
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'Your Wall' : `${profileUserName}'s Wall`}
        </Text>
        <Text style={styles.commentCount}>
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      <View style={styles.commentsList}>
        {comments.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <View style={styles.commentsListContent}>
            {comments.map((comment) => (
              <View key={comment.id}>
                {renderComment({ item: comment })}
              </View>
            ))}
            
            {/* Load More Button */}
            {usePagination && hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreComments}
                disabled={isLoadingMore}
              >
                <Text style={styles.loadMoreText}>
                  {isLoadingMore ? 'Loading more...' : 'Load more comments'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {renderCommentInput()}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  commentCount: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    alignItems: 'flex-start',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  postButtonDisabled: {
    backgroundColor: theme.border,
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: theme.textSecondary,
  },
  permissionNotice: {
    padding: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  permissionText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  commentsList: {
    // Container for comments list
  },
  commentsListContent: {
    padding: 16,
  },
  commentContainer: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentTime: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  commentContent: {
    marginLeft: 44, // Align with avatar
  },
  commentText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 22,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 22,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: theme.border,
  },
  replyContainer: {
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  replyTime: {
    fontSize: 10,
    color: theme.textTertiary,
  },
  replyContent: {
    marginLeft: 32, // Align with small avatar
  },
  replyText: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.textTertiary,
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  // Image styles
  commentImagesContainer: {
    marginTop: 8,
  },
  commentImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  imagePreviewContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  imagePickerButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imagePickerDisabled: {
    backgroundColor: theme.border,
    opacity: 0.6,
  },
  imagePickerText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  imagePickerDisabledText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
});

export default ProfileCommentWall; 