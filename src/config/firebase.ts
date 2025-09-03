import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure we're using the web Firebase SDK explicitly
console.log('Initializing Firebase with Web SDK for Development Build');

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

// Initialize Firebase (avoid multiple initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
} else {
  app = getApp();
  console.log('Firebase app already exists');
}

// Initialize Firebase Auth - Firebase will automatically handle persistence
let auth: Auth;
try {
  // Try to get existing auth instance
  auth = getAuth(app);
  console.log('Using existing Firebase Auth instance');
} catch (error) {
  // Initialize new auth instance
  console.log('Initializing new Firebase Auth instance');
  auth = initializeAuth(app);
  console.log('Firebase Auth initialized');
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in production builds
let analytics;
try {
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping Analytics initialization in development');
  } else {
    analytics = getAnalytics(app);
    console.log('Analytics initialized');
  }
} catch (error) {
  console.warn('Analytics initialization failed:', error);
}

export { analytics };
export default app; 