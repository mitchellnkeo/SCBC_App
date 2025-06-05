import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Utility function to set admin role for a user
export const setUserAsAdmin = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date()
    });
    console.log('User role updated to admin:', userId);
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw error;
  }
};

// Utility function to check user role
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || 'member';
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Admin emails list - add your email here
const ADMIN_EMAILS = [
  'mitchellnkeo@gmail.com',
  // Add other admin emails here
];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}; 