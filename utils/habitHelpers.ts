// ==========================================
// utils/habitHelpers.ts
// ==========================================
import { HabitWithCompletion } from '@/types/habit';

/**
 * Gets a human-readable frequency display string for a habit
 * @param habit - The habit object
 * @returns Formatted frequency string
 */
export const getFrequencyDisplay = (habit: HabitWithCompletion): string => {
  if (habit.frequency_type === 'daily') {
    if (!habit.frequency_days || habit.frequency_days.length === 0) {
      return 'Daily';
    }
    if (habit.frequency_days.length === 7) {
      return 'Every day';
    }
    return `${habit.frequency_days.length} days/week`;
  } 
  
  if (habit.frequency_type === 'weekly') {
    return `${habit.frequency_count || 1}x per week`;
  } 
  
  if (habit.frequency_type === 'monthly') {
    if (!habit.frequency_days || habit.frequency_days.length === 0) {
      return 'Monthly';
    }
    return `${habit.frequency_days.length} days/month`;
  }

  // Fallback: capitalize frequency type
  const ft = String(habit.frequency_type || '');
  if (!ft) return '';
  return ft.charAt(0).toUpperCase() + ft.slice(1);
};

/**
 * Color map for background classes to gradient colors
 */
const COLOR_GRADIENT_MAP: Record<string, [string, string]> = {
  'bg-blue-500': ['#60A5FA', '#2563EB'],
  'bg-green-500': ['#34D399', '#10B981'],
  'bg-purple-500': ['#A78BFA', '#8B5CF6'],
  'bg-amber-500': ['#FBBF24', '#F59E0B'],
  'bg-red-500': ['#F87171', '#EF4444'],
  'bg-pink-500': ['#F472B6', '#EC4899'],
  'bg-indigo-500': ['#818CF8', '#6366F1'],
  'bg-teal-500': ['#2DD4BF', '#14B8A6'],
  'bg-orange-500': ['#FB923C', '#F97316'],
  'bg-cyan-500': ['#22D3EE', '#06B6D4'],
};

/**
 * Converts a Tailwind background class to gradient colors
 * @param bgClass - The Tailwind background class (e.g., 'bg-blue-500')
 * @returns Tuple of [lightColor, darkColor] for gradient
 */
export const getColorFromBgClass = (bgClass: string): [string, string] => {
  return COLOR_GRADIENT_MAP[bgClass] || ['#60A5FA', '#2563EB'];
};

/**
 * Maps trend direction to emoji icon
 * @param direction - The trend direction
 * @returns Emoji representing the trend
 */
export const getTrendIcon = (direction: 'up' | 'down' | 'stable'): string => {
  const trendIcons: Record<'up' | 'down' | 'stable', string> = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  };
  
  return trendIcons[direction];
};

/**
 * Formats a date to a human-readable month and year
 * @param date - The date to format
 * @returns Formatted string (e.g., "January 2024")
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Calculates the progress percentage for a habit
 * @param current - Current progress count
 * @param target - Target count
 * @returns Progress percentage (0-100)
 */
export const calculateProgressPercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

/**
 * Checks if a habit is completed for the day
 * @param current - Current progress count
 * @param target - Target count
 * @returns True if completed
 */
export const isHabitCompleted = (current: number, target: number): boolean => {
  return current >= target;
};

/**
 * Gets the appropriate status color based on completion rate
 * @param completionRate - The completion rate (0-100)
 * @returns Tailwind color class
 */
export const getStatusColor = (completionRate: number): string => {
  if (completionRate >= 80) return 'text-green-600';
  if (completionRate >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Formats a streak count with appropriate suffix
 * @param count - The streak count
 * @returns Formatted string (e.g., "5 days")
 */
export const formatStreak = (count: number): string => {
  if (count === 0) return 'No streak';
  if (count === 1) return '1 day';
  return `${count} days`;
};

/**
 * Gets insight text based on statistics
 * @param statistics - Habit statistics
 * @returns Array of insight strings
 */
export const getInsights = (statistics: {
  trendDirection: 'up' | 'down' | 'stable';
  currentStreak: number;
  completionRate: number;
}): Array<{ color: string; text: string }> => {
  const insights: Array<{ color: string; text: string }> = [];

  if (statistics.trendDirection === 'up') {
    insights.push({
      color: 'text-green-500',
      text: "Great progress! You're maintaining a strong completion rate this month."
    });
  }

  if (statistics.currentStreak > 0) {
    insights.push({
      color: 'text-orange-500',
      text: `You're on a ${statistics.currentStreak}-day streak. Keep the momentum going!`
    });
  }

  if (statistics.completionRate > 80) {
    insights.push({
      color: 'text-blue-500',
      text: "Excellent consistency! You're maintaining a high success rate."
    });
  }

  if (statistics.completionRate < 50) {
    insights.push({
      color: 'text-yellow-500',
      text: "Consider adjusting your target or breaking this habit into smaller steps."
    });
  }

  // Always add a general tip
  insights.push({
    color: 'text-purple-500',
    text: "Try linking this habit to an existing routine for better consistency."
  });

  return insights;
};