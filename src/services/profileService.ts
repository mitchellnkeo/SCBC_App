import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { AuthUser } from '../types';

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  hobbies?: string[];
  favoriteBooks?: string[];
  profilePicture?: string;
}

/**
 * Update user profile in both Firebase Auth and Firestore
 */
export const updateUserProfile = async (
  userId: string,
  updateData: ProfileUpdateData
): Promise<void> => {
  try {
    const updates: any = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    // Update Firestore document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);

    // Update Firebase Auth display name if provided
    if (updateData.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updateData.displayName,
      });
    }

    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
};

/**
 * Get user profile data from Firestore
 */
export const getUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userId,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        profilePicture: data.profilePicture,
        bio: data.bio,
        hobbies: data.hobbies,
        favoriteBooks: data.favoriteBooks,
      } as AuthUser;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}; 