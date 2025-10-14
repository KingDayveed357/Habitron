// hooks/useHabits.ts
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

interface UseHabitsReturn {
  habits: HabitWithCompletion[];
  stats: HabitStats;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  lastSyncResult: SyncResult | null;
  // Actions
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
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
  
  // Keep track of ongoing operations to prevent race conditions
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

      // Auto-sync when coming back online
      if (wasOffline && nowOnline && !isSyncing.current && user) {
        syncData();
      }

      // Check for pending sync items
      checkSyncStatus();
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline, user]);

  // Check if there are items pending sync
  const checkSyncStatus = useCallback(async () => {
    if (!user) return;

    try {
      const networkStatus = habitService.getNetworkStatus();
      const online = networkStatus.isConnected && networkStatus.isInternetReachable;
      
      if (online) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('pending');
      }
    } catch (error) {
      console.warn('Failed to check sync status:', error);
    }
  }, [user, habitService]);

  // Load data with proper queue management
  const loadData = useCallback(async (isRefresh = false, silent = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    // If already loading, return the existing promise to prevent race conditions
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
        
        // Load from habit service
        const [habitsData, statsData] = await Promise.all([
          habitService.getHabits(),
          habitService.getHabitStats()
        ]);
        
        setHabits(habitsData);
        setStats(statsData);

        // Check sync status
        await checkSyncStatus();

        // Try to sync with server if online (but don't block UI)
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

  // Initial load and user change effect
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
      setHabits([]);
      setStats({ totalHabits: 0, completedToday: 0, activeStreak: 0, completionRate: 0 });
    }
  }, [user]);

  // Sync with server
  const syncData = useCallback(async () => {
    if (!user || !isOnline || isSyncing.current) return;

    isSyncing.current = true;
    setSyncStatus('syncing');

    try {
      const syncResult = await habitService.syncHabits();
      setLastSyncResult(syncResult);
      
      if (syncResult.success) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
      
      // Reload data after sync
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

  // Refetch data
  const refetch = useCallback(() => loadData(false), [loadData]);

  // Refresh data (pull to refresh)
  const refresh = useCallback(() => loadData(true), [loadData]);

  // Toggle habit completion
  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user || isToggling.current) return;

    isToggling.current = true;

    try {
      await habitService.toggleHabitCompletion(habitId);
      await loadData(false, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle habit';
      setError(errorMessage);
      throw err;
    } finally {
      isToggling.current = false;
    }
  }, [user, loadData, habitService]);

  // Update habit completion count
  const updateHabitCompletion = useCallback(async (habitId: string, count: number) => {
    if (!user) return;

    try {
      await habitService.updateHabitCompletion(habitId, count);
      await loadData(false, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit completion';
      setError(errorMessage);
      throw err;
    }
  }, [user, loadData, habitService]);

  // Create new habit
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

  // Update existing habit
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

  // Delete habit
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

  // Resolve conflict
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
    resolveConflict
  };
};