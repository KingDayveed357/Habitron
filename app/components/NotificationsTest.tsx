// app/components/NotificationTest.tsx
// Add this to your account screen or create a debug screen
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationService from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/hooks/useAuth';

export const NotificationTestScreen = () => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const checkPermissions = async () => {
    const hasPermission = await NotificationService.checkPermissions();
    setPermissionStatus(hasPermission ? 'granted' : 'denied');
    Alert.alert('Permissions', `Status: ${hasPermission ? 'Granted ✅' : 'Denied ❌'}`);
  };

  const requestPermissions = async () => {
    setLoading(true);
    const granted = await NotificationService.requestPermissions();
    setPermissionStatus(granted ? 'granted' : 'denied');
    setLoading(false);
    Alert.alert(
      'Permissions',
      granted ? 'Permissions granted! ✅' : 'Permissions denied ❌'
    );
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification(
        '🎉 Test Notification',
        'If you see this, notifications are working!'
      );
      Alert.alert('Success', 'Test notification sent! Check your notification tray.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const scheduleTestReminder = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in');
      return;
    }

    try {
      // Schedule for 1 minute from now
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      await NotificationService.createReminder(
        'test-habit-id',
        user.id,
        timeString,
        ['M', 'TU', 'W', 'TH', 'F', 'SA', 'SU'],
        'Test Habit Reminder'
      );

      Alert.alert(
        'Success',
        `Test reminder scheduled for ${timeString}!\nYou should receive a notification in ~1 minute.`
      );
    } catch (error) {
      console.error('Error scheduling test:', error);
      Alert.alert('Error', 'Failed to schedule test reminder');
    }
  };

  const checkScheduledNotifications = async () => {
    try {
      const scheduled = await NotificationService.getAllScheduledNotifications();
      setScheduledCount(scheduled.length);
      
      const details = scheduled.map((notif, index) => {
        const trigger = notif.trigger as any;
        return `${index + 1}. ${notif.content.title}\n   Time: ${trigger.hour}:${trigger.minute}, Day: ${trigger.weekday}`;
      }).join('\n\n');

      Alert.alert(
        'Scheduled Notifications',
        scheduled.length > 0 
          ? `Found ${scheduled.length} scheduled:\n\n${details}`
          : 'No scheduled notifications'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check scheduled notifications');
    }
  };

  const cancelAllNotifications = async () => {
    Alert.alert(
      'Cancel All',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Cancel All',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.cancelAllReminders();
            setScheduledCount(0);
            Alert.alert('Success', 'All notifications cancelled');
          },
        },
      ]
    );
  };

  const getUserReminders = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in');
      return;
    }

    try {
      const reminders = await NotificationService.getUserReminders(user.id);
      Alert.alert(
        'Your Reminders',
        reminders.length > 0
          ? `You have ${reminders.length} active reminder(s):\n\n` +
            reminders.map(r => `• ${r.time} on ${r.days.join(', ')}`).join('\n')
          : 'No active reminders'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get reminders');
    }
  };

  const TestButton: React.FC<{
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
  }> = ({ title, subtitle, onPress, color = 'blue' }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-${color}-500 rounded-xl p-4 mb-3`}
      style={{ backgroundColor: color === 'blue' ? '#3B82F6' : color === 'red' ? '#EF4444' : '#10B981' }}
    >
      <Text className="text-white font-bold text-center text-lg">{title}</Text>
      {subtitle && (
        <Text className="text-white/80 text-center text-sm mt-1">{subtitle}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          🔔 Notification Testing
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-6">
          Use these tools to test the notification system
        </Text>

        {/* Status */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Status
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-gray-800 dark:text-white">Permissions:</Text>
            <Text className={`font-bold ${
              permissionStatus === 'granted' ? 'text-green-600' : 
              permissionStatus === 'denied' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {permissionStatus.toUpperCase()}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-800 dark:text-white">Scheduled:</Text>
            <Text className="font-bold text-blue-600">{scheduledCount} notifications</Text>
          </View>
        </View>

        {/* Permission Tests */}
        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          1️⃣ Permission Tests
        </Text>
        <TestButton
          title="Check Permissions"
          subtitle="View current permission status"
          onPress={checkPermissions}
        />
        <TestButton
          title="Request Permissions"
          subtitle="Ask user for notification access"
          onPress={requestPermissions}
        />

        {/* Basic Notification Tests */}
        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3 mt-6">
          2️⃣ Basic Notification Tests
        </Text>
        <TestButton
          title="Send Test Notification"
          subtitle="Sends immediately"
          onPress={sendTestNotification}
          color="green"
        />
        <TestButton
          title="Schedule Test Reminder"
          subtitle="Scheduled for 1 minute from now"
          onPress={scheduleTestReminder}
          color="green"
        />

        {/* Scheduled Notifications */}
        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3 mt-6">
          3️⃣ Scheduled Notifications
        </Text>
        <TestButton
          title="View Scheduled"
          subtitle="See all scheduled notifications"
          onPress={checkScheduledNotifications}
        />
        <TestButton
          title="View Your Reminders"
          subtitle="From database"
          onPress={getUserReminders}
        />
        <TestButton
          title="Cancel All"
          subtitle="Clear all scheduled notifications"
          onPress={cancelAllNotifications}
          color="red"
        />

        {/* Debug Info */}
        <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mt-6">
          <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
            <Text className="font-bold">💡 Testing Tips:</Text>
            {'\n\n'}
            • Use a physical device (simulators are unreliable)
            {'\n'}
            • Check device notification settings
            {'\n'}
            • Look for emoji prefixes in console logs
            {'\n'}
            • Scheduled notifications appear in system tray
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};