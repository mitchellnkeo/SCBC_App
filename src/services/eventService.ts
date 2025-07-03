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
  limit,
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  Timestamp,
  documentId,
  QueryConstraint,
  startAfter,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { 
  BookClubEvent, 
  RSVP, 
  EventComment, 
  PopulatedEvent, 
  CreateEventFormData, 
  CreateCommentFormData,
  EventStats,
  ApprovalFormData,
  PendingEventStats
} from '../types';
import { isEventCurrentOrUpcoming, hasEventEnded } from '../utils/timezone';
import { logger } from '../utils/logger';
import { cacheService, cacheKeys } from './cacheService';

// Collections
const EVENTS_COLLECTION = 'events';
const RSVPS_COLLECTION = 'rsvps';
const COMMENTS_COLLECTION = 'comments';

// Event Management
export const createEvent = async (
  eventData: CreateEventFormData, 
  userId: string, 
  userName: string,
  userRole: 'admin' | 'member',
  userProfilePicture?: string
): Promise<string> => {
  try {
    // Admin events are auto-approved, member events need approval
    const status = userRole === 'admin' ? 'approved' : 'pending';
    const approvedBy = userRole === 'admin' ? userId : null;
    const approvedAt = userRole === 'admin' ? serverTimestamp() : null;

    // Create event document first (without header photo)
    const { headerPhoto, ...eventDataWithoutPhoto } = eventData;
    
    const eventDoc = {
      ...eventDataWithoutPhoto,
      createdBy: userId,
      hostName: userName,
      hostProfilePicture: userProfilePicture || null,
      status,
      approvedBy,
      approvedAt,
      rejectionReason: null,
      headerPhoto: null, // Will be updated after upload if image provided
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventDoc);
    console.log(`Event created with ID: ${docRef.id}, Status: ${status}`);
    
    // Invalidate cached event lists
    cacheService.remove(cacheKeys.events()).catch(() => {});
    
    // Upload header image if provided
    if (headerPhoto && headerPhoto.trim()) {
      try {
        const imageUrl = await uploadEventHeaderImage(docRef.id, headerPhoto);
        await updateDoc(docRef, {
          headerPhoto: imageUrl,
          updatedAt: serverTimestamp(),
        });
        console.log('Event header image uploaded and linked');
      } catch (error) {
        console.error('Error uploading header image:', error);
        // Don't fail event creation if image upload fails
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event. Please try again.');
  }
};

/**
 * Basic integrity checks for event form data (title length, description length, date validity)
 */
const validateEventData = (data: Partial<CreateEventFormData>) => {
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0 || data.title.length > 100) {
      throw new Error('Event title must be 1-100 characters');
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.length > 2000) {
      throw new Error('Event description must be ≤ 2000 characters');
    }
  }

  if (data.date) {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid event date');
    }
  }
};

export const updateEvent = async (
  eventId: string, 
  eventData: Partial<CreateEventFormData>,
  updaterUserId?: string,
  updaterUserName?: string,
  updaterProfilePicture?: string
): Promise<void> => {
  try {
    // Validate input early
    validateEventData(eventData);

    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    
    // Handle header image separately
    const { headerPhoto, ...eventDataWithoutPhoto } = eventData;
    
    // Perform the core update inside a transaction for consistency
    let currentEvent = await getEvent(eventId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(eventRef);
      if (!snap.exists()) {
        throw new Error('Event no longer exists');
      }

      // Re-fetch to keep types simple
      currentEvent = snap.data() as BookClubEvent;

      tx.update(eventRef, {
        ...eventDataWithoutPhoto,
        updatedAt: serverTimestamp(),
      });
    });
    
    // Handle header image changes only if the image actually changed
    if (headerPhoto !== undefined) {
      const currentImageUrl = currentEvent?.headerPhoto || '';
      const newImageUrl = headerPhoto || '';
      
      // Only process image changes if the URL/URI is actually different
      if (currentImageUrl !== newImageUrl) {
        // Delete old image if it exists and we're changing/removing it
        if (currentEvent?.headerPhoto) {
          try {
            await deleteEventHeaderImage(currentEvent.headerPhoto);
          } catch (error) {
            console.warn('Failed to delete old header image:', error);
            // Continue with update even if deletion fails
          }
        }
        
        // Upload new image if provided
        if (headerPhoto && headerPhoto.trim()) {
          try {
            const imageUrl = await uploadEventHeaderImage(eventId, headerPhoto);
            await updateDoc(eventRef, {
              headerPhoto: imageUrl,
              updatedAt: serverTimestamp(),
            });
            console.log('Event header image updated');
          } catch (error) {
            console.error('Error uploading new header image:', error);
            // Set headerPhoto to null if upload fails
            await updateDoc(eventRef, {
              headerPhoto: null,
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          // Remove image reference if empty string provided
          await updateDoc(eventRef, {
            headerPhoto: null,
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        console.log('Header photo unchanged, skipping image processing');
      }
    }
    
    console.log('Event updated:', eventId);
    
    // Invalidate caches related to this event
    cacheService.remove(cacheKeys.eventDetails(eventId)).catch(() => {});
    cacheService.remove(cacheKeys.events()).catch(() => {});
    
    // Create event update notifications for attendees
    if (updaterUserId && updaterUserName) {
      try {
        const event = await getEvent(eventId);
        if (event) {
          const changes = Object.keys(eventData);
          const { createEventUpdateNotification } = await import('./internalNotificationService');
          await createEventUpdateNotification(
            eventId,
            event.title,
            changes,
            updaterUserId,
            updaterUserName,
            updaterProfilePicture
          );
        }
      } catch (error) {
        console.error('Error creating event update notifications:', error);
        // Don't fail update if notifications fail
      }
    }
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event. Please try again.');
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    // Get event to check for header image
    const event = await getEvent(eventId);
    
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
    
    // Delete header image if it exists (after batch commit)
    if (event?.headerPhoto) {
      try {
        await deleteEventHeaderImage(event.headerPhoto);
        console.log('Event header image deleted');
      } catch (error) {
        console.warn('Failed to delete event header image:', error);
        // Don't fail the deletion if image cleanup fails
      }
    }
    
    console.log('Event and related data deleted:', eventId);

    // Invalidate caches
    cacheService.remove(cacheKeys.eventDetails(eventId)).catch(() => {});
    cacheService.remove(cacheKeys.events()).catch(() => {});
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

/**
 * Get all events with pagination
 */
export const getAllEvents = async (
  options: {
    limitCount?: number;
    lastVisible?: any;
    includeExpired?: boolean;
  } = {}
): Promise<{ events: BookClubEvent[]; lastVisible: any; hasMore: boolean }> => {
  try {
    const {
      limitCount = 20,
      lastVisible,
      includeExpired = false
    } = options;

    logger.debug('Fetching events with options:', { 
      limitCount, 
      hasLastVisible: !!lastVisible,
      includeExpired 
    });

    // Build query constraints
    const constraints: QueryConstraint[] = [
      where('status', '==', 'approved'),
      orderBy('date', 'asc')
    ];

    if (!includeExpired) {
      // Use the start of today in the local timezone as a safe default
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timestamp = Timestamp.fromDate(today);
      constraints.push(where('date', '>=', timestamp));
    }

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    constraints.push(limit(limitCount + 1)); // Get one extra to check if there are more

    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      ...constraints
    );

    const eventsSnapshot = await getDocs(eventsQuery);
    const docs = eventsSnapshot.docs;
    
    const hasMore = docs.length > limitCount;
    const eventsToProcess = hasMore ? docs.slice(0, limitCount) : docs;
    const newLastVisible = eventsToProcess[eventsToProcess.length - 1];

    const events = eventsToProcess.map(doc => {
      const data = doc.data();
      
      // Safely convert Firestore timestamps to Dates
      const safeToDate = (timestamp: any) => {
        if (!timestamp) return new Date();
        try {
          if (timestamp instanceof Timestamp) {
            return timestamp.toDate();
          }
          return new Date();
        } catch (e) {
          logger.warn('Invalid timestamp in event data:', { 
            eventId: doc.id, 
            error: e,
            timestampValue: timestamp 
          });
          return new Date();
        }
      };

      // Create event object with safe date conversions
      const event: BookClubEvent = {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        date: safeToDate(data.date),
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        address: data.address || '',
        location: data.location || '',
        headerPhoto: data.headerPhoto || undefined,
        maxAttendees: data.maxAttendees,
        createdBy: data.createdBy || '',
        hostName: data.hostName || '',
        hostProfilePicture: data.hostProfilePicture,
        status: data.status || 'pending',
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt ? safeToDate(data.approvedAt) : undefined,
        rejectionReason: data.rejectionReason,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt)
      };

      return event;
    });

    // Only log dates if we have events
    if (events.length > 0) {
      logger.debug('Events fetch complete:', {
        totalFetched: docs.length,
        returnedCount: events.length,
        hasMore,
        firstEventDate: events[0].date.toISOString(),
        lastEventDate: events[events.length - 1].date.toISOString()
      });
    } else {
      logger.debug('No events found');
    }

    return {
      events,
      lastVisible: newLastVisible,
      hasMore
    };
  } catch (error) {
    // Improved error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while loading events';
    
    logger.error('Error getting events:', { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      details: error
    });
    
    throw new Error('Failed to load events. Please try again.');
  }
};

export const getPastEvents = async (limitCount: number = 20): Promise<BookClubEvent[]> => {
  try {
    // Get approved events (we'll filter by date in JavaScript since Firestore
    // has limitations with timestamp queries and we need proper PST date comparison)
    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'approved'),
      limit(limitCount * 2) // Get more events to account for filtering
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
        approvedAt: data.approvedAt?.toDate() || undefined,
      } as BookClubEvent;
    });
    
    // Filter past events using PST timezone
    const pastEvents = events.filter(event => {
      return hasEventEnded(event.date, event.startTime, event.endTime);
    });
    
    // Sort by date in reverse chronological order (most recent first)
    return pastEvents
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting past events:', error);
    throw new Error('Failed to load past events. Please try again.');
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
    
    const isNewRSVP = existingRSVP.empty;
    let previousStatus: string | null = null;
    
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
      const rsvpData = rsvpDoc.data();
      previousStatus = rsvpData.status;
      
      await updateDoc(rsvpDoc.ref, {
        status,
        updatedAt: serverTimestamp(),
      });
    }
    
    // Create RSVP notification for event host (if not the user who RSVP'd)
    try {
      const event = await getEvent(eventId);
      if (event && event.createdBy !== userId) {
        const { createNotification } = await import('./internalNotificationService');
        
        let notificationMessage: string;
        if (isNewRSVP) {
          notificationMessage = `${userName} RSVP'd "${status}" to your event "${event.title}"`;
        } else if (previousStatus !== status) {
          notificationMessage = `${userName} changed their RSVP from "${previousStatus}" to "${status}" for your event "${event.title}"`;
        } else {
          // No notification needed if status didn't change
          console.log('RSVP updated:', { eventId, userId, status });
          return;
        }
        
        await createNotification({
          userId: event.createdBy,
          type: 'rsvp_update',
          title: 'RSVP Update',
          message: notificationMessage,
          data: {
            rsvpUpdate: {
              eventTitle: event.title,
              status,
            }
          },
          eventId,
          fromUserId: userId,
          fromUserName: userName,
          fromUserProfilePicture: userProfilePicture,
        });
      }
    } catch (error) {
      console.error('Error creating RSVP notification:', error);
      // Don't fail RSVP creation if notification fails
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
      where('eventId', '==', eventId)
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
    
    // Sort in JavaScript instead of Firestore
    return rsvps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
      images: commentData.images || [],
      mentions: commentData.mentions || [],
      parentCommentId: commentData.parentCommentId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentDoc);
    console.log('Comment created with ID:', docRef.id);
    
    // Create mention notifications if there are mentions
    if (commentData.mentions && commentData.mentions.length > 0) {
      try {
        // Get event title for notification
        const event = await getEvent(eventId);
        if (event) {
          const { createMentionNotifications } = await import('./internalNotificationService');
          await createMentionNotifications(
            commentData.mentions,
            eventId,
            event.title,
            docRef.id,
            userId,
            userName,
            userProfilePicture
          );
        }
      } catch (error) {
        console.error('Error creating mention notifications:', error);
        // Don't fail comment creation if notifications fail
      }
    }
    
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
      where('eventId', '==', eventId)
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
    
    // Sort in JavaScript instead of Firestore
    const sortedComments = comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Organize comments with replies
    const commentsMap = new Map<string, EventComment>();
    const rootComments: EventComment[] = [];
    
    sortedComments.forEach(comment => {
      comment.replies = [];
      commentsMap.set(comment.id, comment);
      
      if (!comment.parentCommentId) {
        rootComments.push(comment);
      }
    });
    
    // Add replies to their parent comments
    sortedComments.forEach(comment => {
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
  return cacheService.getOrFetch(
    cacheKeys.eventDetails(eventId),
    async () => {
      try {
        const event = await getEvent(eventId);
        if (!event) return null;

        const [rsvps, comments, userRsvp] = await Promise.all([
          getEventRSVPs(eventId),
          getEventComments(eventId),
          userId ? getUserRSVP(eventId, userId) : Promise.resolve(null)
        ]);

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
        } as PopulatedEvent;
      } catch (error) {
        console.error('Error getting populated event:', error);
        throw new Error('Failed to load event details. Please try again.');
      }
    },
    10 // cache 10 minutes
  );
};

// Real-time listeners
export const subscribeToEvents = (callback: (events: BookClubEvent[]) => void) => {
  const eventsQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', 'approved')
  );
  
  const unsubscribe = onSnapshot(eventsQuery, 
    (snapshot) => {
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          approvedAt: data.approvedAt?.toDate() || undefined,
        } as BookClubEvent;
      });
      
      // Filter to show only current and upcoming events using PST timezone
      const upcomingEvents = events.filter(event => {
        return isEventCurrentOrUpcoming(event.date, event.startTime, event.endTime);
      });
      
      // Sort by date in JavaScript (upcoming events first)
      const sortedEvents = upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      callback(sortedEvents);
    },
    (error) => {
      console.error('Error in events subscription:', error);
    }
  );
  
  return unsubscribe;
};

export const subscribeToPastEvents = (callback: (pastEvents: BookClubEvent[]) => void) => {
  const eventsQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', 'approved')
  );
  
  const unsubscribe = onSnapshot(eventsQuery, 
    (snapshot) => {
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          approvedAt: data.approvedAt?.toDate() || undefined,
        } as BookClubEvent;
      });
      
      // Filter past events using PST timezone
      const pastEvents = events.filter(event => {
        return hasEventEnded(event.date, event.startTime, event.endTime);
      });
      
      // Sort by date in reverse chronological order (most recent first)
      const sortedPastEvents = pastEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
      callback(sortedPastEvents);
    },
    (error) => {
      console.error('Error in past events subscription:', error);
    }
  );
  
  return unsubscribe;
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

// Admin Approval Functions
export const getPendingEvents = async (): Promise<BookClubEvent[]> => {
  try {
    const pendingQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    
    const events = pendingSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || undefined,
      } as BookClubEvent;
    });
    
    // Sort by createdAt in JavaScript instead of Firestore (newest first)
    return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting pending events:', error);
    throw new Error('Failed to load pending events. Please try again.');
  }
};

export const approveEvent = async (
  eventId: string,
  adminUserId: string,
  approvalData: ApprovalFormData
): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    
    const updateData: any = {
      status: approvalData.action === 'approve' ? 'approved' : 'rejected',
      approvedBy: adminUserId,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    if (approvalData.action === 'reject' && approvalData.rejectionReason) {
      updateData.rejectionReason = approvalData.rejectionReason;
    }
    
    await updateDoc(eventRef, updateData);
    console.log(`Event ${approvalData.action}d:`, eventId);
    
    // Invalidate caches
    cacheService.remove(cacheKeys.eventDetails(eventId)).catch(() => {});
    cacheService.remove(cacheKeys.events()).catch(() => {});
    
    // Create event approval/rejection notification
    try {
      const event = await getEvent(eventId);
      if (event) {
        const { createEventApprovalNotification } = await import('./internalNotificationService');
        await createEventApprovalNotification(
          eventId,
          event.title,
          event.createdBy,
          approvalData.action === 'approve' ? 'approved' : 'rejected',
          adminUserId,
          'Admin', // Could get admin name from user data
          undefined, // Admin profile picture
          approvalData.rejectionReason
        );
      }
    } catch (error) {
      console.error('Error creating approval notification:', error);
      // Don't fail approval if notifications fail
    }
  } catch (error) {
    console.error(`Error ${approvalData.action}ing event:`, error);
    throw new Error(`Failed to ${approvalData.action} event. Please try again.`);
  }
};

export const getPendingEventStats = async (): Promise<PendingEventStats> => {
  try {
    const pendingQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    
    const totalPending = pendingSnapshot.size;
    
    // Calculate events from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newThisWeek = pendingSnapshot.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      return createdAt && createdAt >= oneWeekAgo;
    }).length;
    
    return {
      totalPending,
      newThisWeek
    };
  } catch (error) {
    console.error('Error getting pending event stats:', error);
    return { totalPending: 0, newThisWeek: 0 };
  }
};

// Real-time listeners for admin
export const subscribeToPendingEvents = (callback: (events: BookClubEvent[]) => void) => {
  const pendingQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', 'pending')
  );
  
  return onSnapshot(pendingQuery, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || undefined,
      } as BookClubEvent;
    });
    
    // Sort by createdAt in JavaScript instead of Firestore (newest first)
    const sortedEvents = events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    callback(sortedEvents);
  }, (error) => {
    console.error('Error in pending events subscription:', error);
  });
};

// Get events that a user is attending (RSVP'd as 'going') or hosting
export const getUserEvents = async (userId: string): Promise<BookClubEvent[]> => {
  try {
    // Get all approved events
    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'approved')
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    
    const allEvents = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || undefined,
      } as BookClubEvent;
    });

    // Get user's RSVPs for 'going' status
    const rsvpsQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'going')
    );
    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    const rsvpEventIds = rsvpsSnapshot.docs.map(doc => doc.data().eventId);

    // Filter events to include:
    // 1. Events the user is hosting (createdBy === userId)
    // 2. Events the user RSVP'd to as 'going'
    const userEvents = allEvents.filter(event => 
      event.createdBy === userId || rsvpEventIds.includes(event.id)
    );

    // Sort by date
    return userEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error getting user events:', error);
    throw new Error('Failed to load your events. Please try again.');
  }
};

// Subscribe to user events with real-time updates
export const subscribeToUserEvents = (
  userId: string,
  callback: (events: BookClubEvent[]) => void
) => {
  // Subscribe to events where user is the creator
  const createdEventsQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('createdBy', '==', userId),
    where('status', '==', 'approved')
  );

  // Subscribe to user's RSVPs
  const userRsvpsQuery = query(
    collection(db, RSVPS_COLLECTION),
    where('userId', '==', userId),
    where('status', '==', 'going')
  );

  let createdEvents: BookClubEvent[] = [];
  let rsvpEventIds: string[] = [];
  let allEvents: BookClubEvent[] = [];

  const updateUserEvents = () => {
    const userEvents = allEvents.filter(event => 
      event.createdBy === userId || rsvpEventIds.includes(event.id)
    );
    const sortedEvents = userEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    callback(sortedEvents);
  };

  // Subscribe to all approved events
  const unsubscribeAllEvents = onSnapshot(
    query(collection(db, EVENTS_COLLECTION), where('status', '==', 'approved')),
    (snapshot) => {
      allEvents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          approvedAt: data.approvedAt?.toDate() || undefined,
        } as BookClubEvent;
      });
      updateUserEvents();
    },
    (error) => {
      console.error('Error in user events subscription:', error);
    }
  );

  // Subscribe to user's RSVPs
  const unsubscribeRsvps = onSnapshot(
    userRsvpsQuery,
    (snapshot) => {
      rsvpEventIds = snapshot.docs.map(doc => doc.data().eventId);
      updateUserEvents();
    },
    (error) => {
      console.error('Error in user RSVPs subscription:', error);
    }
  );

  // Return cleanup function
  return () => {
    unsubscribeAllEvents();
    unsubscribeRsvps();
  };
};

export const uploadEventHeaderImage = async (eventId: string, imageUri: string): Promise<string> => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, `event-headers/${eventId}-${Date.now()}.jpg`);
    
    // Upload image
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Event header image uploaded:', eventId);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading event header image:', error);
    throw new Error('Failed to upload event header image. Please try again.');
  }
};

export const deleteEventHeaderImage = async (imageUrl: string): Promise<void> => {
  try {
    // Skip deletion if it's a local file URI (not a Firebase Storage URL)
    if (imageUrl.startsWith('file://') || imageUrl.startsWith('content://')) {
      console.log('Skipping deletion of local file URI:', imageUrl);
      return;
    }
    
    // Only process Firebase Storage URLs
    if (!imageUrl.includes('firebasestorage.googleapis.com')) {
      console.log('Skipping deletion of non-Firebase URL:', imageUrl);
      return;
    }
    
    // Extract the file path from the URL - handle both old and new Firebase Storage URL formats
    const url = new URL(imageUrl);
    let filePath: string | null = null;
    
    // Try to extract from the path (new format: /v0/b/bucket/o/path)
    const newFormatMatch = url.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)/);
    if (newFormatMatch) {
      filePath = decodeURIComponent(newFormatMatch[1]);
    } else {
      // Fallback to old format (/o/path)
      const oldFormatMatch = url.pathname.match(/\/o\/(.+)/);
      if (oldFormatMatch) {
        // Remove query parameters if they exist in the path
        const pathWithoutQuery = oldFormatMatch[1].split('?')[0];
        filePath = decodeURIComponent(pathWithoutQuery);
      }
    }
    
    if (!filePath) {
      console.error('Could not extract file path from Firebase Storage URL:', imageUrl);
      console.debug('URL pathname:', url.pathname);
      return;
    }
    
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    console.log('Event header image deleted from Firebase Storage');
  } catch (error) {
    console.error('Error deleting event header image:', error);
    // Don't throw error as this is cleanup - event can still be updated
  }
};

/**
 * Get events a user is attending (based on RSVPs)
 */
export const getUserAttendingEvents = async (userId: string, limitCount: number = 10): Promise<BookClubEvent[]> => {
  try {
    // First get user's RSVPs where status is 'going'
    const rsvpsQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'going'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    const eventIds = rsvpsSnapshot.docs.map(doc => doc.data().eventId);

    if (eventIds.length === 0) return [];

    // Get all events in a single batch query
    const eventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      where(documentId(), 'in', eventIds)
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

    // Sort by date
    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching user attending events:', error);
    return [];
  }
}; 