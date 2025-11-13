// app/screens/habit-details.tsx - COMPLETE FIX + BEAUTIFUL UI

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useHabits } from '@/hooks/usehabits';
import { HabitWithCompletion, UpdateHabitRequest } from '@/types/habit';
import { EditHabitModal } from '../components/modal/EditHabit';
import { useAuth } from '@/hooks/useAuth';

// import MetricsOverview from '../components/reports/MetricsOverview';
import HeatmapCalendar from '../components/reports/HeatMapCalendar';
import { getStreakUnit, formatCompletionCount } from '@/utils/streakCalculation';

const HabitDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const initialLoadCompleteRef = useRef(false);
  
  const { 
    habits, 
    loading: habitsLoading,
    updateHabit, 
    deleteHabit, 
    updateHabitCompletion,
    refetch
  } = useHabits();

  const [habit, setHabit] = useState<HabitWithCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<UpdateHabitRequest>({});
  const [updating, setUpdating] = useState(false);
  const [todayProgress, setTodayProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      hasLoadedRef.current = false;
      initialLoadCompleteRef.current = false;
    };
  }, []);

  // Refresh on focus - but not on initial mount
  useFocusEffect(
    useCallback(() => {
      if (user && !habitsLoading && isMountedRef.current && initialLoadCompleteRef.current) {
        refetch().catch(err => console.error('Refetch error:', err));
      }
    }, [user, habitsLoading, refetch])
  );

  // Simple statistics calculation from habit data
  const statistics = useMemo(() => {
    if (!habit) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        consistencyScore: 0,
        last7DaysRate: 0,
        last30DaysRate: 0,
        completedDays: 0,
        weekStats: { perfectDays: 0, scheduledDays: 0, completionRate: 0 },
        monthStats: { perfectDays: 0, scheduledDays: 0, completionRate: 0 }
      };
    }

    return {
      currentStreak: habit.streak || 0,
      longestStreak: habit.longestStreak || habit.streak || 0,
      completionRate: 0,
      consistencyScore: 0,
      last7DaysRate: 0,
      last30DaysRate: 0,
      completedDays: 0,
      weekStats: { perfectDays: 0, scheduledDays: 7, completionRate: 0 },
      monthStats: { perfectDays: 0, scheduledDays: 30, completionRate: 0 }
    };
  }, [habit]);

  // Generate simple heatmap data
  const heatmapData = useMemo(() => {
    if (!habit) return [];

    const data = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const isToday = i === 0;
      const isCompleted = isToday ? habit.isCompleted : false;
      
      data.push({
        date: dateStr,
        completed: isCompleted,
        count: isCompleted ? habit.completed : 0
      });
    }
    
    return data;
  }, [habit]);

  // Load habit data - FIXED: Only on initial load
  useEffect(() => {
    // Skip if already loaded OR if we're in a refetch state
    if (hasLoadedRef.current || initialLoadCompleteRef.current) {
      console.log('Already loaded, skipping...');
      return;
    }

    // Only wait for initial load
    if (habitsLoading && !initialLoadCompleteRef.current) {
      console.log('Habits still loading, waiting...');
      return;
    }

    if (!isMountedRef.current) {
      console.log('Component not mounted, skipping...');
      return;
    }

    console.log('Loading habit data...', { habitsLoading, id, habitsCount: habits.length });

    try {
      const foundHabit = habits.find(h => h.id === id);
      console.log('Found habit:', foundHabit ? 'YES' : 'NO');
      
      if (foundHabit && isMountedRef.current) {
        setHabit(foundHabit);
        setTodayProgress(foundHabit.completed || 0);
        setEditingHabit({
          title: foundHabit.title,
          icon: foundHabit.icon,
          description: foundHabit.description,
          category: foundHabit.category,
          target_count: foundHabit.target_count,
          target_unit: foundHabit.target_unit,
          frequency_type: foundHabit.frequency_type,
          frequency_count: foundHabit.frequency_count,
          frequency_days: foundHabit.frequency_days,
          bg_color: foundHabit.bg_color
        });
        hasLoadedRef.current = true;
        initialLoadCompleteRef.current = true;
        setLoading(false);
        console.log('Habit loaded successfully');
      } else if (!foundHabit) {
        console.log('Habit not found, stopping loading...');
        setLoading(false);
        hasLoadedRef.current = true;
        initialLoadCompleteRef.current = true;
      }
    } catch (error) {
      console.error('Error loading habit data:', error);
      if (isMountedRef.current) {
        setLoading(false);
        hasLoadedRef.current = true;
        initialLoadCompleteRef.current = true;
      }
    }
  }, [habits, habitsLoading, id]);

  // Update habit from habits array when it changes (after refetch)
  useEffect(() => {
    if (!initialLoadCompleteRef.current) return;
    if (habitsLoading) return; // Don't update while loading
    
    const foundHabit = habits.find(h => h.id === id);
    if (foundHabit && isMountedRef.current) {
      console.log('Updating habit from refetch');
      setHabit(foundHabit);
      setTodayProgress(foundHabit.completed || 0);
    }
  }, [habits, id, habitsLoading]);

  // Handle progress updates
  const handleProgressUpdate = useCallback(async (increment: number) => {
    if (!habit || isUpdatingProgress || !isMountedRef.current) return;

    const newProgress = Math.min(Math.max(0, todayProgress + increment), habit.target_count);
    if (newProgress === todayProgress) return;

    setIsUpdatingProgress(true);
    const previousProgress = todayProgress;
    
    // Optimistic update
    if (isMountedRef.current) {
      setTodayProgress(newProgress);
      setHabit(prev => prev ? {
        ...prev,
        completed: newProgress,
        isCompleted: newProgress >= prev.target_count,
        progress: newProgress / prev.target_count
      } : null);
    }

    try {
      await updateHabitCompletion(habit.id, newProgress);
      
      // Refetch happens automatically in useHabits
      // The useEffect above will update the habit state
    } catch (error) {
      console.error('Error updating progress:', error);
      if (isMountedRef.current) {
        setTodayProgress(previousProgress);
        setHabit(prev => prev ? {
          ...prev,
          completed: previousProgress,
          isCompleted: previousProgress >= prev.target_count,
          progress: previousProgress / prev.target_count
        } : null);
        Alert.alert('Update Failed', 'Failed to update progress. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsUpdatingProgress(false);
      }
    }
  }, [habit, isUpdatingProgress, todayProgress, updateHabitCompletion]);

  const handleSaveEdit = useCallback(async (editingHabit: UpdateHabitRequest) => {
    if (!habit || !editingHabit.title?.trim() || !isMountedRef.current) return;

    setUpdating(true);
    try {
      await updateHabit(habit.id, editingHabit);
      if (isMountedRef.current) {
        setIsEditModalVisible(false);
        Alert.alert('Success', 'Habit updated successfully!');
      }
      // useEffect will handle updating the habit state
    } catch (error) {
      console.error('Error updating habit:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to update habit. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setUpdating(false);
      }
    }
  }, [habit, updateHabit]);

  const handleDeleteHabit = useCallback(() => {
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
              if (isMountedRef.current) {
                Alert.alert('Error', 'Failed to delete habit. Please try again.');
              }
            }
          }
        }
      ]
    );
  }, [habit, deleteHabit, router]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !hasLoadedRef.current) {
        console.log('Loading timeout reached, forcing stop...');
        setLoading(false);
        hasLoadedRef.current = true;
        initialLoadCompleteRef.current = true;
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading || (habitsLoading && !initialLoadCompleteRef.current)) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-500 mt-4">Loading habit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mb-2 mt-4">Habit not found</Text>
          <Text className="text-gray-400 text-center text-sm mb-4">
            This habit may have been deleted or doesn't exist.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-indigo-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = Math.round((todayProgress / habit.target_count) * 100);
  const streakUnit = getStreakUnit(habit.frequency_type);
  const completionText = formatCompletionCount(todayProgress, habit.target_unit);
  const targetText = formatCompletionCount(habit.target_count, habit.target_unit);
  const isComplete = todayProgress >= habit.target_count;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1 text-center">
          {habit.title}
        </Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)} className="p-2">
            <Ionicons name="create-outline" size={22} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteHabit} className="p-2">
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Hero Card */}
       <View className={`${habit.bg_color} rounded-2xl p-6 mb-4 shadow-sm`}>
  <View className="flex-row items-center mb-4">
    {/* Icon container with neutral background that works with any habit color */}
    <View className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-black/20 items-center justify-center mr-4 backdrop-blur-sm border border-white/10">
      <Text className="text-3xl text-white">{habit.icon}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-xl font-bold text-white mb-1">
        {habit.title}
      </Text>
      <View className="flex-row items-center">
        <Text className="text-orange-500 text-lg font-semibold mr-1">🔥</Text>
        <Text className="text-gray-200">
          {statistics.currentStreak} {streakUnit} streak
        </Text>
      </View>
    </View>
  </View>

  {/* Progress Bar */}
  <View className="mb-4">
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-gray-200 text-sm font-medium">Today's Progress</Text>
      <Text className="text-white font-bold">
        {completionText} / {targetText}
      </Text>
    </View>
    <View className="h-3 bg-white/30 dark:bg-black/30 rounded-full overflow-hidden">
      <View 
        className="h-full bg-white/80 dark:bg-white/90 rounded-full "
        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
      />
    </View>
    <Text className="text-right text-xs text-gray-300 mt-1 font-medium">
      {progressPercentage}% complete
    </Text>
  </View>

  {/* Beautiful Quick Actions */}
  <View className="flex-row items-center justify-between gap-3">
    {/* Decrease Button */}
    <TouchableOpacity
      onPress={() => handleProgressUpdate(-1)}
      disabled={isUpdatingProgress || todayProgress === 0}
      className={`w-14 h-14 rounded-full items-center justify-center border-2 ${
        todayProgress === 0 || isUpdatingProgress
          ? 'bg-white/20 border-white/30 opacity-40'
          : 'bg-white/30 border-white/50'
      }`}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="remove" 
        size={24} 
        color={todayProgress === 0 ? 'rgba(255,255,255,0.5)' : 'white'} 
      />
    </TouchableOpacity>

    {/* Mark Complete Button */}
  <TouchableOpacity
      onPress={() => handleProgressUpdate(habit.target_count - todayProgress)}
      disabled={isUpdatingProgress || isComplete}
      className={`flex-1 h-14 rounded-2xl items-center justify-center border-2 ${
        isComplete
          ? 'bg-emerald-500/90 border-emerald-600 dark:bg-emerald-600/90 dark:border-emerald-700'
          : 'bg-white/80 dark:bg-gray-800/90 border-white/60 dark:border-gray-600'
      } ${isUpdatingProgress ? 'opacity-70' : ''}`}
      activeOpacity={0.8}
    >
      {isUpdatingProgress ? (
        <ActivityIndicator color={isComplete ? "white" : "#4B5563"} />
      ) : (
        <View className="flex-row items-center">
          <Ionicons 
            name={isComplete ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={isComplete ? "white" : "#374151"} 
          />
          <Text className={`font-semibold text-base ml-2 ${
            isComplete ? 'text-white' : 'text-gray-900 dark:text-gray-200'
          }`}>
            {isComplete ? 'Completed' : 'Complete'}
          </Text>
        </View>
      )}
    </TouchableOpacity>


    {/* Increase Button */}
    <TouchableOpacity
      onPress={() => handleProgressUpdate(1)}
      disabled={isUpdatingProgress || isComplete}
      className={`w-14 h-14 rounded-full items-center justify-center border-2 ${
        isComplete || isUpdatingProgress
          ? 'bg-white/20 border-white/30 opacity-40'
          : 'bg-white/30 border-white/50'
      }`}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="add" 
        size={24} 
        color={isComplete ? 'rgba(255,255,255,0.5)' : 'white'} 
      />
    </TouchableOpacity>
  </View>
</View>

          {/* Analytics Snapshot */}
          {/* <MetricsOverview 
            overallMetrics={{
              totalHabits: 1,
              activeStreaks: statistics.currentStreak > 0 ? 1 : 0,
              completionRate: statistics.completionRate,
              consistencyScore: statistics.consistencyScore,
              momentum: statistics.last7DaysRate,
              improvement: 0,
              weeklyGoal: 80,
              monthlyGoal: 85
            }}
          /> */}

          {/* Key Metrics */}
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Key Metrics
            </Text>
            <View className="flex-row flex-wrap">
              <MetricItem 
                label="Best Streak" 
                value={`${statistics.longestStreak} ${streakUnit}`}
                icon="🏆"
              />
              <MetricItem 
                label="This Week" 
                value={`${statistics.weekStats.perfectDays}/${statistics.weekStats.scheduledDays}`}
                icon="🎯"
              />
              <MetricItem 
                label="This Month" 
                value={`${statistics.monthStats.perfectDays}/${statistics.monthStats.scheduledDays}`}
                icon="📊"
              />
              <MetricItem 
                label="Total" 
                value={`${statistics.completedDays}`}
                icon="📅"
              />
            </View>
          </View>

          {/* Heatmap Calendar */}
          {heatmapData.length > 0 && (
            <HeatmapCalendar 
              dailyData={heatmapData}
              selectedPeriod="Last 28 days"
              totalDays={28}
            />
          )}

          {/* Habit Details */}
          {habit.description && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 leading-5">
                {habit.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <EditHabitModal
        visible={isEditModalVisible}
        habit={habit}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSaveEdit}
        loading={updating}
      />
    </SafeAreaView>
  );
};

const MetricItem: React.FC<{ label: string; value: string; icon: string }> = ({ 
  label, 
  value, 
  icon 
}) => (
  <View className="w-1/2 mb-3">
    <View className="flex-row items-center mb-1">
      <Text className="text-lg mr-2">{icon}</Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
    </View>
    <Text className="text-base font-semibold text-gray-900 dark:text-white ml-7">
      {value}
    </Text>
  </View>
);

export default HabitDetails;