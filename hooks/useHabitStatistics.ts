// hooks/useHabitStatistics.ts - FIXED VERSION

import { useState, useEffect, useMemo, useRef } from 'react';
import { HabitWithCompletion, HabitCompletion } from '@/types/habit';
import { CalendarDay } from '@/types/calendar';
import { useHabitService } from './useHabitService';
import { useAuth } from './useAuth';
import {
  calculateStreak,
  calculateSuccessMetrics,
  calculatePeriodStats,
  StreakInfo,
  SuccessMetrics,
  PeriodStats
} from '@/utils/habitTrackingAlgorithm';

export interface HabitStatistics {
  completionRate: number;
  consistencyScore: number;
  currentStreak: number;
  longestStreak: number;
  streakUnit: string;
  weekStats: PeriodStats;
  monthStats: PeriodStats;
  allTimeStats: PeriodStats;
  totalScheduledDays: number;
  completedDays: number;
  missedDays: number;
  partialDays: number;
  perfectWeeks: number;
  bestStreak: number;
  totalCompletions: number;
  last7DaysRate: number;
  last30DaysRate: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

const EMPTY_STATS: HabitStatistics = {
  completionRate: 0,
  consistencyScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  streakUnit: 'days',
  weekStats: {
    period: 'week',
    completionRate: 0,
    averageCompletion: 0,
    totalCompletions: 0,
    scheduledDays: 0,
    perfectDays: 0
  },
  monthStats: {
    period: 'month',
    completionRate: 0,
    averageCompletion: 0,
    totalCompletions: 0,
    scheduledDays: 0,
    perfectDays: 0
  },
  allTimeStats: {
    period: 'all',
    completionRate: 0,
    averageCompletion: 0,
    totalCompletions: 0,
    scheduledDays: 0,
    perfectDays: 0
  },
  totalScheduledDays: 0,
  completedDays: 0,
  missedDays: 0,
  partialDays: 0,
  perfectWeeks: 0,
  bestStreak: 0,
  totalCompletions: 0,
  last7DaysRate: 0,
  last30DaysRate: 0,
  improvementTrend: 'stable'
};

export const useHabitStatistics = (
  habit: HabitWithCompletion | null,
  calendarData: CalendarDay[]
): HabitStatistics => {
  const habitService = useHabitService();
  const { user } = useAuth();
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load completions
  useEffect(() => {
    const loadCompletions = async () => {
      if (!habit || !user || loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);

      try {
        // Load up to 1 year of data
        const allCompletions = await habitService.getHabitCompletions(
          habit.id, 
          user.id, 
          365
        );

        if (isMountedRef.current) {
          setCompletions(allCompletions);
        }
      } catch (error) {
        console.error('Error loading completions for statistics:', error);
        if (isMountedRef.current) {
          setCompletions([]);
        }
      } finally {
        loadingRef.current = false;
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadCompletions();
  }, [habit?.id, user?.id, habitService]);

  // Calculate statistics
  const statistics = useMemo((): HabitStatistics => {
    if (!habit || completions.length === 0) {
      return EMPTY_STATS;
    }

    try {
      // Use the simple streak from habit object
      const currentStreak = habit.streak || 0;
      const longestStreak = habit.longestStreak || currentStreak;

      // Calculate metrics for different periods
      const last30DaysMetrics = calculateSuccessMetrics(habit, completions, 30);
      const last7DaysMetrics = calculateSuccessMetrics(habit, completions, 7);

      // Calculate period stats
      const weekStats = calculatePeriodStats(habit, completions, 'week');
      const monthStats = calculatePeriodStats(habit, completions, 'month');
      const allTimeStats = calculatePeriodStats(habit, completions, 'all');

      // Total completions count
      const totalCompletions = completions.reduce(
        (sum, c) => sum + c.completed_count, 
        0
      );

      // Determine improvement trend
      const improvementTrend = determineImprovementTrend(
        last7DaysMetrics.successRate,
        last30DaysMetrics.successRate
      );

      // Get streak unit
      const streakUnit = getStreakUnit(habit.frequency_type);

      return {
        completionRate: Math.round(last30DaysMetrics.successRate),
        consistencyScore: Math.round(last30DaysMetrics.consistencyScore),
        currentStreak,
        longestStreak,
        streakUnit,
        weekStats,
        monthStats,
        allTimeStats,
        totalScheduledDays: last30DaysMetrics.totalScheduledDays,
        completedDays: last30DaysMetrics.completedDays,
        missedDays: last30DaysMetrics.missedDays,
        partialDays: last30DaysMetrics.partiallyCompletedDays,
        perfectWeeks: 0, // Calculate if needed
        bestStreak: longestStreak,
        totalCompletions,
        last7DaysRate: Math.round(last7DaysMetrics.successRate),
        last30DaysRate: Math.round(last30DaysMetrics.successRate),
        improvementTrend
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return EMPTY_STATS;
    }
  }, [habit, completions]);

  return statistics;
};

function determineImprovementTrend(
  last7DaysRate: number,
  last30DaysRate: number
): 'improving' | 'stable' | 'declining' {
  const difference = last7DaysRate - last30DaysRate;

  if (difference > 10) {
    return 'improving';
  } else if (difference < -10) {
    return 'declining';
  } else {
    return 'stable';
  }
}

function getStreakUnit(frequencyType: string): string {
  switch (frequencyType) {
    case 'daily':
      return 'days';
    case 'weekly':
      return 'weeks';
    case 'monthly':
      return 'months';
    default:
      return 'days';
  }
}