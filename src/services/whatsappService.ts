import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  DocumentReference 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface WhatsAppCommunity {
  id: string;
  inviteLink: string;
  isActive: boolean;
  description: string;
  lastUpdated: Date;
  updatedBy: string;
}

export interface CreateWhatsAppCommunityData {
  inviteLink: string;
  isActive: boolean;
  description: string;
  updatedBy: string;
}

export interface UpdateWhatsAppCommunityData {
  inviteLink?: string;
  isActive?: boolean;
  description?: string;
  updatedBy: string;
}

const WHATSAPP_DOC_ID = 'community_chat';

class WhatsAppService {
  private getWhatsAppDocRef(): DocumentReference {
    return doc(db, 'whatsapp_community', WHATSAPP_DOC_ID);
  }

  async getWhatsAppCommunity(): Promise<WhatsAppCommunity | null> {
    try {
      const docRef = this.getWhatsAppDocRef();
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          inviteLink: data.inviteLink || '',
          isActive: data.isActive || false,
          description: data.description || '',
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || '',
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching WhatsApp community:', error);
      throw error;
    }
  }

  async createWhatsAppCommunity(data: CreateWhatsAppCommunityData): Promise<void> {
    try {
      const docRef = this.getWhatsAppDocRef();
      
      await setDoc(docRef, {
        ...data,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating WhatsApp community:', error);
      throw error;
    }
  }

  async updateWhatsAppCommunity(data: UpdateWhatsAppCommunityData): Promise<void> {
    try {
      const docRef = this.getWhatsAppDocRef();
      
      await updateDoc(docRef, {
        ...data,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating WhatsApp community:', error);
      throw error;
    }
  }

  async initializeWhatsAppCommunity(): Promise<void> {
    try {
      const existing = await this.getWhatsAppCommunity();
      
      if (!existing) {
        await this.createWhatsAppCommunity({
          inviteLink: '',
          isActive: false,
          description: 'Join our WhatsApp community to stay connected with fellow book club members!',
          updatedBy: 'system',
        });
      }
    } catch (error) {
      console.error('Error initializing WhatsApp community:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService(); 