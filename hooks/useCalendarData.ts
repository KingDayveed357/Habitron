
// ==========================================
// hooks/useCalendarData.ts
// ==========================================
import { useState, useEffect, useCallback } from 'react';
import { HabitWithCompletion } from '@/types/habit';
import { CalendarDay } from '@/types/calendar';

interface UseCalendarDataReturn {
  calendarData: CalendarDay[];
  currentMonth: Date;
  navigateMonth: (direction: 'prev' | 'next') => void;
}

export const useCalendarData = (habit: HabitWithCompletion | null): UseCalendarDataReturn => {
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarData = useCallback(() => {
    if (!habit) return;

    const today = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    // Generate 6 weeks (42 days) for calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      
      // TODO: Replace with actual completion data from backend
      const isCompleted = Math.random() > 0.6 && current <= today;
      const completionCount = isCompleted ? (habit?.target_count || 1) : 0;
      
      days.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === currentMonth.getMonth(),
        isToday: current.toDateString() === today.toDateString(),
        isCompleted,
        completionCount
      });
      
      current.setDate(current.getDate() + 1);
    }

    setCalendarData(days);
  }, [currentMonth, habit]);

  useEffect(() => {
    generateCalendarData();
  }, [generateCalendarData]);

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
    navigateMonth
  };
};