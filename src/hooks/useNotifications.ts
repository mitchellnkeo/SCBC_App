import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/notificationService';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const notificationService = NotificationService.getInstance();

  const registerForPushNotifications = useCallback(async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      setExpoPushToken(token);
      
      const hasPermission = await notificationService.areNotificationsEnabled();
      setPermissionGranted(hasPermission);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }, [notificationService]);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Set up notification listeners
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        // Handle notification tap
        console.log('Notification tapped:', response);
        // You can navigate to specific screens based on notification data here
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [registerForPushNotifications, notificationService]);

  const requestPermissions = async () => {
    try {
      const granted = await notificationService.requestPermissions();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    try {
      return await notificationService.scheduleLocalNotification(title, body, trigger);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await notificationService.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      return await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
      return false;
    }
  };

  return {
    expoPushToken,
    notification,
    permissionGranted,
    requestPermissions,
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    registerForPushNotifications,
  };
}; 