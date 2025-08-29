// services/databaseService.ts
import { LocalHabitRecord, LocalCompletionRecord } from '@/types/habit';
import type { SQLiteDatabase } from 'expo-sqlite';

export class DatabaseService {
  private db: SQLiteDatabase;

  constructor(database: SQLiteDatabase) {
    this.db = database;
  }

  // Habits CRUD operations
  public async insertHabit(habit: LocalHabitRecord): Promise<void> {
    const conflictData = habit.conflict_data ? JSON.stringify(habit.conflict_data) : null;

    await this.db.runAsync(
     `INSERT OR REPLACE INTO habits (
      id, user_id, title, icon, description, category, target_count, 
      target_unit, frequency, bg_color, is_active, created_at, updated_at,
      last_synced_at, is_dirty, sync_status, conflict_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habit.id,
      habit.user_id,
      habit.title,
      habit.icon,
      habit.description || null,
      habit.category,
      habit.target_count,
      habit.target_unit,
      habit.frequency,
      habit.bg_color,
      habit.is_active ? 1 : 0,
      habit.created_at,
      habit.updated_at,
      habit.last_synced_at || null,
      habit.is_dirty ? 1 : 0,
      habit.sync_status,
      conflictData
    ]
  );
}

 public async getHabits(userId: string): Promise<LocalHabitRecord[]> {
    const result = await this.db.getAllAsync<LocalHabitRecord>(
      `SELECT * FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC`,
      [userId]
    );

    return result.map(row => ({
      ...row,
      is_active: row.is_active === 1,
      is_dirty: row.is_dirty === 1,
      conflict: row.conflict_data ? true : false,
      conflict_data: row.conflict_data ? JSON.parse(row.conflict_data) : undefined
    }));
  }

 public async updateHabit(habitId: string, updates: Partial<LocalHabitRecord>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'conflict_data') {
        fields.push(`${key} = ?`);
        values.push(value ? JSON.stringify(value) : null);
      } else if (key === 'is_active' || key === 'is_dirty') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(habitId);

    await this.db.runAsync(
      `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  public async deleteHabit(habitId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE habits SET is_active = 0, is_dirty = 1, sync_status = 'pending', updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), habitId]
    );
  }

 // Habit completions CRUD operations
  public async insertCompletion(completion: LocalCompletionRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO habit_completions (
        id, habit_id, user_id, completed_count, completion_date, 
        notes, created_at, updated_at, last_synced_at, is_dirty, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        completion.id,
        completion.habit_id,
        completion.user_id,
        completion.completed_count,
        completion.completion_date,
        completion.notes || null,
        completion.created_at,
        completion.updated_at,
        completion.last_synced_at || null,
        completion.is_dirty ? 1 : 0,
        completion.sync_status
      ]
    );
  }

    public async getCompletions(userId: string, days?: number): Promise<LocalCompletionRecord[]> {
    let query = `SELECT * FROM habit_completions WHERE user_id = ?`;
    const params = [userId];

    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query += ` AND completion_date >= ?`;
      params.push(cutoffDate.toISOString().split('T')[0]);
    }

    query += ` ORDER BY completion_date DESC`;

    const result = await this.db.getAllAsync<LocalCompletionRecord>(query, params);

    return result.map(row => ({
      ...row,
      is_dirty: row.is_dirty === 1
    }));
  }




  public async getCompletionByDate(habitId: string, userId: string, date: string): Promise<LocalCompletionRecord | null> {
    const result = await this.db.getFirstAsync<LocalCompletionRecord>(
      `SELECT * FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completion_date = ?`,
      [habitId, userId, date]
    );

    if (result) {
      return {
        ...result,
        is_dirty: result.is_dirty === 1
      };
    }

    return null;
  }

  // Enhanced method to get completions with conflict detection
  public async getCompletionsByHabitAndDateRange(
    habitId: string, 
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<LocalCompletionRecord[]> {
    const result = await this.db.getAllAsync<LocalCompletionRecord>(
      `SELECT * FROM habit_completions 
       WHERE habit_id = ? AND user_id = ? 
       AND completion_date BETWEEN ? AND ? 
       ORDER BY completion_date DESC`,
      [habitId, userId, startDate, endDate]
    );

    return result.map(row => ({
      ...row,
      is_dirty: row.is_dirty === 1
    }));
  }

  // Method to handle upsert operations for completions
  public async upsertCompletion(completion: LocalCompletionRecord): Promise<void> {
    // First try to get existing completion for the date
    const existing = await this.getCompletionByDate(
      completion.habit_id,
      completion.user_id,
      completion.completion_date
    );

    if (existing) {
      // Update existing completion
      await this.updateCompletion(existing.id, {
        completed_count: completion.completed_count,
        notes: completion.notes,
        updated_at: completion.updated_at,
        is_dirty: completion.is_dirty,
        sync_status: completion.sync_status
      });
    } else {
      // Insert new completion
      await this.insertCompletion(completion);
    }
  }
  


  public async getTodayCompletion(habitId: string, userId: string): Promise<LocalCompletionRecord | null> {
    const today = new Date().toISOString().split('T')[0];

    const result = await this.db.getFirstAsync<LocalCompletionRecord>(
      `SELECT * FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completion_date = ?`,
      [habitId, userId, today]
    );

    if (result) {
      return {
        ...result,
        is_dirty: result.is_dirty === 1
      };
    }

    return null;
  }

  public async updateCompletion(completionId: string, updates: Partial<LocalCompletionRecord>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'is_dirty') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(completionId);

    await this.db.runAsync(
      `UPDATE habit_completions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }


  // Method to clean up duplicate completions (run during database maintenance)
  public async cleanupDuplicateCompletions(userId: string): Promise<void> {
    await this.db.runAsync(`
      DELETE FROM habit_completions 
      WHERE local_id NOT IN (
        SELECT MIN(local_id) 
        FROM habit_completions 
        WHERE user_id = ?
        GROUP BY habit_id, completion_date
      ) AND user_id = ?
    `, [userId, userId]);
  }

  // Sync-related operations
  public async getUnsynced(table: 'habits' | 'habit_completions'): Promise<any[]> {
    const result = await this.db.getAllAsync(
      `SELECT * FROM ${table} WHERE sync_status = 'pending' OR is_dirty = 1`,
      []
    );

    return result.map(row => ({
      ...row,
      is_dirty: row.is_dirty === 1,
      is_active: table === 'habits' ? row.is_active === 1 : undefined
    }));
  }

  public async markAsSynced(table: 'habits' | 'habit_completions', id: string): Promise<void> {
    const now = new Date().toISOString();

    await this.db.runAsync(
      `UPDATE ${table} SET sync_status = 'synced', is_dirty = 0, last_synced_at = ? WHERE id = ?`,
      [now, id]
    );
  }

  public async clearConflict(habitId: string): Promise<void> {
    return this.updateHabit(habitId, {
      conflict_data: undefined,
      sync_status: 'synced'
    });
  }

  // Utility methods
  public async clearAllData(): Promise<void> {
    await this.db.execAsync(`
      DELETE FROM habit_completions;
      DELETE FROM habits;
    `);
  }

  public async getLastSyncTime(): Promise<string | null> {
    const result = await this.db.getFirstAsync<{ last_sync: string }>(
      `SELECT MAX(last_synced_at) as last_sync FROM (
        SELECT last_synced_at FROM habits WHERE last_synced_at IS NOT NULL
        UNION ALL
        SELECT last_synced_at FROM habit_completions WHERE last_synced_at IS NOT NULL
      )`
    );

    return result?.last_sync || null;
  }
}