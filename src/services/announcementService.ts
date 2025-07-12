import { collection, doc, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { createAnnouncementNotification } from './internalNotificationService';

export interface Announcement {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

export interface GetAnnouncementsResult {
  announcements: Announcement[];
}

class AnnouncementService {
  private getAnnouncementsCollection() {
    return collection(db, 'announcements');
  }

  async getAnnouncements(): Promise<GetAnnouncementsResult> {
    try {
      const announcementsRef = this.getAnnouncementsCollection();
      const q = query(announcementsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const announcements: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        announcements.push({
          id: doc.id,
          content: data.content,
          authorId: data.authorId,
          authorName: data.authorName,
          createdAt: data.createdAt,
        });
      });

      return { announcements };
    } catch (error: any) {
      console.error('Error getting announcements:', error);
      throw new Error('Failed to load announcements');
    }
  }

  async createAnnouncement(content: string): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (user.role !== 'admin') {
        throw new Error('Only admins can create announcements');
      }

      const announcementsRef = this.getAnnouncementsCollection();
      const docRef = await addDoc(announcementsRef, {
        content,
        authorId: user.id,
        authorName: user.displayName || 'Admin',
        createdAt: serverTimestamp(),
      });

      // Send notifications to all users
      await createAnnouncementNotification(
        docRef.id,
        content,
        user.id,
        user.displayName || 'Admin',
        user.profilePicture
      );
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      throw new Error(error.message || 'Failed to create announcement');
    }
  }

  async deleteAnnouncement(announcementId: string): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (user.role !== 'admin') {
        throw new Error('Only admins can delete announcements');
      }

      const announcementRef = doc(db, 'announcements', announcementId);
      await deleteDoc(announcementRef);
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      throw new Error(error.message || 'Failed to delete announcement');
    }
  }
}

export const announcementService = new AnnouncementService(); 