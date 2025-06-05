import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  BookClubEvent, 
  RSVP, 
  EventComment, 
  PopulatedEvent, 
  CreateEventFormData, 
  CreateCommentFormData,
  EventStats 
} from '../types';

// Collections
const EVENTS_COLLECTION = 'events';
const RSVPS_COLLECTION = 'rsvps';
const COMMENTS_COLLECTION = 'comments';

// Event Management
export const createEvent = async (
  eventData: CreateEventFormData, 
  userId: string, 
  userName: string,
  userProfilePicture?: string
): Promise<string> => {
  try {
    const eventDoc = {
      ...eventData,
      createdBy: userId,
      hostName: userName,
      hostProfilePicture: userProfilePicture || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventDoc);
    console.log('Event created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event. Please try again.');
  }
};

export const updateEvent = async (
  eventId: string, 
  eventData: Partial<CreateEventFormData>
): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp(),
    });
    console.log('Event updated:', eventId);
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event. Please try again.');
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Delete the event
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    batch.delete(eventRef);
    
    // Delete all RSVPs for this event
    const rsvpsQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId)
    );
    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    rsvpsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete all comments for this event
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('eventId', '==', eventId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Event and related data deleted:', eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event. Please try again.');
  }
};

export const getEvent = async (eventId: string): Promise<BookClubEvent | null> => {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    if (eventDoc.exists()) {
      const data = eventDoc.data();
      return {
        id: eventDoc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BookClubEvent;
    }
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error('Failed to load event. Please try again.');
  }
};

export const getAllEvents = async (): Promise<BookClubEvent[]> => {
  try {
    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      orderBy('date', 'asc')
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    
    return eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BookClubEvent;
    });
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error('Failed to load events. Please try again.');
  }
};

// RSVP Management
export const createOrUpdateRSVP = async (
  eventId: string,
  userId: string,
  userName: string,
  status: 'going' | 'maybe' | 'not-going',
  userProfilePicture?: string
): Promise<void> => {
  try {
    // Check if RSVP already exists
    const rsvpQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );
    const existingRSVP = await getDocs(rsvpQuery);
    
    if (existingRSVP.empty) {
      // Create new RSVP
      await addDoc(collection(db, RSVPS_COLLECTION), {
        eventId,
        userId,
        userName,
        userProfilePicture: userProfilePicture || null,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update existing RSVP
      const rsvpDoc = existingRSVP.docs[0];
      await updateDoc(rsvpDoc.ref, {
        status,
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log('RSVP updated:', { eventId, userId, status });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    throw new Error('Failed to update RSVP. Please try again.');
  }
};

export const getUserRSVP = async (eventId: string, userId: string): Promise<RSVP | null> => {
  try {
    const rsvpQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );
    const rsvpSnapshot = await getDocs(rsvpQuery);
    
    if (!rsvpSnapshot.empty) {
      const doc = rsvpSnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as RSVP;
    }
    return null;
  } catch (error) {
    console.error('Error getting user RSVP:', error);
    return null;
  }
};

export const getEventRSVPs = async (eventId: string): Promise<RSVP[]> => {
  try {
    const rsvpsQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
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
    console.error('Error getting event RSVPs:', error);
    return [];
  }
};

// Comment Management
export const createComment = async (
  eventId: string,
  userId: string,
  userName: string,
  commentData: CreateCommentFormData,
  userProfilePicture?: string
): Promise<string> => {
  try {
    const commentDoc = {
      eventId,
      userId,
      userName,
      userProfilePicture: userProfilePicture || null,
      content: commentData.content,
      parentCommentId: commentData.parentCommentId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentDoc);
    console.log('Comment created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment. Please try again.');
  }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Delete the comment
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    batch.delete(commentRef);
    
    // Delete all replies to this comment
    const repliesQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('parentCommentId', '==', commentId)
    );
    const repliesSnapshot = await getDocs(repliesQuery);
    repliesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Comment and replies deleted:', commentId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment. Please try again.');
  }
};

export const getEventComments = async (eventId: string): Promise<EventComment[]> => {
  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc')
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
    
    // Organize comments with replies
    const commentsMap = new Map<string, EventComment>();
    const rootComments: EventComment[] = [];
    
    comments.forEach(comment => {
      comment.replies = [];
      commentsMap.set(comment.id, comment);
      
      if (!comment.parentCommentId) {
        rootComments.push(comment);
      }
    });
    
    // Add replies to their parent comments
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentsMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies!.push(comment);
        }
      }
    });
    
    return rootComments;
  } catch (error) {
    console.error('Error getting event comments:', error);
    return [];
  }
};

// Populate Event with all related data
export const getPopulatedEvent = async (eventId: string, userId?: string): Promise<PopulatedEvent | null> => {
  try {
    const event = await getEvent(eventId);
    if (!event) return null;
    
    const [rsvps, comments, userRsvp] = await Promise.all([
      getEventRSVPs(eventId),
      getEventComments(eventId),
      userId ? getUserRSVP(eventId, userId) : Promise.resolve(null)
    ]);
    
    // Calculate stats
    const stats: EventStats = {
      totalAttendees: rsvps.length,
      goingCount: rsvps.filter(r => r.status === 'going').length,
      maybeCount: rsvps.filter(r => r.status === 'maybe').length,
      notGoingCount: rsvps.filter(r => r.status === 'not-going').length,
      commentsCount: comments.reduce((count, comment) => count + 1 + (comment.replies?.length || 0), 0)
    };
    
    return {
      ...event,
      rsvps,
      comments,
      stats,
      userRsvp: userRsvp || undefined
    };
  } catch (error) {
    console.error('Error getting populated event:', error);
    throw new Error('Failed to load event details. Please try again.');
  }
};

// Real-time listeners
export const subscribeToEvents = (callback: (events: BookClubEvent[]) => void) => {
  const eventsQuery = query(
    collection(db, EVENTS_COLLECTION),
    orderBy('date', 'asc')
  );
  
  return onSnapshot(eventsQuery, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BookClubEvent;
    });
    
    callback(events);
  }, (error) => {
    console.error('Error in events subscription:', error);
  });
};

export const subscribeToEventDetails = (
  eventId: string, 
  userId: string | undefined,
  callback: (event: PopulatedEvent | null) => void
) => {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  
  return onSnapshot(eventRef, async (doc) => {
    if (doc.exists()) {
      try {
        const populatedEvent = await getPopulatedEvent(eventId, userId);
        callback(populatedEvent);
      } catch (error) {
        console.error('Error loading populated event:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in event details subscription:', error);
  });
}; 