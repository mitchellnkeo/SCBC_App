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
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Notification, 
  CreateNotificationData, 
  NotificationStats, 
  NotificationSettings,
  NotificationType 
} from '../types/notifications';
import { Mention } from '../types/mentions';

const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_SETTINGS_COLLECTION = 'notificationSettings';

/**
 * Create a new notification
 */
export const createNotification = async (notificationData: CreateNotificationData): Promise<string> => {
  try {
    const notification = {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    console.log('Notification created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};

/**
 * Create mention notifications for all mentioned users
 */
export const createMentionNotifications = async (
  mentions: Mention[],
  eventId: string,
  eventTitle: string,
  commentId: string,
  mentionerUserId: string,
  mentionerUserName: string,
  mentionerProfilePicture?: string
): Promise<void> => {
  if (mentions.length === 0) return;

  try {
    const batch = writeBatch(db);
    
    mentions.forEach(mention => {
      // Don't notify users who mention themselves
      if (mention.userId === mentionerUserId) return;
      
      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      batch.set(notificationRef, {
        userId: mention.userId,
        type: 'mention' as NotificationType,
        title: 'You were mentioned',
        message: `${mentionerUserName} mentioned you in a comment on "${eventTitle}"`,
        data: {
          mention: {
            commentId,
            eventTitle,
            mentionText: mention.displayName,
          }
        },
        isRead: false,
        eventId,
        fromUserId: mentionerUserId,
        fromUserName: mentionerUserName,
        fromUserProfilePicture: mentionerProfilePicture,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`Created ${mentions.length} mention notifications`);
  } catch (error) {
    console.error('Error creating mention notifications:', error);
  }
};

/**
 * Create event update notification for all attendees
 */
export const createEventUpdateNotification = async (
  eventId: string,
  eventTitle: string,
  changes: string[],
  updaterUserId: string,
  updaterUserName: string,
  updaterProfilePicture?: string
): Promise<void> => {
  try {
    // Get all users who RSVP'd to this event
    const rsvpsQuery = query(
      collection(db, 'rsvps'),
      where('eventId', '==', eventId),
      where('status', 'in', ['going', 'maybe'])
    );
    const rsvpsSnapshot = await getDocs(rsvpsQuery);
    
    if (rsvpsSnapshot.empty) return;

    const batch = writeBatch(db);
    const notifiedUsers = new Set<string>();
    
    rsvpsSnapshot.docs.forEach(rsvpDoc => {
      const rsvpData = rsvpDoc.data();
      const userId = rsvpData.userId;
      
      // Don't notify the person who made the update or duplicate users
      if (userId === updaterUserId || notifiedUsers.has(userId)) return;
      
      notifiedUsers.add(userId);
      
      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      batch.set(notificationRef, {
        userId,
        type: 'event_update' as NotificationType,
        title: 'Event updated',
        message: `"${eventTitle}" has been updated by ${updaterUserName}`,
        data: {
          eventUpdate: {
            eventTitle,
            changes,
          }
        },
        isRead: false,
        eventId,
        fromUserId: updaterUserId,
        fromUserName: updaterUserName,
        fromUserProfilePicture: updaterProfilePicture,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`Created ${notifiedUsers.size} event update notifications`);
  } catch (error) {
    console.error('Error creating event update notifications:', error);
  }
};

/**
 * Create event approval/rejection notification
 */
export const createEventApprovalNotification = async (
  eventId: string,
  eventTitle: string,
  eventCreatorId: string,
  status: 'approved' | 'rejected',
  adminUserId: string,
  adminUserName: string,
  adminProfilePicture?: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const isApproved = status === 'approved';
    
    await createNotification({
      userId: eventCreatorId,
      type: isApproved ? 'event_approved' : 'event_rejected',
      title: isApproved ? 'Event approved!' : 'Event not approved',
      message: isApproved 
        ? `Your event "${eventTitle}" has been approved and is now live!`
        : `Your event "${eventTitle}" was not approved${rejectionReason ? `: ${rejectionReason}` : ''}`,
      data: {
        eventApproval: {
          eventTitle,
          status,
        }
      },
      eventId,
      fromUserId: adminUserId,
      fromUserName: adminUserName,
      fromUserProfilePicture: adminProfilePicture,
    });
    
    console.log(`Created event ${status} notification`);
  } catch (error) {
    console.error('Error creating event approval notification:', error);
  }
};

/**
 * Get user's notifications
 */
export const getUserNotifications = async (
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> => {
  try {
    const notificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    const notifications = notificationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notification;
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw new Error('Failed to load notifications');
  }
};

/**
 * Get unread notification stats
 */
export const getNotificationStats = async (userId: string): Promise<NotificationStats> => {
  try {
    const unreadQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const unreadSnapshot = await getDocs(unreadQuery);
    
    const unreadByType: Record<NotificationType, number> = {
      mention: 0,
      event_update: 0,
      event_approved: 0,
      event_rejected: 0,
      rsvp_update: 0,
      comment_reply: 0,
      admin_message: 0,
    };
    
    let totalUnread = 0;
    
    unreadSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type as NotificationType;
      if (unreadByType.hasOwnProperty(type)) {
        unreadByType[type]++;
        totalUnread++;
      }
    });
    
    return {
      totalUnread,
      unreadByType,
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return {
      totalUnread: 0,
      unreadByType: {
        mention: 0,
        event_update: 0,
        event_approved: 0,
        event_rejected: 0,
        rsvp_update: 0,
        comment_reply: 0,
        admin_message: 0,
      },
    };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
    console.log('Notification marked as read:', notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
};

/**
 * Mark all user notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const unreadQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const unreadSnapshot = await getDocs(unreadQuery);
    
    if (unreadSnapshot.empty) return;
    
    const batch = writeBatch(db);
    
    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
    console.log(`Marked ${unreadSnapshot.docs.length} notifications as read`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark notifications as read');
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    console.log('Notification deleted:', notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Failed to delete notification');
  }
};

/**
 * Subscribe to user notifications
 */
export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const notificationsQuery = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notification;
    });
    
    callback(notifications);
  }, (error) => {
    console.error('Error in notifications subscription:', error);
  });
};

/**
 * Subscribe to notification stats
 */
export const subscribeToNotificationStats = (
  userId: string,
  callback: (stats: NotificationStats) => void
) => {
  const unreadQuery = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  
  return onSnapshot(unreadQuery, (snapshot) => {
    const unreadByType: Record<NotificationType, number> = {
      mention: 0,
      event_update: 0,
      event_approved: 0,
      event_rejected: 0,
      rsvp_update: 0,
      comment_reply: 0,
      admin_message: 0,
    };
    
    let totalUnread = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type as NotificationType;
      if (unreadByType.hasOwnProperty(type)) {
        unreadByType[type]++;
        totalUnread++;
      }
    });
    
    callback({
      totalUnread,
      unreadByType,
    });
  }, (error) => {
    console.error('Error in notification stats subscription:', error);
  });
}; 