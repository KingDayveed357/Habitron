// services/notificationService.ts - FIXED VERSION
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export interface HabitReminder {
  id: string;
  habit_id: string;
  user_id: string;
  enabled: boolean;
  time: string;
  days: string[];
  notification_id?: string;
  created_at: string;
  updated_at: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any;
  private responseListener: any;

  private constructor() {
    this.setupNotificationListeners();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupNotificationListeners() {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      const habitId = response.notification.request.content.data.habitId;
    });
  }

cleanup() {
  if (this.notificationListener) {
    this.notificationListener.remove();
  }
  if (this.responseListener) {
    this.responseListener.remove();
  }
}


  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('⚠️ Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Failed to get push notification permissions');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    console.log('✅ Notification permissions granted');
    return true;
  }

  async checkPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  async scheduleHabitReminder(
    habitId: string,
    habitTitle: string,
    time: string,
    days: string[],
  ): Promise<string[]> {
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    // CRITICAL FIX: Cancel existing notifications first
    await this.cancelHabitReminders(habitId);

    const notificationIds: string[] = [];
    const [hours, minutes] = time.split(':').map(Number);

    // Validate time
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time format: ${time}`);
    }

    const dayMap: { [key: string]: number } = {
      'SU': 1, 'M': 2, 'TU': 3, 'W': 4, 'TH': 5, 'F': 6, 'SA': 7,
    };

    console.log(`📅 Scheduling reminders for "${habitTitle}" at ${hours}:${minutes.toString().padStart(2, '0')} on days:`, days);

    for (const day of days) {
      const weekday = dayMap[day];
      if (!weekday) {
        console.warn(`⚠️ Invalid day: ${day}`);
        continue;
      }

      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⭐ Time for your habit!',
            body: habitTitle,
            data: { 
              habitId, 
              type: 'habit_reminder',
              day: day 
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            hour: hours,
            minute: minutes,
            weekday,
            repeats: true,
          },
        });

        notificationIds.push(notificationId);
        console.log(`✅ Scheduled for ${day} (weekday ${weekday}): ${notificationId}`);
      } catch (error) {
        console.error(`❌ Failed to schedule for ${day}:`, error);
      }
    }

    console.log(`📋 Total scheduled: ${notificationIds.length} notifications`);
    return notificationIds;
  }

  async cancelHabitReminders(habitId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const habitNotifications = scheduledNotifications.filter(
        (notif) => notif.content.data?.habitId === habitId
      );

      console.log(`🗑️ Canceling ${habitNotifications.length} reminders for habit ${habitId}`);

      for (const notif of habitNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }

      console.log('✅ Reminders canceled successfully');
    } catch (error) {
      console.error('❌ Error canceling habit reminders:', error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ All reminders canceled');
  }

  // CRITICAL FIX: Simplified createReminder with proper upsert
  async createReminder(
    habitId: string,
    userId: string,
    time: string,
    days: string[],
    habitTitle: string
  ): Promise<HabitReminder> {
    try {
      console.log('📝 Creating reminder for habit:', habitId);
      
      // Schedule notifications first
      const notificationIds = await this.scheduleHabitReminder(
        habitId,
        habitTitle,
        time,
        days
      );

      if (notificationIds.length === 0) {
        throw new Error('Failed to schedule any notifications');
      }

      // Check if reminder already exists
      const { data: existingReminder } = await supabase
        .from('habit_reminders')
        .select('*')
        .eq('habit_id', habitId)
        .single();

      let data;
      let error;

      if (existingReminder) {
        // Update existing reminder
        const updateResult = await supabase
          .from('habit_reminders')
          .update({
            enabled: true,
            time,
            days,
            notification_id: notificationIds.join(','),
            updated_at: new Date().toISOString(),
          })
          .eq('habit_id', habitId)
          .select()
          .single();
        
        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Insert new reminder
        const insertResult = await supabase
          .from('habit_reminders')
          .insert({
            habit_id: habitId,
            user_id: userId,
            enabled: true,
            time,
            days,
            notification_id: notificationIds.join(','),
          })
          .select()
          .single();
        
        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) throw error;
      
      console.log('✅ Reminder saved to database:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating reminder:', error);
      // Cleanup scheduled notifications on error
      await this.cancelHabitReminders(habitId);
      throw error;
    }
  }

  async updateReminder(
    reminderId: string,
    habitId: string,
    time: string,
    days: string[],
    habitTitle: string,
    enabled: boolean
  ): Promise<void> {
    try {
      console.log(`📝 Updating reminder ${reminderId}, enabled: ${enabled}`);

      if (enabled) {
        const notificationIds = await this.scheduleHabitReminder(
          habitId,
          habitTitle,
          time,
          days
        );

        const { error } = await supabase
          .from('habit_reminders')
          .update({
            time,
            days,
            enabled,
            notification_id: notificationIds.join(','),
            updated_at: new Date().toISOString(),
          })
          .eq('id', reminderId);

        if (error) throw error;
      } else {
        await this.cancelHabitReminders(habitId);

        const { error } = await supabase
          .from('habit_reminders')
          .update({
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reminderId);

        if (error) throw error;
      }

      console.log('✅ Reminder updated successfully');
    } catch (error) {
      console.error('❌ Error updating reminder:', error);
      throw error;
    }
  }

  async deleteReminder(reminderId: string, habitId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting reminder ${reminderId}`);
      
      await this.cancelHabitReminders(habitId);

      const { error } = await supabase
        .from('habit_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
      
      console.log('✅ Reminder deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting reminder:', error);
      throw error;
    }
  }

  async getHabitReminders(habitId: string): Promise<HabitReminder[]> {
    try {
      const { data, error } = await supabase
        .from('habit_reminders')
        .select('*')
        .eq('habit_id', habitId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`📋 Found ${data?.length || 0} reminders for habit ${habitId}`);
      return data || [];
    } catch (error) {
      console.error('❌ Error getting reminders:', error);
      return [];
    }
  }

  async getUserReminders(userId: string): Promise<HabitReminder[]> {
    try {
      const { data, error } = await supabase
        .from('habit_reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting user reminders:', error);
      return [];
    }
  }

  async sendTestNotification(title: string, body: string): Promise<void> {
    console.log('🧪 Sending test notification...');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: null,
    });

    console.log('✅ Test notification sent');
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Total scheduled notifications: ${notifications.length}`);
    return notifications;
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

export default NotificationService.getInstance();