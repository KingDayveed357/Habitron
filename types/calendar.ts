// ==========================================
// types/calendar.ts
// ==========================================
/**
 * Represents a single day in the calendar view
 */
export interface CalendarDay {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  
  /** Day number (1-31) */
  day: number;
  
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
  
  /** Whether this day is today */
  isToday: boolean;
  
  /** Whether the habit was completed on this day */
  isCompleted: boolean;
  
  /** Number of times the habit was completed (for habits with target > 1) */
  completionCount: number;
}

/**
 * Calendar navigation direction
 */
export type CalendarNavigationDirection = 'prev' | 'next';

/**
 * Calendar view props
 */
export interface CalendarViewProps {
  calendarData: CalendarDay[];
  currentMonth: Date;
  onNavigateMonth: (direction: CalendarNavigationDirection) => void;
  targetCount: number;
}