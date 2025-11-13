// ==========================================
// utils/habitTrackingAlgorithm.ts
// ==========================================

import { HabitWithCompletion, HabitCompletion } from '@/types/habit';

export interface DaySchedule {
  date: string;
  isScheduled: boolean;
  isBeforeCreation: boolean;
  isCompleted: boolean;
  completionCount: number;
  targetCount: number;
  completionPercentage: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  streakType: 'days' | 'scheduled_days';
}

export interface SuccessMetrics {
  totalScheduledDays: number;
  completedDays: number;
  partiallyCompletedDays: number;
  missedDays: number;
  restDays: number;
  successRate: number;
  consistencyScore: number;
}

export interface PeriodStats {
  period: 'week' | 'month' | 'all';
  completionRate: number;
  averageCompletion: number;
  totalCompletions: number;
  scheduledDays: number;
  perfectDays: number;
}

/**
 * Core algorithm to determine if a habit is scheduled for a specific date
 */
export const isHabitScheduledForDate = (
  habit: HabitWithCompletion,
  date: Date
): boolean => {
  const creationDate = new Date(habit.created_at);
  creationDate.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  // Not scheduled if before creation
  if (checkDate < creationDate) {
    return false;
  }

  const { frequency_type, frequency_count, frequency_days } = habit;

  switch (frequency_type) {
    case 'daily':
      if (!frequency_days || frequency_days.length === 0) {
        // Every day
        return true;
      }
      // Specific days of the week
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[checkDate.getDay()];
      return (frequency_days as string[]).includes(dayName);

    case 'weekly':
      // For weekly habits, we need to check if this week's quota allows this day
      // This is more complex and depends on user's completion pattern
      // For simplicity, we mark all days as scheduled and track actual completions
      return true;

    case 'monthly':
      if (!frequency_days || frequency_days.length === 0) {
        return true;
      }
      // Specific days of the month
      const dayOfMonth = checkDate.getDate();
      return (frequency_days as number[]).includes(dayOfMonth);

    default:
      return true;
  }
};

/**
 * Calculate streak with proper frequency consideration
 */
export const calculateStreak = (
  habit: HabitWithCompletion,
  completions: HabitCompletion[]
): StreakInfo => {
  const sortedCompletions = completions
    .filter(c => c.habit_id === habit.id)
    .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For weekly/monthly habits, we track scheduled days differently
  if (habit.frequency_type === 'weekly' || habit.frequency_type === 'monthly') {
    return calculateFlexibleStreak(habit, sortedCompletions);
  }

  // For daily habits
  let currentDate = new Date(today);
  let streakBroken = false;

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isScheduled = isHabitScheduledForDate(habit, currentDate);

    if (isScheduled) {
      const completion = sortedCompletions.find(c => c.completion_date === dateStr);
      const isCompleted = completion && completion.completed_count >= habit.target_count;

      if (isCompleted) {
        if (!streakBroken) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        // Allow grace period for today
        if (currentDate.getTime() === today.getTime()) {
          // Today is not complete yet, don't break streak
        } else {
          streakBroken = true;
          tempStreak = 0;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return {
    currentStreak,
    longestStreak,
    streakType: 'scheduled_days'
  };
};

/**
 * Calculate streak for flexible frequency habits (weekly/monthly)
 */
const calculateFlexibleStreak = (
  habit: HabitWithCompletion,
  completions: HabitCompletion[]
): StreakInfo => {
  let currentStreak = 0;
  let longestStreak = 0;

  if (habit.frequency_type === 'weekly') {
    const requiredPerWeek = habit.frequency_count || 1;
    const weeks = groupCompletionsByWeek(completions);
    
    let consecutiveWeeks = 0;
    let tempStreak = 0;

    for (const week of weeks) {
      const completedDays = week.completions.filter(
        c => c.completed_count >= habit.target_count
      ).length;

      if (completedDays >= requiredPerWeek) {
        consecutiveWeeks++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (week.isCurrentWeek && completedDays > 0) {
          // Current week in progress
          consecutiveWeeks++;
        } else {
          tempStreak = 0;
        }
      }
    }

    currentStreak = consecutiveWeeks;
  } else if (habit.frequency_type === 'monthly') {
    const requiredPerMonth = habit.frequency_count || 1;
    const months = groupCompletionsByMonth(completions);
    
    let consecutiveMonths = 0;
    let tempStreak = 0;

    for (const month of months) {
      const completedDays = month.completions.filter(
        c => c.completed_count >= habit.target_count
      ).length;

      if (completedDays >= requiredPerMonth) {
        consecutiveMonths++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (month.isCurrentMonth && completedDays > 0) {
          // Current month in progress
          consecutiveMonths++;
        } else {
          tempStreak = 0;
        }
      }
    }

    currentStreak = consecutiveMonths;
  }

  return {
    currentStreak,
    longestStreak,
    streakType: habit.frequency_type === 'weekly' ? 'days' : 'days'
  };
};

/**
 * Calculate success rate based on scheduled vs completed days
 */
export const calculateSuccessMetrics = (
  habit: HabitWithCompletion,
  completions: HabitCompletion[],
  days: number = 30
): SuccessMetrics => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalScheduledDays = 0;
  let completedDays = 0;
  let partiallyCompletedDays = 0;
  let missedDays = 0;
  let restDays = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dateStr = date.toISOString().split('T')[0];
    const isScheduled = isHabitScheduledForDate(habit, date);

    if (!isScheduled) {
      restDays++;
      continue;
    }

    totalScheduledDays++;
    const completion = completions.find(c => c.completion_date === dateStr);

    if (completion) {
      if (completion.completed_count >= habit.target_count) {
        completedDays++;
      } else if (completion.completed_count > 0) {
        partiallyCompletedDays++;
      } else {
        missedDays++;
      }
    } else {
      // No completion record
      if (date.getTime() < today.getTime()) {
        missedDays++;
      }
    }
  }

  const successRate = totalScheduledDays > 0 
    ? (completedDays / totalScheduledDays) * 100 
    : 0;

  // Consistency score considers both completion and partial attempts
  const consistencyScore = totalScheduledDays > 0
    ? ((completedDays + (partiallyCompletedDays * 0.5)) / totalScheduledDays) * 100
    : 0;

  return {
    totalScheduledDays,
    completedDays,
    partiallyCompletedDays,
    missedDays,
    restDays,
    successRate,
    consistencyScore
  };
};

/**
 * Calculate period-specific statistics
 */
export const calculatePeriodStats = (
  habit: HabitWithCompletion,
  completions: HabitCompletion[],
  period: 'week' | 'month' | 'all'
): PeriodStats => {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const metrics = calculateSuccessMetrics(habit, completions, days);

  const totalCompletions = completions
    .filter(c => {
      const date = new Date(c.completion_date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return date >= cutoff;
    })
    .reduce((sum, c) => sum + c.completed_count, 0);

  return {
    period,
    completionRate: metrics.successRate,
    averageCompletion: metrics.totalScheduledDays > 0 
      ? totalCompletions / metrics.totalScheduledDays 
      : 0,
    totalCompletions,
    scheduledDays: metrics.totalScheduledDays,
    perfectDays: metrics.completedDays
  };
};

/**
 * Generate calendar day schedule information
 */
export const generateDaySchedule = (
  habit: HabitWithCompletion,
  date: Date,
  completion: HabitCompletion | undefined
): DaySchedule => {
  const creationDate = new Date(habit.created_at);
  creationDate.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const isBeforeCreation = checkDate < creationDate;
  const isScheduled = !isBeforeCreation && isHabitScheduledForDate(habit, date);
  const completionCount = completion?.completed_count || 0;
  const targetCount = habit.target_count;
  const isCompleted = completionCount >= targetCount;
  const completionPercentage = targetCount > 0 ? (completionCount / targetCount) * 100 : 0;

  return {
    date: date.toISOString().split('T')[0],
    isScheduled,
    isBeforeCreation,
    isCompleted,
    completionCount,
    targetCount,
    completionPercentage
  };
};

// Helper functions
const groupCompletionsByWeek = (completions: HabitCompletion[]) => {
  const weeks: { weekStart: Date; isCurrentWeek: boolean; completions: HabitCompletion[] }[] = [];
  const today = new Date();
  
  // Group by week for last 12 weeks
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekCompletions = completions.filter(c => {
      const date = new Date(c.completion_date);
      return date >= weekStart && date <= weekEnd;
    });

    weeks.push({
      weekStart,
      isCurrentWeek: i === 0,
      completions: weekCompletions
    });
  }

  return weeks.reverse();
};

const groupCompletionsByMonth = (completions: HabitCompletion[]) => {
  const months: { monthStart: Date; isCurrentMonth: boolean; completions: HabitCompletion[] }[] = [];
  const today = new Date();
  
  // Group by month for last 12 months
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    const monthCompletions = completions.filter(c => {
      const date = new Date(c.completion_date);
      return date >= monthStart && date <= monthEnd;
    });

    months.push({
      monthStart,
      isCurrentMonth: i === 0,
      completions: monthCompletions
    });
  }

  return months.reverse();
};

