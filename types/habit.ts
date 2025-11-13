// types/habit.ts
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  description?: string;
  category: string;
  target_count: number;
  target_unit: string;
  frequency_type: 'daily' | 'weekly' | 'monthly';
  frequency_count?: number | null; // For weekly (times per week)
  frequency_days?: string[] | number[] | null; // For daily (day labels) or monthly (day numbers)
  bg_color: string;
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
  
  // Offline-first fields
  last_synced_at?: string;
  is_dirty?: boolean | number;
  conflict?: boolean;
  conflict_data?: string | {
    local_version: Partial<Habit>;
    remote_version: Partial<Habit>;
    conflicted_fields: string[];
  };
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_count: number;
  completion_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Offline-first fields
  last_synced_at?: string;
  is_dirty?: boolean | number;
  conflict?: boolean;
}

export interface HabitWithCompletion extends Habit {
  completion?: HabitCompletion;
  streak: number;
  isCompleted: boolean;
  progress: number;
  completed: number;
  total: number;
  longestStreak?: number;
}

export interface CreateHabitRequest {
  title: string;
  icon: string;
  description?: string;
  category: string;
  target_count: number;
  target_unit: string;
  frequency_type: 'daily' | 'weekly' | 'monthly';
  frequency_count?: number | null;
  frequency_days?: string[] | number[] | null;
  bg_color: string;
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {
  is_active?: boolean | number;
}

export interface HabitStats {
  totalHabits: number;
  completedToday: number;
  activeStreak: number;
  completionRate: number;
}

// Sync-related types
export interface SyncResult {
  success: boolean;
  synced_habits: number;
  synced_completions: number;
  conflicts: Habit[];
  errors: string[];
}

export interface LocalHabitRecord extends Habit {
  // SQLite specific fields
  local_id?: number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
}

export interface LocalCompletionRecord extends HabitCompletion {
  // SQLite specific fields
  local_id?: number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Learning',
  'Mindfulness',
  'Productivity',
  'Social',
  'Creative',
  'Personal Care',
  'General'
] as const;

export const HABIT_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
] as const;

export const HABIT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500'
] as const;

declare module 'expo-sqlite' {
  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowId: number }>;
    getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
    getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  }
}