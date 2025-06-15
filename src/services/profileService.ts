import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { AuthUser } from '../types';
import { selectAndUploadProfilePicture, deleteProfilePicture } from './imageService';

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
 * Update user profile picture by selecting and uploading a new image
 */
export const updateProfilePicture = async (
  userId: string,
  source: 'camera' | 'gallery' = 'gallery'
): Promise<{ success: boolean; profilePictureUrl?: string; error?: string }> => {
  try {
    // Get current user data to check for existing profile picture
    const currentProfile = await getUserProfile(userId);
    
    // Upload new profile picture
    const uploadResult = await selectAndUploadProfilePicture(userId, source);
    
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload profile picture',
      };
    }

    // Delete old profile picture if it exists
    if (currentProfile?.profilePicture) {
      try {
        await deleteProfilePicture(currentProfile.profilePicture);
      } catch (error) {
        console.warn('Failed to delete old profile picture:', error);
        // Don't fail the update if we can't delete the old picture
      }
    }

    // Update profile with new picture URL
    await updateUserProfile(userId, {
      profilePicture: uploadResult.url,
    });

    // Update Firebase Auth profile picture
    if (auth.currentUser && uploadResult.url) {
      await updateProfile(auth.currentUser, {
        photoURL: uploadResult.url,
      });
    }

    return {
      success: true,
      profilePictureUrl: uploadResult.url,
    };
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile picture',
    };
  }
};

/**
 * Remove user profile picture
 */
export const removeProfilePicture = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current profile to find existing picture
    const currentProfile = await getUserProfile(userId);
    
    if (!currentProfile?.profilePicture) {
      return { success: true }; // No picture to remove
    }

    // Delete from storage
    const deleteSuccess = await deleteProfilePicture(currentProfile.profilePicture);
    
    if (!deleteSuccess) {
      console.warn('Failed to delete profile picture from storage');
      // Continue with profile update even if storage deletion fails
    }

    // Update profile to remove picture URL
    await updateUserProfile(userId, {
      profilePicture: '',
    });

    // Update Firebase Auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        photoURL: null,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove profile picture',
    };
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