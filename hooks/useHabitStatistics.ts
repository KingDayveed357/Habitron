// ==========================================
// hooks/useHabitStatistics.ts
// ==========================================
import { useMemo } from 'react';
import { HabitWithCompletion } from '../types/habit';
import { CalendarDay } from '../types/calendar';

export interface HabitStatistics {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  monthlyAverage: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export const useHabitStatistics = (
  habit: HabitWithCompletion | null,
  calendarData: CalendarDay[]
): HabitStatistics => {
  return useMemo(() => {
    if (!habit) {
      return {
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyAverage: 0,
        monthlyAverage: 0,
        trendDirection: 'stable' as const
      };
    }

    // Calculate statistics from calendar data
    const currentMonthDays = calendarData.filter(day => day.isCurrentMonth);
    const completedDays = currentMonthDays.filter(day => day.isCompleted).length;
    const totalDays = currentMonthDays.length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Get streak information from habit
    const currentStreak = habit.streak || 0;
    
    // TODO: Replace with actual longest streak from backend
    const longestStreak = Math.max(habit.streak || 0, Math.floor(Math.random() * 20) + 5);
    
    // Calculate averages
    const weeklyAverage = Math.floor(completionRate * 0.07);
    const monthlyAverage = completedDays;

    // Determine trend direction based on completion rate
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (completionRate > 70) {
      trendDirection = 'up';
    } else if (completionRate < 30) {
      trendDirection = 'down';
    }

    return {
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
      longestStreak,
      weeklyAverage,
      monthlyAverage,
      trendDirection
    };
  }, [habit, calendarData]);
};
