import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
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
import ImageViewer from '../common/ImageViewer';
import * as ImagePickerExpo from 'expo-image-picker';
import { Mention } from '../../types/mentions';
import { uploadCommentImage } from '../../services';

// CommentItem component following the event discussion structure
const CommentItem: React.FC<{
  comment: ProfileComment;
  isReply?: boolean;
  user: any;
  isOwnProfile: boolean;
  onDeleteComment: (comment: ProfileComment) => void;
  onOpenImageViewer: (images: string[], initialIndex: number) => void;
}> = memo(({
  comment,
  isReply = false,
  user,
  isOwnProfile,
  onDeleteComment,
  onOpenImageViewer
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const canDelete = user && (comment.authorId === user.id || isOwnProfile);
  
  return (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentHeader}>
        <ClickableUser
          userId={comment.authorId}
          displayName={comment.authorName}
          profilePicture={comment.authorProfilePicture}
          avatarSize={isReply ? "small" : "medium"}
          textStyle={styles.commentAuthor}
        />
        
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </View>
        
        {/* Report button for other users' comments */}
        {user && comment.authorId !== user.id && (
          <View style={styles.reportButtonContainer}>
            <ReportButton
              contentType="comment"
              contentId={comment.id}
              contentOwnerId={comment.authorId}
              contentOwnerName={comment.authorName}
              contentPreview={comment.content.substring(0, 100)}
              variant="icon"
              size="small"
            />
          </View>
        )}
        
        {canDelete && (
          <TouchableOpacity
            onPress={() => onDeleteComment(comment)}
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
              onPress={() => onOpenImageViewer(comment.images!, index)}
            >
              <Image
                source={{ uri: imageUrl }}
                style={isReply ? styles.replyImage : styles.commentImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {/* Render replies */}
      {!isReply && comment.replies && comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isReply={true}
          user={user}
          isOwnProfile={isOwnProfile}
          onDeleteComment={onDeleteComment}
          onOpenImageViewer={onOpenImageViewer}
        />
      ))}
    </View>
  );
});

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
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerInitialIndex, setImageViewerInitialIndex] = useState(0);
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

  const openImageViewer = (images: string[], initialIndex: number = 0) => {
    setImageViewerImages(images);
    setImageViewerInitialIndex(initialIndex);
    setImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewerVisible(false);
    setImageViewerImages([]);
    setImageViewerInitialIndex(0);
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

  // Updated to use the new CommentItem component structure
  const renderComment = ({ item: comment }: { item: ProfileComment }) => (
    <CommentItem
      comment={comment}
      user={user}
      isOwnProfile={isOwnProfile}
      onDeleteComment={handleDeleteComment}
      onOpenImageViewer={openImageViewer}
    />
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
      <View style={styles.addCommentContainer}>
        {/* Image Preview */}
        {newCommentImages.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagePreviewContainer}
          >
            {newCommentImages.map((imageUrl, index) => (
              <View key={index} style={styles.imagePreviewItem}>
                <TouchableOpacity
                  onPress={() => openImageViewer(newCommentImages, index)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
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
        
        <View style={styles.commentInputContainer}>
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
          
          <View style={styles.inputActions}>
            {(isUploadingImage || newCommentImages.length >= 3) ? (
              <TouchableOpacity 
                style={[styles.imagePickerButton, styles.imagePickerDisabled]}
                disabled
              >
                <Text style={styles.imagePickerDisabledText}>
                  {isUploadingImage ? 'Uploading...' : `${newCommentImages.length}/3`}
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
                <Text style={styles.imagePickerText}>📷</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.sendCommentButton,
                ((!newComment.trim() && newCommentImages.length === 0) || isPosting) && styles.sendCommentButtonDisabled,
              ]}
              onPress={handlePostComment}
              disabled={(!newComment.trim() && newCommentImages.length === 0) || isPosting}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.sendCommentText}>Send</Text>
              )}
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

      {/* Add Comment Section */}
      {renderCommentInput()}

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <View style={styles.commentsList}>
          {comments.length === 0 && !isLoading ? (
            renderEmptyState()
          ) : (
            comments.map((comment) => (
              <View key={comment.id}>
                {renderComment({ item: comment })}
              </View>
            ))
          )}
          
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
      </View>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={imageViewerVisible}
        images={imageViewerImages}
        initialIndex={imageViewerInitialIndex}
        onClose={closeImageViewer}
      />
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
  inputWrapper: {
    flex: 1,
  },
  // Event-style comment input
  addCommentContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.card,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    paddingRight: 8,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: theme.text,
  },
  sendCommentButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    marginLeft: 8,
    marginBottom: 4,
  },
  sendCommentButtonDisabled: {
    backgroundColor: theme.border,
  },
  sendCommentText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  commentsSection: {
    marginBottom: 24,
  },
  commentsList: {
    gap: 16,
    padding: 16,
  },
  // New event-style comment structure
  commentItem: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  replyItem: {
    marginLeft: 32,
    marginTop: 12,
    backgroundColor: theme.surface,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  reportButtonContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCommentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.error,
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
    color: theme.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  replyImagesContainer: {
    marginTop: 6,
  },
  replyImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 6,
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
    alignItems: 'center',
    gap: 8,
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