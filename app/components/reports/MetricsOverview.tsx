// components/reports/MetricsOverview.tsx
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { OverallMetrics } from '@/interfaces/interfaces';
import  MetricCard  from '../../components/reports/MetricCard';

interface MetricsOverviewProps {
  overallMetrics: OverallMetrics;
  isLoading?: boolean;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ 
  overallMetrics,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <View className="mb-4">
        <View className="flex-row gap-3 mb-3">
          <View className="card p-4 flex-1 h-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <View className="card p-4 flex-1 h-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </View>
        <View className="flex-row gap-3 mb-4">
          <View className="card p-4 flex-1 h-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <View className="card p-4 flex-1 h-24 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </View>
      </View>
    );
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMomentumColor = (momentum: number) => {
    if (momentum >= 70) return 'text-orange-600 dark:text-orange-400';
    if (momentum >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <View className="mb-4">
      {/* First row of metrics */}
      <View className="flex-row gap-3 mb-3">
        <MetricCard 
          title="Completion Rate"
          value={`${overallMetrics.completionRate}%`}
          subtitle={`${overallMetrics.totalHabits} habits tracked`}
          color={getCompletionColor(overallMetrics.completionRate)}
          trend={overallMetrics.improvement}
          icon="🎯"
        />
        <MetricCard 
          title="Active Streaks"
          value={`${overallMetrics.activeStreaks}`}
          subtitle={`Of ${overallMetrics.totalHabits} habit${overallMetrics.totalHabits !== 1 ? 's' : ''}`}
          color="text-green-600 dark:text-green-400"
          icon="🔥"
        />
      </View>

      {/* Second row of metrics */}
      <View className="flex-row gap-3 mb-4">
        <MetricCard 
          title="Consistency"
          value={`${overallMetrics.consistencyScore}`}
          subtitle="Score"
          color="text-purple-600 dark:text-purple-400"
          trend={overallMetrics.improvement}
          icon="📊"
        />
        <MetricCard 
          title="Momentum"
          value={`${overallMetrics.momentum}`}
          subtitle="Current trend"
          color={getMomentumColor(overallMetrics.momentum)}
          icon="⚡"
        />
      </View>

      {/* Goals Progress */}
      {(overallMetrics.weeklyGoal || overallMetrics.monthlyGoal) && (
        <View className="card p-4 mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Goals Progress
          </Text>
          <View className="space-y-3">
            {overallMetrics.weeklyGoal && (
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Weekly Goal
                  </Text>
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {overallMetrics.completionRate}% / {overallMetrics.weeklyGoal}%
                  </Text>
                </View>
                <View className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <View 
                    className={`h-2 rounded-full ${
                      overallMetrics.completionRate >= overallMetrics.weeklyGoal
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${Math.min((overallMetrics.completionRate / overallMetrics.weeklyGoal) * 100, 100)}%` 
                    }}
                  />
                </View>
              </View>
            )}
            {overallMetrics.monthlyGoal && (
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Monthly Goal
                  </Text>
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {overallMetrics.completionRate}% / {overallMetrics.monthlyGoal}%
                  </Text>
                </View>
                <View className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <View 
                    className={`h-2 rounded-full ${
                      overallMetrics.completionRate >= overallMetrics.monthlyGoal
                        ? 'bg-green-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ 
                      width: `${Math.min((overallMetrics.completionRate / overallMetrics.monthlyGoal) * 100, 100)}%` 
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default MetricsOverview;