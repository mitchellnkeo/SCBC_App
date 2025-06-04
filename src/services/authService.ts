import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';

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

    return {
      id: user.uid,
      email: user.email!,
      displayName: user.displayName || userData?.displayName || 'User',
      role: userData?.role || 'member',
      profilePicture: userData?.profilePicture,
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

    return {
      id: user.uid,
      email: user.email!,
      displayName: user.displayName || userData?.displayName || 'User',
      role: userData?.role || 'member',
      profilePicture: userData?.profilePicture,
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

        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData?.displayName || 'User',
          role: userData?.role || 'member',
          profilePicture: userData?.profilePicture,
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
        };
        
        callback(authUser);
      }
    } else {
      callback(null);
    }
  });
}; 