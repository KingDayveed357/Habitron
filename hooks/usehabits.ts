// hooks/useHabits.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HabitWithCompletion, 
  HabitStats, 
  CreateHabitRequest, 
  UpdateHabitRequest,
  SyncResult
} from '@/types/habit';
import { useAuth } from '@/hooks/useAuth';
import { useHabitService } from '@/hooks/useHabitService';

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
  
  // Keep track of ongoing operations to prevent unnecessary loading states
  const isToggling = useRef(false);
  const isCreating = useRef(false);
  const isSyncing = useRef(false);

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

    // Check initially and set up interval for network status updates
    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline, user, habitService]);

  // Check if there are items pending sync
  const checkSyncStatus = useCallback(async () => {
    if (!user) return;

    try {
      const networkStatus = habitService.getNetworkStatus();
      const online = networkStatus.isConnected && networkStatus.isInternetReachable;
      
      if (online) {
        // Check if we have pending changes - this is a simplified check
        // In a more advanced implementation, you could check the database for dirty records
        setSyncStatus('synced');
      } else {
        setSyncStatus('pending');
      }
    } catch (error) {
      console.warn('Failed to check sync status:', error);
    }
  }, [user, habitService]);

  // Load data from habit service
  const loadData = useCallback(async (isRefresh = false, silent = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

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
    }
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
  }, [user, loadData]);

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
      
      // Reload data to get updated state
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
      
      // Reload data to get updated state
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
      
      // Reload data to show the new habit
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
      
      // Reload data to get updated state
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
      
      // Reload data to reflect the deletion
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
      
      // Reload data to reflect the resolution
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