// hooks/useNotifications.ts - Initialize notifications on app start
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus, Platform } from 'react-native';
import NotificationService from '@/services/notificationService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (!user) return;

    // Initialize notification listeners
    initializeNotifications();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      cleanupNotifications();
    };
  }, [user]);

  const initializeNotifications = async () => {
    console.log('🔔 Initializing notifications...');

    // Request permissions if not already granted
    const hasPermission = await NotificationService.checkPermissions();
    if (!hasPermission) {
      console.log('📱 Notification permissions not granted');
      return;
    }

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Check for scheduled notifications
    const scheduled = await NotificationService.getAllScheduledNotifications();
    console.log(`📅 Found ${scheduled.length} scheduled notifications`);

    // Clear badge on app open
    await NotificationService.clearBadge();
  };

  const cleanupNotifications = () => {
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }
  };

  const handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('📬 Notification received:', notification.request.content.title);
    
    const habitId = notification.request.content.data?.habitId;
    if (habitId) {
      console.log(`📝 Reminder for habit: ${habitId}`);
      // You can add custom logic here, like updating UI
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('👆 User tapped notification');
    
    const habitId = response.notification.request.content.data?.habitId;
    if (habitId) {
      console.log(`🎯 Opening habit: ${habitId}`);
      // Navigate to habit detail screen
      // Example: router.push(`/habit/${habitId}`);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('🔄 App came to foreground');
      
      // Clear badge when app opens
      await NotificationService.clearBadge();
      
      // Optionally reload reminders
      if (user) {
        const reminders = await NotificationService.getUserReminders(user.id);
        console.log(`📋 User has ${reminders.length} active reminders`);
      }
    }

    appState.current = nextAppState;
  };

  return {
    requestPermissions: NotificationService.requestPermissions.bind(NotificationService),
    checkPermissions: NotificationService.checkPermissions.bind(NotificationService),
    sendTestNotification: NotificationService.sendTestNotification.bind(NotificationService),
  };
};