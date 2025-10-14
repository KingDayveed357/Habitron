// hooks/useReport.ts - FREQUENCY-AWARE VERSION
/**
 * useReport Hook - Frequency-Aware Calculations
 * 
 * 🎯 NEW: Respects habit frequency for accurate metrics
 * - Daily habits: Expects completion every day
 * - Weekly habits: Expects X completions per week
 * - Monthly habits: Expects X completions per month
 * 
 * @version 3.0.0 - Frequency-aware calculations
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { insightsService, InsightsContext, PeriodInfo } from '@/services/AIServices/insights';
import type { 
  TimePeriod, 
  HabitDataProps, 
  OverallMetrics, 
  PeriodData,
  AIInsight 
} from '@/interfaces/interfaces';

interface UseReportOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableInsights?: boolean;
}

interface UseReportReturn {
  periodData: PeriodData;
  aiInsights: AIInsight[];
  selectedPeriod: TimePeriod;
  customDateRange: { start: Date; end: Date };
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: TimePeriod) => void;
  setCustomRange: (start: Date, end: Date) => void;
  refreshData: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  lastUpdated: Date | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
}

/**
 * 🔧 Frequency type from your database
 */
type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom';

interface HabitFrequency {
  type: FrequencyType;
  count: number; // e.g., 3 for "3 times per week"
  days?: number[]; // Optional: specific days [0-6] for weekly habits
}

export const useReport = (options: UseReportOptions = {}): UseReportReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 60000,
    enableInsights = true
  } = options;

  const { user } = useAuth();
  const currentUserIdRef = useRef<string | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(),
    end: new Date()
  });
  const [habits, setHabits] = useState<HabitDataProps[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [selectedPeriod, customDateRange]);

  const totalDays = useMemo(() => {
    return Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  }, [dateRange]);

  const periodInfo = useMemo((): PeriodInfo => {
    return {
      type: selectedPeriod,
      label: getPeriodLabel(selectedPeriod, dateRange),
      totalDays: totalDays,
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    };
  }, [selectedPeriod, dateRange, totalDays]);

  /**
   * 🎯 FREQUENCY-AWARE: Calculate expected completions based on habit frequency
   */
  const calculateExpectedCompletions = useCallback((
    frequency: HabitFrequency,
    totalDays: number,
    dateRange: { start: Date; end: Date }
  ): number => {
    const { type, count, days } = frequency;

    switch (type) {
      case 'daily':
        // Daily habit: Expected every day
        return totalDays;

      case 'weekly': {
        // Weekly habit: e.g., "3 times per week"
        const fullWeeks = Math.floor(totalDays / 7);
        const remainingDays = totalDays % 7;
        
        // For full weeks, multiply count by number of weeks
        let expected = fullWeeks * count;
        
        // For remaining days, proportionally calculate expected
        if (remainingDays > 0) {
          expected += Math.ceil((count * remainingDays) / 7);
        }
        
        // If specific days are set, count those days in the period
        if (days && days.length > 0) {
          expected = countSpecificDaysInRange(dateRange.start, dateRange.end, days);
        }
        
        return expected;
      }

      case 'monthly': {
        // Monthly habit: e.g., "2 times per month"
        const fullMonths = Math.floor(totalDays / 30);
        const remainingDays = totalDays % 30;
        
        let expected = fullMonths * count;
        
        // For remaining days, proportionally calculate
        if (remainingDays > 0) {
          expected += Math.ceil((count * remainingDays) / 30);
        }
        
        return expected;
      }

      case 'custom':
        // Custom frequency: specified number of times in the period
        return count;

      default:
        return totalDays; // Default to daily
    }
  }, []);

  /**
   * 🎯 FREQUENCY-AWARE: Fetch and transform habits
   */
  const fetchHabits = useCallback(async () => {
    if (!user?.id) {
      console.warn('⚠️ No user ID - skipping fetch');
      return [];
    }

    try {
      console.log('🔍 Fetching habits for user:', user.id);

      // Fetch habits with frequency information
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (habitsError) {
        console.error('❌ Habits query error:', habitsError);
        throw new Error(`Failed to fetch habits: ${habitsError.message}`);
      }

      // Validate habits belong to user
      const validHabits = (habitsData || []).filter(habit => {
        if (habit.user_id !== user.id) {
          console.error('🚨 SECURITY: Habit does not belong to user!', habit.id);
          return false;
        }
        return true;
      });

      console.log(`✅ Fetched ${validHabits.length} habits`);

      if (validHabits.length === 0) {
        console.log('ℹ️ No habits found for user');
        return [];
      }

      const habitIds = validHabits.map(h => h.id);

      // Fetch completions for the period
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .in('habit_id', habitIds)
        .gte('completion_date', dateRange.start.toISOString())
        .lte('completion_date', dateRange.end.toISOString());

      if (completionsError) {
        console.error('❌ Completions query error:', completionsError);
        throw new Error(`Failed to fetch completions: ${completionsError.message}`);
      }

      // Validate completions
      const validCompletions = (completionsData || []).filter(completion => {
        if (completion.user_id !== user.id) {
          console.error('🚨 SECURITY: Completion does not belong to user!');
          return false;
        }
        if (!habitIds.includes(completion.habit_id)) {
          console.error('🚨 SECURITY: Completion for non-owned habit!');
          return false;
        }
        return true;
      });

      console.log(`✅ Fetched ${validCompletions.length} completions`);

      // Group completions by habit_id
      const completionsMap = new Map<string, any[]>();
      validCompletions.forEach(completion => {
        const list = completionsMap.get(completion.habit_id) || [];
        list.push(completion);
        completionsMap.set(completion.habit_id, list);
      });

      // 🎯 Transform habits with FREQUENCY-AWARE calculations
      const transformedHabits: HabitDataProps[] = validHabits.map(habit => {
        const completions = completionsMap.get(habit.id) || [];
        
        // 🔧 Parse frequency from habit data
        const frequency: HabitFrequency = parseFrequency(habit);
        
        // 🎯 Calculate expected completions based on frequency
        const expectedCompletions = calculateExpectedCompletions(
          frequency,
          totalDays,
          dateRange
        );

        const actualCompletions = completions.length;
        
        // 🎯 FREQUENCY-AWARE: Completion rate based on expected vs actual
        const completionRate = expectedCompletions > 0
          ? Math.min(Math.round((actualCompletions / expectedCompletions) * 100), 100)
          : 0;

        const { current, longest } = calculateStreaks(completions, frequency, dateRange);

        return {
          id: habit.id,
          name: habit.title || habit.name || 'Unnamed Habit',
          icon: habit.icon || '📌',
          completionRate,
          currentStreak: current,
          longestStreak: longest,
          totalDays,
          consistencyScore: calculateFrequencyAwareConsistency(
            completions, 
            frequency, 
            totalDays,
            dateRange
          ),
          momentum: calculateFrequencyAwareMomentum(completions, frequency),
          optimalTime: findOptimalTime(completions),
          difficulty: habit.difficulty || 'Medium',
          weeklyPattern: calculateWeeklyPattern(completions),
          monthlyTrend: calculateMonthlyTrend(completions),
          correlationScore: calculateCorrelation(completions),
          // 🎯 NEW: Include frequency info
          frequency: {
            type: frequency.type,
            count: frequency.count,
            expected: expectedCompletions,
            actual: actualCompletions
          },
          dailyData: completions.map(c => ({
            date: c.completion_date,
            completed: true,
            count: c.count || 1
          }))
        };
      });

      console.log(`✅ Transformed ${transformedHabits.length} habits (frequency-aware)`);
      return transformedHabits;

    } catch (err) {
      console.error('❌ Error in fetchHabits:', err);
      throw err;
    }
  }, [user?.id, dateRange, totalDays, calculateExpectedCompletions]);

  /**
   * Calculate overall metrics (frequency-aware)
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
    
    // 🎯 Average completion rates (already frequency-aware from individual habits)
    const avgCompletionRate = Math.round(
      habitsList.reduce((sum, h) => sum + h.completionRate, 0) / totalHabits
    );
    const avgConsistency = Math.round(
      habitsList.reduce((sum, h) => sum + h.consistencyScore, 0) / totalHabits
    );
    const avgMomentum = Math.round(
      habitsList.reduce((sum, h) => sum + h.momentum, 0) / totalHabits
    );

    const improvement = calculateImprovement(habitsList);

    return {
      totalHabits,
      activeStreaks,
      completionRate: avgCompletionRate,
      consistencyScore: avgConsistency,
      momentum: avgMomentum,
      improvement,
      weeklyGoal: 80,
      monthlyGoal: 85
    };
  }, []);

  const periodData = useMemo((): PeriodData => {
    const metrics = calculateMetrics(habits);

    return {
      habits,
      overallMetrics: metrics,
      periodLabel: periodInfo.label,
      totalDays: periodInfo.totalDays
    };
  }, [habits, periodInfo, calculateMetrics]);

  const fetchInsights = useCallback(async () => {
    if (!user?.id || !enableInsights) return;

    try {
      const context: InsightsContext = {
        habits: habits.map(h => ({
          id: h.id,
          title: h.name,
          category: 'General',
          completionRate: h.completionRate,
          currentStreak: h.currentStreak
        })),
        stats: {
          totalHabits: periodData.overallMetrics.totalHabits,
          completedToday: habits.filter(h => h.currentStreak > 0).length,
          completionRate: periodData.overallMetrics.completionRate,
          activeStreak: periodData.overallMetrics.activeStreaks
        },
        timeframe: selectedPeriod === 'today' ? 'today' : 
                   selectedPeriod === 'week' ? 'week' : 
                   selectedPeriod === 'month' ? 'month' : 'all',
        userProfile: {
          name: user.email || 'User',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        period: periodInfo
      };

      console.log('🔄 Fetching insights with period:', periodInfo.label);

      const insights = await insightsService.getInsights(
        user.id,
        context,
        { forceRefresh: false }
      );

      setAIInsights(insights);
      console.log(`✅ Loaded ${insights.length} insights`);
    } catch (err) {
      console.warn('⚠️ Failed to fetch insights:', err);
    }
  }, [user?.id, habits, periodData.overallMetrics, selectedPeriod, enableInsights, periodInfo]);

  const refreshData = useCallback(async () => {
    if (!user?.id) {
      console.warn('⚠️ Cannot refresh: No authenticated user');
      setIsLoading(false);
      setHabits([]);
      setError('Please sign in to view your habits');
      return;
    }

    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      console.log('🔄 User changed - clearing old data');
      setHabits([]);
      setAIInsights([]);
      insightsService.clearCache(currentUserIdRef.current);
    }
    currentUserIdRef.current = user.id;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const fetchedHabits = await fetchHabits();
      setHabits(fetchedHabits);
      setLastUpdated(new Date());
      console.log(`✅ Set ${fetchedHabits.length} habits in state`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Failed to load data';
        setError(errorMessage);
        console.error('❌ Error refreshing data:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchHabits]);

  const refreshInsights = useCallback(async () => {
    await fetchInsights();
  }, [fetchInsights]);

  const setPeriod = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
    setError(null);
  }, []);

  const setCustomRange = useCallback((start: Date, end: Date) => {
    if (start > end) {
      setError('Start date must be before end date');
      return;
    }
    setCustomDateRange({ start, end });
    setSelectedPeriod('custom');
    setError(null);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      console.log('🔒 No user - clearing all data');
      setHabits([]);
      setAIInsights([]);
      currentUserIdRef.current = null;
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id, dateRange.start.toISOString(), dateRange.end.toISOString()]);

  useEffect(() => {
    if (habits.length > 0 && !isLoading && user?.id) {
      fetchInsights();
    }
  }, [habits.length, isLoading, user?.id]);

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
  }, [autoRefresh, refreshInterval, user?.id]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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
    aiInsights,
    selectedPeriod,
    customDateRange,
    isLoading,
    error,
    setPeriod,
    setCustomRange,
    refreshData,
    refreshInsights,
    lastUpdated,
    cacheStatus
  };
};

// ============================================================================
// 🎯 FREQUENCY-AWARE UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse frequency from habit data
 */
function parseFrequency(habit: any): HabitFrequency {
  // From useHabits hook, frequency is stored as: frequency_type, frequency_count, frequency_days
  const type = habit.frequency_type || habit.frequency || 'daily';
  const count = habit.frequency_count || habit.target_count || 1;
  const days = habit.frequency_days || habit.specific_days || null;


  // Safely parse days - it might already be an array or need parsing
  let parsedDays: number[] | undefined = undefined;
  if (days) {
    try {
      // If it's already an array, use it directly
      if (Array.isArray(days)) {
        parsedDays = days;
      } 
      // If it's a string, try to parse it
      else if (typeof days === 'string') {
        parsedDays = JSON.parse(days);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse frequency_days:', days, error);
      parsedDays = undefined;
    }
  }

  return {
    type: type as FrequencyType,
    count: count,
    days: parsedDays
  };
}


/**
 * Count specific days in range (for weekly habits with specific days)
 */
function countSpecificDaysInRange(start: Date, end: Date, allowedDays: number[]): number {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    if (allowedDays.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * 🎯 FREQUENCY-AWARE: Calculate streaks
 */
function calculateStreaks(
  completions: any[],
  frequency: HabitFrequency,
  dateRange: { start: Date; end: Date }
): { current: number; longest: number } {
  if (completions.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = [...new Set(
    completions.map(c => new Date(c.completion_date).toDateString())
  )].sort();

  // For non-daily habits, streak calculation is different
  if (frequency.type === 'weekly') {
    return calculateWeeklyStreak(uniqueDates, frequency);
  } else if (frequency.type === 'monthly') {
    return calculateMonthlyStreak(uniqueDates, frequency);
  }

  // Daily habits: consecutive days
  let longest = 1;
  let streak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  
  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  const current = daysSince <= 1 ? streak : 0;

  return { current, longest };
}

/**
 * Calculate weekly streak (meets frequency requirement each week)
 */
function calculateWeeklyStreak(dates: string[], frequency: HabitFrequency): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const weeklyCompletions = groupByWeek(dates);
  const requiredPerWeek = frequency.count;

  let longest = 0;
  let current = 0;
  let streak = 0;

  const weeks = Array.from(weeklyCompletions.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  for (let i = 0; i < weeks.length; i++) {
    const [weekKey, count] = weeks[i];
    
    if (count >= requiredPerWeek) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  // Check if current week meets requirement
  const thisWeek = getWeekKey(new Date());
  const thisWeekCount = weeklyCompletions.get(thisWeek) || 0;
  current = thisWeekCount >= requiredPerWeek ? streak : 0;

  return { current, longest };
}

/**
 * Calculate monthly streak
 */
function calculateMonthlyStreak(dates: string[], frequency: HabitFrequency): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const monthlyCompletions = groupByMonth(dates);
  const requiredPerMonth = frequency.count;

  let longest = 0;
  let current = 0;
  let streak = 0;

  const months = Array.from(monthlyCompletions.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  for (let i = 0; i < months.length; i++) {
    const [monthKey, count] = months[i];
    
    if (count >= requiredPerMonth) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  // Check if current month meets requirement
  const thisMonth = getMonthKey(new Date());
  const thisMonthCount = monthlyCompletions.get(thisMonth) || 0;
  current = thisMonthCount >= requiredPerMonth ? streak : 0;

  return { current, longest };
}

/**
 * 🎯 FREQUENCY-AWARE: Consistency score
 */
function calculateFrequencyAwareConsistency(
  completions: any[],
  frequency: HabitFrequency,
  totalDays: number,
  dateRange: { start: Date; end: Date }
): number {
  if (totalDays === 0) return 0;

  const actualCompletions = completions.length;
  
  // Calculate expected based on frequency
  const expectedCompletions = calculateExpectedForFrequency(frequency, totalDays, dateRange);
  
  if (expectedCompletions === 0) return 0;
  
  // Consistency = actual / expected * 100
  return Math.min(Math.round((actualCompletions / expectedCompletions) * 100), 100);
}

/**
 * 🎯 FREQUENCY-AWARE: Momentum
 */
function calculateFrequencyAwareMomentum(completions: any[], frequency: HabitFrequency): number {
  if (completions.length === 0) return 0;

  const recentDays = 7;
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - recentDays);

  const recentCompletions = completions.filter(
    c => new Date(c.completion_date) >= recentDate
  );

  const actualRecent = recentCompletions.length;
  
  // Calculate expected for last 7 days
  const expectedRecent = calculateExpectedForFrequency(
    frequency,
    7,
    { start: recentDate, end: new Date() }
  );

  if (expectedRecent === 0) return 0;

  return Math.min(Math.round((actualRecent / expectedRecent) * 100), 100);
}

/**
 * Helper: Calculate expected completions
 */
function calculateExpectedForFrequency(
  frequency: HabitFrequency,
  days: number,
  dateRange: { start: Date; end: Date }
): number {
  switch (frequency.type) {
    case 'daily':
      return days;
    case 'weekly': {
      const weeks = days / 7;
      return Math.ceil(weeks * frequency.count);
    }
    case 'monthly': {
      const months = days / 30;
      return Math.ceil(months * frequency.count);
    }
    default:
      return days;
  }
}

// Helper functions
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

function groupByWeek(dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  dates.forEach(dateStr => {
    const date = new Date(dateStr);
    const weekKey = getWeekKey(date);
    map.set(weekKey, (map.get(weekKey) || 0) + 1);
  });
  return map;
}

function groupByMonth(dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  dates.forEach(dateStr => {
    const date = new Date(dateStr);
    const monthKey = getMonthKey(date);
    map.set(monthKey, (map.get(monthKey) || 0) + 1);
  });
  return map;
}

// Other utility functions (unchanged)
function findOptimalTime(completions: any[]): string {
  if (completions.length === 0) return 'Anytime';

  const hours = completions.map(c => new Date(c.completion_date).getHours());
  const avgHour = Math.round(
    hours.reduce((sum, h) => sum + h, 0) / hours.length
  );

  if (avgHour < 12) return 'Morning';
  if (avgHour < 17) return 'Afternoon';
  return 'Evening';
}

function calculateWeeklyPattern(completions: any[]): number[] {
  const pattern = [0, 0, 0, 0, 0, 0, 0];
  
  completions.forEach(c => {
    const day = new Date(c.completion_date).getDay();
    pattern[day]++;
  });

  return pattern;
}

function calculateMonthlyTrend(completions: any[]): number[] {
  const monthlyData = Array(12).fill(0);
  
  completions.forEach(c => {
    const month = new Date(c.completion_date).getMonth();
    monthlyData[month]++;
  });
  
  return monthlyData;
}

function calculateCorrelation(completions: any[]): number {
  return completions.length > 10 ? 75 : 50;
}

function calculateImprovement(habits: HabitDataProps[]): number {
  if (habits.length === 0) return 0;
  
  const avgMomentum = habits.reduce((sum, h) => sum + h.momentum, 0) / habits.length;
  const avgCompletion = habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length;
  
  const improvement = avgMomentum - avgCompletion;
  
  return Math.round(Math.max(-20, Math.min(20, improvement)));
}

function getPeriodLabel(period: TimePeriod, dateRange: { start: Date; end: Date }): string {
  switch (period) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'last6months':
      return 'Last 6 Months';
    case 'year':
      return 'This Year';
    case 'lastyear':
      return 'Last Year';
    case 'alltime':
      return 'All Time';
    case 'custom':
      return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
    default:
      return 'Unknown';
  }
}