import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';

import { useHabits } from '@/hooks/usehabits';
import { HabitWithCompletion, UpdateHabitRequest, HABIT_CATEGORIES, HABIT_COLORS } from '@/types/habit';

const { width } = Dimensions.get('window');

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isCompleted: boolean;
  completionCount: number;
}

const HabitDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { 
    habits, 
    loading: habitsLoading,
    updateHabit, 
    deleteHabit, 
    updateHabitCompletion,
    refetch
  } = useHabits();

  // State management
  const [habit, setHabit] = useState<HabitWithCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'stats'>('overview');
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<UpdateHabitRequest>({});
  const [todayProgress, setTodayProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Load habit data
  useEffect(() => {
    const loadHabitData = () => {
      // Don't proceed if habits array is still loading (empty but not yet loaded)
      if (habitsLoading) {
        return; // Keep loading state, don't set to false yet
      }

      try {
        const foundHabit = habits.find(h => h.id === id);
        if (foundHabit) {
          setHabit(foundHabit);
          setTodayProgress(foundHabit.completed);
          setEditingHabit({
            title: foundHabit.title,
            icon: foundHabit.icon,
            description: foundHabit.description,
            category: foundHabit.category,
            target_count: foundHabit.target_count,
            target_unit: foundHabit.target_unit,
            frequency: foundHabit.frequency,
            bg_color: foundHabit.bg_color
          });
          generateCalendarData();
          setLoading(false);
        } else {
          // Habit not found after habits are loaded
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading habit data:', error);
        setLoading(false);
      }
    };

    loadHabitData();
  }, [habits, habitsLoading, id]);

  // Generate calendar data with mock completion data
  // Note: In a real implementation, you'd want to add a method to get habit history
  const generateCalendarData = () => {
    const today = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    // Create 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Mock completion data - in a real app, you'd fetch this from your service
      // For now, we'll show some random completions for demo purposes
      const isCompleted = Math.random() > 0.6 && current <= today;
      const completionCount = isCompleted ? (habit?.target_count || 1) : 0;
      
      days.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === currentMonth.getMonth(),
        isToday: current.toDateString() === today.toDateString(),
        isCompleted,
        completionCount
      });
      
      current.setDate(current.getDate() + 1);
    }

    setCalendarData(days);
  };

  // Update calendar when month changes
  useEffect(() => {
    if (habit) {
      generateCalendarData();
    }
  }, [currentMonth, habit]);

  // Calculate statistics based on current habit data
  const statistics = useMemo(() => {
    if (!habit) {
      return {
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyAverage: 0,
        monthlyAverage: 0,
        trendDirection: 'stable' as 'up' | 'down' | 'stable'
      };
    }

    // For now, use the calendar data to calculate stats
    // In a real implementation, you'd have historical completion data
    const currentMonthDays = calendarData.filter(day => day.isCurrentMonth);
    const completedDays = currentMonthDays.filter(day => day.isCompleted).length;
    const totalDays = currentMonthDays.length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Mock additional stats - these would come from your service in a real implementation
    const currentStreak = habit.streak;
    const longestStreak = Math.max(habit.streak, Math.floor(Math.random() * 20) + 5);
    const weeklyAverage = Math.floor(completionRate * 0.07);
    const monthlyAverage = completedDays;

    // Simple trend calculation based on completion rate
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (completionRate > 70) trendDirection = 'up';
    else if (completionRate < 30) trendDirection = 'down';

    return {
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
      longestStreak,
      weeklyAverage,
      monthlyAverage,
      trendDirection
    };
  }, [habit, calendarData]);

  // Handle progress updates with proper error handling
  const handleProgressUpdate = async (increment: number) => {
    if (!habit || isUpdatingProgress) return;

    const newProgress = Math.min(Math.max(0, todayProgress + increment), habit.target_count);
    
    // Don't proceed if no actual change
    if (newProgress === todayProgress) return;

    setIsUpdatingProgress(true);
    const previousProgress = todayProgress;
    
    // Optimistically update UI
    setTodayProgress(newProgress);

    try {
      await updateHabitCompletion(habit.id, newProgress);
      
      // Refetch habits to get updated data
      await refetch();
      
      // Update local habit state with fresh data
      const updatedHabits = habits;
      const updatedHabit = updatedHabits.find(h => h.id === habit.id);
      if (updatedHabit) {
        setHabit(updatedHabit);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert on error
      setTodayProgress(previousProgress);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to update progress. Please try again.';
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === '23505') {
          errorMessage = 'Progress already recorded for today. Refreshing...';
          // Refresh the habit to get current state
          setTimeout(async () => {
            await refetch();
            const refreshedHabit = habits.find(h => h.id === habit.id);
            if (refreshedHabit) {
              setTodayProgress(refreshedHabit.completed);
            }
          }, 1000);
        }
      }
      
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Handle habit editing
  const handleSaveEdit = async () => {
    if (!habit || !editingHabit.title?.trim()) return;

    try {
      await updateHabit(habit.id, editingHabit);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Habit updated successfully!');
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  // Handle habit deletion
  const handleDeleteHabit = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit!.id);
              Alert.alert('Success', 'Habit deleted successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Navigate between months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getTrendIcon = () => {
    switch (statistics.trendDirection) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getColorFromBgClass = (bgClass: string): [string, string] => {
    const colorMap: Record<string, [string, string]> = {
      'bg-blue-500': ['#60A5FA', '#2563EB'],
      'bg-green-500': ['#34D399', '#10B981'],
      'bg-purple-500': ['#A78BFA', '#8B5CF6'],
      'bg-amber-500': ['#FBBF24', '#F59E0B'],
      'bg-red-500': ['#F87171', '#EF4444'],
      'bg-pink-500': ['#F472B6', '#EC4899'],
      'bg-indigo-500': ['#818CF8', '#6366F1'],
      'bg-teal-500': ['#2DD4BF', '#14B8A6'],
      'bg-orange-500': ['#FB923C', '#F97316'],
      'bg-cyan-500': ['#22D3EE', '#06B6D4'],
    };
    return colorMap[bgClass] || ['#60A5FA', '#2563EB'];
  };

  if (loading || habitsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-sm">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <View className="bg-gray-200 dark:bg-gray-700 rounded-lg h-5 w-32" />
          
          <View className="p-2">
            <View className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          </View>
        </View>

        {/* Content Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading habit details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">Habit Not Found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-indigo-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {habit.title}
        </Text>
        
        <TouchableOpacity 
          onPress={() => setIsEditModalVisible(true)}
          className="p-2"
        >
          <Ionicons name="create-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white dark:bg-gray-900 px-4 py-2">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'calendar', label: 'Calendar', icon: '📅' },
          { key: 'stats', label: 'Stats', icon: '📈' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex-row items-center justify-center py-3 mx-1 rounded-lg ${
              activeTab === tab.key ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text className="mr-1">{tab.icon}</Text>
            <Text className={`text-sm font-medium ${
              activeTab === tab.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View className="px-4 py-4">
          <LinearGradient
            colors={getColorFromBgClass(habit.bg_color)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16 }}
            className="p-6"
          >
            <View className="flex-row items-center mb-4">
              <Text className="text-4xl mr-4">{habit.icon}</Text>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white mb-1">
                  {habit.title}
                </Text>
                <Text className="text-white/80 text-base">
                  {habit.category} • {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between">
              <View className="bg-white/20 rounded-xl p-4 flex-1 mr-3">
                <Text className="text-3xl font-bold text-white">{habit.streak}</Text>
                <Text className="text-white/80 text-sm">Current Streak</Text>
              </View>
              <View className="bg-white/20 rounded-xl p-4 flex-1 ml-3">
                <Text className="text-3xl font-bold text-white">{Math.round(statistics.completionRate)}%</Text>
                <Text className="text-white/80 text-sm">Success Rate</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View className="px-4">
            {/* Today's Progress */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">Today's Progress</Text>
                <Text className="text-gray-600 dark:text-gray-400">
                  {todayProgress}/{habit.target_count} {habit.target_unit}
                </Text>
              </View>
              
              <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                <View 
                  className="bg-indigo-500 rounded-full h-3" 
                  style={{ width: `${(todayProgress / habit.target_count) * 100}%` }}
                />
              </View>
              
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  className={`rounded-xl px-6 py-3 flex-1 mr-2 ${
                    todayProgress >= habit.target_count ? 'bg-green-500' : 'bg-indigo-500'
                  }`}
                  onPress={() => handleProgressUpdate(habit.target_count - todayProgress)}
                  disabled={todayProgress >= habit.target_count || isUpdatingProgress}
                >
                  {isUpdatingProgress ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">
                      {todayProgress >= habit.target_count ? '✓ Completed' : 'Mark Complete'}
                    </Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="border border-indigo-500 rounded-xl px-4 py-3 mr-2"
                  onPress={() => handleProgressUpdate(1)}
                  disabled={todayProgress >= habit.target_count || isUpdatingProgress}
                >
                  <Text className="text-indigo-500 font-medium">+1</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="border border-red-500 rounded-xl px-4 py-3"
                  onPress={() => handleProgressUpdate(-1)}
                  disabled={todayProgress <= 0 || isUpdatingProgress}
                >
                  <Text className="text-red-500 font-medium">-1</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</Text>
              <View className="flex-row justify-between mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalDays}</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">Days This Month</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">{statistics.completedDays}</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">Completed</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-purple-600">{statistics.longestStreak}</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">Best Streak</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xl">{getTrendIcon()}</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">Trend</Text>
                </View>
              </View>
            </View>

            {/* Habit Details */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-600 dark:text-gray-400">Target</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {habit.target_count} {habit.target_unit}
                  </Text>
                </View>
                
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-600 dark:text-gray-400">Frequency</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-600 dark:text-gray-400">Category</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">{habit.category}</Text>
                </View>
                
                {habit.description && (
                  <View className="py-2">
                    <Text className="text-gray-600 dark:text-gray-400 mb-1">Description</Text>
                    <Text className="text-gray-900 dark:text-white">{habit.description}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'calendar' && (
          <View className="px-4">
            {/* Calendar Header */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => navigateMonth('prev')}>
                  <Ionicons name="chevron-back" size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatMonthYear(currentMonth)}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth('next')}>
                  <Ionicons name="chevron-forward" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Day headers */}
              <View className="flex-row justify-between mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <View key={day} className="w-10 items-center">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View className="flex-row flex-wrap">
                {calendarData.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`w-10 h-10 items-center justify-center rounded-lg m-0.5 ${
                      day.isToday ? 'bg-indigo-500' : 
                      day.isCompleted ? 'bg-green-100 dark:bg-green-900' :
                      day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : 'bg-transparent'
                    }`}
                    style={{ width: (width - 80) / 7 - 4 }}
                  >
                    <Text className={`text-sm ${
                      day.isToday ? 'text-white font-bold' :
                      day.isCompleted ? 'text-green-800 dark:text-green-200 font-semibold' :
                      day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                    }`}>
                      {day.day}
                    </Text>
                    {day.completionCount > 0 && day.completionCount < habit.target_count && (
                      <View className="w-1 h-1 bg-amber-500 rounded-full absolute bottom-1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Legend */}
              <View className="flex-row justify-center mt-4 gap-4 space-x-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">Completed</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-amber-500 rounded-full mr-1" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">Partial</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-indigo-500 rounded-full mr-1" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">Today</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View className="px-4">
            {/* Performance Overview */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</Text>
              
              <View className="flex-row justify-between mb-6">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-600">{Math.round(statistics.completionRate)}%</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">Month Rate</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-600">{Math.round(statistics.weeklyAverage)}</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">Weekly Avg</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-purple-600">{statistics.monthlyAverage}</Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">Monthly Total</Text>
                </View>
              </View>

              {/* Trend Indicator */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-700 dark:text-gray-300">Current Trend</Text>
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">{getTrendIcon()}</Text>
                    <Text className={`font-semibold ${
                      statistics.trendDirection === 'up' ? 'text-green-600' :
                      statistics.trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {statistics.trendDirection === 'up' ? 'Strong' :
                       statistics.trendDirection === 'down' ? 'Needs Focus' : 'Steady'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Streaks */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streaks</Text>
              
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 dark:text-gray-400">Current Streak</Text>
                  <Text className="text-xl font-bold text-orange-600">{statistics.currentStreak} days</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 dark:text-gray-400">Longest Streak</Text>
                  <Text className="text-xl font-bold text-green-600">{statistics.longestStreak} days</Text>
                </View>
              </View>
            </View>

            {/* Time Analysis */}
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Month</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Days in Month</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">{statistics.totalDays}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Days Completed</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">{statistics.completedDays}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Days Missed</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">{statistics.totalDays - statistics.completedDays}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Success Rate</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">{Math.round(statistics.completionRate)}%</Text>
                </View>
              </View>
            </View>

            {/* Insights */}
            <View className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6 mb-4 shadow-sm border border-purple-200 dark:border-purple-800">
              <View className="flex-row items-center mb-4">
                <Text className="text-2xl mr-3">💡</Text>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">Insights</Text>
              </View>
              
              <View className="space-y-3">
                {statistics.trendDirection === 'up' && (
                  <View className="flex-row items-start">
                    <Text className="text-green-500 mr-2">•</Text>
                    <Text className="text-gray-700 dark:text-gray-300 flex-1">
                      Great progress! You're maintaining a strong completion rate this month.
                    </Text>
                  </View>
                )}
                
                {statistics.currentStreak > 0 && (
                  <View className="flex-row items-start">
                    <Text className="text-orange-500 mr-2">•</Text>
                    <Text className="text-gray-700 dark:text-gray-300 flex-1">
                      You're on a {statistics.currentStreak}-day streak. Keep the momentum going!
                    </Text>
                  </View>
                )}
                
                {statistics.completionRate > 80 && (
                  <View className="flex-row items-start">
                    <Text className="text-blue-500 mr-2">•</Text>
                    <Text className="text-gray-700 dark:text-gray-300 flex-1">
                      Excellent consistency! You're maintaining a high success rate.
                    </Text>
                  </View>
                )}
                
                {statistics.completionRate < 50 && (
                  <View className="flex-row items-start">
                    <Text className="text-yellow-500 mr-2">•</Text>
                    <Text className="text-gray-700 dark:text-gray-300 flex-1">
                      Consider adjusting your target or breaking this habit into smaller steps.
                    </Text>
                  </View>
                )}
                
                <View className="flex-row items-start">
                  <Text className="text-purple-500 mr-2">•</Text>
                  <Text className="text-gray-700 dark:text-gray-300 flex-1">
                    Try linking this habit to an existing routine for better consistency.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-4 pb-8">
          <View className="flex-row space-x-3 gap-3">
            <TouchableOpacity 
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              onPress={() => setIsEditModalVisible(true)}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="create-outline" size={20} color="#6B7280" />
                <Text className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Edit</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-red-500 rounded-xl p-4 shadow-sm"
              onPress={handleDeleteHabit}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text className="ml-2 text-white font-medium">Delete</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text className="text-gray-600 dark:text-gray-400 font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">Edit Habit</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text className="text-indigo-600 font-medium">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Habit Name */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Habit Name</Text>
              <TextInput
                value={editingHabit.title || ''}
                onChangeText={(text) => setEditingHabit({ ...editingHabit, title: text })}
                className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-gray-900 dark:text-white"
                placeholder="Enter habit name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Icon Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Icon</Text>
              <View className="flex-row flex-wrap gap-3">
                {['💧', '📚', '🏃', '🧘', '🍎', '💪', '🌱', '🎯', '✍️', '🎨', '⭐', '🔥'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setEditingHabit({ ...editingHabit, icon })}
                    className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${
                      editingHabit.icon === icon 
                        ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900' 
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Text className="text-xl">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {HABIT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setEditingHabit({ ...editingHabit, category })}
                    className={`px-4 py-2 rounded-full border ${
                      editingHabit.category === category
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm ${
                      editingHabit.category === category 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Target & Unit */}
            <View className="flex-row space-x-3 mb-6">
              <View className="flex-1">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Target</Text>
                <TextInput
                  value={editingHabit.target_count?.toString() || ''}
                  onChangeText={(text) => setEditingHabit({ ...editingHabit, target_count: parseInt(text) || 1 })}
                  className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-gray-900 dark:text-white"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Unit</Text>
                <TextInput
                  value={editingHabit.target_unit || ''}
                  onChangeText={(text) => setEditingHabit({ ...editingHabit, target_unit: text })}
                  className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-gray-900 dark:text-white"
                  placeholder="times, glasses, etc."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Color Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Color</Text>
              <View className="flex-row flex-wrap gap-3">
                {HABIT_COLORS.map((color) => {
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
                      key={color}
                      onPress={() => setEditingHabit({ ...editingHabit, bg_color: color })}
                      style={{ backgroundColor: colorMap[color] }}
                      className={`w-12 h-12 rounded-full border-4 ${
                        editingHabit.bg_color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                      }`}
                    />
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Description</Text>
              <TextInput
                value={editingHabit.description || ''}
                onChangeText={(text) => setEditingHabit({ ...editingHabit, description: text })}
                className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-gray-900 dark:text-white h-24"
                placeholder="Why is this habit important to you?"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default HabitDetails;