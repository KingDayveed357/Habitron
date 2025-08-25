import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import HabitCard from '../components/ui/HabitCard';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '@/hooks/usehabits';
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
    refresh,
    toggleHabit,
    clearError
  } = useHabits();

  // Refresh data when screen comes into focus (handles new habit creation)
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
  React.useEffect(() => {
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

  // Show loading state only on initial load (not when refreshing or toggling)
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
            Sign in to start tracking your habits and building better routines.
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
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
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
        <View className="card">
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
          <View className="bg-white/20 rounded-full h-2 mb-4">
            <View 
              className="bg-indigo-500 rounded-full h-2 transition-all duration-300" 
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

        {/* Today's Habits Section */}
        <View>
          <Text className="text-heading mb-4">Today's Habits</Text>
          
          {habits.length === 0 ? (
            <View className="card items-center py-8">
              <Text className="text-xl mb-2">🌱</Text>
              <Text className="text-heading text-center mb-2">No habits yet!</Text>
              <Text className="text-body text-center mb-4">
                Create your first habit to start building better routines.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/screens/create_habit')}
                className="bg-indigo-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Create First Habit</Text>
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
            </View>
          )}
        </View>

        {/* AI Insights */}
        {habits.length > 0 && (
          <View className="bg-pink-50 dark:bg-pink-900/20 rounded-2xl mt-7 p-6">
            <View className="flex-row items-center mb-4">
              <Text className="text-pink-500 text-xl mr-2">🧠</Text>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</Text>
            </View>
            
            {/* Dynamic insights based on current stats */}
            {stats.completionRate < 50 && (
              <View className="flex-row items-start mb-3">
                <Text className="text-purple-500 mr-2">•</Text>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  Try to complete your habits earlier in the day for better consistency
                </Text>
              </View>
            )}

            {stats.completedToday === 0 && habits.length > 0 && (
              <View className="flex-row items-start mb-3">
                <Text className="text-purple-500 mr-2">•</Text>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  Start with your easiest habit to build momentum for today
                </Text>
              </View>
            )}

            {stats.completedToday === stats.totalHabits && stats.totalHabits > 0 && (
              <View className="flex-row items-start mb-3">
                <Text className="text-green-500 mr-2">🎉</Text>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  Amazing! You've completed all your habits today!
                </Text>
              </View>
            )}

            {habits.filter(h => h.streak > 7).length > 0 && (
              <View className="flex-row items-start">
                <Text className="text-yellow-500 mr-2">🔥</Text>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  You're on fire! Keep your streak going strong
                </Text>
              </View>
            )}

            {/* Motivational message when progress is good but not perfect */}
            {stats.completedToday > 0 && stats.completedToday < stats.totalHabits && (
              <View className="flex-row items-start">
                <Text className="text-blue-500 mr-2">💪</Text>
                <Text className="text-gray-700 dark:text-gray-300 flex-1">
                  Great progress! You can still complete {stats.totalHabits - stats.completedToday} more habit{stats.totalHabits - stats.completedToday === 1 ? '' : 's'} today
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View className="absolute bottom-24 right-6 space-y-4 z-50">
        {/* Add Habit Button */}
        <TouchableOpacity
          onPress={() => router.push('/screens/create_habit')}
          className="bg-indigo-500 p-4 rounded-full shadow-lg items-center justify-center"
          style={{ 
            elevation: 6,
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>

        {/* Ask AI Coach Button */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ai_coach')}
          className="bg-white dark:bg-zinc-900 mt-2 p-4 rounded-full shadow-lg items-center justify-center border border-indigo-500"
          style={{ 
            elevation: 6,
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;