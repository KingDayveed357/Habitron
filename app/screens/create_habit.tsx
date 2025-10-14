// app/screens/create_habit.tsx
import { useState, useEffect } from 'react';
import { Stack } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CheckIcon } from 'lucide-react-native';
import { CreateHabitRequest, HABIT_FREQUENCIES, HABIT_COLORS } from '@/types/habit';
import { useHabits } from '@/hooks/usehabits';
import { useAuth } from '@/hooks/useAuth';
import { useAICoach } from '@/hooks/useAICoach';

// Icon collections
const BASIC_ICONS = ['💧', '📚', '🏃', '🧘', '🍎', '💪', '🌱', '🎯', '✍️', '🎨'];

const ALL_EMOJIS = [
  // Face emojis
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  
  // Activity & Sports
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🤿',
  '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂',
  
  // Health & Fitness
  '🏃‍♂️', '🏃‍♀️', '🚶‍♂️', '🚶‍♀️', '🧘‍♂️', '🧘‍♀️', '🏋️‍♂️', '🏋️‍♀️', '💪', '🦵',
  
  // Food & Drink
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍅', '🥥',
  '🥑', '🍆', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅',
  '🥛', '🍵', '☕', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷',
  
  // Study & Learning
  '📚', '📖', '📝', '✏️', '✒️', '🖊️', '🖋️', '🖍️', '📄', '📃',
  '📑', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏',
  '📐', '✂️', '🗃️', '🗄️', '🗂️', '📂', '📁', '📰', '🔍', '🔎',
  
  // Technology
  '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀', '☎️', '📞',
  '📱', '📲', '📧', '📨', '📩', '📤', '📥', '📮', '🗳️',
  
  // Music & Art
  '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻',
  '🎨', '🖌️', '🖍️', '🎭', '🩰', '🎪', '🎬', '🎤', '🎧', '🎮',
  
  // Time & Calendar
  '⏰', '⏲️', '⏱️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
  '📅', '📆', '🗓️', '📋', '📌', '📍', '🔔', '🔕', '📢', '📣',
  
  // Weather & Nature
  '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
  '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌊', '💧', '💦', '☔',
  
  // Transport
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚚', '🚛', '🚜', '🚲', '🛴', '🛵', '🏍️', '✈️', '🛩️', '🚁',
  
  // Hearts & Symbols
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  
  // Stars & Celebration
  '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂',
  '🍰', '🧁', '🥳', '🎆', '🎇', '🌠', '💥', '💢', '💯', '🔥'
];

const FUNCTIONAL_ICONS = [
  // Productivity & Work
  '📊', '📈', '📉', '💼', '💻', '📋', '✅', '📝', '🗓️', '⏰',
  '📌', '📎', '🗂️', '📁', '💾', '🖨️', '📧', '📞', '📱', '💡',
  
  // Health & Fitness
  '🏥', '💊', '🩺', '🌡️', '💉', '🦷', '👁️', '🫀', '🫁', '🧠',
  '💪', '🏃', '🚴', '🏊', '🤸', '🧘', '🛌', '🥗', '🥛', '💧',
  
  // Education & Learning
  '🎓', '📚', '📖', '✏️', '📐', '🧮', '🔬', '🔭', '🗺️', '🌍',
  '🎨', '🖌️', '🎭', '🎪', '🎬', '📹', '📷', '🎤', '🎧', '🎵',
  
  // Home & Living
  '🏠', '🏡', '🛏️', '🛋️', '🪑', '🚿', '🛁', '🧹', '🧽', '🗑️',
  '🔑', '🚪', '🪟', '💡', '🔌', '📺', '📻', '☎️', '🕯️', '🧯',
  
  // Food & Cooking
  '🍳', '🥘', '🍲', '🥗', '🍝', '🍜', '🥙', '🌮', '🌯', '🥪',
  '🔪', '🥄', '🍴', '🥢', '🧂', '📦', '🥫', '🍯', '🧈', '🥛'
];

const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Learning',
  'Mindfulness',
  'Productivity',
  'Social',
  'Creative',
  'Personal Care',
  'General'
];

const weekLabels = ['SU', 'M', 'TU', 'W', 'TH', 'F', 'SA'];

const CreateHabitScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { createHabit } = useHabits();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateHabitRequest>({
    title: '',
    icon: '⭐',
    description: '',
    category: 'General',
    target_count: 1,
    target_unit: 'times',
    frequency_type: 'daily',
    frequency_count: null,
    frequency_days: null,
    bg_color: 'bg-blue-500'
  });

  // Additional states
  const [errors, setErrors] = useState<Partial<CreateHabitRequest>>({});
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);
  const [iconModalTab, setIconModalTab] = useState<'Emoji' | 'Icon'>('Emoji');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categories, setCategories] = useState(HABIT_CATEGORIES);
  
  // Frequency settings state
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [weeklyCount, setWeeklyCount] = useState(1);
  const [monthlyDays, setMonthlyDays] = useState<number[]>([]);
  const [allDaysSelected, setAllDaysSelected] = useState(false);
  
  // Reminder settings
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  
  // AI coaching features
  const [aiFeatures, setAiFeatures] = useState({
    smartReminder: true,
    motivationalMessages: true,
    weeklyOptimization: true
  });

  const { suggestions, generateSuggestions, loadingSuggestions } = useAICoach();

  useEffect(() => {
    if (suggestions.length === 0) {
      generateSuggestions();
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateHabitRequest> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Habit name is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Habit name must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Habit name must be less than 100 characters';
    }

    if (formData.target_count < 1) {
      newErrors.target_count = 'Target must be at least 1' as any;
    } else if (formData.target_count > 100) {
      newErrors.target_count = 'Target cannot exceed 100' as any;
    }

    if (!formData.target_unit.trim()) {
      newErrors.target_unit = 'Unit is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate frequency settings
    if (formData.frequency_type === 'daily' && selectedDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day for daily frequency');
      return false;
    }

    if (formData.frequency_type === 'weekly' && weeklyCount < 1) {
      Alert.alert('Validation Error', 'Please select how many times per week');
      return false;
    }

    if (formData.frequency_type === 'monthly' && monthlyDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day for monthly frequency');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create habits');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare frequency data based on frequency type
      let frequencyData: Partial<CreateHabitRequest> = {
        frequency_type: formData.frequency_type,
        frequency_count: null,
        frequency_days: null
      };

      if (formData.frequency_type === 'daily') {
        // For daily, store selected days as JSON array
        frequencyData.frequency_days = selectedDays.length > 0 ? selectedDays : null;
      } else if (formData.frequency_type === 'weekly') {
        // For weekly, store count
        frequencyData.frequency_count = weeklyCount;
      } else if (formData.frequency_type === 'monthly') {
        // For monthly, store days as JSON array of numbers
        frequencyData.frequency_days = monthlyDays.length > 0 ? monthlyDays.sort((a, b) => a - b) : null;
      }

      const habitData: CreateHabitRequest = {
        ...formData,
        ...frequencyData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        target_unit: formData.target_unit.trim()
      };

      await createHabit(habitData);
      
      Alert.alert(
        'Success!', 
        'Your new habit has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert(
        'Error', 
        'Failed to create habit. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title.trim() || formData.description?.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleIconSelect = (icon: string) => {
    setFormData({ ...formData, icon });
    setIsIconModalVisible(false);
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const toggleDailyDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newDays);
    setAllDaysSelected(newDays.length === 7);
  };

  const toggleAllDays = () => {
    if (allDaysSelected) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...weekLabels]);
    }
    setAllDaysSelected(!allDaysSelected);
  };

  const toggleMonthlyDay = (day: number) => {
    const newDays = monthlyDays.includes(day)
      ? monthlyDays.filter(d => d !== day)
      : [...monthlyDays, day];
    
    setMonthlyDays(newDays);
  };

  const addCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      const newCategories = [...categories, customCategory.trim()];
      setCategories(newCategories);
      setFormData({ ...formData, category: customCategory.trim() });
      setCustomCategory('');
      setIsAddingCategory(false);
    }
  };

  const getFrequencyDescription = () => {
    if (formData.frequency_type === 'daily') {
      if (selectedDays.length === 0) return 'Select days';
      if (selectedDays.length === 7) return 'Every day';
      return `${selectedDays.length} days/week`;
    } else if (formData.frequency_type === 'weekly') {
      return `${weeklyCount}x per week`;
    } else if (formData.frequency_type === 'monthly') {
      if (monthlyDays.length === 0) return 'Select days';
      return `${monthlyDays.length} days/month`;
    }
    return 'Not set';
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Sign In Required
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
            You need to be signed in to create habits.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signin')}
            className="bg-indigo-500 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity 
          onPress={handleCancel}
          disabled={loading}
          className="p-2"
        >
          <Text className="text-gray-600 dark:text-gray-400 font-medium">Cancel</Text>
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">
          Create New Habit
        </Text>
        
        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading || !formData.title.trim()}
          className={`px-4 py-2 rounded-lg ${
            loading || !formData.title.trim()
              ? 'bg-gray-300 dark:bg-gray-600' 
              : 'bg-indigo-500'
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className={`font-semibold ${
              loading || !formData.title.trim()
                ? 'text-gray-500' 
                : 'text-white'
            }`}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-4 mx-4 mt-4 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">🤖</Text>
                <Text className="text-lg font-semibold text-gray-800 dark:text-white">AI Suggestions</Text>
              </View>
              {loadingSuggestions && <ActivityIndicator size="small" color="#6366F1" />}
            </View>
            <Text className="text-gray-600 dark:text-gray-400 mb-4">
              Based on your goals and current habits, here are some recommendations:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => {
                const title = typeof suggestion === 'string' ? suggestion : suggestion.title;
                return (
                  <TouchableOpacity 
                    key={index}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2"
                    onPress={() => {
                      if (typeof suggestion === 'string') {
                        setFormData({ ...formData, title: suggestion });
                      } else {
                        setFormData({
                          ...formData,
                          title: suggestion.title,
                          icon: suggestion.icon,
                          category: suggestion.category,
                          description: suggestion.description,
                          target_count: suggestion.targetCount,
                          target_unit: suggestion.targetUnit
                        });
                      }
                    }}
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-300">{title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {loadingSuggestions && suggestions.length === 0 && (
          <View className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-4 mx-4 mt-4 mb-6">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#6366F1" className="mr-2" />
              <Text className="text-gray-600 dark:text-gray-400">Loading personalized suggestions...</Text>
            </View>
          </View>
        )}

        <View className="px-4 mt-4">
          {/* Habit Name */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              What habit would you like to build?
            </Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Drink 8 glasses of water"
              placeholderTextColor="#9CA3AF"
              className={`border rounded-xl p-4 text-gray-800 dark:text-white dark:bg-gray-800 ${
                errors.title 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-gray-100'
              }`}
              maxLength={100}
              editable={!loading}
              multiline
            />
            {errors.title && (
              <Text className="text-red-500 text-sm mt-1">{errors.title}</Text>
            )}
          </View>

          {/* Choose Icon */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white">Choose an Icon</Text>
              <TouchableOpacity 
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full"
                onPress={() => setIsIconModalVisible(true)}
              >
                <Text className="text-sm text-blue-600 dark:text-blue-300">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {BASIC_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-12 h-12 rounded-xl justify-center items-center border ${
                    formData.icon === icon 
                      ? 'bg-indigo-100 dark:bg-indigo-500 border-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200'
                  }`}
                  onPress={() => setFormData({ ...formData, icon })}
                >
                  <Text className="text-xl">{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Category</Text>
            <View className="flex-row flex-wrap gap-3">
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-4 py-3 rounded-xl border ${
                    formData.category === category 
                      ? 'bg-indigo-500 border-indigo-500' 
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                  }`}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text className={`text-sm font-medium ${
                    formData.category === category 
                      ? 'text-white' 
                      : 'text-gray-800 dark:text-white'
                  }`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
              {isAddingCategory ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="New category"
                    className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 text-gray-800 dark:text-white"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={addCustomCategory}
                    className="bg-green-500 px-3 py-3 rounded-xl"
                  >
                    <Text className="text-white font-medium">Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsAddingCategory(false)}
                    className="bg-gray-300 px-3 py-3 rounded-xl"
                  >
                    <Text className="text-gray-700">Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="px-4 py-3 rounded-xl border border-dashed border-gray-400"
                  onPress={() => setIsAddingCategory(true)}
                >
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">+ Add Category</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Color Theme */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Choose Color</Text>
            <View className="flex-row flex-wrap gap-3">
              {HABIT_COLORS.map((color, index) => {
                const colorMap: Record<string, string> = {
                  'bg-blue-500': '#3B82F6',
                  'bg-green-500': '#10B981',
                  'bg-purple-500': '#8B5CF6',
                  'bg-amber-500': '#F59E0B',
                  'bg-red-500': '#EF4444',
                  'bg-pink-500': '#EC4899',
                  'bg-indigo-500': '#6366F1',
                  'bg-teal-500': '#14B8A6',
                  'bg-orange-500': '#F97316',
                  'bg-cyan-500': '#06B6D4'
                };
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={{ backgroundColor: colorMap[color] }}
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.bg_color === color ? 'border-black dark:border-white' : 'border-transparent'
                    }`}
                    onPress={() => setFormData({ ...formData, bg_color: color })}
                  />
                );
              })}
            </View>
          </View>

          {/* Target & Unit */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Goal Settings</Text>
            
            <View className="flex-row space-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  Target {errors.target_count && <Text className="text-red-500">*</Text>}
                </Text>
                <TextInput
                  value={formData.target_count.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setFormData({ ...formData, target_count: Math.max(1, Math.min(100, num)) });
                  }}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`border rounded-xl p-4 text-gray-800 dark:text-white dark:bg-gray-800 ${
                    errors.target_count 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100'
                  }`}
                  editable={!loading}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  Unit {errors.target_unit && <Text className="text-red-500">*</Text>}
                </Text>
                <TextInput
                  value={formData.target_unit}
                  onChangeText={(text) => setFormData({ ...formData, target_unit: text })}
                  placeholder="times, glasses, etc."
                  placeholderTextColor="#9CA3AF"
                  className={`border rounded-xl p-4 text-gray-800 dark:text-white dark:bg-gray-800 ${
                    errors.target_unit 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100'
                  }`}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Frequency */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Frequency</Text>
            <View className="flex-row flex-wrap gap-3">
              {HABIT_FREQUENCIES.map((frequency, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-6 py-3 rounded-xl border ${
                    formData.frequency_type === frequency.value
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                  }`}
                  onPress={() => {
                    setFormData({ ...formData, frequency_type: frequency.value });
                    // Reset frequency settings when changing type
                    setSelectedDays([]);
                    setWeeklyCount(1);
                    setMonthlyDays([]);
                    setAllDaysSelected(false);
                  }}
                >
                  <Text className={`text-sm font-medium ${
                    formData.frequency_type === frequency.value 
                      ? 'text-white' 
                      : 'text-gray-800 dark:text-white'
                  }`}>
                    {frequency.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Daily Frequency Settings */}
          {formData.frequency_type === 'daily' && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-800 dark:text-white">On these days</Text>
                <TouchableOpacity onPress={toggleAllDays} className="flex-row items-center gap-2">
                  <Text className="text-gray-600 dark:text-gray-400">All days</Text>
                  <View className={`w-5 h-5 border rounded items-center justify-center ${
                    allDaysSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-400'
                  }`}>
                    {allDaysSelected && <CheckIcon size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-3">
                {weekLabels.map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`w-12 h-12 items-center justify-center rounded-full border ${
                      selectedDays.includes(day)
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                    }`}
                    onPress={() => toggleDailyDay(day)}
                  >
                    <Text className={`text-sm ${
                      selectedDays.includes(day)
                        ? 'text-white'
                        : 'text-gray-800 dark:text-white'
                    }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Weekly Frequency Settings */}
          {formData.frequency_type === 'weekly' && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">How many times per week?</Text>
              <View className="flex-row flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                  <TouchableOpacity
                    key={count}
                    className={`w-12 h-12 items-center justify-center rounded-full border ${
                      weeklyCount === count
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                    }`}
                    onPress={() => setWeeklyCount(count)}
                  >
                    <Text className={`text-sm ${
                      weeklyCount === count
                        ? 'text-white'
                        : 'text-gray-800 dark:text-white'
                    }`}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Monthly Frequency Settings */}
          {formData.frequency_type === 'monthly' && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Select Days in the Month</Text>
              <View className="flex-row flex-wrap gap-3">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`w-12 h-12 items-center justify-center rounded-full border ${
                      monthlyDays.includes(day)
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                    }`}
                    onPress={() => toggleMonthlyDay(day)}
                  >
                    <Text className={`text-sm ${
                      monthlyDays.includes(day)
                        ? 'text-white'
                        : 'text-gray-800 dark:text-white'
                    }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {monthlyDays.length > 0 && (
                <Text className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Every Month on {monthlyDays.sort((a, b) => a - b).join(', ')}
                </Text>
              )}
            </View>
          )}

          {/* Reminder Time */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Reminder Time</Text>
            <TouchableOpacity 
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex-row items-center"
              onPress={() => setShowTimePicker(true)}
            >
              <Text className="text-2xl mr-3">🕘</Text>
              <Text className="text-gray-800 dark:text-white">{formatTime(reminderTime)}</Text>
              <View className="ml-auto">
                <Text className="text-2xl text-gray-400">⏰</Text>
              </View>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={Platform.OS === 'ios' ? { height: 120, marginTop: -10 } : {}}
                textColor="#000000"
                themeVariant="light"
              />
            )}
          </View>

          {/* Preview */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Preview</Text>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className={`w-12 h-12 ${formData.bg_color} rounded-xl items-center justify-center mr-3`}>
                  <Text className="text-2xl">{formData.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800 dark:text-white">
                    {formData.title || 'Your habit name'}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.target_count} {formData.target_unit} • {getFrequencyDescription()}
                  </Text>
                  {formData.description && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* AI Coaching Features */}
          <View className="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Coaching Features</Text>
              <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-green-700 dark:text-green-300">Recommended</Text>
              </View>
            </View>
            
            <View className="space-y-3">
              <TouchableOpacity 
                className="flex-row items-center mb-3"
                onPress={() => setAiFeatures({...aiFeatures, smartReminder: !aiFeatures.smartReminder})}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  aiFeatures.smartReminder ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                }`}>
                  {aiFeatures.smartReminder && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
                <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  Smart reminder timing based on my schedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center mb-3"
                onPress={() => setAiFeatures({...aiFeatures, motivationalMessages: !aiFeatures.motivationalMessages})}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  aiFeatures.motivationalMessages ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                }`}>
                  {aiFeatures.motivationalMessages && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
                <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  Motivational coaching messages
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => setAiFeatures({...aiFeatures, weeklyOptimization: !aiFeatures.weeklyOptimization})}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  aiFeatures.weeklyOptimization ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                }`}>
                  {aiFeatures.weeklyOptimization && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
                <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  Weekly habit optimization suggestions
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Description (Optional)
            </Text>
            <TextInput
              value={formData.description || ''}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Why is this habit important to you?"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 h-20 text-gray-800 dark:text-white"
              multiline
              textAlignVertical="top"
              maxLength={500}
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Icon/Emoji Selection Modal */}
      <Modal
        visible={isIconModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsIconModalVisible(false)}
      >
        <View className="flex-1 bg-white dark:bg-gray-900">
          <View className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">Choose Icon</Text>
              <TouchableOpacity onPress={() => setIsIconModalVisible(false)}>
                <Text className="text-lg text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${
                  iconModalTab === 'Emoji' 
                    ? 'bg-indigo-500' 
                    : 'bg-transparent'
                }`}
                onPress={() => setIconModalTab('Emoji')}
              >
                <Text className={`text-center font-medium ${
                  iconModalTab === 'Emoji' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  Emoji
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${
                  iconModalTab === 'Icon' 
                    ? 'bg-indigo-500' 
                    : 'bg-transparent'
                }`}
                onPress={() => setIconModalTab('Icon')}
              >
                <Text className={`text-center font-medium ${
                  iconModalTab === 'Icon' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  Icon
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}>
            <View className="flex-row flex-wrap justify-between">
              {(iconModalTab === 'Emoji' ? ALL_EMOJIS : FUNCTIONAL_ICONS).map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-12 h-12 rounded-xl justify-center items-center border mb-3 ${
                    formData.icon === icon 
                      ? 'bg-indigo-100 dark:bg-indigo-500 border-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                  onPress={() => handleIconSelect(icon)}
                >
                  <Text className="text-xl">{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity 
              className="bg-indigo-500 rounded-xl py-3"
              onPress={() => setIsIconModalVisible(false)}
            >
              <Text className="text-center text-base font-medium text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateHabitScreen;