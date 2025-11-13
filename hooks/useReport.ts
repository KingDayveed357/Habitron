// hooks/useReport.ts - FIXED VERSION
/**
 * 🎯 OFFLINE-FIRST REPORT SYSTEM - FIXED
 * 
 * Key Fixes:
 * - Fixed TypeScript type mismatches
 * - Optimized dependency arrays to prevent re-render loops
 * - Proper date comparison for re-fetching
 * - Added missing 'count' property to dailyData
 * - Memoized expensive calculations
 * 
 * @version 4.1.0 - Bug fixes and optimization
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitService } from '@/hooks/useHabitService';
import { calculateHabitStreak, getStreakUnit } from '@/utils/streakCalculation';
import type { 
  TimePeriod, 
  HabitDataProps, 
  OverallMetrics, 
  PeriodData 
} from '@/interfaces/interfaces';
import type { LocalHabitRecord, LocalCompletionRecord } from '@/types/habit';

interface UseReportOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseReportReturn {
  periodData: PeriodData;
  selectedPeriod: TimePeriod;
  customDateRange: { start: Date; end: Date };
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: TimePeriod) => void;
  setCustomRange: (start: Date, end: Date) => void;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
}

export const useReport = (options: UseReportOptions = {}): UseReportReturn => {
  const { autoRefresh = false, refreshInterval = 60000 } = options;

  const { user } = useAuth();
  const habitService = useHabitService();
  const isMountedRef = useRef(true);
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [customDateRange, setCustomDateRange] = useState({ start: new Date(), end: new Date() });
  const [habits, setHabits] = useState<HabitDataProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * 🔥 FIX 1: Memoize date range calculation with stable dependencies
   */
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedPeriod) {
      case 'today':
        return { start: today, end: today };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: today };
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: today };
      }
      case 'last6months': {
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return { start: sixMonthsAgo, end: today };
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return { start: yearStart, end: today };
      }
      case 'lastyear': {
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        return { start: lastYearStart, end: lastYearEnd };
      }
      case 'alltime':
        return { start: new Date(2020, 0, 1), end: today };
      case 'custom':
        return customDateRange;
      default:
        return { start: today, end: today };
    }
  }, [selectedPeriod, customDateRange.start.getTime(), customDateRange.end.getTime()]);

  const totalDays = useMemo(() => {
    return Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [dateRange.start.getTime(), dateRange.end.getTime()]);

  /**
   * 🎯 CORE: Fetch habits from SQLite and calculate metrics
   * 🔥 FIX 2: Added missing 'count' property to dailyData
   */
  const fetchHabits = useCallback(async () => {
    if (!user?.id) {
      console.warn('⚠️ No user ID - cannot fetch habits');
      return [];
    }

    console.log('📊 Fetching habits from SQLite for period:', {
      period: selectedPeriod,
      startDate: formatDate(dateRange.start),
      endDate: formatDate(dateRange.end),
      totalDays
    });

    try {
      const localHabits = await habitService.getHabits();
      console.log(`✅ Retrieved ${localHabits.length} habits from service`);

      if (localHabits.length === 0) {
        console.log('ℹ️ No habits found');
        return [];
      }

      const startDateStr = formatDate(dateRange.start);
      const endDateStr = formatDate(dateRange.end);

      const allCompletions = await Promise.all(
        localHabits.map(habit =>
          habitService.getCompletionsByDateRange(habit.id, user.id, startDateStr, endDateStr)
        )
      );

      console.log(`✅ Retrieved completions for ${localHabits.length} habits`);

      const transformedHabits: HabitDataProps[] = localHabits.map((habit, index) => {
        const completions = allCompletions[index] || [];
        
        console.log(`📈 Processing habit: ${habit.title}`, {
          id: habit.id,
          frequencyType: habit.frequency_type,
          completions: completions.length
        });

        const expectedCompletions = calculateExpectedCompletions(
          habit,
          totalDays,
          dateRange
        );

        const actualCompletions = completions.filter(c => 
          c.completed_count >= habit.target_count
        ).length;

        const completionRate = expectedCompletions > 0
          ? Math.round((actualCompletions / expectedCompletions) * 100)
          : 0;

        const { currentStreak, longestStreak } = calculateHabitStreak(habit, completions);
        const consistencyScore = calculateConsistency(completions, expectedCompletions, totalDays);
        const momentum = calculateMomentum(completions, habit, totalDays);

        console.log(`✅ ${habit.title} metrics:`, {
          expected: expectedCompletions,
          actual: actualCompletions,
          completionRate,
          currentStreak,
          consistencyScore,
          momentum
        });

        return {
          id: habit.id,
          name: habit.title,
          icon: habit.icon,
          completionRate,
          currentStreak,
          longestStreak,
          totalDays,
          consistencyScore,
          momentum,
          optimalTime: 'Anytime',
          difficulty: 'Medium' as const,
          weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
          monthlyTrend: Array(12).fill(0),
          correlationScore: 0,
          // 🔥 FIX: Added missing 'count' property
          dailyData: completions.map(c => ({
            date: c.completion_date,
            completed: c.completed_count >= habit.target_count,
            count: c.completed_count
          })),
          frequency: {
            type: habit.frequency_type as 'daily' | 'weekly' | 'monthly' | 'custom',
            count: habit.frequency_count || 1,
            expected: expectedCompletions,
            actual: actualCompletions,
            days: parseFrequencyDays(habit.frequency_days)
          }
        };
      });

      console.log(`✅ Successfully transformed ${transformedHabits.length} habits`);
      return transformedHabits;

    } catch (err) {
      console.error('❌ Error fetching habits:', err);
      throw err;
    }
  }, [user?.id, dateRange.start.getTime(), dateRange.end.getTime(), totalDays, habitService]);

  /**
   * Calculate overall metrics from habits
   * 🔥 FIX 3: Wrapped in useCallback with proper dependencies
   */
  const calculateMetrics = useCallback((habitsList: HabitDataProps[]): OverallMetrics => {
    if (habitsList.length === 0) {
      return {
        totalHabits: 0,
        activeStreaks: 0,
        completionRate: 0,
        consistencyScore: 0,
        momentum: 0,
        improvement: 0,
        weeklyGoal: 80,
        monthlyGoal: 85
      };
    }

    const totalHabits = habitsList.length;
    const activeStreaks = habitsList.filter(h => h.currentStreak > 0).length;
    
    const avgCompletionRate = Math.round(
      habitsList.reduce((sum, h) => sum + h.completionRate, 0) / totalHabits
    );
    
    const avgConsistency = Math.round(
      habitsList.reduce((sum, h) => sum + h.consistencyScore, 0) / totalHabits
    );
    
    const avgMomentum = Math.round(
      habitsList.reduce((sum, h) => sum + h.momentum, 0) / totalHabits
    );

    const improvement = avgMomentum - avgCompletionRate;

    console.log('📊 Overall Metrics:', {
      totalHabits,
      activeStreaks,
      avgCompletionRate,
      avgConsistency,
      avgMomentum,
      improvement
    });

    return {
      totalHabits,
      activeStreaks,
      completionRate: avgCompletionRate,
      consistencyScore: avgConsistency,
      momentum: avgMomentum,
      improvement: Math.round(improvement),
      weeklyGoal: 80,
      monthlyGoal: 85
    };
  }, []);

  /**
   * 🔥 FIX 4: Proper period data with correct types (HabitDataProps = HabitData)
   */
  const periodData = useMemo((): PeriodData => {
    const metrics = calculateMetrics(habits);
    const periodLabel = getPeriodLabel(selectedPeriod, dateRange);

    return {
      habits, // This is correct - HabitDataProps matches HabitData
      overallMetrics: metrics,
      periodLabel,
      totalDays
    };
  }, [habits, selectedPeriod, dateRange, totalDays, calculateMetrics]);

  /**
   * Refresh data from SQLite
   */
  const refreshData = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) {
      console.warn('⚠️ Cannot refresh: No user or component unmounted');
      setIsLoading(false);
      return;
    }

    console.log('🔄 Refreshing report data...');
    setIsLoading(true);
    setError(null);

    try {
      const fetchedHabits = await fetchHabits();
      
      if (isMountedRef.current) {
        setHabits(fetchedHabits);
        setLastUpdated(new Date());
        console.log(`✅ Report refreshed: ${fetchedHabits.length} habits loaded`);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMessage = err.message || 'Failed to load report data';
        setError(errorMessage);
        console.error('❌ Error refreshing report:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, fetchHabits]);

  /**
   * Set period
   */
  const setPeriod = useCallback((period: TimePeriod) => {
    console.log('📅 Setting period to:', period);
    setSelectedPeriod(period);
    setError(null);
  }, []);

  /**
   * Set custom range
   */
  const setCustomRange = useCallback((start: Date, end: Date) => {
    if (start > end) {
      setError('Start date must be before end date');
      return;
    }
    console.log('📅 Setting custom range:', { start, end });
    setCustomDateRange({ start, end });
    setSelectedPeriod('custom');
    setError(null);
  }, []);

  // 🔥 FIX 5: Initial load with stable dependency
  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id, dateRange.start.getTime(), dateRange.end.getTime()]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    refreshTimerRef.current = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, user?.id, refreshData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const cacheStatus = useMemo((): 'fresh' | 'stale' | 'empty' => {
    if (!lastUpdated) return 'empty';
    const age = Date.now() - lastUpdated.getTime();
    return age < 60000 ? 'fresh' : 'stale';
  }, [lastUpdated]);

  return {
    periodData,
    selectedPeriod,
    customDateRange,
    isLoading,
    error,
    setPeriod,
    setCustomRange,
    refreshData,
    lastUpdated,
    cacheStatus
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateExpectedCompletions(
  habit: LocalHabitRecord,
  totalDays: number,
  dateRange: { start: Date; end: Date }
): number {
  const frequencyType = habit.frequency_type || 'daily';
  const frequencyCount = habit.frequency_count || 1;
  const frequencyDays = habit.frequency_days;

  switch (frequencyType) {
    case 'daily':
      if (frequencyDays && Array.isArray(frequencyDays) && frequencyDays.length > 0) {
        return countSpecificDaysInRange(dateRange.start, dateRange.end, frequencyDays);
      }
      return totalDays;

    case 'weekly': {
      const fullWeeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      return fullWeeks * frequencyCount + Math.ceil((frequencyCount * remainingDays) / 7);
    }

    case 'monthly': {
      const fullMonths = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;
      return fullMonths * frequencyCount + Math.ceil((frequencyCount * remainingDays) / 30);
    }

    default:
      return totalDays;
  }
}

function countSpecificDaysInRange(start: Date, end: Date, allowedDays: (string | number)[]): number {
  let count = 0;
  const current = new Date(start);
  
  const dayNumbers = allowedDays.map(day => {
    if (typeof day === 'number') return day;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames.findIndex(name => name.toLowerCase().startsWith(day.toLowerCase()));
  }).filter(d => d >= 0);
  
  while (current <= end) {
    if (dayNumbers.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function calculateConsistency(
  completions: LocalCompletionRecord[],
  expectedCompletions: number,
  totalDays: number
): number {
  if (expectedCompletions === 0 || totalDays === 0) return 0;

  const actualCompletions = completions.length;
  const consistency = (actualCompletions / expectedCompletions) * 100;

  return Math.min(Math.round(consistency), 100);
}

function calculateMomentum(
  completions: LocalCompletionRecord[],
  habit: LocalHabitRecord,
  totalDays: number
): number {
  if (completions.length === 0) return 0;

  const recentDays = Math.min(7, Math.floor(totalDays / 2));
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - recentDays);
  const recentDateStr = formatDate(recentDate);

  const recentCompletions = completions.filter(c => c.completion_date >= recentDateStr);
  
  const expectedRecent = calculateExpectedCompletions(
    habit,
    recentDays,
    { start: recentDate, end: new Date() }
  );

  if (expectedRecent === 0) return 0;

  const momentum = (recentCompletions.length / expectedRecent) * 100;
  return Math.min(Math.round(momentum), 100);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseFrequencyDays(days: any): number[] | undefined {
  if (!days) return undefined;
  
  try {
    if (Array.isArray(days)) return days;
    if (typeof days === 'string') return JSON.parse(days);
  } catch (error) {
    console.warn('Failed to parse frequency days:', error);
  }
  
  return undefined;
}

function getPeriodLabel(period: TimePeriod, dateRange: { start: Date; end: Date }): string {
  switch (period) {
    case 'today': return 'Today';
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'last6months': return 'Last 6 Months';
    case 'year': return 'This Year';
    case 'lastyear': return 'Last Year';
    case 'alltime': return 'All Time';
    case 'custom':
      return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
    default: return 'Unknown';
  }
}