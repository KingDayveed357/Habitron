// services/habitService.ts
import uuid from 'react-native-uuid';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/services/supabase';
import { DatabaseService } from './databaseService';
import {
  Habit,
  HabitCompletion,
  HabitWithCompletion,
  HabitStats,
  CreateHabitRequest,
  UpdateHabitRequest,
  LocalHabitRecord,
  LocalCompletionRecord,
  SyncResult,
  NetworkStatus
} from '@/types/habit';

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

      // Auto-sync when coming back online
      if (wasOffline && this.networkStatus.isConnected) {
        this.syncHabits().catch(console.error);
      }
    });

    // Initial network check
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

  // Get habits with offline-first approach
  public async getHabits(): Promise<HabitWithCompletion[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Always get from local DB first
      const localHabits = await this.db.getHabits(userId);
      
      // Try to sync if online (but don't wait for it)
      if (this.isOnline()) {
        this.syncHabits().catch(console.error);
      }

      // Get today's completions and calculate streaks
      return this.enrichHabitsWithCompletions(localHabits, userId);
    } catch (error) {
      console.error('Error getting habits:', error);
      throw error;
    }
  }

  private async enrichHabitsWithCompletions(
    habits: LocalHabitRecord[], 
    userId: string
  ): Promise<HabitWithCompletion[]> {
    const today = new Date().toISOString().split('T')[0];
    const completions = await this.db.getCompletions(userId, 365); // Last year for streak calculation

    return habits.map(habit => {
      const todayCompletion = completions.find(
        c => c.habit_id === habit.id && c.completion_date === today
      );
      
      const streak = this.calculateStreak(habit.id, completions);
      const completed = todayCompletion?.completed_count || 0;
      const progress = Math.min(completed / habit.target_count, 1);
      
      return {
        ...habit,
        completion: todayCompletion,
        streak,
        isCompleted: completed >= habit.target_count,
        progress,
        completed,
        total: habit.target_count
      };
    });
  }

  private calculateStreak(habitId: string, completions: LocalCompletionRecord[]): number {
    const habitCompletions = completions
      .filter(c => c.habit_id === habitId)
      .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime());

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    for (const completion of habitCompletions) {
      const completionDate = new Date(completion.completion_date);
      const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0 || daysDiff === 1) {
        if (completion.completed_count > 0) {
          streak++;
          currentDate = new Date(completionDate);
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  // Create habit (offline-first)
public async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
  const userId = await this.getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const now = new Date().toISOString();
  
  // FIX: Ensure frequency_type always has a valid value
  const habit: LocalHabitRecord = {
    id: uuid.v4() as string,
    user_id: userId,
    title: habitData.title,
    icon: habitData.icon,
    description: habitData.description,
    category: habitData.category,
    target_count: habitData.target_count,
    target_unit: habitData.target_unit,
    // FIX: Use nullish coalescing to ensure frequency_type is never null/undefined
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
    // Save to local DB immediately
    await this.db.insertHabit(habit);

    // Try to sync if online
    if (this.isOnline()) {
      await this.syncSingleHabit(habit);
    }

    return habit;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
}


  // Update habit (offline-first)
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

      // Update local DB immediately
      await this.db.updateHabit(habitId, updateData);

      // Try to sync if online
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

  // Delete habit (offline-first)
  public async deleteHabit(habitId: string): Promise<void> {
    try {
      // Soft delete locally
      await this.db.deleteHabit(habitId);

      // Try to sync if online
      if (this.isOnline()) {
        try {
          const { error } = await supabase
            .from('habits')
            .update({ is_active: false })
            .eq('id', habitId);

          if (error) throw error;
        } catch (syncError) {
          console.error('Error syncing habit deletion:', syncError);
          // Keep local deletion even if sync fails
        }
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Update habit completion (offline-first)
  public async updateHabitCompletion(habitId: string, count: number): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      // Check if completion exists for today
      const existingCompletion = await this.db.getCompletionByDate(habitId, userId, today);

      if (existingCompletion) {
        // Update existing completion
        await this.db.updateCompletion(existingCompletion.id, {
          completed_count: count,
          updated_at: now,
          is_dirty: true,
          sync_status: 'pending'
        });
      } else {
        // Create new completion
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
        
        // Use upsert to handle any race conditions
        await this.db.upsertCompletion(completion);
      }

      // Try to sync if online
      if (this.isOnline()) {
        await this.syncCompletions();
      }
    } catch (error) {
      console.error('Error updating habit completion:', error);
      throw error;
    }
  }

  // Toggle habit completion (convenience method)
  public async toggleHabitCompletion(habitId: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const habits = await this.db.getHabits(userId);
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      const existingCompletion = await this.db.getTodayCompletion(habitId, userId);
      const currentCount = existingCompletion?.completed_count || 0;
      const newCount = currentCount >= habit.target_count ? 0 : habit.target_count;

      await this.updateHabitCompletion(habitId, newCount);
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  }

  // Get habit statistics
  public async getHabitStats(): Promise<HabitStats> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const habits = await this.db.getHabits(userId);
      const today = new Date().toISOString().split('T')[0];
      const completions = await this.db.getCompletions(userId, 30); // Last 30 days

      const totalHabits = habits.length;
      const todayCompletions = completions.filter(c => c.completion_date === today);
      const completedToday = todayCompletions.filter(c => {
        const habit = habits.find(h => h.id === c.habit_id);
        return habit && c.completed_count >= habit.target_count;
      }).length;

      // Calculate overall completion rate (last 30 days)
      const last30Days: string[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
      }

      let totalPossible = 0;
      let totalCompleted = 0;

      habits.forEach(habit => {
        last30Days.forEach((date: string) => {
          const completion = completions.find(c => 
            c.habit_id === habit.id && c.completion_date === date
          );
          totalPossible++;
          if (completion && completion.completed_count >= habit.target_count) {
            totalCompleted++;
          }
        });
      });

      const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

      // Calculate active streak (average across all habits)
      const streaks = habits.map(habit => this.calculateStreak(habit.id, completions));
      const activeStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0;

      return {
        totalHabits,
        completedToday,
        activeStreak,
        completionRate: Math.round(completionRate)
      };
    } catch (error) {
      console.error('Error getting habit stats:', error);
      throw error;
    }
  }

  // SYNC FUNCTIONALITY
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
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result: SyncResult = {
      success: true,
      synced_habits: 0,
      synced_completions: 0,
      conflicts: [],
      errors: []
    };

    try {
      // Sync habits
      await this.syncHabitsToServer(result);
      await this.syncHabitsFromServer(result);

      // Sync completions
      await this.syncCompletionsToServer(result);
      await this.syncCompletionsFromServer(result);

      console.log('Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      return result;
    }
  }

private async syncHabitsToServer(result: SyncResult): Promise<void> {
  const unsyncedHabits = await this.db.getUnsynced('habits') as LocalHabitRecord[];
  
  for (const habit of unsyncedHabits) {
    try {
      const habitData = {
        id: habit.id,
        user_id: habit.user_id,
        title: habit.title,
        icon: habit.icon,
        description: habit.description,
        category: habit.category,
        target_count: habit.target_count,
        target_unit: habit.target_unit,
        // FIX: Ensure frequency_type is never null when syncing
        frequency_type: habit.frequency_type || 'daily',
        frequency_count: habit.frequency_count,
        frequency_days: habit.frequency_days,
        bg_color: habit.bg_color,
        is_active: habit.is_active,
        created_at: habit.created_at,
        updated_at: habit.updated_at
      };

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('habits')
        .upsert([habitData], {
          onConflict: 'id'
        });

      if (error) throw error;

      // Mark as synced
      await this.db.markAsSynced('habits', habit.id);
      result.synced_habits++;
    } catch (error) {
      console.error(`Error syncing habit ${habit.id}:`, error);
      result.errors.push(`Failed to sync habit: ${habit.title}`);
      // Mark as error
      await this.db.updateHabit(habit.id, { sync_status: 'error' });
    }
  }
}

private async syncSingleHabit(habit: LocalHabitRecord): Promise<void> {
  try {
    const habitData = {
      id: habit.id,
      user_id: habit.user_id,
      title: habit.title,
      icon: habit.icon,
      description: habit.description,
      category: habit.category,
      target_count: habit.target_count,
      target_unit: habit.target_unit,
      // FIX: Ensure frequency_type is never null when syncing
      frequency_type: habit.frequency_type || 'daily',
      frequency_count: habit.frequency_count,
      frequency_days: habit.frequency_days,
      bg_color: habit.bg_color,
      is_active: habit.is_active,
      created_at: habit.created_at,
      updated_at: habit.updated_at
    };

    // Use upsert instead of complex insert/update logic
    const { error } = await supabase
      .from('habits')
      .upsert([habitData], {
        onConflict: 'id'
      });

    if (error) throw error;

    // Mark as synced
    await this.db.markAsSynced('habits', habit.id);
  } catch (error) {
    // Mark as error
    await this.db.updateHabit(habit.id, { sync_status: 'error' });
    throw error;
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
          const localHabits = await this.db.getHabits(userId);
          const localHabit = localHabits.find(h => h.id === serverHabit.id);

          if (!localHabit) {
            // New habit from server
            await this.db.insertHabit({
              ...serverHabit,
              sync_status: 'synced',
              is_dirty: false,
              last_synced_at: new Date().toISOString()
            });
            result.synced_habits++;
          } else if (new Date(serverHabit.updated_at) > new Date(localHabit.updated_at)) {
            // Server version is newer
            const conflictedFields = this.findConflictedFields(localHabit, serverHabit);
            
            if (localHabit.is_dirty && conflictedFields.length > 0) {
              // Conflict detected
              await this.db.updateHabit(localHabit.id, {
                conflict: true,
                conflict_data: {
                  local_version: localHabit,
                  remote_version: serverHabit,
                  conflicted_fields: conflictedFields
                },
                sync_status: 'conflict'
              });
              result.conflicts.push(localHabit);
            } else {
              // Update local with server version
              await this.db.insertHabit({
                ...serverHabit,
                sync_status: 'synced',
                is_dirty: false,
                last_synced_at: new Date().toISOString()
              });
              result.synced_habits++;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error syncing habits from server:', error);
      throw error;
    }
  }

  private async syncCompletions(): Promise<void> {
    if (!this.isOnline()) return;

    try {
      await this.syncCompletionsToServer();
      await this.syncCompletionsFromServer();
    } catch (error) {
      console.error('Error syncing completions:', error);
    }
  }

  private async syncCompletionsToServer(result?: SyncResult): Promise<void> {
    const unsyncedCompletions = await this.db.getUnsynced('habit_completions') as LocalCompletionRecord[];
    
    for (const completion of unsyncedCompletions) {
      try {
        const completionData = {
          id: completion.id,
          habit_id: completion.habit_id,
          user_id: completion.user_id,
          completed_count: completion.completed_count,
          completion_date: completion.completion_date,
          notes: completion.notes,
          created_at: completion.created_at,
          updated_at: completion.updated_at
        };

        // Use upsert with the unique constraint fields
        const { error } = await supabase
          .from('habit_completions')
          .upsert([completionData], {
            onConflict: 'habit_id,completion_date'
          });

        if (error) throw error;

        // Mark as synced
        await this.db.markAsSynced('habit_completions', completion.id);
        if (result) result.synced_completions++;
      } catch (error) {
        console.error(`Error syncing completion ${completion.id}:`, error);
        if (result) result.errors.push(`Failed to sync completion for ${completion.completion_date}`);
        // Mark completion as error
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

  private findConflictedFields(local: any, remote: any): string[] {
    const conflictedFields: string[] = [];
    const fieldsToCheck = [
      'title', 
      'icon', 
      'description', 
      'category', 
      'target_count', 
      'target_unit', 
      'frequency_type',
      'frequency_count',
      'frequency_days',
      'bg_color'
    ];

    for (const field of fieldsToCheck) {
      // Deep comparison for frequency_days array
      if (field === 'frequency_days') {
        const localDays = JSON.stringify(local[field]);
        const remoteDays = JSON.stringify(remote[field]);
        if (localDays !== remoteDays) {
          conflictedFields.push(field);
        }
      } else if (local[field] !== remote[field]) {
        conflictedFields.push(field);
      }
    }

    return conflictedFields;
  }

  // Conflict resolution
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
        // Keep local version, sync to server
        await this.db.updateHabit(habitId, {
          conflict_data: undefined,
          sync_status: 'pending',
          is_dirty: true
        });
        
        if (this.isOnline()) {
          await this.syncSingleHabit(habit);
        }
      } else {
        // Use remote version
        const remoteVersion = habit.conflict_data.remote_version;
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

  // Utility methods
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  public getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  public async clearAllData(): Promise<void> {
    await this.db.clearAllData();
  }
}