// // app/(tabs)/index.tsx - UPDATED WITH OFFLINE-FIRST AI INSIGHTS
// import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
// import React, { useCallback, useMemo } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router';
// import { useFocusEffect } from '@react-navigation/native';
// import HabitCard from '../components/ui/HabitCard';
// import AIInsights from '../components/AIInsights';
// import { Ionicons } from '@expo/vector-icons';
// import { useHabits } from '@/hooks/usehabits';
// import { useAuth } from '@/hooks/useAuth';
// import { useHabitService } from '@/hooks/useHabitService';

// const Home = () => {
//   const router = useRouter();
//   const { user } = useAuth();
//   const habitService = useHabitService();

//   const { 
//     habits, 
//     stats, 
//     loading, 
//     refreshing,
//     error,
//     isOnline,
//     syncStatus,
//     refresh,
//     toggleHabit,
//     clearError
//   } = useHabits();

//   // Refresh data when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       if (user && !loading) {
//         refresh();
//       }
//     }, [user, refresh, loading])
//   );

//   // Handle habit toggle with optimistic UI and error handling
//   const handleToggleHabit = useCallback(async (habitId: string) => {
//     try {
//       await toggleHabit(habitId);
//     } catch (error) {
//       Alert.alert(
//         'Error', 
//         'Failed to update habit. Please try again.',
//         [{ text: 'OK' }]
//       );
//     }
//   }, [toggleHabit]);

//   // Calculate overall progress with memoization
//   const overallProgress = useMemo(() => {
//     return stats.totalHabits > 0 ? (stats.completedToday / stats.totalHabits) : 0;
//   }, [stats.totalHabits, stats.completedToday]);

//   // Show loading state only on initial load
//   if (loading && !refreshing && habits.length === 0) {
//     return (
//       <SafeAreaView className="flex-1 app-background">
//         <View className="flex-1 justify-center items-center">
//           <Text className="text-gray-500 dark:text-gray-400">Loading your habits...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Show auth required state
//   if (!user) {
//     return (
//       <SafeAreaView className="flex-1 app-background">
//         <View className="flex-1 justify-center items-center px-6">
//           <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Habitron!</Text>
//           <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
//             Sign in to start tracking your habits and get AI coaching.
//           </Text>
//           <TouchableOpacity
//             onPress={() => router.push('/auth/signin')}
//             className="bg-indigo-500 px-8 py-3 rounded-xl"
//           >
//             <Text className="text-white font-semibold">Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 app-background" edges={['bottom']}>
//       {/* Header with Action Buttons and Sync Status - Fixed at top */}
//       <View className="px-4 pt-4 pb-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
//         <View className="flex-row justify-between items-center">
//           <View className="flex-1">
//             <Text className="text-2xl font-bold text-gray-900 dark:text-white">
//               Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
//             </Text>
//             <View className="flex-row items-center mt-1">
//               <Text className="text-gray-600 dark:text-gray-400">
//                 Keep up your great progress
//               </Text>
//               {/* Network/Sync Status Indicator */}
//               <View className="flex-row items-center ml-3">
//                 {!isOnline && (
//                   <View className="flex-row items-center">
//                     <Ionicons name="cloud-offline" size={16} color="#EF4444" />
//                     <Text className="text-red-500 text-xs ml-1">Offline</Text>
//                   </View>
//                 )}
//                 {isOnline && syncStatus === 'syncing' && (
//                   <View className="flex-row items-center">
//                     <Ionicons name="sync" size={16} color="#3B82F6" />
//                     <Text className="text-blue-500 text-xs ml-1">Syncing...</Text>
//                   </View>
//                 )}
//               </View>
//             </View>
//           </View>
          
//           {/* Action Buttons Row */}
//           <View className="flex-row gap-3">
//             {/* AI Coach Button */}
//             <TouchableOpacity
//               onPress={() => router.push('/(tabs)/ai_coach')}
//               className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl items-center justify-center"
//               activeOpacity={0.8}
//             >
//               <Ionicons name="sparkles" size={20} color="#4F46E5" />
//             </TouchableOpacity>

//             {/* Add Habit Button */}
//             <TouchableOpacity
//               onPress={() => router.push('/screens/create_habit')}
//               className="bg-indigo-500 p-3 rounded-xl items-center justify-center"
//               activeOpacity={0.8}
//             >
//               <Ionicons name="add" size={20} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       <ScrollView 
//         className="flex-1 px-4"
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 30, paddingTop: 16 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={refresh}
//             colors={['#4F46E5']}
//             tintColor="#4F46E5"
//           />
//         }
//       >
//         {/* Progress Card */}
//         <View className="card mb-6">
//           <View className='flex flex-row justify-between items-start'>
//             <View className="flex-1">
//               <Text className="text-heading">Today's Progress</Text>
//               <Text className="text-body mb-4">
//                 {stats.completedToday} of {stats.totalHabits} habits completed
//               </Text>
//             </View>
//             <Text className="text-heading text-2xl font-bold">
//               {Math.round(overallProgress * 100)}%
//             </Text>
//           </View>
          
//           {/* Progress Bar */}
//           <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
//             <View 
//               className="bg-indigo-500 rounded-full h-3 " 
//               style={{ width: `${overallProgress * 100}%` }}
//             />
//           </View>
          
//           {/* Weekly stats */}
//           {stats.completionRate > 0 && (
//             <Text className="text-body text-sm">
//               Weekly completion rate: {stats.completionRate}%
//             </Text>
//           )}
//         </View>

//         {/* 🆕 AI Insights - Entry Point with Offline-First Data */}
//         {habits.length > 0 && (
//           <View className="mb-6">
//             <AIInsights 
//               maxInsights={3}
//               showHeader={true}
//               compact={false}
//               autoLoad={true}
//             />
//           </View>
//         )}

//         {/* Today's Habits Section */}
//         <View>
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-heading">Today's Habits</Text>
//             {habits.length > 0 && (
//               <Text className="text-sm text-gray-500 dark:text-gray-400">
//                 Tap to view details
//               </Text>
//             )}
//           </View>
          
//           {habits.length === 0 ? (
//             <View className="card items-center py-8">
//               <Text className="text-4xl mb-4">🌱</Text>
//               <Text className="text-heading text-center mb-2">Ready to build great habits?</Text>
//               <Text className="text-body text-center mb-6">
//                 Create your first habit to start building better routines and get AI coaching.
//               </Text>
//               <TouchableOpacity
//                 onPress={() => router.push('/screens/create_habit')}
//                 className="bg-indigo-500 px-8 py-3 rounded-xl flex-row items-center"
//               >
//                 <Ionicons name="add" size={18} color="white" />
//                 <Text className="text-white font-semibold ml-2">Create First Habit</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View>
//               {habits.map((habit, index) => (
//                 <HabitCard
//                   key={habit.id}
//                   habit={habit}
//                   onToggle={() => handleToggleHabit(habit.id)}
//                   isLast={index === habits.length - 1}
//                 />
//               ))}
              
//               {/* Quick Add Button at bottom of habits list */}
//               <TouchableOpacity
//                 onPress={() => router.push('/screens/create_habit')}
//                 className="mt-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl items-center justify-center"
//                 activeOpacity={0.7}
//               >
//                 <View className="flex-row items-center">
//                   <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
//                   <Text className="text-gray-600 dark:text-gray-400 font-medium ml-2">
//                     Add another habit
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Home;


// app/(tabs)/index.tsx - CLEAN, FOCUSED, ACTION-FIRST HOME SCREEN
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList, Platform } from 'react-native';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { MotiView } from 'moti';

import HabitCard from '../components/ui/HabitCard';
import { useHabits } from '@/hooks/usehabits';
import { useAuth } from '@/hooks/useAuth';
import type { HabitWithCompletion } from '@/types/habit';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Home = () => {
  const router = useRouter();
  const { user } = useAuth();
  const lastFetchTimestamp = useRef<number>(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const progressValue = useSharedValue(0);

  const { 
    habits, 
    stats, 
    loading, 
    refreshing,
    error,
    isOnline,
    syncStatus,
    refresh,
    toggleHabit,
  } = useHabits();

  // 🎯 Smart refresh - only fetch if data is stale (>30 seconds)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimestamp.current;
      
      if (user && (timeSinceLastFetch > 30000 || habits.length === 0)) {
        lastFetchTimestamp.current = now;
        refresh();
      }
    }, [user, refresh, habits.length])
  );

  // Animate progress bar
  useEffect(() => {
    const targetProgress = stats.totalHabits > 0 
      ? stats.completedToday / stats.totalHabits 
      : 0;
    
    progressValue.value = withSpring(targetProgress, {
      damping: 15,
      stiffness: 100
    });
  }, [stats.completedToday, stats.totalHabits]);

  // 🎯 Optimized habit toggle with haptics & animation
  const handleToggleHabit = useCallback(async (habitId: string) => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const habit = habits.find(h => h.id === habitId);
      const wasCompleted = habit?.isCompleted;
      
      await toggleHabit(habitId);
      
      if (!wasCompleted && habit) {
        setShowStreakAnimation(true);
        setTimeout(() => setShowStreakAnimation(false), 2000);
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  }, [toggleHabit, habits]);

  // 📊 Overall progress percentage
  const overallProgress = useMemo(() => {
    return stats.totalHabits > 0 ? (stats.completedToday / stats.totalHabits) : 0;
  }, [stats.totalHabits, stats.completedToday]);

  // 🎨 Progress bar animated style
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    )}%`
  }));

  // 🔄 Sync status indicator
  const SyncStatusIndicator = useCallback(() => {
    if (!isOnline) {
      return (
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
          <Text className="text-yellow-700 dark:text-yellow-400 text-xs font-medium">
            Offline
          </Text>
        </View>
      );
    }

    if (syncStatus === 'syncing') {
      return (
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: 1.3 }}
            transition={{ type: 'timing', duration: 800, loop: true }}
          >
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          </MotiView>
          <Text className="text-blue-700 dark:text-blue-400 text-xs font-medium">
            Syncing
          </Text>
        </View>
      );
    }

    return null;
  }, [isOnline, syncStatus]);

  // 🎯 Memoized habit list render
  const renderHabitItem = useCallback(({ item, index }: { item: HabitWithCompletion; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 40 }}
      key={item.id}
    >
      <HabitCard
        habit={item}
        onToggle={handleToggleHabit}
        isLast={index === habits.length - 1}
      />
    </MotiView>
  ), [handleToggleHabit, habits.length]);

  const keyExtractor = useCallback((item: HabitWithCompletion) => item.id, []);

  // 🎬 Streak animation overlay
  const StreakAnimation = () => (
    showStreakAnimation && (
      <Animated.View 
        entering={FadeIn.duration(300)}
        className="absolute top-20 left-0 right-0 items-center z-50"
      >
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="bg-orange-500 px-6 py-3 rounded-full shadow-lg"
        >
          <Text className="text-white font-bold text-lg">
            🔥 Streak!
          </Text>
        </MotiView>
      </Animated.View>
    )
  );

  // 🚫 Loading state
  if (loading && !refreshing && habits.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <View className="flex-1 justify-center items-center px-6">
          <MotiView
            from={{ rotate: '0deg', scale: 1 }}
            animate={{ rotate: '360deg', scale: 1.1 }}
            transition={{ 
              type: 'timing', 
              duration: 1000, 
              loop: true,
              repeatReverse: false
            }}
            className="mb-6"
          >
            <View className="w-16 h-16 rounded-full items-center justify-center" 
              style={{ backgroundColor: '#6366F1' }}>
              <Ionicons name="flash" size={32} color="white" />
            </View>
          </MotiView>
          <Text className="text-gray-900 dark:text-white text-lg font-semibold mb-2">
            Loading Habitron
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Getting your habits ready...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 🔒 Auth required
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-5xl mb-4">⚡</Text>
          <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
            Welcome to Habitron
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-8 px-4">
            AI-powered habit tracking. Sign in to get started.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signin')}
            className="px-8 py-4 rounded-xl shadow-lg"
            style={{ backgroundColor: '#6366F1' }}
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['bottom']}>
      <StreakAnimation />

      {/* ✨ CLEAN HEADER */}
      <View className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-gray-800">
        <View className="px-4 pt-3 pb-4">
          {/* Header Row */}
          <View className="flex-row justify-between items-center mb-4">
            {/* Logo + Status */}
            <View className="flex-row items-center flex-1">
              <View className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#6366F1' }}>
                <Ionicons name="flash" size={18} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Habitron
                </Text>
                <SyncStatusIndicator />
              </View>
            </View>
            
            {/* Action Buttons */}
            <View className="flex-row gap-2">
              {/* Refresh Button */}
              <TouchableOpacity
                onPress={refresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center"
                activeOpacity={0.7}
              >
                <MotiView
                  animate={{ rotate: refreshing ? '360deg' : '0deg' }}
                  transition={{ type: 'timing', duration: 1000, loop: refreshing }}
                >
                  <Ionicons 
                    name="refresh" 
                    size={18} 
                    color="#6B7280"
                  />
                </MotiView>
              </TouchableOpacity>

              {/* AI Coach Button */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/ai_coach')}
                className="p-2.5 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#8B5CF6' }}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={18} color="white" />
              </TouchableOpacity>

              {/* Add Habit Button */}
              <TouchableOpacity
                onPress={() => router.push('/screens/create_habit')}
                className="p-2.5 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#6366F1' }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 📊 Progress Summary - Compact */}
          {habits.length > 0 && (
            <View className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-3.5 border border-indigo-100 dark:border-indigo-900/50">
              <View className="flex-row justify-between items-center mb-2.5">
                <View>
                  <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                    Today's Progress
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                    {stats.completedToday} of {stats.totalHabits} habits completed
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(overallProgress * 100)}%
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <Animated.View 
                  className="rounded-full h-2"
                  style={[
                    progressBarStyle,
                    { backgroundColor: '#6366F1' }
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 📜 SCROLLABLE CONTENT */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
      >
        {/* 📋 Habits List */}
        <View className="px-4 mt-4">
          {/* Section Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Habits
            </Text>
            {habits.length > 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Tap to view details
              </Text>
            )}
          </View>
          
          {habits.length === 0 ? (
            // Empty state
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 items-center border border-gray-100 dark:border-gray-800"
            >
              <Text className="text-5xl mb-4">🌱</Text>
              <Text className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">
                Start Your Journey
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm px-4">
                Create your first habit and build consistency with AI coaching.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/screens/create_habit')}
                className="px-8 py-3.5 rounded-xl flex-row items-center shadow-md"
                style={{ backgroundColor: '#6366F1' }}
              >
                <Ionicons name="add" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Create First Habit</Text>
              </TouchableOpacity>
            </MotiView>
          ) : (
            <FlatList
              data={habits}
              renderItem={renderHabitItem}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={10}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          )}
        </View>

    
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;