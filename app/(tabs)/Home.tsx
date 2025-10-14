// (tabs)/index.tsx or your Home component
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import React, { useCallback, useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import HabitCard from '../components/ui/HabitCard';
import AIInsights from '../components/AIInsights';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/usehabits'; // Updated import path
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const router = useRouter();
  const { user } = useAuth();

  const { 
    habits, 
    stats, 
    loading, 
    refreshing,
    error,
    isOnline,
    syncStatus,
    lastSyncResult,
    refresh,
    toggleHabit,
    syncData,
    clearError
  } = useHabits();

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user && !loading) {
        refresh();
      }
    }, [user, refresh, loading])
  );

  // Handle habit toggle with optimistic UI and error handling
  const handleToggleHabit = useCallback(async (habitId: string) => {
    try {
      await toggleHabit(habitId);
    } catch (error) {
      Alert.alert(
        'Error', 
        'Failed to update habit. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [toggleHabit]);

  // Calculate overall progress with memoization
  const overallProgress = useMemo(() => {
    return stats.totalHabits > 0 ? (stats.completedToday / stats.totalHabits) : 0;
  }, [stats.totalHabits, stats.completedToday]);

  // Show error alert if there's an error
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error,
        [
          { 
            text: 'Retry', 
            onPress: () => { 
              clearError(); 
              refresh(); 
            } 
          },
          { text: 'OK', onPress: clearError }
        ]
      );
    }
  }, [error, clearError, refresh]);

  // Show sync conflicts if any
  useEffect(() => {
    if (lastSyncResult && lastSyncResult.conflicts.length > 0) {
      Alert.alert(
        'Sync Conflicts',
        `${lastSyncResult.conflicts.length} habit(s) have sync conflicts. Please resolve them in the habit details.`,
        [{ text: 'OK' }]
      );
    }
  }, [lastSyncResult]);

  // Show loading state only on initial load
  if (loading && !refreshing && habits.length === 0) {
    return (
      <SafeAreaView className="flex-1 app-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 dark:text-gray-400">Loading your habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show auth required state
  if (!user) {
    return (
      <SafeAreaView className="flex-1 app-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Habitron!</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Sign in to start tracking your habits and get AI coaching.
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
    <SafeAreaView className="flex-1 app-background" edges={['bottom']}>
      {/* Header with Action Buttons and Sync Status - Fixed at top */}
      <View className="px-4 pt-4 pb-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-600 dark:text-gray-400">
                Keep up your great progress
              </Text>
              {/* Network/Sync Status Indicator */}
              <View className="flex-row items-center ml-3">
                {!isOnline && (
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-offline" size={16} color="#EF4444" />
                    <Text className="text-red-500 text-xs ml-1">Offline</Text>
                  </View>
                )}
                {isOnline && syncStatus === 'syncing' && (
                  <View className="flex-row items-center">
                    <Ionicons name="sync" size={16} color="#3B82F6" />
                    <Text className="text-blue-500 text-xs ml-1">Syncing...</Text>
                  </View>
                )}
                {isOnline && syncStatus === 'error' && (
                  <TouchableOpacity onPress={syncData} className="flex-row items-center">
                    <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                    <Text className="text-amber-500 text-xs ml-1">Tap to retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {/* Action Buttons Row */}
          <View className="flex-row gap-3">
            {/* AI Coach Button */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ai_coach')}
              className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={20} color="#4F46E5" />
            </TouchableOpacity>

            {/* Add Habit Button */}
            <TouchableOpacity
              onPress={() => router.push('/components/modal/CreateHabit')}
              className="bg-indigo-500 p-3 rounded-xl items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Progress Card */}
        <View className="card mb-6">
          <View className='flex flex-row justify-between items-start'>
            <View className="flex-1">
              <Text className="text-heading">Today's Progress</Text>
              <Text className="text-body mb-4">
                {stats.completedToday} of {stats.totalHabits} habits completed
              </Text>
            </View>
            <Text className="text-heading text-2xl font-bold">
              {Math.round(overallProgress * 100)}%
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <View 
              className="bg-indigo-500 rounded-full h-3 " 
              style={{ width: `${overallProgress * 100}%` }}
            />
          </View>
          
          {/* Weekly stats */}
          {stats.completionRate > 0 && (
            <Text className="text-body text-sm">
              Weekly completion rate: {stats.completionRate}%
            </Text>
          )}
        </View>

        {/* AI Insights */}
        {habits.length > 0 && (
          <View className="mb-6">
            <AIInsights 
              maxInsights={3}
              showHeader={true}
              compact={false}
            />
          </View>
        )}

        {/* Today's Habits Section */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-heading">Today's Habits</Text>
            {habits.length > 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Tap to view details
              </Text>
            )}
          </View>
          
          {habits.length === 0 ? (
            <View className="card items-center py-8">
              <Text className="text-4xl mb-4">🌱</Text>
              <Text className="text-heading text-center mb-2">Ready to build great habits?</Text>
              <Text className="text-body text-center mb-6">
                Create your first habit to start building better routines and get AI coaching.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/screens/create_habit')}
                className="bg-indigo-500 px-8 py-3 rounded-xl flex-row items-center"
              >
                <Ionicons name="add" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Create First Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {habits.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={() => handleToggleHabit(habit.id)}
                  isLast={index === habits.length - 1}
                />
              ))}
              
              {/* Quick Add Button at bottom of habits list */}
              <TouchableOpacity
                onPress={() => router.push('/components/modal/CreateHabit')}
                className="mt-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl items-center justify-center"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
                  <Text className="text-gray-600 dark:text-gray-400 font-medium ml-2">
                    Add another habit
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Show conflicts notice if any exist */}
        {lastSyncResult && lastSyncResult.conflicts.length > 0 && (
          <View className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text className="text-amber-800 dark:text-amber-200 font-semibold ml-2">
                Sync Conflicts Detected
              </Text>
            </View>
            <Text className="text-amber-700 dark:text-amber-300 text-sm mb-3">
              {lastSyncResult.conflicts.length} habit(s) have conflicts that need resolution.
            </Text>
            {/* <TouchableOpacity
              onPress={() => router.push('')}
              className="bg-amber-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-center">Resolve Conflicts</Text>
            </TouchableOpacity> */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;