import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import { isAdminEmail } from '../utils/adminUtils';

/**
 * Register a new user with email and password
 */
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthUser> => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, {
      displayName: credentials.displayName,
    });

    // Try to create user document in Firestore, but don't fail if offline
    try {
      const userData: Omit<AuthUser, 'id'> & { createdAt: any; updatedAt: any } = {
        email: credentials.email,
        displayName: credentials.displayName,
        role: 'member', // Default role
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User document created in Firestore');
    } catch (firestoreError) {
      console.warn('Could not create Firestore document (offline?), but user was created:', firestoreError);
    }

    // Return the AuthUser object from Firebase Auth data
    return {
      id: user.uid,
      email: credentials.email,
      displayName: credentials.displayName,
      role: 'member',
      bio: undefined,
      hobbies: undefined,
      favoriteBooks: undefined,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Sign in user with email and password
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = userCredential.user;

    // Try to get additional user data from Firestore, but fall back to Firebase Auth data
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      userData = userDoc.data();
      console.log('Retrieved user data from Firestore');
    } catch (firestoreError) {
      console.warn('Could not fetch from Firestore (offline?), using Firebase Auth data:', firestoreError);
    }

    // Ensure admin role is set for admin emails
    userData = await ensureAdminRole(user, userData);

    return {
      id: user.uid,
      email: user.email!,
      displayName: user.displayName || userData?.displayName || 'User',
      role: userData?.role || 'member',
      profilePicture: userData?.profilePicture,
      bio: userData?.bio,
      hobbies: userData?.hobbies,
      favoriteBooks: userData?.favoriteBooks,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Sign out the current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // Try to get additional user data from Firestore, but fall back to Firebase Auth data
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      userData = userDoc.data();
    } catch (firestoreError) {
      console.warn('Could not fetch from Firestore (offline?), using Firebase Auth data');
    }

    // Ensure admin role is set for admin emails
    userData = await ensureAdminRole(user, userData);

    return {
      id: user.uid,
      email: user.email!,
      displayName: user.displayName || userData?.displayName || 'User',
      role: userData?.role || 'member',
      profilePicture: userData?.profilePicture,
      bio: userData?.bio,
      hobbies: userData?.hobbies,
      favoriteBooks: userData?.favoriteBooks,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        // Try to get additional user data from Firestore, but fall back to Firebase Auth data
        let userData = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          userData = userDoc.data();
        } catch (firestoreError) {
          console.warn('Could not fetch from Firestore in auth listener (offline?), using Firebase Auth data');
        }

        // Ensure admin role is set for admin emails
        userData = await ensureAdminRole(firebaseUser, userData);

        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData?.displayName || 'User',
          role: userData?.role || 'member',
          profilePicture: userData?.profilePicture,
          bio: userData?.bio,
          hobbies: userData?.hobbies,
          favoriteBooks: userData?.favoriteBooks,
        };

        callback(authUser);
      } catch (error) {
        console.error('Error in auth state change:', error);
        
        // Even if Firestore fails, we can still create a basic auth user from Firebase Auth
        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'User',
          role: 'member', // Default role when Firestore is unavailable
          bio: undefined,
          hobbies: undefined,
          favoriteBooks: undefined,
        };
        
        callback(authUser);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Ensure admin role is set for admin emails
 */
const ensureAdminRole = async (user: FirebaseUser, userData: any): Promise<any> => {
  if (isAdminEmail(user.email!)) {
    // Check if user already has admin role
    if (userData?.role !== 'admin') {
      try {
        const userRef = doc(db, 'users', user.uid);
        
        if (userData) {
          // User document exists, update it
          await updateDoc(userRef, {
            role: 'admin',
            updatedAt: serverTimestamp(),
          });
        } else {
          // User document doesn't exist, create it
          const newUserData = {
            email: user.email!,
            displayName: user.displayName || 'Admin User',
            role: 'admin',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          await setDoc(userRef, newUserData);
          userData = newUserData;
        }
        
        console.log('Admin role assigned to:', user.email);
        return { ...userData, role: 'admin' };
      } catch (error) {
        console.error('Error setting admin role:', error);
      }
    }
  }
  return userData;
}; 