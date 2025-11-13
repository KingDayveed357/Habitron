// types/calendar.ts

/**
 * Status of a calendar day
 */
export type CalendarDayStatus = 'completed' | 'partial' | 'missed' | 'rest' | 'future';

/**
 * Represents a single day in the calendar view
 */
export interface CalendarDay {
  completedCount: any;
  dateString: any;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  
  /** Day number (1-31) */
  day: number;
  
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
  
  /** Whether this day is today */
  isToday: boolean;
  
  /** Whether the habit was fully completed on this day */
  isCompleted: boolean;
  
  /** Number of times the habit was completed */
  completionCount: number;
  
  /** Visual status for display */
  status: CalendarDayStatus;
  
  /** Whether this day is scheduled for the habit */
  isScheduled: boolean;
  
  /** Target count for this habit */
  targetCount: number;
  
  /** Completion percentage (0-100) */
  completionPercentage: number;
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
  loading?: boolean;
}