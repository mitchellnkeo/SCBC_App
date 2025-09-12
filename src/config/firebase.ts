import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure we're using the web Firebase SDK explicitly

// Firebase configuration using environment variables
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDt4Pla0Rnf9Ck7GdNrvYfgVrF2WUOiBwU",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "scbc-app-9b6e6.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "scbc-app-9b6e6",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "scbc-app-9b6e6.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "464365287349",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:464365287349:web:a8e249603139c73b218bfc",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZQK1QQCLVP"
  };

// Initialize Firebase
let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth
let auth: Auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
if (process.env.NODE_ENV === 'production') {
  try {
    import('firebase/analytics').then(({ getAnalytics }) => {
      getAnalytics(app);
    }).catch(() => {
      // Analytics not available
    });
  } catch (error) {
    // Analytics not available
  }
}

export default app; 