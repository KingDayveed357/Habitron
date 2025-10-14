// app/screens/habit-details.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';

import { useHabits } from '@/hooks/usehabits';
import { HabitWithCompletion, UpdateHabitRequest } from '@/types/habit';
import { HabitDetailsHeader } from '../components/habit-details/Header';
import { HabitDetailsTabNav } from '../components/habit-details/TabNav';
import { HabitHeroCard } from '../components/habit-details/HeroCard';
import { OverviewTab } from '../components/habit-details/OverviewTab';
import { CalendarTab } from '../components/habit-details/CalendarTab';
import { StatsTab } from '../components/habit-details/StatsTab';
import { EditHabitModal } from '../components/modal/EditHabit';
import { LoadingState, EmptyState } from '../components/habit-details/StateViews';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useHabitStatistics } from '@/hooks/useHabitStatistics';

type TabType = 'overview' | 'calendar' | 'stats';

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

  const [habit, setHabit] = useState<HabitWithCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<UpdateHabitRequest>({});
  const [updating, setUpdating] = useState(false);
  const [todayProgress, setTodayProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Custom hooks for data management
  const { calendarData, currentMonth, navigateMonth } = useCalendarData(habit);
  const statistics = useHabitStatistics(habit, calendarData);

  // Load habit data
  useEffect(() => {
    if (habitsLoading) return;

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
          frequency_type: foundHabit.frequency_type,
          frequency_count: foundHabit.frequency_count,
          frequency_days: foundHabit.frequency_days,
          bg_color: foundHabit.bg_color
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading habit data:', error);
      setLoading(false);
    }
  }, [habits, habitsLoading, id]);

  // Handle progress updates
  const handleProgressUpdate = async (increment: number) => {
    if (!habit || isUpdatingProgress) return;

    const newProgress = Math.min(Math.max(0, todayProgress + increment), habit.target_count);
    if (newProgress === todayProgress) return;

    setIsUpdatingProgress(true);
    const previousProgress = todayProgress;
    setTodayProgress(newProgress);

    try {
      await updateHabitCompletion(habit.id, newProgress);
      await refetch();
      
      const updatedHabit = habits.find(h => h.id === habit.id);
      if (updatedHabit) setHabit(updatedHabit);
    } catch (error) {
      console.error('Error updating progress:', error);
      setTodayProgress(previousProgress);
      
      let errorMessage = 'Failed to update progress. Please try again.';
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        errorMessage = 'Progress already recorded for today. Refreshing...';
        setTimeout(async () => {
          await refetch();
          const refreshedHabit = habits.find(h => h.id === habit.id);
          if (refreshedHabit) setTodayProgress(refreshedHabit.completed);
        }, 1000);
      }
      
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Handle habit editing
  const handleSaveEdit = async (editingHabit: UpdateHabitRequest) => {
    if (!habit || !editingHabit.title?.trim()) return;

    setUpdating(true);
    try {
      await updateHabit(habit.id, editingHabit);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Habit updated successfully!');
      await refetch(); // Refresh data
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    } finally {
      setUpdating(false);
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

  if (loading || habitsLoading) {
    return <LoadingState onBack={() => router.back()} />;
  }

  if (!habit) {
    return <EmptyState onBack={() => router.back()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      <HabitDetailsHeader
        title={habit.title}
        onBack={() => router.back()}
        onEdit={() => setIsEditModalVisible(true)}
        onDelete={handleDeleteHabit}
      />

      <HabitDetailsTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HabitHeroCard
          habit={habit}
          statistics={statistics}
        />

        {activeTab === 'overview' && (
          <OverviewTab
            habit={habit}
            todayProgress={todayProgress}
            isUpdatingProgress={isUpdatingProgress}
            statistics={statistics}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            habit={habit}
            calendarData={calendarData}
            currentMonth={currentMonth}
            onNavigateMonth={navigateMonth}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            statistics={statistics}
          />
        )}
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

export default HabitDetails;