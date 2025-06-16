import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserSuggestion } from '../types/mentions';
import { AuthUser } from '../types';

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