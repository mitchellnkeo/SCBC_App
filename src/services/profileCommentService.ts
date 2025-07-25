import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  limit,
  startAfter,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  ProfileComment, 
  CreateProfileCommentData,
  User 
} from '../types';
import { Mention } from '../types/mentions';
import { createNotification, createMentionNotifications } from './internalNotificationService';

const PROFILE_COMMENTS_COLLECTION = 'profileComments';

/**
 * Create a new profile comment
 */
export const createProfileComment = async (
  profileUserId: string,
  authorId: string,
  authorName: string,
  authorProfilePicture: string | undefined,
  commentData: CreateProfileCommentData
): Promise<string> => {
  try {
    const comment = {
      profileUserId,
      authorId,
      authorName,
      authorProfilePicture,
      content: commentData.content,
      images: commentData.images || [],
      mentions: commentData.mentions || [],
      parentCommentId: commentData.parentCommentId || null, // Explicitly set null
      isReply: !!commentData.parentCommentId, // Add boolean flag for easier querying
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, PROFILE_COMMENTS_COLLECTION), comment);

    // Create notification for profile owner (if not commenting on own profile)
    if (profileUserId !== authorId) {
      // Get profile owner info for notification
      const profileUserDoc = await getDoc(doc(db, 'users', profileUserId));
      const profileUserData = profileUserDoc.data();
      const profileUserName = profileUserData?.displayName || 'Unknown User';

      if (commentData.parentCommentId) {
        // This is a reply
        await createNotification({
          userId: profileUserId,
          type: 'profile_comment_reply',
          title: 'New reply on your profile',
          message: `${authorName} replied to a comment on your profile`,
          data: {
            profileCommentReply: {
              commentId: docRef.id,
              parentCommentId: commentData.parentCommentId,
              profileUserName,
            }
          },
          fromUserId: authorId,
          fromUserName: authorName,
          fromUserProfilePicture: authorProfilePicture,
        });
      } else {
        // This is a new comment
        await createNotification({
          userId: profileUserId,
          type: 'profile_comment',
          title: 'New comment on your profile',
          message: `${authorName} commented on your profile`,
          data: {
            profileComment: {
              commentId: docRef.id,
              profileUserName,
            }
          },
          fromUserId: authorId,
          fromUserName: authorName,
          fromUserProfilePicture: authorProfilePicture,
        });
      }
    }

    // Create mention notifications
    if (commentData.mentions && commentData.mentions.length > 0) {
      // For profile comments, we'll reuse the mention notification system
      // but adapt it for profile context
      const profileUserDoc = await getDoc(doc(db, 'users', profileUserId));
      const profileUserData = profileUserDoc.data();
      const profileUserName = profileUserData?.displayName || 'a profile';

      await createMentionNotifications(
        commentData.mentions,
        '', // No eventId for profile comments
        `${profileUserName}'s profile`, // Use profile as "event title"
        docRef.id,
        authorId,
        authorName,
        authorProfilePicture
      );
    }

    console.log('Profile comment created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating profile comment:', error);
    throw new Error('Failed to create comment');
  }
};

/**
 * Update a profile comment
 */
export const updateProfileComment = async (
  commentId: string,
  content: string,
  images?: string[],
  mentions?: Mention[]
): Promise<void> => {
  try {
    await updateDoc(doc(db, PROFILE_COMMENTS_COLLECTION, commentId), {
      content,
      images: images || [],
      mentions: mentions || [],
      updatedAt: serverTimestamp(),
    });
    console.log('Profile comment updated');
  } catch (error) {
    console.error('Error updating profile comment:', error);
    throw new Error('Failed to update comment');
  }
};

/**
 * Delete a profile comment
 */
export const deleteProfileComment = async (commentId: string): Promise<void> => {
  try {
    // First, delete all replies to this comment
    const repliesQuery = query(
      collection(db, PROFILE_COMMENTS_COLLECTION),
      where('parentCommentId', '==', commentId)
    );
    const repliesSnapshot = await getDocs(repliesQuery);

    const batch = writeBatch(db);
    
    // Delete replies
    repliesSnapshot.docs.forEach(replyDoc => {
      batch.delete(doc(db, PROFILE_COMMENTS_COLLECTION, replyDoc.id));
    });

    // Delete the main comment
    batch.delete(doc(db, PROFILE_COMMENTS_COLLECTION, commentId));

    await batch.commit();
    console.log('Profile comment and replies deleted');
  } catch (error) {
    console.error('Error deleting profile comment:', error);
    throw new Error('Failed to delete comment');
  }
};

/**
 * Get comments for a user's profile
 */
export const getProfileComments = async (
  profileUserId: string,
  includeReplies: boolean = true
): Promise<ProfileComment[]> => {
  try {
    // Get all comments for this profile and filter client-side for now
    // This handles both old comments (without isReply field) and new ones
    // Temporarily removing orderBy while index builds
    const commentsQuery = query(
      collection(db, PROFILE_COMMENTS_COLLECTION),
      where('profileUserId', '==', profileUserId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    const allComments: ProfileComment[] = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ProfileComment[];

    // Filter to get only top-level comments (no parentCommentId) and sort by date
    const comments = allComments
      .filter(comment => !comment.parentCommentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first

    if (includeReplies) {
      // Get replies for each comment from the already fetched data
      for (const comment of comments) {
        comment.replies = allComments.filter(c => c.parentCommentId === comment.id)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
    }

    return comments;
  } catch (error) {
    console.error('Error getting profile comments:', error);
    console.error('Profile User ID:', profileUserId);
    console.error('Include Replies:', includeReplies);
    throw error; // Throw the original error to see more details
  }
};

/**
 * Get comment by ID
 */
export const getProfileCommentById = async (commentId: string): Promise<ProfileComment | null> => {
  try {
    const commentDoc = await getDoc(doc(db, PROFILE_COMMENTS_COLLECTION, commentId));
    
    if (!commentDoc.exists()) {
      return null;
    }

    return {
      id: commentDoc.id,
      ...commentDoc.data(),
      createdAt: commentDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: commentDoc.data().updatedAt?.toDate() || new Date(),
    } as ProfileComment;
  } catch (error) {
    console.error('Error getting profile comment:', error);
    throw new Error('Failed to load comment');
  }
};

/**
 * Subscribe to profile comments
 */
export const subscribeToProfileComments = (
  profileUserId: string,
  callback: (comments: ProfileComment[]) => void
) => {
  // Temporarily removing orderBy while index builds
  const commentsQuery = query(
    collection(db, PROFILE_COMMENTS_COLLECTION),
    where('profileUserId', '==', profileUserId)
  );

  return onSnapshot(commentsQuery, (snapshot) => {
    const allComments: ProfileComment[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ProfileComment[];

    // Filter to get only top-level comments and sort by date
    const comments = allComments
      .filter(comment => !comment.parentCommentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first

    // Get replies for each comment from the already fetched data
    for (const comment of comments) {
      comment.replies = allComments.filter(c => c.parentCommentId === comment.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    callback(comments);
  });
};

/**
 * Get comment count for a user's profile
 */
export const getProfileCommentCount = async (profileUserId: string): Promise<number> => {
  try {
    const commentsQuery = query(
      collection(db, PROFILE_COMMENTS_COLLECTION),
      where('profileUserId', '==', profileUserId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    return commentsSnapshot.size;
  } catch (error) {
    console.error('Error getting profile comment count:', error);
    return 0;
  }
};

/**
 * Get comments for a user's profile with pagination
 */
export const getProfileCommentsPaginated = async (
  profileUserId: string,
  limitCount: number = 10,
  lastVisible?: any
): Promise<{ comments: ProfileComment[]; lastVisible: any; hasMore: boolean }> => {
  try {
    // Try to build query with index-dependent constraints
    let commentsQuery;
    
    try {
      const constraints: QueryConstraint[] = [
        where('profileUserId', '==', profileUserId),
        where('parentCommentId', '==', null), // Only get top-level comments
        orderBy('createdAt', 'desc'),
        limit(limitCount + 1) // Get one extra to check if there are more
      ];

      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      commentsQuery = query(
        collection(db, PROFILE_COMMENTS_COLLECTION),
        ...constraints
      );
    } catch (indexError) {
      console.log('Index not ready, using simpler query');
      // Fallback to simpler query without parentCommentId filter
      const constraints: QueryConstraint[] = [
        where('profileUserId', '==', profileUserId),
        orderBy('createdAt', 'desc'),
        limit(limitCount + 1)
      ];

      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      commentsQuery = query(
        collection(db, PROFILE_COMMENTS_COLLECTION),
        ...constraints
      );
    }

    const snapshot = await getDocs(commentsQuery);
    const docs = snapshot.docs;
    
    // Filter out replies if we got them (in case index wasn't available)
    const topLevelDocs = docs.filter(doc => !doc.data().parentCommentId);
    const hasMore = topLevelDocs.length > limitCount;
    const commentsToProcess = hasMore ? topLevelDocs.slice(0, limitCount) : topLevelDocs;
    const newLastVisible = commentsToProcess.length > 0 ? commentsToProcess[commentsToProcess.length - 1] : null;

    const comments: ProfileComment[] = [];

    for (const doc of commentsToProcess) {
      const commentData = doc.data();
      
      // Get replies for this comment
      try {
        const repliesQuery = query(
          collection(db, PROFILE_COMMENTS_COLLECTION),
          where('parentCommentId', '==', doc.id),
          orderBy('createdAt', 'asc')
        );
        
        const repliesSnapshot = await getDocs(repliesQuery);
        const replies = repliesSnapshot.docs.map(replyDoc => ({
          id: replyDoc.id,
          ...replyDoc.data(),
          createdAt: replyDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: replyDoc.data().updatedAt?.toDate() || new Date(),
        })) as ProfileComment[];

        comments.push({
          id: doc.id,
          ...commentData,
          createdAt: commentData.createdAt?.toDate() || new Date(),
          updatedAt: commentData.updatedAt?.toDate() || new Date(),
          replies,
        } as ProfileComment);
      } catch (replyError) {
        console.log('Could not fetch replies, adding comment without replies');
        // If we can't get replies, just add the comment without them
        const comment: ProfileComment = {
          id: doc.id,
          profileUserId: commentData.profileUserId,
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          authorProfilePicture: commentData.authorProfilePicture,
          content: commentData.content,
          images: commentData.images || [],
          mentions: commentData.mentions || [],
          parentCommentId: commentData.parentCommentId,
          isReply: commentData.isReply,
          replies: [],
          createdAt: commentData.createdAt?.toDate() || new Date(),
          updatedAt: commentData.updatedAt?.toDate() || new Date(),
        };
        comments.push(comment);
      }
    }

    return { comments, lastVisible: newLastVisible, hasMore };
  } catch (error) {
    console.error('Error fetching paginated profile comments:', error);
    throw new Error('Failed to fetch profile comments');
  }
}; 