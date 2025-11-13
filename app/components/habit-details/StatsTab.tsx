// components/habit-details/StatsTab.tsx
import React, { memo, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { HabitStatistics } from '@/hooks/useHabitStatistics';
import { HabitWithCompletion } from '@/types/habit';
// import { AIInsightsService } from '@/services/AIInsightsService';

interface StatsTabProps {
  statistics: HabitStatistics;
  habit: HabitWithCompletion;
}

export const StatsTab = memo<StatsTabProps>(({ statistics, habit }) => {
  return (
    <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
      <PerformanceCard statistics={statistics} habit={habit} />
      <StreaksCard statistics={statistics} />
      <ConsistencyCard statistics={statistics} />
      <AIInsightsCard habit={habit} statistics={statistics} />
    </ScrollView>
  );
});

StatsTab.displayName = 'StatsTab';

// Performance Card with Chart
const PerformanceCard = memo<{ statistics: HabitStatistics; habit: HabitWithCompletion }>(
  ({ statistics, habit }) => {
    const screenWidth = Dimensions.get('window').width;
    
    // Generate last 30 days data for chart
    const chartData = generateChartData(statistics);

    return (
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Overview
        </Text>
        
        {/* Key Metrics Grid */}
        <View className="flex-row flex-wrap mb-6">
          <MetricBox
            value={`${Math.round(statistics.completionRate)}%`}
            label="30-Day Success"
            color="text-blue-600"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <MetricBox
            value={`${Math.round(statistics.consistencyScore)}%`}
            label="Consistency Score"
            color="text-purple-600"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
          <MetricBox
            value={statistics.totalCompletions.toString()}
            label="Total Completions"
            color="text-green-600"
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          <MetricBox
            value={statistics.perfectWeeks.toString()}
            label="Perfect Weeks"
            color="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-900/20"
          />
        </View>

        {/* Trend Chart */}
        {chartData.labels.length > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last 7 Days Trend
            </Text>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f0f9ff',
                backgroundGradientTo: '#e0f2fe',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#3b82f6'
                }
              }}
              bezier
              style={{
                borderRadius: 16
              }}
            />
          </View>
        )}

        {/* Momentum Indicator */}
        <View className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700 dark:text-gray-300 font-medium">
              Momentum
            </Text>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">
                {getMomentumEmoji(statistics.improvementTrend)}
              </Text>
              <Text className={`font-semibold ${getMomentumColor(statistics.improvementTrend)}`}>
                {getMomentumText(statistics.improvementTrend)}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last 7 days vs last 30 days
          </Text>
        </View>
      </View>
    );
  }
);

PerformanceCard.displayName = 'PerformanceCard';

// Metric Box Component
const MetricBox = memo<{
  value: string;
  label: string;
  color: string;
  bgColor: string;
}>(({ value, label, color, bgColor }) => (
  <View className="w-1/2 p-2">
    <View className={`${bgColor} rounded-xl p-4`}>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </Text>
    </View>
  </View>
));

MetricBox.displayName = 'MetricBox';

// Streaks Card
const StreaksCard = memo<{ statistics: HabitStatistics }>(({ statistics }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Streaks & Milestones
    </Text>
    
    <View className="space-y-4">
      <StreakRow 
        icon="🔥"
        label="Current Streak"
        value={`${statistics.currentStreak} ${statistics.streakUnit}`}
        color="text-orange-600"
      />
      <StreakRow 
        icon="🏆"
        label="Best Streak"
        value={`${statistics.longestStreak} ${statistics.streakUnit}`}
        color="text-yellow-600"
      />
      <StreakRow 
        icon="✨"
        label="Perfect Weeks"
        value={statistics.perfectWeeks.toString()}
        color="text-purple-600"
      />
    </View>

    {/* Streak Progress Bar */}
    {statistics.longestStreak > 0 && (
      <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Streak Progress
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round((statistics.currentStreak / statistics.longestStreak) * 100)}%
          </Text>
        </View>
        <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <View 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            style={{ 
              width: `${Math.min((statistics.currentStreak / statistics.longestStreak) * 100, 100)}%` 
            }}
          />
        </View>
      </View>
    )}
  </View>
));

StreaksCard.displayName = 'StreaksCard';

const StreakRow = memo<{
  icon: string;
  label: string;
  value: string;
  color: string;
}>(({ icon, label, value, color }) => (
  <View className="flex-row justify-between items-center">
    <View className="flex-row items-center flex-1">
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className="text-gray-700 dark:text-gray-300">{label}</Text>
    </View>
    <Text className={`text-xl font-bold ${color}`}>{value}</Text>
  </View>
));

StreakRow.displayName = 'StreakRow';

// Consistency Card
const ConsistencyCard = memo<{ statistics: HabitStatistics }>(({ statistics }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Consistency Analysis
    </Text>
    
    <View className="space-y-3">
      <DetailRow 
        label="Scheduled Days (30d)"
        value={statistics.totalScheduledDays.toString()}
      />
      <DetailRow 
        label="Completed"
        value={statistics.completedDays.toString()}
        valueColor="text-green-600"
      />
      <DetailRow 
        label="Partial Progress"
        value={statistics.partialDays.toString()}
        valueColor="text-yellow-600"
      />
      <DetailRow 
        label="Missed"
        value={statistics.missedDays.toString()}
        valueColor="text-red-600"
      />
      
      <View className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-700 dark:text-gray-300 font-medium">
            Completion Rate
          </Text>
          <View className="items-end">
            <Text className="text-2xl font-bold text-blue-600">
              {Math.round(statistics.completionRate)}%
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {statistics.completedDays}/{statistics.totalScheduledDays} days
            </Text>
          </View>
        </View>
      </View>
    </View>
  </View>
));

ConsistencyCard.displayName = 'ConsistencyCard';

const DetailRow = memo<{ 
  label: string; 
  value: string;
  valueColor?: string;
}>(({ label, value, valueColor = 'text-gray-900 dark:text-white' }) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-gray-600 dark:text-gray-400">{label}</Text>
    <Text className={`font-medium ${valueColor}`}>{value}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

// AI Insights Card
const AIInsightsCard = memo<{ habit: HabitWithCompletion; statistics: HabitStatistics }>(
  ({ habit, statistics }) => {
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //   const loadInsights = async () => {
    //     try {
    //       const aiInsights = await AIInsightsService.generateHabitInsights(habit, statistics);
    //       setInsights(aiInsights);
    //     } catch (error) {
    //       console.error('Error loading AI insights:', error);
    //       // Fallback to rule-based insights
    //       setInsights(generateFallbackInsights(statistics));
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   loadInsights();
    // }, [habit, statistics]);

    return (
      <View className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-6 shadow-sm border border-purple-200 dark:border-purple-800">
        <View className="flex-row items-center mb-4">
          <Text className="text-2xl mr-3">🧠</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </Text>
        </View>
        
        {loading ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#9333ea" />
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2 text-sm">
              Analyzing your habit...
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {insights.map((insight, index) => (
              <InsightItem key={index} text={insight} index={index} />
            ))}
          </View>
        )}
      </View>
    );
  }
);

AIInsightsCard.displayName = 'AIInsightsCard';

const InsightItem = memo<{ text: string; index: number }>(({ text, index }) => {
  const icons = ['💡', '🎯', '⚡', '🌟', '🚀'];
  const colors = [
    'text-purple-600',
    'text-blue-600',
    'text-green-600',
    'text-orange-600',
    'text-pink-600'
  ];

  return (
    <View className="flex-row items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
      <Text className="text-lg mr-2">{icons[index % icons.length]}</Text>
      <Text className={`flex-1 text-sm ${colors[index % colors.length]} dark:text-gray-200`}>
        {text}
      </Text>
    </View>
  );
});

InsightItem.displayName = 'InsightItem';

// Helper Functions

function generateChartData(statistics: HabitStatistics) {
  // Generate last 7 days completion data
  const labels: string[] = [];
  const data: number[] = [];
  
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    labels.push(dayName);
    
    // Mock data - in real implementation, this would come from completions
    // This should be calculated from actual completion records
    data.push(Math.floor(Math.random() * 100));
  }

  return {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };
}

function getMomentumEmoji(trend: string): string {
  switch (trend) {
    case 'improving':
      return '📈';
    case 'declining':
      return '📉';
    case 'stable':
      return '➡️';
    default:
      return '➡️';
  }
}

function getMomentumColor(trend: string): string {
  switch (trend) {
    case 'improving':
      return 'text-green-600';
    case 'declining':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

function getMomentumText(trend: string): string {
  switch (trend) {
    case 'improving':
      return 'Strong';
    case 'declining':
      return 'Needs Focus';
    case 'stable':
      return 'Steady';
    default:
      return 'Steady';
  }
}

function generateFallbackInsights(statistics: HabitStatistics): string[] {
  const insights: string[] = [];

  // Success rate insights
  if (statistics.completionRate >= 80) {
    insights.push('Outstanding! You\'re maintaining an excellent success rate. Keep up the amazing work!');
  } else if (statistics.completionRate >= 60) {
    insights.push('Good progress! You\'re building consistency. Try to push for 80% to establish a stronger habit.');
  } else if (statistics.completionRate >= 40) {
    insights.push('You\'re making progress. Focus on completing just one more day this week to boost your momentum.');
  } else {
    insights.push('Starting is the hardest part, and you\'ve done it! Try setting a smaller, achievable daily goal.');
  }

  // Streak insights
  if (statistics.currentStreak >= 30) {
    insights.push(`Amazing ${statistics.currentStreak}-${statistics.streakUnit} streak! You\'re proving this habit is part of who you are.`);
  } else if (statistics.currentStreak >= 7) {
    insights.push(`${statistics.currentStreak} ${statistics.streakUnit} streak going strong! The first week is crucial and you\'ve nailed it.`);
  } else if (statistics.currentStreak > 0) {
    insights.push(`You\'re on a ${statistics.currentStreak}-${statistics.streakUnit} streak. Just focus on today to keep it alive!`);
  } else {
    insights.push('Ready to start a new streak? Today is day one of your comeback!');
  }

  // Consistency insights
  if (statistics.consistencyScore >= 70) {
    insights.push('Your consistency score is impressive! Even your partial completions show commitment.');
  } else if (statistics.partialDays > 0) {
    insights.push('You\'ve made partial progress on some days. That\'s better than nothing! Consider adjusting your target if it feels too high.');
  }

  // Improvement trend
  if (statistics.improvementTrend === 'improving') {
    insights.push('Your recent performance is trending upward! Whatever you\'re doing differently is working.');
  } else if (statistics.improvementTrend === 'declining') {
    insights.push('Your completion rate has dipped recently. Reflect on what changed and adjust your approach.');
  }

  // Perfect weeks
  if (statistics.perfectWeeks > 0) {
    insights.push(`You\'ve had ${statistics.perfectWeeks} perfect week${statistics.perfectWeeks > 1 ? 's' : ''}! You know you can do it again.`);
  }

  // Return top 5 insights
  return insights.slice(0, 5);
}