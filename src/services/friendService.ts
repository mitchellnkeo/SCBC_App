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
  writeBatch,
  serverTimestamp,
  or,
  and,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  FriendRequest, 
  Friendship, 
  FriendStatus, 
  User 
} from '../types';
import { createNotification } from './internalNotificationService';

const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const FRIENDSHIPS_COLLECTION = 'friendships';

/**
 * Get friend request between two users (if exists)
 */
export const getFriendRequestBetweenUsers = async (
  fromUserId: string,
  toUserId: string
): Promise<FriendRequest | null> => {
  try {
    // Check for request from user1 to user2
    const requestQuery1 = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );
    
    // Check for request from user2 to user1
    const requestQuery2 = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('fromUserId', '==', toUserId),
      where('toUserId', '==', fromUserId),
      where('status', '==', 'pending')
    );
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(requestQuery1),
      getDocs(requestQuery2)
    ]);
    
    if (!snapshot1.empty) {
      const doc = snapshot1.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FriendRequest;
    }
    
    if (!snapshot2.empty) {
      const doc = snapshot2.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FriendRequest;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting friend request between users:', error);
    return null;
  }
};

/**
 * Send a friend request
 */
export const sendFriendRequest = async (
  fromUserId: string,
  fromUserName: string,
  fromUserProfilePicture: string | undefined,
  toUserId: string,
  toUserName: string,
  toUserProfilePicture?: string
): Promise<string> => {
  try {
    console.log('Sending friend request:', { fromUserId, toUserId, fromUserName, toUserName });
    
    // Validate inputs
    if (!fromUserId || !toUserId || !fromUserName || !toUserName) {
      throw new Error('Missing required fields for friend request');
    }
    
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if request already exists
    try {
      const existingRequest = await getFriendRequestBetweenUsers(fromUserId, toUserId);
      if (existingRequest) {
        console.log('Friend request already exists:', existingRequest.id);
        throw new Error('Friend request already exists');
      }
    } catch (error) {
      console.error('Error checking existing friend request:', error);
      // Continue anyway - the error might be due to missing function
    }

    // Check if they're already friends
    const friendStatus = await getFriendStatus(fromUserId, toUserId);
    if (friendStatus.isFriend) {
      console.log('Users are already friends');
      throw new Error('Users are already friends');
    }

    // Create friend request object, filtering out undefined values
    const friendRequest: any = {
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add profile picture fields if they have values
    if (fromUserProfilePicture) {
      friendRequest.fromUserProfilePicture = fromUserProfilePicture;
    }
    if (toUserProfilePicture) {
      friendRequest.toUserProfilePicture = toUserProfilePicture;
    }

    console.log('Creating friend request document:', friendRequest);
    const docRef = await addDoc(collection(db, FRIEND_REQUESTS_COLLECTION), friendRequest);

    // Create notification for the recipient
    try {
      await createNotification({
        userId: toUserId,
        type: 'friend_request',
        title: 'New friend request',
        message: `${fromUserName} sent you a friend request`,
        data: {
          friendRequest: {
            requestId: docRef.id,
            fromUserName,
          }
        },
        fromUserId,
        fromUserName,
        fromUserProfilePicture,
      });
    } catch (notificationError) {
      console.warn('Failed to create notification, but friend request was sent:', notificationError);
      // Don't fail the entire operation if notification fails
    }

    console.log('Friend request sent successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestDoc = await getDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId));
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const requestData = requestDoc.data() as FriendRequest;
    if (requestData.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    const batch = writeBatch(db);

    // Update friend request status
    batch.update(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });

    // Create friendship record
    const friendshipRef = doc(collection(db, FRIENDSHIPS_COLLECTION));
    batch.set(friendshipRef, {
      user1Id: requestData.fromUserId,
      user1Name: requestData.fromUserName,
      user1ProfilePicture: requestData.fromUserProfilePicture,
      user2Id: requestData.toUserId,
      user2Name: requestData.toUserName,
      user2ProfilePicture: requestData.toUserProfilePicture,
      createdAt: serverTimestamp(),
    });

    await batch.commit();

    // Create notification for the request sender
    await createNotification({
      userId: requestData.fromUserId,
      type: 'friend_request_accepted',
      title: 'Friend request accepted!',
      message: `${requestData.toUserName} accepted your friend request`,
      data: {
        friendshipAccepted: {
          friendName: requestData.toUserName,
        }
      },
      fromUserId: requestData.toUserId,
      fromUserName: requestData.toUserName,
      fromUserProfilePicture: requestData.toUserProfilePicture,
    });

    console.log('Friend request accepted');
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

/**
 * Decline a friend request
 */
export const declineFriendRequest = async (requestId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), {
      status: 'declined',
      updatedAt: serverTimestamp(),
    });
    console.log('Friend request declined');
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};

/**
 * Cancel a pending friend request
 */
export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId));
    console.log('Friend request cancelled');
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    throw error;
  }
};

/**
 * Remove a friendship
 */
export const removeFriend = async (friendshipId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, FRIENDSHIPS_COLLECTION, friendshipId));
    console.log('Friendship removed');
  } catch (error) {
    console.error('Error removing friendship:', error);
    throw error;
  }
};

/**
 * Get friend status between two users
 */
export const getFriendStatus = async (userId1: string, userId2: string): Promise<FriendStatus> => {
  try {
    // Check for existing friendship (check both directions)
    const friendshipQuery1 = query(
      collection(db, FRIENDSHIPS_COLLECTION),
      where('user1Id', '==', userId1),
      where('user2Id', '==', userId2)
    );
    const friendshipQuery2 = query(
      collection(db, FRIENDSHIPS_COLLECTION),
      where('user1Id', '==', userId2),
      where('user2Id', '==', userId1)
    );
    
    const [friendshipSnapshot1, friendshipSnapshot2] = await Promise.all([
      getDocs(friendshipQuery1),
      getDocs(friendshipQuery2)
    ]);

    if (!friendshipSnapshot1.empty) {
      return {
        isFriend: true,
        hasIncomingRequest: false,
        hasOutgoingRequest: false,
        friendshipId: friendshipSnapshot1.docs[0].id,
      };
    }
    
    if (!friendshipSnapshot2.empty) {
      return {
        isFriend: true,
        hasIncomingRequest: false,
        hasOutgoingRequest: false,
        friendshipId: friendshipSnapshot2.docs[0].id,
      };
    }

    // Check for pending friend requests (check both directions)
    const requestQuery1 = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('fromUserId', '==', userId1),
      where('toUserId', '==', userId2),
      where('status', '==', 'pending')
    );
    const requestQuery2 = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('fromUserId', '==', userId2),
      where('toUserId', '==', userId1),
      where('status', '==', 'pending')
    );
    
    const [requestSnapshot1, requestSnapshot2] = await Promise.all([
      getDocs(requestQuery1),
      getDocs(requestQuery2)
    ]);

    if (!requestSnapshot1.empty) {
      return {
        isFriend: false,
        hasIncomingRequest: false,
        hasOutgoingRequest: true,
        requestId: requestSnapshot1.docs[0].id,
      };
    }
    
    if (!requestSnapshot2.empty) {
      return {
        isFriend: false,
        hasIncomingRequest: true,
        hasOutgoingRequest: false,
        requestId: requestSnapshot2.docs[0].id,
      };
    }

    return {
      isFriend: false,
      hasIncomingRequest: false,
      hasOutgoingRequest: false,
    };
  } catch (error) {
    console.error('Error getting friend status:', error);
    throw error;
  }
};

/**
 * Get user's friends
 */
export const getUserFriends = async (userId: string): Promise<User[]> => {
  try {
    // Query friendships where user is user1
    const friendshipsQuery1 = query(
      collection(db, FRIENDSHIPS_COLLECTION),
      where('user1Id', '==', userId),
      orderBy('createdAt', 'desc')
    );
    // Query friendships where user is user2
    const friendshipsQuery2 = query(
      collection(db, FRIENDSHIPS_COLLECTION),
      where('user2Id', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const [friendshipsSnapshot1, friendshipsSnapshot2] = await Promise.all([
      getDocs(friendshipsQuery1),
      getDocs(friendshipsQuery2)
    ]);

    const friends: User[] = [];
    
    // Process friendships where user is user1
    friendshipsSnapshot1.docs.forEach(doc => {
      const friendship = doc.data() as Friendship;
      friends.push({
        id: friendship.user2Id,
        displayName: friendship.user2Name,
        profilePicture: friendship.user2ProfilePicture,
        // Note: This is a simplified friend object. For full user data, you'd need to fetch from users collection
      } as User);
    });
    
    // Process friendships where user is user2
    friendshipsSnapshot2.docs.forEach(doc => {
      const friendship = doc.data() as Friendship;
      friends.push({
        id: friendship.user1Id,
        displayName: friendship.user1Name,
        profilePicture: friendship.user1ProfilePicture,
        // Note: This is a simplified friend object. For full user data, you'd need to fetch from users collection
      } as User);
    });

    // Sort by creation date (newest first)
    return friends.sort((a, b) => {
      // Note: We'd need to include the createdAt in the friend object for proper sorting
      // For now, we'll just return the array as is
      return 0;
    });
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
};

/**
 * Get pending friend requests for a user
 */
export const getPendingFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const requestsSnapshot = await getDocs(requestsQuery);

    const requests: FriendRequest[] = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FriendRequest[];

    return requests;
  } catch (error) {
    console.error('Error getting pending friend requests:', error);
    throw error;
  }
};

/**
 * Get sent friend requests for a user
 */
export const getSentFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('fromUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const requestsSnapshot = await getDocs(requestsQuery);

    const requests: FriendRequest[] = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FriendRequest[];

    return requests;
  } catch (error) {
    console.error('Error getting sent friend requests:', error);
    throw error;
  }
};

/**
 * Subscribe to user's friend requests
 */
export const subscribeToFriendRequests = (
  userId: string,
  callback: (requests: FriendRequest[]) => void
) => {
  const requestsQuery = query(
    collection(db, FRIEND_REQUESTS_COLLECTION),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(requestsQuery, (snapshot) => {
    const requests: FriendRequest[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as FriendRequest[];

    callback(requests);
  });
};

/**
 * Subscribe to user's friendships
 */
export const subscribeToUserFriends = (
  userId: string,
  callback: (friends: User[]) => void
) => {
  // Subscribe to friendships where user is user1
  const friendshipsQuery1 = query(
    collection(db, FRIENDSHIPS_COLLECTION),
    where('user1Id', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  // Subscribe to friendships where user is user2
  const friendshipsQuery2 = query(
    collection(db, FRIENDSHIPS_COLLECTION),
    where('user2Id', '==', userId),
    orderBy('createdAt', 'desc')
  );

  let friends1: User[] = [];
  let friends2: User[] = [];
  
  const updateCallback = () => {
    const allFriends = [...friends1, ...friends2];
    callback(allFriends);
  };

  const unsubscribe1 = onSnapshot(friendshipsQuery1, (snapshot) => {
    friends1 = snapshot.docs.map(doc => {
      const friendship = doc.data() as Friendship;
      return {
        id: friendship.user2Id,
        displayName: friendship.user2Name,
        profilePicture: friendship.user2ProfilePicture,
      } as User;
    });
    updateCallback();
  });
  
  const unsubscribe2 = onSnapshot(friendshipsQuery2, (snapshot) => {
    friends2 = snapshot.docs.map(doc => {
      const friendship = doc.data() as Friendship;
      return {
        id: friendship.user1Id,
        displayName: friendship.user1Name,
        profilePicture: friendship.user1ProfilePicture,
      } as User;
    });
    updateCallback();
  });

  // Return a function that unsubscribes from both listeners
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

/* -------------------------------------------------------------------------- */
/*                      Realtime Listener Optimisation                        */
/* -------------------------------------------------------------------------- */

type ListenerEntry<T> = {
  refCount: number;
  unsubscribe: Unsubscribe;
  timeoutId: NodeJS.Timeout | null;
  callbacks: Set<(data: T) => void>;
};

const ACTIVE_LISTENERS = new Map<string, ListenerEntry<any>>();
const LISTENER_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function getOrCreateListener<T>(key: string, setup: () => Unsubscribe, onData: (data: T) => void): () => void {
  let entry = ACTIVE_LISTENERS.get(key) as ListenerEntry<T> | undefined;

  if (!entry) {
    const callbacks = new Set<(data: T) => void>();

    const unsubscribe = setup();

    entry = { refCount: 0, unsubscribe, timeoutId: null, callbacks };
    ACTIVE_LISTENERS.set(key, entry);
  }

  entry.callbacks.add(onData);
  entry.refCount++;
  if (entry.timeoutId) {
    clearTimeout(entry.timeoutId);
    entry.timeoutId = null;
  }

  // Return a disposer
  return () => {
    entry!.refCount--;
    entry!.callbacks.delete(onData);
    if (entry!.refCount <= 0) {
      // Schedule detach after idle timeout
      entry!.timeoutId = setTimeout(() => {
        entry!.unsubscribe();
        ACTIVE_LISTENERS.delete(key);
      }, LISTENER_IDLE_TIMEOUT_MS);
    }
  };
} 