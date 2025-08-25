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
  frequency: 'daily' | 'weekly' | 'monthly';
  bg_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
}

export interface HabitWithCompletion extends Habit {
  completion?: HabitCompletion;
  streak: number;
  isCompleted: boolean;
  progress: number;
  completed: number;
  total: number;
}

export interface CreateHabitRequest {
  title: string;
  icon: string;
  description?: string;
  category: string;
  target_count: number ;
  target_unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  bg_color: string;
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {
  is_active?: boolean;
}

export interface HabitStats {
  totalHabits: number;
  completedToday: number;
  activeStreak: number;
  completionRate: number;
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