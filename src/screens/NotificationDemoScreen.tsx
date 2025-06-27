import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Clipboard from 'expo-clipboard';
import TopNavbar from '../components/navigation/TopNavbar';
import { Input } from '../components/common/Input';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationDemoScreen = () => {
  const {
    expoPushToken,
    notification,
    permissionGranted,
    requestPermissions,
    scheduleLocalNotification,
    cancelAllNotifications,
    setBadgeCount,
  } = useNotifications();

  const [notificationTitle, setNotificationTitle] = useState('Test Notification');
  const [notificationBody, setNotificationBody] = useState('This is a test notification!');
  const [badgeCount, setBadgeCountInput] = useState('1');

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Notifications enabled!');
    } else {
      Alert.alert('Error', 'Failed to enable notifications');
    }
  };

  const handleScheduleNotification = async () => {
    if (!permissionGranted) {
      Alert.alert('Error', 'Please enable notifications first');
      return;
    }

    const notificationId = await scheduleLocalNotification(
      notificationTitle,
      notificationBody,
      { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 } // Trigger in 5 seconds
    );

    if (notificationId) {
      Alert.alert('Success', 'Notification scheduled for 5 seconds!');
    } else {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const handleScheduleInstantNotification = async () => {
    if (!permissionGranted) {
      Alert.alert('Error', 'Please enable notifications first');
      return;
    }

    const notificationId = await scheduleLocalNotification(
      notificationTitle,
      notificationBody
    );

    if (notificationId) {
      Alert.alert('Success', 'Instant notification sent!');
    } else {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleCancelAllNotifications = async () => {
    await cancelAllNotifications();
    Alert.alert('Success', 'All notifications cancelled');
  };

  const handleSetBadgeCount = async () => {
    const count = parseInt(badgeCount, 10);
    if (isNaN(count)) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    const success = await setBadgeCount(count);
    if (success) {
      Alert.alert('Success', `Badge count set to ${count}`);
    } else {
      Alert.alert('Error', 'Failed to set badge count');
    }
  };

  const copyTokenToClipboard = () => {
    if (expoPushToken) {
      // You can implement clipboard copy here
      Alert.alert('Push Token', expoPushToken);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Notification Demo</Text>
        
        {/* Permission Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Permission Status:</Text>
          <Text style={[
            styles.statusValue,
            { color: permissionGranted ? '#4CAF50' : '#F44336' }
          ]}>
            {permissionGranted ? 'Granted' : 'Not Granted'}
          </Text>
        </View>

        {/* Push Token */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Push Token:</Text>
          <TouchableOpacity onPress={copyTokenToClipboard}>
            <Text style={styles.tokenText} numberOfLines={1}>
              {expoPushToken ? expoPushToken : 'Not available'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Latest Notification */}
        {notification && (
          <View style={styles.notificationContainer}>
            <Text style={styles.sectionTitle}>Latest Notification:</Text>
            <Text style={styles.notificationText}>
              Title: {notification.request.content.title}
            </Text>
            <Text style={styles.notificationText}>
              Body: {notification.request.content.body}
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: permissionGranted ? '#4CAF50' : '#2196F3' }]}
          onPress={handleRequestPermissions}
        >
          <Text style={styles.buttonText}>
            {permissionGranted ? 'Permissions Granted' : 'Request Permissions'}
          </Text>
        </TouchableOpacity>

        <Input
          label="Notification Title"
          value={notificationTitle}
          onChangeText={setNotificationTitle}
          placeholder="Enter notification title"
          variant="outlined"
        />

        <Input
          label="Notification Body"
          value={notificationBody}
          onChangeText={setNotificationBody}
          placeholder="Enter notification body"
          multiline
          numberOfLines={3}
          variant="outlined"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleScheduleInstantNotification}
        >
          <Text style={styles.buttonText}>Send Instant Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleScheduleNotification}
        >
          <Text style={styles.buttonText}>Schedule Notification (5s)</Text>
        </TouchableOpacity>

        <Input
          label="Badge Count"
          value={badgeCount}
          onChangeText={setBadgeCountInput}
          placeholder="Enter badge count"
          keyboardType="numeric"
          variant="outlined"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSetBadgeCount}
        >
          <Text style={styles.buttonText}>Set Badge Count</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleCancelAllNotifications}
        >
          <Text style={styles.buttonText}>Cancel All Notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenText: {
    fontSize: 12,
    color: '#2196F3',
    maxWidth: 200,
  },
  notificationContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },

  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 