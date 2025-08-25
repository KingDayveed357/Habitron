// hooks/useHabits.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { habitService } from '@/services/habitService';
import { HabitWithCompletion, HabitStats, CreateHabitRequest, UpdateHabitRequest } from '@/types/habit';
import { useAuth } from '@/hooks/useAuth';

interface UseHabitsReturn {
  habits: HabitWithCompletion[];
  stats: HabitStats;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  // Actions
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  updateHabitCompletion: (habitId: string, count: number) => Promise<void>;
  createHabit: (habitData: CreateHabitRequest) => Promise<void>;
  updateHabit: (habitId: string, updates: UpdateHabitRequest) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  clearError: () => void;
}

export const useHabits = (): UseHabitsReturn => {
  const { user } = useAuth();
  
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    totalHabits: 0,
    completedToday: 0,
    activeStreak: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of ongoing operations to prevent unnecessary loading states
  const isToggling = useRef(false);
  const isCreating = useRef(false);

  // Optimistically update stats when habits change
  const updateStatsFromHabits = useCallback((updatedHabits: HabitWithCompletion[]) => {
    const totalHabits = updatedHabits.length;
    const completedToday = updatedHabits.filter(h => h.isCompleted).length;
    
    setStats(prevStats => ({
      ...prevStats,
      totalHabits,
      completedToday
    }));
  }, []);

  // Load habits and stats
  const loadData = useCallback(async (isRefresh = false, silent = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Only show loading indicators if not a silent refresh
      if (!silent) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      }
      
      setError(null);
      
      const [habitsData, statsData] = await Promise.all([
        habitService.getHabits(),
        habitService.getHabitStats()
      ]);
      
      setHabits(habitsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load habits';
      setError(errorMessage);
      console.error('Error loading habits:', err);
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  // Refetch data
  const refetch = useCallback(() => loadData(false), [loadData]);

  // Refresh data (pull to refresh)
  const refresh = useCallback(() => loadData(true), [loadData]);

  // Toggle habit completion with optimistic updates
  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user || isToggling.current) return;

    // Find the habit to toggle
    const habitToToggle = habits.find(h => h.id === habitId);
    if (!habitToToggle) return;

    isToggling.current = true;

    try {
      // Optimistic update
      const updatedHabits = habits.map(habit => 
        habit.id === habitId 
          ? { 
              ...habit, 
              isCompleted: !habit.isCompleted,
              completed: habit.isCompleted ? 0 : habit.total,
              progress: habit.isCompleted ? 0 : 1.0
            }
          : habit
      );
      
      setHabits(updatedHabits);
      updateStatsFromHabits(updatedHabits);

      // Make API call
      await habitService.toggleHabitCompletion(habitId);
      
      // Silent refresh to get accurate streaks and counts without showing loading
      await loadData(false, true);
    } catch (err) {
      // Revert optimistic update on error
      await loadData(false, true);
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle habit';
      setError(errorMessage);
      throw err;
    } finally {
      isToggling.current = false;
    }
  }, [habits, user, loadData, updateStatsFromHabits]);

  // Update habit completion count
  const updateHabitCompletion = useCallback(async (habitId: string, count: number) => {
    if (!user) return;

    try {
      // Optimistic update
      const updatedHabits = habits.map(habit => 
        habit.id === habitId 
          ? { 
              ...habit, 
              completed: count,
              progress: Math.min(count / habit.total, 1),
              isCompleted: count >= habit.total
            }
          : habit
      );
      
      setHabits(updatedHabits);
      updateStatsFromHabits(updatedHabits);

      await habitService.updateHabitCompletion(habitId, count);
      
      // Silent refresh for accurate stats
      await loadData(false, true);
    } catch (err) {
      // Revert optimistic update on error
      await loadData(false, true);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit completion';
      setError(errorMessage);
      throw err;
    }
  }, [habits, user, loadData, updateStatsFromHabits]);

  // Create new habit
  const createHabit = useCallback(async (habitData: CreateHabitRequest) => {
    if (!user || isCreating.current) return;

    isCreating.current = true;

    try {
      setError(null);
      await habitService.createHabit(habitData);
      // Refresh the list to show the new habit
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      throw err;
    } finally {
      isCreating.current = false;
    }
  }, [user, loadData]);

  // Update existing habit
  const updateHabit = useCallback(async (habitId: string, updates: UpdateHabitRequest) => {
    if (!user) return;

    try {
      setError(null);
      
      // Optimistic update for immediate feedback
      const updatedHabits = habits.map(habit =>
        habit.id === habitId ? { ...habit, ...updates } : habit
      );
      setHabits(updatedHabits);

      await habitService.updateHabit(habitId, updates);
      
      // Silent refresh to ensure data consistency
      await loadData(false, true);
    } catch (err) {
      // Revert optimistic update on error
      await loadData(false, true);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      setError(errorMessage);
      throw err;
    }
  }, [user, loadData, habits]);

  // Delete habit
  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    try {
      setError(null);
      
      // Optimistic update - remove from UI immediately
      const updatedHabits = habits.filter(habit => habit.id !== habitId);
      setHabits(updatedHabits);
      updateStatsFromHabits(updatedHabits);

      await habitService.deleteHabit(habitId);
      
      // Silent refresh to ensure data consistency
      await loadData(false, true);
    } catch (err) {
      // Revert optimistic update on error
      await loadData(false, true);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      throw err;
    }
  }, [user, loadData, habits, updateStatsFromHabits]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    habits,
    stats,
    loading,
    refreshing,
    error,
    refetch,
    refresh,
    toggleHabit,
    updateHabitCompletion,
    createHabit,
    updateHabit,
    deleteHabit,
    clearError
  };
};