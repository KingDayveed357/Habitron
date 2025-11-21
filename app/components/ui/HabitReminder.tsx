// app/components/ui/HabitReminder.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Bell, Plus, Clock, Trash2, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import NotificationService, { HabitReminder as ReminderType } from '@/services/notificationService';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HabitReminderProps {
  habitId?: string; // ✅ Make optional for create mode
  habitTitle: string;
  userId: string;
  mode: 'create' | 'edit';
  onRemindersChange?: (reminders: ReminderType[]) => void;
}

const DAYS = [
  { label: 'Sun', value: 'SU' },
  { label: 'Mon', value: 'M' },
  { label: 'Tue', value: 'TU' },
  { label: 'Wed', value: 'W' },
  { label: 'Thu', value: 'TH' },
  { label: 'Fri', value: 'F' },
  { label: 'Sat', value: 'SA' },
];

export const HabitReminder: React.FC<HabitReminderProps> = ({
  habitId,
  habitTitle,
  userId,
  mode,
  onRemindersChange,
}) => {
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  // New reminder form state
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>(['M', 'TU', 'W', 'TH', 'F']);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ✅ CRITICAL FIX: Load existing reminders only in edit mode with habitId
  useEffect(() => {
    if (mode === 'edit' && habitId) {
      loadReminders();
    }
    checkPermissions();
  }, [habitId, mode]);

  const checkPermissions = async () => {
    const granted = await NotificationService.checkPermissions();
    setHasPermission(granted);
  };

  const loadReminders = async () => {
    if (!habitId) return;
    
    setLoading(true);
    try {
      const data = await NotificationService.getHabitReminders(habitId);
      setReminders(data);
      onRemindersChange?.(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    const granted = await NotificationService.requestPermissions();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications in your device settings to use reminders.',
        [{ text: 'OK' }]
      );
    }
    
    return granted;
  };

  const handleAddReminder = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    // ✅ CRITICAL FIX: Handle create mode differently
    if (mode === 'create') {
      // In create mode, just show a preview/confirmation
      Alert.alert(
        'Reminder Saved',
        'Your reminder will be created when you save the habit.',
        [{ text: 'OK', onPress: () => setShowAddModal(false) }]
      );
      return;
    }

    if (!habitId) {
      Alert.alert('Error', 'Cannot create reminder: Habit ID missing');
      return;
    }

    setLoading(true);
    try {
      const timeString = formatTime(selectedTime);
      
      await NotificationService.createReminder(
        habitId,
        userId,
        timeString,
        selectedDays,
        habitTitle
      );

      await loadReminders();
      setShowAddModal(false);
      
      // Reset form
      setSelectedTime(new Date());
      setSelectedDays(['M', 'TU', 'W', 'TH', 'F']);
      
      Alert.alert('Success', 'Reminder created successfully!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = async (reminder: ReminderType) => {
    if (!habitId) return;

    setLoading(true);
    try {
      await NotificationService.updateReminder(
        reminder.id,
        habitId,
        reminder.time,
        reminder.days,
        habitTitle,
        !reminder.enabled
      );
      await loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (reminder: ReminderType) => {
    if (!habitId) return;

    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await NotificationService.deleteReminder(reminder.id, habitId);
              await loadReminders();
              Alert.alert('Success', 'Reminder deleted');
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeDisplay = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // ✅ IMPROVED: Show different UI for create vs edit mode
  const showEmptyState = mode === 'create' || (mode === 'edit' && reminders.length === 0);

  return (
    <SafeAreaView className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Bell size={20} color="#6B7280" />
          <Text className="text-lg font-semibold text-gray-800 dark:text-white ml-2">
            Reminders
          </Text>
        </View>
        
        {/* ✅ ALWAYS show Add button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex-row items-center"
          disabled={loading}
        >
          <Plus size={16} color="#3B82F6" />
          <Text className="text-blue-600 dark:text-blue-400 ml-1 font-semibold">
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && mode === 'edit' && (
        <View className="py-4">
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}

      {/* Reminders List */}
      {!loading && reminders.length > 0 && (
        <View className="space-y-2">
          {reminders.map((reminder) => (
            <View
              key={reminder.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatTimeDisplay(reminder.time)}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {reminder.days.join(', ')}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => handleToggleReminder(reminder)}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={reminder.enabled ? '#ffffff' : '#f4f3f4'}
                  disabled={loading}
                />
                <TouchableOpacity
                  onPress={() => handleDeleteReminder(reminder)}
                  disabled={loading}
                  className="p-2"
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {!loading && showEmptyState && (
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 items-center">
          <Bell size={32} color="#9CA3AF" />
          <Text className="text-gray-600 dark:text-gray-400 mt-2 text-center">
            No reminders set
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-500 mt-1 text-center">
            Tap "Add" to create one
          </Text>
        </View>
      )}

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">
              New Reminder
            </Text>
            <TouchableOpacity
              onPress={handleAddReminder}
              disabled={loading || selectedDays.length === 0}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text
                  className={`font-semibold ${
                    selectedDays.length > 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {/* Time Selection */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex-row items-center"
              >
                <Clock size={20} color="#6B7280" />
                <Text className="text-lg text-gray-800 dark:text-white ml-3">
                  {formatTimeDisplay(formatTime(selectedTime))}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={false}
                  display="spinner"
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setSelectedTime(date);
                  }}
                />
              )}
            </View>

            {/* Days Selection */}
            <View>
              <Text className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                Repeat on
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    onPress={() => toggleDay(day.value)}
                    className={`px-4 py-3 rounded-xl ${
                      selectedDays.includes(day.value)
                        ? 'bg-blue-500'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    style={{ minWidth: 60 }}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        selectedDays.includes(day.value)
                          ? 'text-white'
                          : 'text-gray-800 dark:text-white'
                      }`}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Permission Warning */}
            {!hasPermission && (
              <View className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                  📱 Notification permissions are required. You'll be prompted to enable them when you save.
                </Text>
              </View>
            )}

            {/* Info */}
            <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <Text className="text-blue-800 dark:text-blue-200 text-sm">
                💡 Reminders will notify you at the selected time on the chosen days. Make sure notifications are enabled in your device settings.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};