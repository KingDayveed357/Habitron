// services/habitService.ts - CLEANED UP VERSION
import uuid from 'react-native-uuid';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/services/supabase';
import { DatabaseService } from './databaseService';
import {
  Habit,
  HabitWithCompletion,
  HabitStats,
  CreateHabitRequest,
  UpdateHabitRequest,
  LocalHabitRecord,
  LocalCompletionRecord,
  SyncResult,
  NetworkStatus
} from '@/types/habit';
import { calculateHabitStreak } from '@/utils/streakCalculation';

export class HabitService {
  private db: DatabaseService;
  private networkStatus: NetworkStatus = { isConnected: false, isInternetReachable: false };
  private networkUnsubscribe?: (() => void);

  constructor(databaseService: DatabaseService) {
    this.db = databaseService;
    this.initializeNetworkListener();
  }

  private initializeNetworkListener(): void {
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !this.networkStatus.isConnected;
      this.networkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false
      };

      if (wasOffline && this.networkStatus.isConnected) {
        this.syncHabits().catch(console.error);
      }
    });

    this.checkNetworkStatus();
  }

  private async checkNetworkStatus(): Promise<void> {
    const state = await NetInfo.fetch();
    this.networkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false
    };
  }

  private isOnline(): boolean {
    return this.networkStatus.isConnected && this.networkStatus.isInternetReachable;
  }

  public destroy(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }

  // ============================================================================
  // GET HABITS - MAIN ENTRY POINT
  // ============================================================================
  public async getHabits(): Promise<HabitWithCompletion[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const localHabits = await this.db.getHabits(userId);
      
      if (this.isOnline()) {
        this.syncHabits().catch(console.error);
      }

      return this.enrichHabitsWithCompletions(localHabits, userId);
    } catch (error) {
      console.error('Error getting habits:', error);
      throw error;
    }
  }

  /**
   * CRITICAL FIX: Enrich habits with TODAY's completion and accurate streaks
   */
  private async enrichHabitsWithCompletions(
    habits: LocalHabitRecord[], 
    userId: string
  ): Promise<HabitWithCompletion[]> {
    const today = this.getTodayDateString();
    
    // Get all completions for streak calculation (last year)
    const allCompletions = await this.db.getCompletions(userId, 365);

    return habits.map(habit => {
      // Get TODAY's completion
      const todayCompletion = allCompletions.find(
        c => c.habit_id === habit.id && c.completion_date === today
      );
      
      // Get all completions for THIS habit
      const habitCompletions = allCompletions.filter(c => c.habit_id === habit.id);
      
      // Calculate streak using the new algorithm
      const { currentStreak, longestStreak } = calculateHabitStreak(habit, habitCompletions);
      
      const completed = todayCompletion?.completed_count || 0;
      const progress = completed / habit.target_count;
      const isCompleted = completed >= habit.target_count;
      
      return {
        ...habit,
        completion: todayCompletion,
        streak: currentStreak,
        longestStreak,
        isCompleted,
        progress: Math.min(progress, 1),
        completed,
        total: habit.target_count
      };
    });
  }

  // ============================================================================
  // CREATE HABIT
  // ============================================================================
  public async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const habit: LocalHabitRecord = {
      id: uuid.v4() as string,
      user_id: userId,
      title: habitData.title,
      icon: habitData.icon,
      description: habitData.description,
      category: habitData.category,
      target_count: habitData.target_count,
      target_unit: habitData.target_unit,
      frequency_type: habitData.frequency_type || 'daily',
      frequency_count: habitData.frequency_count || null,
      frequency_days: habitData.frequency_days || null,
      bg_color: habitData.bg_color,
      is_active: true,
      created_at: now,
      updated_at: now,
      is_dirty: true,
      sync_status: 'pending'
    };

    try {
      await this.db.insertHabit(habit);

      if (this.isOnline()) {
        await this.syncSingleHabit(habit);
      }

      return habit;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  // ============================================================================
  // UPDATE HABIT
  // ============================================================================
  public async updateHabit(habitId: string, updates: UpdateHabitRequest): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const updateData: Partial<LocalHabitRecord> = {
        ...updates,
        updated_at: new Date().toISOString(),
        is_dirty: true,
        sync_status: 'pending'
      };

      await this.db.updateHabit(habitId, updateData);

      if (this.isOnline()) {
        const habits = await this.db.getHabits(userId);
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          await this.syncSingleHabit(habit);
        }
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  // ============================================================================
  // DELETE HABIT
  // ============================================================================
  public async deleteHabit(habitId: string): Promise<void> {
    try {
      await this.db.deleteHabit(habitId);

      if (this.isOnline()) {
        try {
          const { error } = await supabase
            .from('habits')
            .update({ is_active: false })
            .eq('id', habitId);

          if (error) throw error;
        } catch (syncError) {
          console.error('Error syncing habit deletion:', syncError);
        }
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // ============================================================================
  // UPDATE HABIT COMPLETION - CRITICAL FIX
  // ============================================================================
  public async updateHabitCompletion(habitId: string, count: number): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const today = this.getTodayDateString();
    const now = new Date().toISOString();

    try {
      // ALWAYS use upsert to avoid duplicate key errors
      const completion: LocalCompletionRecord = {
        id: uuid.v4() as string,
        habit_id: habitId,
        user_id: userId,
        completed_count: count,
        completion_date: today,
        created_at: now,
        updated_at: now,
        is_dirty: true,
        sync_status: 'pending'
      };

      await this.db.upsertCompletion(completion);

      // Sync in background
      if (this.isOnline()) {
        this.syncCompletions().catch(console.error);
      }
    } catch (error) {
      console.error('Error updating habit completion:', error);
      throw error;
    }
  }

  // ============================================================================
  // TOGGLE HABIT COMPLETION
  // ============================================================================
  public async toggleHabitCompletion(habitId: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const habits = await this.db.getHabits(userId);
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      const today = this.getTodayDateString();
      const existingCompletion = await this.db.getCompletionByDate(habitId, userId, today);
      
      const currentCount = existingCompletion?.completed_count || 0;
      const newCount = currentCount >= habit.target_count ? 0 : habit.target_count;

      await this.updateHabitCompletion(habitId, newCount);
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  }

  // ============================================================================
  // GET HABIT STATS
  // ============================================================================
  public async getHabitStats(): Promise<HabitStats> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const habits = await this.db.getHabits(userId);
      const today = this.getTodayDateString();
      const completions = await this.db.getCompletions(userId, 30);

      const totalHabits = habits.length;
      
      // Count completed today
      const completedToday = habits.filter(habit => {
        const todayCompletion = completions.find(
          c => c.habit_id === habit.id && c.completion_date === today
        );
        return todayCompletion && todayCompletion.completed_count >= habit.target_count;
      }).length;

      // Calculate completion rate (last 30 days)
      let totalPossible = 0;
      let totalCompleted = 0;

      for (let i = 0; i < 30; i++) {
        const checkDate = this.getDateStringDaysAgo(i);
        
        habits.forEach(habit => {
          totalPossible++;
          const completion = completions.find(
            c => c.habit_id === habit.id && c.completion_date === checkDate
          );
          if (completion && completion.completed_count >= habit.target_count) {
            totalCompleted++;
          }
        });
      }

      const completionRate = totalPossible > 0 
        ? Math.round((totalCompleted / totalPossible) * 100) 
        : 0;

      // Calculate average streak
      const allCompletions = await this.db.getCompletions(userId, 365);
      const streaks = habits.map(habit => {
        const habitCompletions = allCompletions.filter(c => c.habit_id === habit.id);
        const { currentStreak } = calculateHabitStreak(habit, habitCompletions);
        return currentStreak;
      });

      const activeStreak = streaks.length > 0 
        ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) 
        : 0;

      return {
        totalHabits,
        completedToday,
        activeStreak,
        completionRate
      };
    } catch (error) {
      console.error('Error getting habit stats:', error);
      throw error;
    }
  }

  // ============================================================================
  // PUBLIC METHODS FOR HOOKS
  // ============================================================================
  public async getHabitCompletions(
    habitId: string,
    userId: string,
    days?: number
  ): Promise<LocalCompletionRecord[]> {
    const allCompletions = await this.db.getCompletions(userId, days);
    return allCompletions.filter(c => c.habit_id === habitId);
  }

  public async getAllCompletions(
    userId: string,
    days?: number
  ): Promise<LocalCompletionRecord[]> {
    return this.db.getCompletions(userId, days);
  }

  public async getCompletionsByDateRange(
    habitId: string,
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<LocalCompletionRecord[]> {
    return this.db.getCompletionsByHabitAndDateRange(habitId, userId, startDate, endDate);
  }

  // ============================================================================
  // SYNC FUNCTIONALITY
  // ============================================================================
  public async syncHabits(): Promise<SyncResult> {
    if (!this.isOnline()) {
      return {
        success: false,
        synced_habits: 0,
        synced_completions: 0,
        conflicts: [],
        errors: ['Device is offline']
      };
    }

    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const result: SyncResult = {
      success: true,
      synced_habits: 0,
      synced_completions: 0,
      conflicts: [],
      errors: []
    };

    try {
      await this.syncHabitsToServer(result);
      await this.syncHabitsFromServer(result);
      await this.syncCompletionsToServer(result);
      await this.syncCompletionsFromServer(result);

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      return result;
    }
  }

  private async syncSingleHabit(habit: LocalHabitRecord): Promise<void> {
    try {
      const { error } = await supabase
        .from('habits')
        .upsert([{
          id: habit.id,
          user_id: habit.user_id,
          title: habit.title,
          icon: habit.icon,
          description: habit.description,
          category: habit.category,
          target_count: habit.target_count,
          target_unit: habit.target_unit,
          frequency_type: habit.frequency_type || 'daily',
          frequency_count: habit.frequency_count,
          frequency_days: habit.frequency_days,
          bg_color: habit.bg_color,
          is_active: habit.is_active,
          created_at: habit.created_at,
          updated_at: habit.updated_at
        }], { onConflict: 'id' });

      if (error) throw error;
      await this.db.markAsSynced('habits', habit.id);
    } catch (error) {
      await this.db.updateHabit(habit.id, { sync_status: 'error' });
      throw error;
    }
  }

  private async syncCompletions(): Promise<void> {
    if (!this.isOnline()) return;

    try {
      const result: SyncResult = {
        success: true,
        synced_habits: 0,
        synced_completions: 0,
        conflicts: [],
        errors: []
      };
      await this.syncCompletionsToServer(result);
      await this.syncCompletionsFromServer(result);
    } catch (error) {
      console.error('Error syncing completions:', error);
    }
  }

  private async syncHabitsToServer(result: SyncResult): Promise<void> {
    const unsyncedHabits = await this.db.getUnsynced('habits') as LocalHabitRecord[];
    
    for (const habit of unsyncedHabits) {
      try {
        await this.syncSingleHabit(habit);
        result.synced_habits++;
      } catch (error) {
        console.error(`Error syncing habit ${habit.id}:`, error);
        result.errors.push(`Failed to sync habit: ${habit.title}`);
      }
    }
  }

  private async syncHabitsFromServer(result: SyncResult): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    try {
      const lastSyncTime = await this.db.getLastSyncTime();
      
      let query = supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (lastSyncTime) {
        query = query.gt('updated_at', lastSyncTime);
      }

      const { data: serverHabits, error } = await query;
      if (error) throw error;

      if (serverHabits) {
        for (const serverHabit of serverHabits) {
          await this.db.insertHabit({
            ...serverHabit,
            sync_status: 'synced',
            is_dirty: false,
            last_synced_at: new Date().toISOString()
          });
          result.synced_habits++;
        }
      }
    } catch (error) {
      console.error('Error syncing habits from server:', error);
      throw error;
    }
  }

  private async syncCompletionsToServer(result?: SyncResult): Promise<void> {
    const unsyncedCompletions = await this.db.getUnsynced('habit_completions') as LocalCompletionRecord[];
    
    for (const completion of unsyncedCompletions) {
      try {
        const { error } = await supabase
          .from('habit_completions')
          .upsert([{
            id: completion.id,
            habit_id: completion.habit_id,
            user_id: completion.user_id,
            completed_count: completion.completed_count,
            completion_date: completion.completion_date,
            notes: completion.notes,
            created_at: completion.created_at,
            updated_at: completion.updated_at
          }], { onConflict: 'habit_id,completion_date' });

        if (error) throw error;
        await this.db.markAsSynced('habit_completions', completion.id);
        if (result) result.synced_completions++;
      } catch (error) {
        console.error(`Error syncing completion ${completion.id}:`, error);
        if (result) result.errors.push(`Failed to sync completion`);
        await this.db.updateCompletion(completion.id, { sync_status: 'error' });
      }
    }
  }

  private async syncCompletionsFromServer(result?: SyncResult): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    try {
      const lastSyncTime = await this.db.getLastSyncTime();
      
      let query = supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId);

      if (lastSyncTime) {
        query = query.gt('updated_at', lastSyncTime);
      }

      const { data: serverCompletions, error } = await query;
      if (error) throw error;

      if (serverCompletions) {
        for (const serverCompletion of serverCompletions) {
          await this.db.upsertCompletion({
            ...serverCompletion,
            sync_status: 'synced',
            is_dirty: false,
            last_synced_at: new Date().toISOString()
          });
          if (result) result.synced_completions++;
        }
      }
    } catch (error) {
      console.error('Error syncing completions from server:', error);
      throw error;
    }
  }

  public async resolveConflict(habitId: string, resolution: 'local' | 'remote'): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const habits = await this.db.getHabits(userId);
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit || !habit.conflict_data) {
        throw new Error('No conflict found for this habit');
      }

      if (resolution === 'local') {
        await this.db.updateHabit(habitId, {
          conflict_data: undefined,
          sync_status: 'pending',
          is_dirty: true
        });
        
        if (this.isOnline()) {
          await this.syncSingleHabit(habit);
        }
      } else {
        // conflict_data can be stored as a string or an object; normalize it first
        let conflict = habit.conflict_data as
          | string
          | { local_version: Partial<Habit>; remote_version: Partial<Habit>; conflicted_fields: string[]; };

        if (typeof conflict === 'string') {
          try {
            conflict = JSON.parse(conflict);
          } catch (e) {
            throw new Error('Invalid conflict_data format');
          }
        }

        const remoteVersion = (conflict as { remote_version?: Partial<Habit> }).remote_version;
        if (!remoteVersion) {
          throw new Error('No remote version available in conflict data');
        }

        await this.db.insertHabit({
          ...habit,
          ...remoteVersion,
          conflict_data: undefined,
          sync_status: 'synced',
          is_dirty: false,
          last_synced_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  private getTodayDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDateStringDaysAgo(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  public async clearAllData(): Promise<void> {
    await this.db.clearAllData();
  }
}