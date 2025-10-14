// components/reports/PerformanceSummary.tsx

import { View, Text } from "react-native"
import { PeriodData } from "@/interfaces/interfaces";

interface PerformanceSummaryProps {
  periodData: PeriodData;
  isLoading?: boolean;
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ 
  periodData,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <View className="card p-4 mb-6 bg-gray-200 dark:bg-gray-800 animate-pulse h-48" />
    );
  }

  const { overallMetrics, periodLabel, totalDays, habits } = periodData;
  
  const topHabit = habits.reduce((best, current) => 
    current.completionRate > (best?.completionRate || 0) ? current : best
  , habits[0]);

  const needsAttention = habits.filter(h => h.completionRate < 50);
  
  const getPerformanceLevel = (rate: number): { label: string; color: string; emoji: string } => {
    if (rate >= 90) return { label: 'Exceptional', color: 'text-green-600 dark:text-green-400', emoji: '🌟' };
    if (rate >= 75) return { label: 'Excellent', color: 'text-blue-600 dark:text-blue-400', emoji: '💪' };
    if (rate >= 60) return { label: 'Good', color: 'text-yellow-600 dark:text-yellow-400', emoji: '👍' };
    if (rate >= 40) return { label: 'Fair', color: 'text-orange-600 dark:text-orange-400', emoji: '📈' };
    return { label: 'Needs Work', color: 'text-red-600 dark:text-red-400', emoji: '🎯' };
  };

  const performance = getPerformanceLevel(overallMetrics.completionRate);

  return (
    <View className="card p-5 mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            Period Summary
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {periodLabel}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-3xl mb-1">{performance.emoji}</Text>
          <Text className={`text-sm font-semibold ${performance.color}`}>
            {performance.label}
          </Text>
        </View>
      </View>

      {/* Key Stats Grid */}
      <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Duration
            </Text>
            <Text className="text-base font-semibold text-gray-800 dark:text-white">
              {totalDays} day{totalDays !== 1 ? 's' : ''}
            </Text>
          </View>
          <View className="w-1/2 mb-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Habits Tracked
            </Text>
            <Text className="text-base font-semibold text-gray-800 dark:text-white">
              {overallMetrics.totalHabits}
            </Text>
          </View>
          <View className="w-1/2 mb-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Completion Rate
            </Text>
            <Text className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
              {overallMetrics.completionRate}%
            </Text>
          </View>
          <View className="w-1/2 mb-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Active Streaks
            </Text>
            <Text className="text-base font-semibold text-green-600 dark:text-green-400">
              {overallMetrics.activeStreaks}/{overallMetrics.totalHabits}
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Consistency
            </Text>
            <Text className="text-base font-semibold text-purple-600 dark:text-purple-400">
              {overallMetrics.consistencyScore}%
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Momentum
            </Text>
            <Text className="text-base font-semibold text-orange-600 dark:text-orange-400">
              {overallMetrics.momentum}
            </Text>
          </View>
        </View>
      </View>

      {/* Top Performer */}
      {topHabit && (
        <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🏆 Top Performer
          </Text>
          <View className="flex-row items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg">
            <View className="flex-row items-center flex-1">
              <Text className="text-2xl mr-2">{topHabit.icon}</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  {topHabit.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {topHabit.currentStreak} day streak
                </Text>
              </View>
            </View>
            <Text className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {topHabit.completionRate}%
            </Text>
          </View>
        </View>
      )}

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ⚠️ Needs Attention ({needsAttention.length})
          </Text>
          <View className="space-y-2">
            {needsAttention.slice(0, 3).map((habit) => (
              <View 
                key={habit.id}
                className="flex-row items-center justify-between bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-lg mr-2">{habit.icon}</Text>
                  <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {habit.name}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {habit.completionRate}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Insights */}
      <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
        <Text className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Quick Insights
        </Text>
        <View className="space-y-1">
          {overallMetrics.completionRate >= 80 && (
            <Text className="text-xs text-blue-800 dark:text-blue-400">
              • Excellent consistency! You're in the top 20% of users.
            </Text>
          )}
          {overallMetrics.activeStreaks > 0 && (
            <Text className="text-xs text-blue-800 dark:text-blue-400">
              • You have {overallMetrics.activeStreaks} active streak{overallMetrics.activeStreaks !== 1 ? 's' : ''} going!
            </Text>
          )}
          {overallMetrics.momentum >= 70 && (
            <Text className="text-xs text-blue-800 dark:text-blue-400">
              • Strong momentum! Keep up the great work.
            </Text>
          )}
          {overallMetrics.completionRate < 50 && (
            <Text className="text-xs text-blue-800 dark:text-blue-400">
              • Consider focusing on fewer habits to build consistency.
            </Text>
          )}
          {needsAttention.length > habits.length / 2 && (
            <Text className="text-xs text-blue-800 dark:text-blue-400">
              • More than half your habits need attention. Start small!
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};


export default PerformanceSummary