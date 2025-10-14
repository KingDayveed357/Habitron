
// ==========================================
// components/habit-details/StatsTab.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { getTrendIcon } from '@/utils/habitHelpers';

interface StatsTabProps {
  statistics: {
    completionRate: number;
    weeklyAverage: number;
    monthlyAverage: number;
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    completedDays: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

export const StatsTab = memo<StatsTabProps>(({ statistics }) => (
  <View className="px-4">
    <PerformanceCard statistics={statistics} />
    <StreaksCard statistics={statistics} />
    <MonthSummaryCard statistics={statistics} />
    <InsightsCard statistics={statistics} />
  </View>
));

StatsTab.displayName = 'StatsTab';

const DetailRow = memo<{ label: string; value: string }>(({ label, value }) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-gray-600 dark:text-gray-400">{label}</Text>
    <Text className="text-gray-900 dark:text-white font-medium">{value}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

// ==========================================
// components/habit-details/PerformanceCard.tsx
// ==========================================
const PerformanceCard = memo<{ statistics: StatsTabProps['statistics'] }>(({ statistics }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</Text>
    
    <View className="flex-row justify-between mb-6">
      <View className="items-center flex-1">
        <Text className="text-2xl font-bold text-blue-600">{Math.round(statistics.completionRate)}%</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">Month Rate</Text>
      </View>
      <View className="items-center flex-1">
        <Text className="text-2xl font-bold text-green-600">{Math.round(statistics.weeklyAverage)}</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">Weekly Avg</Text>
      </View>
      <View className="items-center flex-1">
        <Text className="text-2xl font-bold text-purple-600">{statistics.monthlyAverage}</Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">Monthly Total</Text>
      </View>
    </View>

    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-700 dark:text-gray-300">Current Trend</Text>
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{getTrendIcon(statistics.trendDirection)}</Text>
          <Text className={`font-semibold ${
            statistics.trendDirection === 'up' ? 'text-green-600' :
            statistics.trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {statistics.trendDirection === 'up' ? 'Strong' :
             statistics.trendDirection === 'down' ? 'Needs Focus' : 'Steady'}
          </Text>
        </View>
      </View>
    </View>
  </View>
));

PerformanceCard.displayName = 'PerformanceCard';

const StreaksCard = memo<{ statistics: StatsTabProps['statistics'] }>(({ statistics }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streaks</Text>
    
    <View className="space-y-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 dark:text-gray-400">Current Streak</Text>
        <Text className="text-xl font-bold text-orange-600">{statistics.currentStreak} days</Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 dark:text-gray-400">Longest Streak</Text>
        <Text className="text-xl font-bold text-green-600">{statistics.longestStreak} days</Text>
      </View>
    </View>
  </View>
));

StreaksCard.displayName = 'StreaksCard';

const MonthSummaryCard = memo<{ statistics: StatsTabProps['statistics'] }>(({ statistics }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Month</Text>
    
    <View className="space-y-3">
      <DetailRow label="Days in Month" value={statistics.totalDays.toString()} />
      <DetailRow label="Days Completed" value={statistics.completedDays.toString()} />
      <DetailRow label="Days Missed" value={(statistics.totalDays - statistics.completedDays).toString()} />
      <DetailRow label="Success Rate" value={`${Math.round(statistics.completionRate)}%`} />
    </View>
  </View>
));

MonthSummaryCard.displayName = 'MonthSummaryCard';

const InsightsCard = memo<{ statistics: StatsTabProps['statistics'] }>(({ statistics }) => (
  <View className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6 mb-4 shadow-sm border border-purple-200 dark:border-purple-800">
    <View className="flex-row items-center mb-4">
      <Text className="text-2xl mr-3">💡</Text>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">Insights</Text>
    </View>
    
    <View className="space-y-3">
      {statistics.trendDirection === 'up' && (
        <InsightItem 
          color="text-green-500" 
          text="Great progress! You're maintaining a strong completion rate this month."
        />
      )}
      
      {statistics.currentStreak > 0 && (
        <InsightItem 
          color="text-orange-500" 
          text={`You're on a ${statistics.currentStreak}-day streak. Keep the momentum going!`}
        />
      )}
      
      {statistics.completionRate > 80 && (
        <InsightItem 
          color="text-blue-500" 
          text="Excellent consistency! You're maintaining a high success rate."
        />
      )}
      
      {statistics.completionRate < 50 && (
        <InsightItem 
          color="text-yellow-500" 
          text="Consider adjusting your target or breaking this habit into smaller steps."
        />
      )}
      
      <InsightItem 
        color="text-purple-500" 
        text="Try linking this habit to an existing routine for better consistency."
      />
    </View>
  </View>
));

InsightsCard.displayName = 'InsightsCard';

const InsightItem = memo<{ color: string; text: string }>(({ color, text }) => (
  <View className="flex-row items-start">
    <Text className={`${color} mr-2`}>•</Text>
    <Text className="text-gray-700 dark:text-gray-300 flex-1">{text}</Text>
  </View>
));

InsightItem.displayName = 'InsightItem';



