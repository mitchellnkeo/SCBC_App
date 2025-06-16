import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface MonthlyBook {
  id: string;
  month: string; // e.g., "January 2024"
  title: string;
  author: string;
  description: string;
  coverImageUrl?: string;
  genre: string;
  pages: number;
  publishedYear: number;
  awards: string[];
  whySelected: string;
  discussionSheetUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean; // Only one book should be active at a time
}

export interface CreateMonthlyBookData {
  month: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  pages: number;
  publishedYear: number;
  awards: string[];
  whySelected: string;
  discussionSheetUrl: string;
}

export interface UpdateMonthlyBookData extends Partial<CreateMonthlyBookData> {
  coverImageUrl?: string;
  isActive?: boolean;
}

const COLLECTION_NAME = 'monthlyBooks';

class MonthlyBookService {
  // Get the current active monthly book
  async getCurrentMonthlyBook(): Promise<MonthlyBook | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as MonthlyBook;
    } catch (error) {
      console.error('Error getting current monthly book:', error);
      throw error;
    }
  }

  // Get a specific monthly book by ID
  async getMonthlyBook(bookId: string): Promise<MonthlyBook | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, bookId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as MonthlyBook;
    } catch (error) {
      console.error('Error getting monthly book:', error);
      throw error;
    }
  }

  // Create a new monthly book (admin only)
  async createMonthlyBook(bookData: CreateMonthlyBookData): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = doc(collection(db, COLLECTION_NAME));
      
      const newBook: Omit<MonthlyBook, 'id'> = {
        ...bookData,
        createdAt: now,
        updatedAt: now,
        isActive: true, // New book becomes active
      };
      
      // Deactivate all other books first
      await this.deactivateAllBooks();
      
      await setDoc(docRef, newBook);
      return docRef.id;
    } catch (error) {
      console.error('Error creating monthly book:', error);
      throw error;
    }
  }

  // Update an existing monthly book (admin only)
  async updateMonthlyBook(bookId: string, updates: UpdateMonthlyBookData): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, bookId);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating monthly book:', error);
      throw error;
    }
  }

  // Upload book cover image
  async uploadBookCover(bookId: string, imageUri: string): Promise<string> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create storage reference
      const imageRef = ref(storage, `monthlyBooks/${bookId}/cover.jpg`);
      
      // Upload image
      await uploadBytes(imageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      
      // Update book document with image URL
      await this.updateMonthlyBook(bookId, { coverImageUrl: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading book cover:', error);
      throw error;
    }
  }

  // Delete book cover image
  async deleteBookCover(bookId: string): Promise<void> {
    try {
      const imageRef = ref(storage, `monthlyBooks/${bookId}/cover.jpg`);
      await deleteObject(imageRef);
      
      // Remove image URL from book document
      await this.updateMonthlyBook(bookId, { coverImageUrl: undefined });
    } catch (error) {
      console.error('Error deleting book cover:', error);
      throw error;
    }
  }

  // Get all monthly books (for admin management)
  async getAllMonthlyBooks(): Promise<MonthlyBook[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MonthlyBook[];
    } catch (error) {
      console.error('Error getting all monthly books:', error);
      throw error;
    }
  }

  // Deactivate all books (helper function)
  private async deactivateAllBooks(): Promise<void> {
    try {
      const books = await this.getAllMonthlyBooks();
      
      const updatePromises = books.map(book => 
        this.updateMonthlyBook(book.id, { isActive: false })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error deactivating books:', error);
      throw error;
    }
  }

  // Set a specific book as active (admin only)
  async setActiveBook(bookId: string): Promise<void> {
    try {
      // Deactivate all books first
      await this.deactivateAllBooks();
      
      // Activate the selected book
      await this.updateMonthlyBook(bookId, { isActive: true });
    } catch (error) {
      console.error('Error setting active book:', error);
      throw error;
    }
  }
}

export const monthlyBookService = new MonthlyBookService(); 