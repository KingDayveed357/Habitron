// hooks/useCalendarData.ts
import { supabase } from '@/services/supabase';
import { CalendarDay } from '@/types/calendar';
import { HabitCompletion, HabitWithCompletion } from '@/types/habit';
import {
  generateDaySchedule
} from '@/utils/habitTrackingAlgorithm';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHabitService } from './useHabitService';

interface CalendarSummary {
  completed: number;
  missed: number;
  restDays: number;
  partial: number;
  successRate: number;
  scheduledDays: number;
}

interface UseCalendarDataReturn {
  calendarData: CalendarDay[];
  currentMonth: Date;
  navigateMonth: (direction: 'prev' | 'next') => void;
  summary: CalendarSummary;
  loading: boolean;
}

export const useCalendarData = (
  habit: HabitWithCompletion | null
): UseCalendarDataReturn => {
  const habitService = useHabitService();
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load completions from HabitService (not directly from db)
  const loadCompletions = useCallback(async () => {
    if (!habit) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get completions for the displayed month plus previous/next months
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

      // Use HabitService public method instead of accessing db directly
      const monthCompletions = await habitService.getCompletionsByDateRange(
        habit.id,
        user.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setCompletions(monthCompletions);
    } catch (error) {
      console.error('Error loading completions:', error);
      setCompletions([]);
    } finally {
      setLoading(false);
    }
  }, [habit, currentMonth, habitService]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  // Generate calendar data
  const generateCalendarData = useCallback(() => {
    if (!habit) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    // Generate 6 weeks (42 days) for calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const completion = completions.find(c => c.completion_date === dateStr);
      
      const daySchedule = generateDaySchedule(habit, current, completion);

      // Determine the status for visual display
      let status: 'completed' | 'partial' | 'missed' | 'rest' | 'future' = 'rest';
      
      if (current > today) {
        status = 'future';
      } else if (daySchedule.isBeforeCreation) {
        status = 'rest';
      } else if (daySchedule.isScheduled) {
        if (daySchedule.isCompleted) {
          status = 'completed';
        } else if (daySchedule.completionCount > 0) {
          status = 'partial';
        } else {
          status = 'missed';
        }
      }

      days.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === currentMonth.getMonth(),
        isToday: current.toDateString() === today.toDateString(),
        isCompleted: daySchedule.isCompleted,
        completionCount: daySchedule.completionCount,
        status,
        isScheduled: daySchedule.isScheduled,
        targetCount: daySchedule.targetCount,
        completionPercentage: daySchedule.completionPercentage
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, habit, completions]);

  // Update calendar data when dependencies change
  useEffect(() => {
    const data = generateCalendarData();
    setCalendarData(data);
  }, [generateCalendarData]);

  // Calculate summary statistics
  const summary = useMemo((): CalendarSummary => {
    if (!habit || calendarData.length === 0) {
      return {
        completed: 0,
        missed: 0,
        restDays: 0,
        partial: 0,
        successRate: 0,
        scheduledDays: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only count days in the current month that are not in the future
    const currentMonthDays = calendarData.filter(day => {
      const dayDate = new Date(day.date);
      return day.isCurrentMonth && dayDate <= today;
    });

    let completed = 0;
    let missed = 0;
    let restDays = 0;
    let partial = 0;
    let scheduledDays = 0;

    currentMonthDays.forEach(day => {
      if (day.status === 'completed') {
        completed++;
        scheduledDays++;
      } else if (day.status === 'partial') {
        partial++;
        scheduledDays++;
      } else if (day.status === 'missed') {
        missed++;
        scheduledDays++;
      } else if (day.status === 'rest') {
        restDays++;
      }
    });

    const successRate = scheduledDays > 0 ? (completed / scheduledDays) * 100 : 0;

    return {
      completed,
      missed,
      restDays,
      partial,
      successRate,
      scheduledDays
    };
  }, [habit, calendarData]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1));
      return newMonth;
    });
  }, []);

  return {
    calendarData,
    currentMonth,
    navigateMonth,
    summary,
    loading
  };
};