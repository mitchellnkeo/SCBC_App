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

// Initialize Firebase Auth with AsyncStorage persistence for React Native/Development Build
let auth: Auth;
try {
  // Try to get existing auth instance
  auth = getAuth(app);
  console.log('Using existing Firebase Auth instance');
} catch (error) {
  // For Development Build, we can use a custom persistence setup
  console.log('Initializing Firebase Auth for Development Build with AsyncStorage');
  
  // Create a custom persistence object that uses AsyncStorage
  const customPersistence = {
    type: 'LOCAL',
    isAvailable: () => Promise.resolve(true),
    clear: () => AsyncStorage.removeItem('firebase:authUser'),
    get: (key: string) => AsyncStorage.getItem(key),
    set: (key: string, value: string) => AsyncStorage.setItem(key, value),
    remove: (key: string) => AsyncStorage.removeItem(key),
  };

  auth = initializeAuth(app, {
    persistence: customPersistence as any,
  });
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('Firebase Auth, Firestore, and Storage initialized for Development Build');

// Analytics only works in web/production builds, not in Expo development
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  // Analytics not available in development environment
  console.log('Analytics not available in this environment');
}

export { analytics };
export default app; 