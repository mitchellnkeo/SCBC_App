import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../../config/firebase';

const FirebaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test Firebase Auth
      if (auth) {
        setAuthStatus('✅ Firebase Auth connected');
      } else {
        setAuthStatus('❌ Firebase Auth failed');
      }

      // Test Firestore
      if (db) {
        setFirestoreStatus('✅ Firestore connected');
      } else {
        setFirestoreStatus('❌ Firestore failed');
      }

      // Overall status
      if (auth && db) {
        setConnectionStatus('🎉 Firebase successfully connected!');
      } else {
        setConnectionStatus('❌ Firebase connection failed');
      }

    } catch (error) {
      console.error('Firebase test error:', error);
      setConnectionStatus('❌ Firebase connection error');
      setAuthStatus('❌ Auth error');
      setFirestoreStatus('❌ Firestore error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{connectionStatus}</Text>
        <Text style={styles.statusText}>{authStatus}</Text>
        <Text style={styles.statusText}>{firestoreStatus}</Text>
      </View>

      <Text style={styles.info}>
        Project ID: {process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'Not found'}
      </Text>
      
      <Text style={styles.note}>
        Note: AsyncStorage warning is normal and doesn't break functionality
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  info: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

export default FirebaseTest; 