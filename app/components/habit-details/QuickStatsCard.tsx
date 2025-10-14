// ==========================================
// components/habit-details/QuickStatsCard.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { getTrendIcon } from '@/utils/habitHelpers';

interface QuickStatsCardProps {
  statistics: {
    totalDays: number;
    completedDays: number;
    longestStreak: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

export const QuickStatsCard = memo<QuickStatsCardProps>(({ statistics }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</Text>
    <View className="flex-row justify-between mb-4">
      <StatItem 
        value={statistics.totalDays} 
        label="Days This Month" 
        color="text-gray-900 dark:text-white"
      />
      <StatItem 
        value={statistics.completedDays} 
        label="Completed" 
        color="text-green-600"
      />
      <StatItem 
        value={statistics.longestStreak} 
        label="Best Streak" 
        color="text-purple-600"
      />
      <View className="items-center">
        <Text className="text-xl">{getTrendIcon(statistics.trendDirection)}</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">Trend</Text>
      </View>
    </View>
  </View>
));

QuickStatsCard.displayName = 'QuickStatsCard';

const StatItem = memo<{ value: number; label: string; color: string }>(({ value, label, color }) => (
  <View className="items-center">
    <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
    <Text className="text-gray-600 dark:text-gray-400 text-sm">{label}</Text>
  </View>
));

StatItem.displayName = 'StatItem';