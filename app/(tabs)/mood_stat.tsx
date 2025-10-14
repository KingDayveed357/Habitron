// app/(tabs)/mood_stat.tsx
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { DatabaseService } from '@/services/databaseService';
import { MoodService, WeeklyMoodData, MoodHabitCorrelation, LocalMoodRecord } from '@/services/moodService';
import * as Haptics from "expo-haptics";

interface MoodOption {
  emoji: string;
  label: string;
  value: number;
}

interface Habit {
  id: string
  title: string
  icon: string
  completed: number
  total: number
  streak: number
  isCompleted: boolean
  progress: number
  bg_color?: string
  category?: string
  name?: string
  conflict?: boolean
}

interface habitCorrelations {
  habit: Habit;
}

export default function MoodStat({habit}:habitCorrelations) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [currentMoodEntry, setCurrentMoodEntry] = useState<LocalMoodRecord | null>(null);
  const [weeklyMoods, setWeeklyMoods] = useState<WeeklyMoodData[]>([]);
  const [habitCorrelations, setHabitCorrelations] = useState<MoodHabitCorrelation[]>([]);
  const [moodInsight, setMoodInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [weeklyAverage, setWeeklyAverage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const db = useSQLiteContext();

  const moodServiceRef = useRef<MoodService | null>(null);
  const isInitialLoadRef = useRef(true);

  if (!moodServiceRef.current) {
    const databaseService = new DatabaseService(db);
    moodServiceRef.current = new MoodService(databaseService);
  }

  const moodService = moodServiceRef.current;

  const moodOptions: MoodOption[] = [
    { emoji: '🤩', label: 'Amazing', value: 10 },
    { emoji: '😊', label: 'Great', value: 8 },
    { emoji: '🙂', label: 'Good', value: 6 },
    { emoji: '😐', label: 'Okay', value: 4 },
    { emoji: '😔', label: 'Bad', value: 2 },
    { emoji: '😰', label: 'Terrible', value: 1 },
  ];

  const isLightColor = (bgClass: string): boolean => {
    if (!bgClass) return true
    
    const lightColors = [
      'bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300',
      'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400',
      'bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400',
      'bg-green-100', 'bg-green-200', 'bg-green-300',
      'bg-blue-100', 'bg-blue-200', 'bg-blue-300',
      'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-400',
      'bg-pink-100', 'bg-pink-200', 'bg-pink-300',
      'bg-purple-100', 'bg-purple-200', 'bg-purple-300',
      'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300',
      'bg-orange-100', 'bg-orange-200', 'bg-orange-300',
      'bg-red-100', 'bg-red-200', 'bg-red-300',
      'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400',
      'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300',
      'bg-teal-100', 'bg-teal-200', 'bg-teal-300',
      'bg-sky-100', 'bg-sky-200', 'bg-sky-300',
      'bg-violet-100', 'bg-violet-200', 'bg-violet-300',
      'bg-fuchsia-100', 'bg-fuchsia-200', 'bg-fuchsia-300',
      'bg-rose-100', 'bg-rose-200', 'bg-rose-300'
    ]
    
    return lightColors.includes(bgClass)
  }

  const getBackgroundColorClass = () => {
    return habit?.bg_color || 'bg-white dark:bg-zinc-900'
  }

  const getTextColor = (currentHabit?: any) => {
    const bgColor = currentHabit?.bg_color;
    if (bgColor) {
      return isLightColor(bgColor) 
        ? 'text-gray-900' 
        : 'text-white'
    }
    return 'text-gray-900 dark:text-white'
  }

  const getSubTextColor = (currentHabit?: any) => {
    const bgColor = currentHabit?.bg_color;
    if (bgColor) {
      return isLightColor(bgColor) 
        ? 'text-gray-600' 
        : 'text-white/80'
    }
    return 'text-gray-600 dark:text-gray-400'
  }

  const loadQuickData = async () => {
    try {
      const todayEntry = await moodService.getTodaysMoodEntry();
      setCurrentMoodEntry(todayEntry);
      if (todayEntry) {
        setSelectedMood(todayEntry.mood_score);
      }
    } catch (error) {
      console.error('Error loading quick data:', error);
    }
  };

  const loadFullData = async () => {
    try {
      const weekly = await moodService.getWeeklyMoodData();
      setWeeklyMoods(weekly);

      const validEntries = weekly.filter(day => day.score > 0);
      const avg = validEntries.length > 0 
        ? validEntries.reduce((sum, day) => sum + day.score, 0) / validEntries.length
        : 0;
      setWeeklyAverage(Number(avg.toFixed(1)));

      const correlations = await moodService.getMoodHabitCorrelations();
      setHabitCorrelations(correlations);

      const insight = await moodService.getMoodInsights();
      setMoodInsight(insight);

    } catch (error) {
      console.error('Error loading full data:', error);
      Alert.alert('Error', 'Failed to load some mood data. Pull to refresh.');
    }
  };

  const loadMoodData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }

      await loadQuickData();
      await loadFullData();

    } catch (error) {
      console.error('Error loading mood data:', error);
      Alert.alert('Error', 'Failed to load mood data. Pull to refresh.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isInitialLoadRef.current) {
        loadMoodData();
        isInitialLoadRef.current = false;
      } else {
        loadQuickData();
      }

      return () => {};
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMoodData(true);
  }, []);

  const handleMoodSelect = async (value: number) => {
    if (isSavingMood) return;

    try {
      setIsSavingMood(true);
      setSelectedMood(value);
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const savedEntry = await moodService.saveMoodEntry({
        mood_score: value
      });

      setCurrentMoodEntry(savedEntry);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // OPTIMIZATION: Only reload necessary data after mood save
      setTimeout(async () => {
        const weekly = await moodService.getWeeklyMoodData();
        setWeeklyMoods(weekly);
        
        const validEntries = weekly.filter(day => day.score > 0);
        const avg = validEntries.length > 0 
          ? validEntries.reduce((sum, day) => sum + day.score, 0) / validEntries.length
          : 0;
        setWeeklyAverage(Number(avg.toFixed(1)));
      }, 500);

    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
      setSelectedMood(currentMoodEntry?.mood_score || null);
    } finally {
      setIsSavingMood(false);
    }
  };

  const getCurrentMoodDisplay = () => {
    if (currentMoodEntry) {
      return {
        emoji: currentMoodEntry.emoji,
        label: moodService.getMoodLabel(currentMoodEntry.mood_score),
        isSet: true
      };
    }
    
    if (selectedMood) {
      const option = moodOptions.find(opt => opt.value === selectedMood);
      return {
        emoji: option?.emoji || '😊',
        label: option?.label || 'Good',
        isSet: false
      };
    }

    return {
      emoji: '😊',
      label: 'How are you feeling?',
      isSet: false
    };
  };

  const currentMood = getCurrentMoodDisplay();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 app-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-body mt-4">Loading your mood data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="app-background" edges={['top']}>
      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={["#8B5CF6"]}
          />
        }
      >
        {/* Main Mood Selection Card */}
        <View className="mb-6 mt-2">
          <LinearGradient
            colors={currentMood.isSet ? ['#10B981', '#059669'] : ['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-8 mb-6"
          >
            <Text className="text-white text-xl font-semibold text-center mb-4">
              {currentMood.isSet ? "Today's Mood" : "How are you feeling today?"}
            </Text>
            <View className="items-center mb-6">
              <Text className="text-6xl mb-2">{currentMood.emoji}</Text>
              <Text className="text-white text-lg font-medium">{currentMood.label}</Text>
              {currentMoodEntry && (
                <Text className="text-white/80 text-sm mt-1">
                  Logged at {new Date(currentMoodEntry.updated_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              )}
            </View>
            {!currentMood.isSet && (
              <Text className="text-white/90 text-center text-base">
                Tap a mood below to track how you're feeling
              </Text>
            )}
            {currentMood.isSet && (
              <Text className="text-white/90 text-center text-base">
                Tap below to update your mood
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Mood Options */}
        <View className="mb-6">
          <View className="flex-row justify-between">
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                onPress={() => handleMoodSelect(mood.value)}
                disabled={isSavingMood}
                className={`items-center p-3 rounded-2xl min-w-[50px] ${
                  selectedMood === mood.value 
                    ? 'bg-indigo-100 border-2 border-indigo-500 dark:bg-indigo-900/30' 
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                }`}
                style={{
                  opacity: isSavingMood && selectedMood === mood.value ? 0.7 : 1
                }}
              >
                <Text className="text-3xl mb-2">{mood.emoji}</Text>
                <Text className={`text-xs font-medium text-center ${
                  selectedMood === mood.value 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {mood.label}
                </Text>
                {isSavingMood && selectedMood === mood.value && (
                  <ActivityIndicator size="small" color="#8B5CF6" className="mt-1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* This Week Section */}
        <View className="card p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-subheading text-lg">This Week</Text>
            <TouchableOpacity 
              onPress={() => router.push('/screens/mood_history')}
              className="flex-row items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl"
            >
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 dark:text-gray-400 text-sm ml-1 font-medium">History</Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Mood Grid */}
          <View className="flex-row justify-between mb-6">
            {weeklyMoods.map((day, index) => {
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const hasEntry = day.score > 0;
              
              return (
                <View key={index} className="items-center">
                  <Text className={`text-xs mb-2 font-medium ${
                    isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-body'
                  }`}>
                    {day.day}
                  </Text>
                  <View className={`w-12 h-12 rounded-full items-center justify-center mb-1 border-2 ${
                    isToday 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                      : hasEntry
                        ? 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                        : 'border-gray-100 bg-gray-25 dark:bg-gray-800 dark:border-gray-700'
                  }`}>
                    <Text className="text-xl">{day.emoji}</Text>
                  </View>
                  <Text className={`text-xs ${
                    hasEntry ? 'text-gray-500 font-medium' : 'text-gray-300'
                  }`}>
                    {hasEntry ? `${day.score}/10` : '-'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Average Mood Score */}
          {weeklyAverage > 0 && (
            <View className="flex-row justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl mb-4">
              <Text className="text-body font-medium">Weekly Average</Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {weeklyAverage}
                </Text>
                <Text className="text-sm text-gray-500 ml-1">/10</Text>
              </View>
            </View>
          )}
        </View>

        {/* Mood Pattern Insight */}
        {moodInsight && (
          <View className="card p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl items-center justify-center mr-3">
                <Text className="text-xl">📊</Text>
              </View>
              <Text className="text-lg text-subheading">Mood Insights</Text>
            </View>
            <View className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4">
              <Text className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {moodInsight}
              </Text>
            </View>
          </View>
        )}

        {/* Habits & Mood Correlation - FIX #3: Use actual bg_color from habit */}
        {habitCorrelations.length > 0 && (
          <View className="card p-4 mb-6">
            <Text className="text-lg text-subheading mb-4">
              Habits & Mood Correlation
            </Text>
            <View className="space-y-3 flex flex-col gap-3">
              {habitCorrelations.slice(0, 3).map((correlation, index) => (
                <View 
                  key={index} 
                  className={`flex-row items-center justify-between p-4 rounded-2xl ${correlation.bg_color || 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-3">{correlation.habit_icon}</Text>
                    <View className="flex-1">
                      <Text className={`font-medium ${getTextColor({ bg_color: correlation.bg_color })}`}>
                        {correlation.habit_name}
                      </Text>
                      <Text className={`text-xs mt-1 ${getSubTextColor({ bg_color: correlation.bg_color })}`}>
                        {correlation.correlation_strength > 0.5 ? 'Strong' : correlation.correlation_strength > 0 ? 'Moderate' : 'Weak'} correlation
                      </Text>
                    </View>
                  </View>
                  <Text 
                    className="font-semibold text-sm" 
                    style={{ 
                      color: isLightColor(correlation.bg_color) ? correlation.color : '#ffffff'
                    }}
                  >
                    {correlation.boost_description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding for scroll */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

export const options = {
  title: 'Mood Tracker',
};