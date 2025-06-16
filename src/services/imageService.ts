import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

// Rate limiting - track last upload time per user
const lastUploadTimes = new Map<string, number>();
const UPLOAD_COOLDOWN_MS = 60000; // 1 minute cooldown between uploads

export interface ImagePickerResult {
  uri: string;
  canceled: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Request camera and media library permissions
 */
export const requestImagePermissions = async (): Promise<boolean> => {
  try {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    // Request media library permissions
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
  } catch (error) {
    console.error('Error requesting image permissions:', error);
    return false;
  }
};

/**
 * Show image picker options (camera vs gallery)
 */
export const showImagePickerOptions = (): Promise<'camera' | 'gallery' | 'cancel'> => {
  return new Promise((resolve) => {
    // For now, we'll default to gallery. In a full implementation,
    // you might want to show an action sheet here
    resolve('gallery');
  });
};

/**
 * Pick image from camera
 */
export const pickImageFromCamera = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return { uri: '', canceled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return { uri: '', canceled: true };
    }

    return { uri: result.assets[0].uri, canceled: false };
  } catch (error) {
    console.error('Error picking image from camera:', error);
    return { uri: '', canceled: true };
  }
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return { uri: '', canceled: true };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return { uri: '', canceled: true };
    }

    return { uri: result.assets[0].uri, canceled: false };
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return { uri: '', canceled: true };
  }
};

/**
 * Compress and optimize image for upload
 */
export const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: 400, height: 400 } }, // Resize to 400x400 for profile pictures
    ], {
      compress: 0.7, // 70% quality
      format: ImageManipulator.SaveFormat.JPEG, // Convert to JPEG for smaller file size
    });

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original URI if compression fails
  }
};

/**
 * Upload image to Firebase Storage
 */
export const uploadProfilePicture = async (
  imageUri: string, 
  userId: string
): Promise<ImageUploadResult> => {
  try {
    // Compress image first
    const compressedUri = await compressImage(imageUri);
    
    // Convert image to blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    
    // Create storage reference
    const fileName = `profile-pictures/${userId}-${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);
    
    // Upload image
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      serverResponse: (error as any)?.serverResponse,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
};

/**
 * Delete profile picture from Firebase Storage
 */
export const deleteProfilePicture = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      console.error('Could not extract file path from URL:', imageUrl);
      return false;
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};

/**
 * Main function to handle profile picture selection and upload
 */
export const selectAndUploadProfilePicture = async (
  userId: string,
  source: 'camera' | 'gallery' = 'gallery'
): Promise<ImageUploadResult> => {
  try {
    // Rate limiting check
    const lastUpload = lastUploadTimes.get(userId);
    const now = Date.now();
    
    if (lastUpload && (now - lastUpload) < UPLOAD_COOLDOWN_MS) {
      const remainingTime = Math.ceil((UPLOAD_COOLDOWN_MS - (now - lastUpload)) / 1000);
      return {
        success: false,
        error: `Please wait ${remainingTime} seconds before uploading another picture`,
      };
    }
    
    // Pick image based on source
    const pickerResult = source === 'camera' 
      ? await pickImageFromCamera()
      : await pickImageFromGallery();
    
    if (pickerResult.canceled) {
      return { success: false, error: 'Image selection canceled' };
    }
    
    // Update rate limiting tracker
    lastUploadTimes.set(userId, now);
    
    // Upload the selected image
    return await uploadProfilePicture(pickerResult.uri, userId);
  } catch (error) {
    console.error('Error in selectAndUploadProfilePicture:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image',
    };
  }
}; 