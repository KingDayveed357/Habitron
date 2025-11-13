// utils/streakCalculation.ts - COMPLETELY REWRITTEN

import { HabitWithCompletion, HabitCompletion, LocalHabitRecord, LocalCompletionRecord } from '@/types/habit';

/**
 * Calculate streak for a habit based on its frequency type
 * This is the ONLY function needed for streak calculation
 */
export function calculateHabitStreak(
  habit: LocalHabitRecord | HabitWithCompletion,
  completions: (HabitCompletion | LocalCompletionRecord)[]
): { currentStreak: number; longestStreak: number } {
  
  if (!habit || !completions) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort completions by date descending (newest first)
 const sortedCompletions = [...completions]
    .filter(c => c && c.completed_count > 0 && isValidDateString(c.completion_date))
    .sort((a, b) => {
      const dateA = new Date(a.completion_date).getTime();
      const dateB = new Date(b.completion_date).getTime();
      return dateB - dateA;
    });

  if (sortedCompletions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = getTodayDateString();

  switch (habit.frequency_type) {
    case 'daily':
      return calculateDailyStreak(habit, sortedCompletions, today);
    case 'weekly':
      return calculateWeeklyStreak(habit, sortedCompletions);
    case 'monthly':
      return calculateMonthlyStreak(habit, sortedCompletions);
    default:
      return { currentStreak: 0, longestStreak: 0 };
  }
}

/**
 * Calculate streak for daily habits
 */
function calculateDailyStreak(
  habit: LocalHabitRecord | HabitWithCompletion,
  completions: (HabitCompletion | LocalCompletionRecord)[],
  today: string
): { currentStreak: number; longestStreak: number } {
  
  const specificDays = habit.frequency_days as string[] | null;
  const hasSpecificDays = specificDays && specificDays.length > 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let checkDate = today;
  let streakBroken = false;

  // Look back up to 365 days
  for (let i = 0; i < 365; i++) {
    const isScheduledDay = hasSpecificDays 
      ? isDateScheduledForDays(checkDate, specificDays)
      : true;

    if (isScheduledDay) {
      const hasCompletion = completions.some(c => 
        c.completion_date === checkDate && 
        c.completed_count >= habit.target_count
      );

      if (hasCompletion) {
        if (!streakBroken) {
          currentStreak++;
        }
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        // Grace period: don't break streak if it's today
        if (checkDate !== today) {
          streakBroken = true;
          tempStreak = 0;
        }
      }
    }

    // Move to previous day
    checkDate = getPreviousDateString(checkDate);
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculate streak for weekly habits (e.g., "3 times per week")
 */
function calculateWeeklyStreak(
  habit: LocalHabitRecord | HabitWithCompletion,
  completions: (HabitCompletion | LocalCompletionRecord)[]
): { currentStreak: number; longestStreak: number } {
  
  const requiredPerWeek = habit.frequency_count || 1;
  const weeks = groupCompletionsByWeek(completions);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakBroken = false;

  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i];
    const completedCount = week.completions.filter(c => 
      c.completed_count >= habit.target_count
    ).length;

    if (completedCount >= requiredPerWeek) {
      if (!streakBroken) {
        currentStreak++;
      }
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      // Grace period for current week
      if (!week.isCurrentWeek) {
        streakBroken = true;
        tempStreak = 0;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculate streak for monthly habits
 */
function calculateMonthlyStreak(
  habit: LocalHabitRecord | HabitWithCompletion,
  completions: (HabitCompletion | LocalCompletionRecord)[]
): { currentStreak: number; longestStreak: number } {
  
  const specificDays = habit.frequency_days as number[] | null;
  const requiredPerMonth = specificDays?.length || habit.frequency_count || 1;
  const months = groupCompletionsByMonth(completions);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakBroken = false;

  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    const completedCount = month.completions.filter(c => 
      c.completed_count >= habit.target_count
    ).length;

    if (completedCount >= requiredPerMonth) {
      if (!streakBroken) {
        currentStreak++;
      }
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      // Grace period for current month
      if (!month.isCurrentMonth) {
        streakBroken = true;
        tempStreak = 0;
      }
    }
  }

  return { currentStreak, longestStreak };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayDateString(): string {
  const date = new Date();
  return formatDateString(date);
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDateString(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDateString:', date);
    return getTodayDateString(); // Fallback to today
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get previous date string
 */
function getPreviousDateString(dateStr: string): string {
  if (!dateStr) {
    console.warn('Invalid date string provided to getPreviousDateString');
    return getTodayDateString();
  }
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    date.setDate(date.getDate() - 1);
    return formatDateString(date);
  } catch (error) {
    console.warn('Error parsing date string, using today:', dateStr);
    return getTodayDateString();
  }
}

function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Check if a date is scheduled for specific days
 */
function isDateScheduledForDays(dateStr: string, scheduledDays: string[]): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[date.getDay()];
  
  return scheduledDays.some(scheduled => 
    dayName.toLowerCase().startsWith(scheduled.toLowerCase().slice(0, 3))
  );
}

/**
 * Group completions by week
 */
function groupCompletionsByWeek(
  completions: (HabitCompletion | LocalCompletionRecord)[]
): Array<{
  weekStart: string;
  isCurrentWeek: boolean;
  completions: (HabitCompletion | LocalCompletionRecord)[];
}> {
  const today = new Date();
  const weeks: Array<{
    weekStart: string;
    isCurrentWeek: boolean;
    completions: (HabitCompletion | LocalCompletionRecord)[];
  }> = [];

  for (let i = 0; i < 52; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = formatDateString(weekStart);
    const weekEndStr = formatDateString(weekEnd);

    const weekCompletions = completions.filter(c => {
      return c.completion_date >= weekStartStr && c.completion_date <= weekEndStr;
    });

    weeks.push({
      weekStart: weekStartStr,
      isCurrentWeek: i === 0,
      completions: weekCompletions
    });
  }

  return weeks;
}

/**
 * Group completions by month
 */
function groupCompletionsByMonth(
  completions: (HabitCompletion | LocalCompletionRecord)[]
): Array<{
  monthStart: string;
  isCurrentMonth: boolean;
  completions: (HabitCompletion | LocalCompletionRecord)[];
}> {
  const today = new Date();
  const months: Array<{
    monthStart: string;
    isCurrentMonth: boolean;
    completions: (HabitCompletion | LocalCompletionRecord)[];
  }> = [];

  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const monthStartStr = formatDateString(monthStart);
    const monthEndStr = formatDateString(monthEnd);

    const monthCompletions = completions.filter(c => {
      return c.completion_date >= monthStartStr && c.completion_date <= monthEndStr;
    });

    months.push({
      monthStart: monthStartStr,
      isCurrentMonth: i === 0,
      completions: monthCompletions
    });
  }

  return months;
}

/**
 * Get streak unit label
 */
export function getStreakUnit(frequencyType: string): string {
  switch (frequencyType) {
    case 'daily': return 'days';
    case 'weekly': return 'weeks';
    case 'monthly': return 'months';
    default: return 'days';
  }
}

/**
 * Format completion count with unit
 */
export function formatCompletionCount(count: number, unit: string): string {
  if (!unit) return String(count);
  
  const pluralUnits: Record<string, string> = {
    'glass': 'glasses',
    'liter': 'liters',
    'page': 'pages',
    'minute': 'minutes',
    'hour': 'hours',
    'time': 'times',
    'rep': 'reps',
    'set': 'sets',
    'kilometer': 'kilometers',
    'mile': 'miles',
  };

  const isPlural = count !== 1;
  const unitLower = unit.toLowerCase();
  const formattedUnit = isPlural && pluralUnits[unitLower] 
    ? pluralUnits[unitLower] 
    : unit;

  return `${count} ${formattedUnit}`;
}