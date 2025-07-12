import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  startAfter,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserSuggestion, User, RSVP, EventComment, BookClubEvent } from '../types';
import { cacheService, cacheKeys } from './cacheService';

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
  return cacheService.getOrFetch(
    cacheKeys.userProfile(userId),
    async () => {
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
    },
    30 // cache for 30 minutes
  );
};

/**
 * Get user's recent event RSVPs
 */
export const getUserRecentRSVPs = async (userId: string, limitCount: number = 10): Promise<RSVP[]> => {
  try {
    const rsvpsQuery = query(
      collection(db, 'rsvps'),
      where('userId', '==', userId),
      limit(limitCount)
    );

    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    
    const rsvps = rsvpsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as RSVP;
    });

    // Sort by createdAt on client side to avoid composite index requirement
    return rsvps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limitCount);
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
      limit(limitCount)
    );

    const commentsSnapshot = await getDocs(commentsQuery);
    
    const comments = commentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as EventComment;
    });

    // Sort by createdAt on client side to avoid composite index requirement
    return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limitCount);
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
 * Search users by display name with optimized search
 */
export const searchUsers = async (
  searchQuery: string,
  options: {
    limitCount?: number;
    lastVisible?: any;
  } = {}
): Promise<{ users: User[]; lastVisible: any; hasMore: boolean }> => {
  try {
    const {
      limitCount = 10,
      lastVisible
    } = options;

    // If search query is empty, return all users
    if (!searchQuery.trim()) {
      return getAllUsers({ limitCount, lastVisible });
    }

    // Convert search query to lowercase for case-insensitive search
    const searchLower = searchQuery.toLowerCase().trim();
    
    try {
      // Try primary search method using searchTerms array
      const constraints: QueryConstraint[] = [
        where('searchTerms', 'array-contains', searchLower),
        orderBy('displayName'),
        limit(limitCount + 1)
      ];

      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        ...constraints
      );

      const snapshot = await getDocs(usersQuery);
      const docs = snapshot.docs;
      
      const hasMore = docs.length > limitCount;
      const usersToProcess = hasMore ? docs.slice(0, limitCount) : docs;
      const newLastVisible = usersToProcess[usersToProcess.length - 1];

      const users = usersToProcess.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName,
          email: data.email,
          profilePicture: data.profilePicture,
          role: data.role || 'member',
          bio: data.bio,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as User;
      });

      return {
        users,
        lastVisible: newLastVisible,
        hasMore
      };
    } catch (searchError) {
      console.warn('Primary search failed, falling back to client-side search:', searchError);
      
      // Fallback to client-side search
      return fallbackClientSideSearch(searchQuery, { limitCount, lastVisible });
    }
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      users: [],
      lastVisible: null,
      hasMore: false
    };
  }
};

/**
 * Get all users (for when no search query is provided)
 */
export const getAllUsers = async (options: {
  limitCount?: number;
  lastVisible?: any;
} = {}): Promise<{ users: User[]; lastVisible: any; hasMore: boolean }> => {
  try {
    const {
      limitCount = 10,
      lastVisible
    } = options;

    const constraints: QueryConstraint[] = [
      orderBy('displayName'),
      limit(limitCount + 1)
    ];

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      ...constraints
    );

    const snapshot = await getDocs(usersQuery);
    const docs = snapshot.docs;
    
    const hasMore = docs.length > limitCount;
    const usersToProcess = hasMore ? docs.slice(0, limitCount) : docs;
    const newLastVisible = usersToProcess[usersToProcess.length - 1];

    const users = usersToProcess.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName,
        email: data.email,
        profilePicture: data.profilePicture,
        role: data.role || 'member',
        bio: data.bio,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    });

    return {
      users,
      lastVisible: newLastVisible,
      hasMore
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    return {
      users: [],
      lastVisible: null,
      hasMore: false
    };
  }
};

/**
 * Fallback client-side search when searchTerms field is not available
 */
export const fallbackClientSideSearch = async (
  searchQuery: string,
  options: {
    limitCount?: number;
    lastVisible?: any;
  } = {}
): Promise<{ users: User[]; lastVisible: any; hasMore: boolean }> => {
  try {
    const { limitCount = 10 } = options;
    
    // Get all users and filter client-side
    const allUsersResult = await getAllUsers({ limitCount: 100 }); // Get more for filtering
    const searchLower = searchQuery.toLowerCase().trim();
    
    const filteredUsers = allUsersResult.users.filter((user: User) => 
      user.displayName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );

    const users = filteredUsers.slice(0, limitCount);
    const hasMore = filteredUsers.length > limitCount;

    return {
      users,
      lastVisible: null, // Client-side search doesn't support pagination
      hasMore
    };
  } catch (error) {
    console.error('Error in fallback search:', error);
    return {
      users: [],
      lastVisible: null,
      hasMore: false
    };
  }
};

/**
 * Generate search terms for a user
 * This should be called when creating/updating a user
 */
export const generateUserSearchTerms = (displayName: string): string[] => {
  const terms: string[] = [];
  const nameLower = displayName.toLowerCase();

  // Add full name
  terms.push(nameLower);

  // Add each word
  const words = nameLower.split(/\s+/);
  terms.push(...words);

  // Add partial matches (minimum 2 characters)
  for (let i = 0; i < nameLower.length - 1; i++) {
    for (let j = i + 2; j <= nameLower.length; j++) {
      const term = nameLower.slice(i, j);
      if (!terms.includes(term)) {
        terms.push(term);
      }
    }
  }

  return [...new Set(terms)]; // Remove duplicates
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

/**
 * Get events created by a user
 */
export const getUserHostedEvents = async (userId: string, limitCount: number = 10): Promise<BookClubEvent[]> => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', userId),
      limit(limitCount)
    );

    const eventsSnapshot = await getDocs(eventsQuery);
    
    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
      } as BookClubEvent;
    });

    // Sort by date on client side
    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching user hosted events:', error);
    return [];
  }
};

/**
 * Get events a user is attending (based on RSVPs)
 */
export const getUserAttendingEvents = async (userId: string, limitCount: number = 10): Promise<BookClubEvent[]> => {
  try {
    // First get user's RSVPs where status is 'going'
    const rsvpsQuery = query(
      collection(db, 'rsvps'),
      where('userId', '==', userId),
      where('status', '==', 'going'),
      limit(limitCount * 2) // Get more RSVPs to account for deleted events
    );

    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    const eventIds = rsvpsSnapshot.docs.map(doc => doc.data().eventId);

    if (eventIds.length === 0) return [];

    // Get the actual events
    const events: BookClubEvent[] = [];
    
    for (const eventId of eventIds) {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          events.push({
            id: eventDoc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            approvedAt: data.approvedAt?.toDate(),
          } as BookClubEvent);
        }
      } catch (eventError) {
        console.warn(`Error fetching event ${eventId}:`, eventError);
      }
    }

    // Sort by date and limit
    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching user attending events:', error);
    return [];
  }
};

/**
 * Get upcoming events for a user (both hosting and attending)
 */
export const getUserUpcomingEvents = async (userId: string, limitCount: number = 10): Promise<{
  hosting: BookClubEvent[];
  attending: BookClubEvent[];
}> => {
  try {
    const now = new Date();
    
    // Get hosted events
    const hostedEvents = await getUserHostedEvents(userId, limitCount);
    const upcomingHosted = hostedEvents.filter(event => event.date > now);

    // Get attending events
    const attendingEvents = await getUserAttendingEvents(userId, limitCount);
    const upcomingAttending = attendingEvents.filter(event => event.date > now);

    return {
      hosting: upcomingHosted.slice(0, limitCount),
      attending: upcomingAttending.slice(0, limitCount),
    };
  } catch (error) {
    console.error('Error fetching user upcoming events:', error);
    return {
      hosting: [],
      attending: [],
    };
  }
};

/**
 * Get past events for a user (both hosting and attending)
 */
export const getUserPastEvents = async (userId: string, limitCount: number = 10): Promise<{
  hosting: BookClubEvent[];
  attending: BookClubEvent[];
}> => {
  try {
    const now = new Date();
    
    // Get hosted events
    const hostedEvents = await getUserHostedEvents(userId, limitCount * 2);
    const pastHosted = hostedEvents.filter(event => event.date <= now);

    // Get attending events
    const attendingEvents = await getUserAttendingEvents(userId, limitCount * 2);
    const pastAttending = attendingEvents.filter(event => event.date <= now);

    return {
      hosting: pastHosted.slice(0, limitCount),
      attending: pastAttending.slice(0, limitCount),
    };
  } catch (error) {
    console.error('Error fetching user past events:', error);
    return {
      hosting: [],
      attending: [],
    };
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, newRole: 'admin' | 'member'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`User ${userId} role updated to ${newRole}`);

    // Invalidate cached profile
    cacheService.remove(cacheKeys.userProfile(userId)).catch(() => {});
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
};

/**
 * Get user statistics (admin only)
 */
export const getUserStats = async (): Promise<{
  totalUsers: number;
  adminCount: number;
  memberCount: number;
  recentSignups: number; // last 7 days
}> => {
  try {
    const usersResult = await getAllUsers({ limitCount: 1000 }); // Get more users for accurate stats
    const users = usersResult.users;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const stats = {
      totalUsers: users.length,
      adminCount: users.filter(user => user.role === 'admin').length,
      memberCount: users.filter(user => user.role === 'member').length,
      recentSignups: users.filter(user => user.createdAt >= weekAgo).length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw new Error('Failed to fetch user statistics');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Generate search terms if display name is being updated
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    if (updates.displayName) {
      updateData.searchTerms = generateUserSearchTerms(updates.displayName);
    }

    await updateDoc(userRef, updateData);

    // Invalidate cached profile
    cacheService.remove(cacheKeys.userProfile(userId)).catch(() => {});
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
}; 