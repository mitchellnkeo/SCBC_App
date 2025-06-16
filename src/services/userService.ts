import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserSuggestion, User, RSVP, EventComment } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Get all users for mention suggestions
 * Limited to prevent excessive Firebase reads
 */
export const getUsersForMentions = async (limitCount: number = 50): Promise<UserSuggestion[]> => {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy('displayName'),
      limit(limitCount)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    const users: UserSuggestion[] = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName || 'Unknown User',
        profilePicture: data.profilePicture,
        matchScore: 1, // Base score, will be calculated during search
      };
    });
    
    console.log(`Loaded ${users.length} users for mentions`);
    return users;
  } catch (error) {
    console.error('Error getting users for mentions:', error);
    throw new Error('Failed to load users for mentions. Please try again.');
  }
};

/**
 * Search users by display name
 * For more specific mention searches
 */
export const searchUsersForMentions = async (
  searchQuery: string,
  limitCount: number = 10
): Promise<UserSuggestion[]> => {
  try {
    if (!searchQuery.trim()) {
      return getUsersForMentions(limitCount);
    }

    // Firebase doesn't support full-text search natively
    // So we'll get all users and filter client-side
    const allUsers = await getUsersForMentions(100); // Get more for better search
    
    const searchLower = searchQuery.toLowerCase();
    
    const filteredUsers = allUsers
      .filter(user => 
        user.displayName.toLowerCase().includes(searchLower)
      )
      .map(user => ({
        ...user,
        matchScore: calculateMatchScore(user.displayName, searchQuery)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limitCount);
    
    return filteredUsers;
  } catch (error) {
    console.error('Error searching users for mentions:', error);
    throw new Error('Failed to search users. Please try again.');
  }
};

/**
 * Calculate match score for search relevance
 */
const calculateMatchScore = (displayName: string, query: string): number => {
  const nameLower = displayName.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match (highest score)
  if (nameLower === queryLower) return 100;
  
  // Starts with query (high score)
  if (nameLower.startsWith(queryLower)) return 80;
  
  // Contains query at word boundary (medium score)
  const words = nameLower.split(' ');
  if (words.some(word => word.startsWith(queryLower))) return 60;
  
  // Contains query anywhere (low score)
  if (nameLower.includes(queryLower)) return 40;
  
  return 0;
};

/**
 * Get users by event participation for contextual mentions
 * Shows users who are attending or have commented on an event
 */
export const getEventParticipantsForMentions = async (eventId: string): Promise<UserSuggestion[]> => {
  try {
    const participants = new Map<string, UserSuggestion>();
    
    // Get RSVP'd users
    const rsvpsQuery = query(
      collection(db, 'rsvps'),
      where('eventId', '==', eventId),
      where('status', 'in', ['going', 'maybe'])
    );
    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    
    rsvpsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.userId && data.userName) {
        participants.set(data.userId, {
          id: data.userId,
          displayName: data.userName,
          profilePicture: data.userProfilePicture,
          matchScore: 90, // High score for event participants
        });
      }
    });
    
    // Get users who have commented
    const commentsQuery = query(
      collection(db, 'comments'),
      where('eventId', '==', eventId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    commentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.userId && data.userName && !participants.has(data.userId)) {
        participants.set(data.userId, {
          id: data.userId,
          displayName: data.userName,
          profilePicture: data.userProfilePicture,
          matchScore: 70, // Good score for commenters
        });
      }
    });
    
    return Array.from(participants.values())
      .sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error getting event participants for mentions:', error);
    // Fallback to general user list
    return getUsersForMentions(20);
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    } as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to load user profile');
  }
};

/**
 * Get user's recent event RSVPs
 */
export const getUserRecentRSVPs = async (userId: string, limitCount: number = 10): Promise<RSVP[]> => {
  try {
    const rsvpsQuery = query(
      collection(db, 'rsvps'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    
    return rsvpsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as RSVP;
    });
  } catch (error) {
    console.error('Error fetching user RSVPs:', error);
    return [];
  }
};

/**
 * Get user's recent comments
 */
export const getUserRecentComments = async (userId: string, limitCount: number = 10): Promise<EventComment[]> => {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const commentsSnapshot = await getDocs(commentsQuery);
    
    return commentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as EventComment;
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return [];
  }
};

/**
 * Get user's event statistics
 */
export const getUserEventStats = async (userId: string) => {
  try {
    // Get total RSVPs
    const rsvpsQuery = query(
      collection(db, 'rsvps'),
      where('userId', '==', userId)
    );
    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    
    // Count by status
    let goingCount = 0;
    let maybeCount = 0;
    let notGoingCount = 0;
    
    rsvpsSnapshot.docs.forEach(doc => {
      const status = doc.data().status;
      switch (status) {
        case 'going':
          goingCount++;
          break;
        case 'maybe':
          maybeCount++;
          break;
        case 'not-going':
          notGoingCount++;
          break;
      }
    });

    // Get total comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('userId', '==', userId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    const totalComments = commentsSnapshot.docs.length;

    // Get events created by user
    const eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', userId)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const eventsCreated = eventsSnapshot.docs.length;

    return {
      totalRSVPs: rsvpsSnapshot.docs.length,
      goingCount,
      maybeCount,
      notGoingCount,
      totalComments,
      eventsCreated,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalRSVPs: 0,
      goingCount: 0,
      maybeCount: 0,
      notGoingCount: 0,
      totalComments: 0,
      eventsCreated: 0,
    };
  }
};

/**
 * Search users by display name (for mentions, etc.)
 */
export const searchUsers = async (searchQuery: string, limitCount: number = 10): Promise<User[]> => {
  try {
    // Note: This is a simple implementation. For better search, consider using Algolia or similar
    const usersQuery = query(
      collection(db, 'users'),
      limit(limitCount)
    );

    const usersSnapshot = await getDocs(usersQuery);
    
    const users = usersSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() as any;
      return {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    });

    // Filter by query on client side (not ideal for large datasets)
    return users.filter(user => 
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

/**
 * Get multiple users by IDs (useful for batch operations)
 */
export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  try {
    if (userIds.length === 0) return [];

    const users: User[] = [];
    
    // Fetch users individually (simpler approach for now)
    for (const userId of userIds) {
      const user = await getUserProfile(userId);
      if (user) {
        users.push(user);
      }
    }

    return users;
  } catch (error) {
    console.error('Error fetching users by IDs:', error);
    return [];
  }
}; 