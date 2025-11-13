// hooks/useHabits.ts - 

import { useAuth } from '@/hooks/useAuth';
import { useHabitService } from '@/hooks/useHabitService';
import {
  CreateHabitRequest,
  HabitStats,
  HabitWithCompletion,
  SyncResult,
  UpdateHabitRequest
} from '@/types/habit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateHabitStreak } from '@/utils/streakCalculation';
import { LocalCompletionRecord } from '@/types/habit';

interface UseHabitsReturn {
  habits: HabitWithCompletion[];
  stats: HabitStats;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  lastSyncResult: SyncResult | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  getAllCompletions: (userId: string, days?: number) => Promise<LocalCompletionRecord[]>;
  updateHabitCompletion: (habitId: string, count: number) => Promise<void>;
  createHabit: (habitData: CreateHabitRequest) => Promise<void>;
  updateHabit: (habitId: string, updates: UpdateHabitRequest) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  syncData: () => Promise<void>;
  clearError: () => void;
  resolveConflict: (habitId: string, resolution: 'local' | 'remote') => Promise<void>;
}

export const useHabits = (): UseHabitsReturn => {
  const { user } = useAuth();
  const habitService = useHabitService();
  
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
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  
  const isToggling = useRef(false);
  const isCreating = useRef(false);
  const isSyncing = useRef(false);
  const isLoadingData = useRef(false);
  const loadDataQueue = useRef<Promise<void> | null>(null);

  // Monitor network status
  useEffect(() => {
    const checkNetwork = () => {
      const networkStatus = habitService.getNetworkStatus();
      const wasOffline = !isOnline;
      const nowOnline = networkStatus.isConnected && networkStatus.isInternetReachable;
      setIsOnline(nowOnline);

      if (wasOffline && nowOnline && !isSyncing.current && user) {
        syncData();
      }

      checkSyncStatus();
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => clearInterval(interval);
  }, [isOnline, user]);

  const checkSyncStatus = useCallback(async () => {
    if (!user) return;

    try {
      const networkStatus = habitService.getNetworkStatus();
      const online = networkStatus.isConnected && networkStatus.isInternetReachable;
      
      setSyncStatus(online ? 'synced' : 'pending');
    } catch (error) {
      console.warn('Failed to check sync status:', error);
    }
  }, [user, habitService]);

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  const loadData = useCallback(async (isRefresh = false, silent = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (isLoadingData.current && loadDataQueue.current) {
      return loadDataQueue.current;
    }

    isLoadingData.current = true;

    const loadPromise = (async () => {
      try {
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

        await checkSyncStatus();

        if (isOnline && !isSyncing.current) {
          syncData().catch(err => console.warn('Background sync failed:', err));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load habits';
        setError(errorMessage);
        console.error('Error loading habits:', err);
      } finally {
        if (!silent) {
          setLoading(false);
          setRefreshing(false);
        }
        isLoadingData.current = false;
        loadDataQueue.current = null;
      }
    })();

    loadDataQueue.current = loadPromise;
    return loadPromise;
  }, [user, checkSyncStatus, isOnline, habitService]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
      setHabits([]);
      setStats({ totalHabits: 0, completedToday: 0, activeStreak: 0, completionRate: 0 });
    }
  }, [user]);

  // ============================================================================
  // TOGGLE HABIT - WITH OPTIMISTIC UPDATE
  // ============================================================================
  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user || isToggling.current) return;

    isToggling.current = true;

    // Store previous state for rollback
    const previousHabits = [...habits];
    const previousStats = { ...stats };

    try {
      // Find the habit
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      const currentCount = habit.completed || 0;
      const newCount = currentCount >= habit.target_count ? 0 : habit.target_count;
      const willBeCompleted = newCount >= habit.target_count;

      // STEP 1: Optimistic update - immediate UI feedback
      setHabits(prevHabits => {
        return prevHabits.map(h => {
          if (h.id !== habitId) return h;

          const newProgress = newCount / h.target_count;
          
          // Optimistically update streak if completing
          let newStreak = h.streak;
          if (willBeCompleted && currentCount < h.target_count) {
            newStreak = Math.max(h.streak, 1);
          }

          return {
            ...h,
            completed: newCount,
            progress: Math.min(newProgress, 1),
            isCompleted: willBeCompleted,
            streak: newStreak
          };
        });
      });

      // STEP 2: Update stats immediately
      setStats(prevStats => {
        const wasCompleted = habit.isCompleted;
        const deltaCompleted = wasCompleted 
          ? (willBeCompleted ? 0 : -1)
          : (willBeCompleted ? 1 : 0);

        return {
          ...prevStats,
          completedToday: prevStats.completedToday + deltaCompleted
        };
      });

      // STEP 3: Persist to database
      await habitService.toggleHabitCompletion(habitId);
      
      // STEP 4: Silently reload accurate data (includes correct streak calculation)
      await loadData(false, true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle habit';
      setError(errorMessage);
      
      // STEP 5: Rollback on error
      setHabits(previousHabits);
      setStats(previousStats);
      
      throw err;
    } finally {
      isToggling.current = false;
    }
  }, [user, habits, stats, habitService, loadData]);

  // ============================================================================
  // UPDATE HABIT COMPLETION
  // ============================================================================
  const updateHabitCompletion = useCallback(async (habitId: string, count: number) => {
    if (!user) return;

    const previousHabits = [...habits];

    try {
      // Optimistic update
      setHabits(prevHabits => {
        return prevHabits.map(h => {
          if (h.id !== habitId) return h;

          const newProgress = count / h.target_count;
          const isCompleted = count >= h.target_count;

          return {
            ...h,
            completed: count,
            progress: Math.min(newProgress, 1),
            isCompleted
          };
        });
      });

      await habitService.updateHabitCompletion(habitId, count);
      await loadData(false, true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit completion';
      setError(errorMessage);
      setHabits(previousHabits);
      throw err;
    }
  }, [user, habits, habitService, loadData]);

  // ============================================================================
  // SYNC
  // ============================================================================
  const syncData = useCallback(async () => {
    if (!user || !isOnline || isSyncing.current) return;

    isSyncing.current = true;
    setSyncStatus('syncing');

    try {
      const syncResult = await habitService.syncHabits();
      setLastSyncResult(syncResult);
      
      setSyncStatus(syncResult.success ? 'synced' : 'error');
      
      await loadData(false, true);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setLastSyncResult({
        success: false,
        synced_habits: 0,
        synced_completions: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown sync error']
      });
    } finally {
      isSyncing.current = false;
    }
  }, [user, isOnline, loadData, habitService]);

  const refetch = useCallback(() => loadData(false), [loadData]);
  const refresh = useCallback(() => loadData(true), [loadData]);

  // ============================================================================
  // CREATE HABIT
  // ============================================================================
  const createHabit = useCallback(async (habitData: CreateHabitRequest) => {
    if (!user || isCreating.current) return;

    isCreating.current = true;

    try {
      setError(null);
      await habitService.createHabit(habitData);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      throw err;
    } finally {
      isCreating.current = false;
    }
  }, [user, loadData, habitService]);

  // ============================================================================
  // UPDATE HABIT
  // ============================================================================
  const updateHabit = useCallback(async (habitId: string, updates: UpdateHabitRequest) => {
    if (!user) return;

    try {
      setError(null);
      await habitService.updateHabit(habitId, updates);
      await loadData(false, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      setError(errorMessage);
      throw err;
    }
  }, [user, loadData, habitService]);

  // ============================================================================
  // DELETE HABIT
  // ============================================================================
  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    try {
      setError(null);
      await habitService.deleteHabit(habitId);
      await loadData(false, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      throw err;
    }
  }, [user, loadData, habitService]);

  // ============================================================================
  // RESOLVE CONFLICT
  // ============================================================================
  const resolveConflict = useCallback(async (habitId: string, resolution: 'local' | 'remote') => {
    if (!user) return;

    try {
      setError(null);
      await habitService.resolveConflict(habitId, resolution);
      await loadData(false, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve conflict';
      setError(errorMessage);
      throw err;
    }
  }, [user, loadData, habitService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    habits,
    stats,
    loading,
    refreshing,
    error,
    isOnline,
    syncStatus,
    lastSyncResult,
    refetch,
    refresh,
    toggleHabit,
    updateHabitCompletion,
    createHabit,
    updateHabit,
    deleteHabit,
    syncData,
    clearError,
    resolveConflict,
    getAllCompletions: (userId: string, days?: number) => 
    habitService.getAllCompletions(userId, days)
};
};