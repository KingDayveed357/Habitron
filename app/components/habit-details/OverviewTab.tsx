// components/habit-details/OverviewTab.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitWithCompletion } from '@/types/habit';
import { HabitStatistics } from '@/hooks/useHabitStatistics';
import { ProgressCard } from './ProgressCard';
import { HabitDetailsCard } from './Card';

interface OverviewTabProps {
  habit: HabitWithCompletion;
  todayProgress: number;
  isUpdatingProgress: boolean;
  statistics: HabitStatistics;
  onProgressUpdate: (increment: number) => void;
}

export const OverviewTab = memo<OverviewTabProps>(({ 
  habit, 
  todayProgress, 
  isUpdatingProgress, 
  statistics,
  onProgressUpdate 
}) => (
  <View className="px-4 pb-6">
    <ProgressCard
      habit={habit}
      todayProgress={todayProgress}
      isUpdating={isUpdatingProgress}
      onProgressUpdate={onProgressUpdate}
    />
    
    {/* <QuickInsightsCard statistics={statistics} /> */}
    
    {/* <WeekAtGlanceCard statistics={statistics} /> */}
    
    <HabitDetailsCard habit={habit} />
  </View>
));

OverviewTab.displayName = 'OverviewTab';

// // Quick Insights Card
// const QuickInsightsCard = memo<{ statistics: HabitStatistics }>(({ statistics }) => {
//   const insights = getQuickInsights(statistics);

//   return (
//     <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
//       <View className="flex-row items-center mb-4">
//         <Text className="text-xl mr-2">⚡</Text>
//         <Text className="text-lg font-semibold text-gray-900 dark:text-white">
//           Quick Insights
//         </Text>
//       </View>

//       <View className="space-y-3">
//         {insights.map((insight, index) => (
//           <InsightRow key={index} insight={insight} />
//         ))}
//       </View>
//     </View>
//   );
// });

// QuickInsightsCard.displayName = 'QuickInsightsCard';

// const InsightRow = memo<{ insight: { icon: string; label: string; value: string; color: string } }>(
//   ({ insight }) => (
//     <View className="flex-row items-center justify-between py-2">
//       <View className="flex-row items-center flex-1">
//         <Text className="text-2xl mr-3">{insight.icon}</Text>
//         <Text className="text-gray-700 dark:text-gray-300">{insight.label}</Text>
//       </View>
//       <Text className={`text-lg font-bold ${insight.color}`}>
//         {insight.value}
//       </Text>
//     </View>
//   )
// );

// InsightRow.displayName = 'InsightRow';

// // Week at a Glance Card
// const WeekAtGlanceCard = memo<{ statistics: HabitStatistics }>(({ statistics }) => {
//   const weekDays = generateWeekDays();
  
//   return (
//     <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
//       <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//         This Week at a Glance
//       </Text>

//       <View className="flex-row justify-between mb-4">
//         {weekDays.map((day, index) => (
//           <WeekDayIndicator key={index} day={day} />
//         ))}
//       </View>

//       {/* Week Summary */}
//       <View className="pt-4 border-t border-gray-200 dark:border-gray-700">
//         <View className="flex-row justify-between items-center">
//           <Text className="text-gray-600 dark:text-gray-400">Week Progress</Text>
//           <View className="flex-row items-center">
//             <Text className="text-lg font-bold text-indigo-600 mr-2">
//               {Math.round(statistics.weekStats.completionRate)}%
//             </Text>
//             <Text className="text-sm text-gray-500">
//               ({statistics.weekStats.perfectDays}/{statistics.weekStats.scheduledDays})
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// });

// WeekAtGlanceCard.displayName = 'WeekAtGlanceCard';

// const WeekDayIndicator = memo<{ day: { label: string; status: 'completed' | 'missed' | 'rest' | 'today' } }>(
//   ({ day }) => {
//     const getStatusColor = () => {
//       switch (day.status) {
//         case 'completed':
//           return 'bg-green-500';
//         case 'missed':
//           return 'bg-red-400';
//         case 'today':
//           return 'bg-indigo-500 border-2 border-indigo-300';
//         case 'rest':
//           return 'bg-gray-300 dark:bg-gray-700';
//       }
//     };

//     const getStatusIcon = () => {
//       switch (day.status) {
//         case 'completed':
//           return '✓';
//         case 'missed':
//           return '○';
//         case 'today':
//           return '•';
//         case 'rest':
//           return '';
//       }
//     };

//     return (
//       <View className="items-center">
//         <View className={`w-10 h-10 rounded-full items-center justify-center ${getStatusColor()}`}>
//           <Text className="text-white font-bold">{getStatusIcon()}</Text>
//         </View>
//         <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//           {day.label}
//         </Text>
//       </View>
//     );
//   }
// );

// WeekDayIndicator.displayName = 'WeekDayIndicator';

// // Helper Functions

// function getQuickInsights(statistics: HabitStatistics) {
//   return [
//     {
//       icon: '🎯',
//       label: 'This Week',
//       value: `${statistics.weekStats.perfectDays}/${statistics.weekStats.scheduledDays}`,
//       color: statistics.weekStats.completionRate >= 70 ? 'text-green-600' : 'text-amber-600'
//     },
//     {
//       icon: '📅',
//       label: 'This Month',
//       value: `${Math.round(statistics.monthStats.completionRate)}%`,
//       color: statistics.monthStats.completionRate >= 70 ? 'text-green-600' : 'text-amber-600'
//     },
//     {
//       icon: '🔥',
//       label: 'Current Streak',
//       value: `${statistics.currentStreak} ${statistics.streakUnit}`,
//       color: 'text-orange-600'
//     },
//     {
//       icon: '💪',
//       label: 'Consistency',
//       value: `${Math.round(statistics.consistencyScore)}%`,
//       color: statistics.consistencyScore >= 70 ? 'text-purple-600' : 'text-gray-600'
//     }
//   ];
// }

// function generateWeekDays() {
//   const today = new Date();
//   const weekDays = [];
//   const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

//   // Start from beginning of current week (Sunday)
//   const startOfWeek = new Date(today);
//   startOfWeek.setDate(today.getDate() - today.getDay());

//   for (let i = 0; i < 7; i++) {
//     const date = new Date(startOfWeek);
//     date.setDate(startOfWeek.getDate() + i);
    
//     let status: 'completed' | 'missed' | 'rest' | 'today' = 'rest';
    
//     if (date.toDateString() === today.toDateString()) {
//       status = 'today';
//     } else if (date < today) {
//       // Mock status - in real implementation, check against actual completions
//       status = Math.random() > 0.5 ? 'completed' : 'missed';
//     }

//     weekDays.push({
//       label: dayLabels[i],
//       status
//     });
//   }

//   return weekDays;
// }