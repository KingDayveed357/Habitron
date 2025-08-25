// services/habitService.ts
import { supabase } from './supabase'; 
import {
  Habit,
  HabitCompletion,
  HabitWithCompletion,
  CreateHabitRequest,
  UpdateHabitRequest,
  HabitStats
} from '@/types/habit';

class HabitService {
  // Get all habits for the current user with today's completion status
  async getHabits(): Promise<HabitWithCompletion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Get habits with their completions for today
      const { data: habits, error } = await supabase
        .from('habits')
        .select(`
          *,
          completion:habit_completions!left(
            id,
            completed_count,
            completion_date,
            notes
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('completion.completion_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include completion info
      const habitsWithCompletion: HabitWithCompletion[] = await Promise.all(
        (habits || []).map(async (habit) => {
          const completion = Array.isArray(habit.completion) ? habit.completion[0] : habit.completion;
          const streak = await this.calculateStreak(habit.id);
          
          const completedCount = completion?.completed_count || 0;
          const targetCount = habit.target_count || 1;
          
          const isCompleted = completedCount >= targetCount;
          const progress = Math.min(completedCount / targetCount, 1);

          return {
            ...habit,
            completion,
            streak,
            isCompleted,
            progress,
            completed: completedCount,
            total: targetCount
          } as HabitWithCompletion;
        })
      );

      return habitsWithCompletion;
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  }

  // Create a new habit
  async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habitData,
          user_id: user.id,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Habit;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  // Update an existing habit
  async updateHabit(habitId: string, updates: UpdateHabitRequest): Promise<Habit> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Habit;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  // Delete a habit (soft delete by setting is_active to false)
  async deleteHabit(habitId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('habits')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Toggle habit completion for today
  async toggleHabitCompletion(habitId: string): Promise<HabitCompletion> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Get the habit to know target count
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('target_count')
        .eq('id', habitId)
        .eq('user_id', user.id)
        .single();

      if (habitError) throw habitError;
      if (!habit) throw new Error('Habit not found');

      // Check if completion exists for today
      const { data: existingCompletion, error: fetchError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('completion_date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let result: HabitCompletion;

      if (existingCompletion) {
        // Update existing completion - toggle between 0 and target_count
        const newCount = existingCompletion.completed_count >= habit.target_count 
          ? 0 
          : habit.target_count;

        const { data, error } = await supabase
          .from('habit_completions')
          .update({ 
            completed_count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCompletion.id)
          .select()
          .single();

        if (error) throw error;
        result = data as HabitCompletion;
      } else {
        // Create new completion
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completed_count: habit.target_count,
            completion_date: today,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        result = data as HabitCompletion;
      }

      return result;
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  }

  // Update habit completion count (for habits that can be partially completed)
  async updateHabitCompletion(habitId: string, count: number): Promise<HabitCompletion> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('habit_completions')
        .upsert({
          habit_id: habitId,
          user_id: user.id,
          completed_count: Math.max(0, count),
          completion_date: today,
          updated_at: now,
          created_at: now
        })
        .select()
        .single();

      if (error) throw error;
      return data as HabitCompletion;
    } catch (error) {
      console.error('Error updating habit completion:', error);
      throw error;
    }
  }

  // Calculate streak for a habit
  private async calculateStreak(habitId: string): Promise<number> {
    try {
      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select('completion_date, completed_count')
        .eq('habit_id', habitId)
        .gt('completed_count', 0)
        .order('completion_date', { ascending: false })
        .limit(100); // Get last 100 days to calculate streak

      if (error || !completions?.length) return 0;

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const completion of completions) {
        const completionDate = new Date(completion.completion_date);
        completionDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate.getTime() - completionDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === streak) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Get habit statistics
  async getHabitStats(): Promise<HabitStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Get total active habits
      const { count: totalHabits } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Get completed habits today with proper join
      const { data: completionsToday } = await supabase
        .from('habit_completions')
        .select(`
          id,
          completed_count,
          habits!inner(target_count, is_active)
        `)
        .eq('user_id', user.id)
        .eq('completion_date', today)
        .eq('habits.is_active', true);

      const completedToday = completionsToday?.filter(
        completion => {
          const habit = completion.habits as any;
          return completion.completed_count >= habit.target_count;
        }
      ).length || 0;

      // Calculate completion rate for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentCompletions } = await supabase
        .from('habit_completions')
        .select(`
          completion_date,
          completed_count,
          habits!inner(target_count, is_active)
        `)
        .eq('user_id', user.id)
        .gte('completion_date', sevenDaysAgo.toISOString().split('T')[0])
        .eq('habits.is_active', true);

      const completedInWeek = recentCompletions?.filter(
        completion => {
          const habit = completion.habits as any;
          return completion.completed_count >= habit.target_count;
        }
      ).length || 0;

      const possibleCompletions = (totalHabits || 0) * 7;
      const completionRate = possibleCompletions > 0 
        ? (completedInWeek / possibleCompletions) * 100 
        : 0;

      // Calculate active streak (consecutive days with at least one habit completed)
      const activeStreak = await this.calculateActiveStreak();

      return {
        totalHabits: totalHabits || 0,
        completedToday,
        activeStreak,
        completionRate: Math.round(completionRate)
      };
    } catch (error) {
      console.error('Error fetching habit stats:', error);
      return {
        totalHabits: 0,
        completedToday: 0,
        activeStreak: 0,
        completionRate: 0
      };
    }
  }

  // Calculate active streak (consecutive days with at least one habit completed)
  private async calculateActiveStreak(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Get completions for the last 30 days, grouped by date
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select(`
          completion_date,
          completed_count,
          habits!inner(target_count)
        `)
        .eq('user_id', user.id)
        .gte('completion_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('completion_date', { ascending: false });

      if (error || !completions?.length) return 0;

      // Group by date and check if any habit was completed each day
      const completionsByDate: Record<string, boolean> = {};
      
      completions.forEach(completion => {
        const habit = completion.habits as any;
        const isCompleted = completion.completed_count >= habit.target_count;
        
        if (isCompleted) {
          completionsByDate[completion.completion_date] = true;
        }
      });

      // Calculate streak
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      while (streak < 30) { // Max 30 days lookback
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (completionsByDate[dateStr]) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating active streak:', error);
      return 0;
    }
  }

  // Get habit history for analytics
  async getHabitHistory(habitId: string, days: number = 30): Promise<HabitCompletion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completion_date', startDate.toISOString().split('T')[0])
        .order('completion_date', { ascending: false });

      if (error) throw error;
      return (data || []) as HabitCompletion[];
    } catch (error) {
      console.error('Error fetching habit history:', error);
      throw error;
    }
  }

  // Batch update multiple habits (useful for bulk operations)
  async batchUpdateHabits(updates: Array<{ id: string; data: UpdateHabitRequest }>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const promises = updates.map(update => 
        supabase
          .from('habits')
          .update({
            ...update.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id)
          .eq('user_id', user.id)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error batch updating habits:', error);
      throw error;
    }
  }

  // Get habits summary for a specific date range
  async getHabitsSummary(startDate: string, endDate: string): Promise<{
    totalCompletions: number;
    averageCompletionRate: number;
    mostConsistentHabit: string | null;
    streakData: Array<{ date: string; completedHabits: number }>;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select(`
          *,
          habits!inner(name, target_count)
        `)
        .eq('user_id', user.id)
        .gte('completion_date', startDate)
        .lte('completion_date', endDate);

      if (error) throw error;

      const totalCompletions = completions?.length || 0;
      
      // Calculate average completion rate and other metrics
      const completionsByDate: Record<string, number> = {};
      const habitCompletions: Record<string, number> = {};
      
      completions?.forEach(completion => {
        const habit = completion.habits as any;
        const isCompleted = completion.completed_count >= habit.target_count;
        
        if (isCompleted) {
          completionsByDate[completion.completion_date] = (completionsByDate[completion.completion_date] || 0) + 1;
          habitCompletions[habit.name] = (habitCompletions[habit.name] || 0) + 1;
        }
      });

      const streakData = Object.entries(completionsByDate).map(([date, count]) => ({
        date,
        completedHabits: count
      }));

      const mostConsistentHabit = Object.entries(habitCompletions).reduce(
        (max, [name, count]) => count > max.count ? { name, count } : max,
        { name: null as string | null, count: 0 }
      ).name;

      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const averageCompletionRate = totalCompletions / days;

      return {
        totalCompletions,
        averageCompletionRate,
        mostConsistentHabit,
        streakData
      };
    } catch (error) {
      console.error('Error getting habits summary:', error);
      throw error;
    }
  }
}

export const habitService = new HabitService();