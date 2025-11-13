
// import React, { useState } from 'react';
// import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import CustomRangeModal from '../components/reports/CustomRangeModal';
// import MetricsOverview from '../components/reports/MetricsOverview';
// import AIInsightsCard from '../components/reports/AIInsightCard';
// import HeatmapCalendar from '../components/reports/HeatMapCalendar';
// import TrendChart from '../components/reports/TrendChart';
// import HabitDetailCard from '../components/reports/HabitDetailCard';
// import PerformanceSummary from '../components/reports/PerformanceSummary';
// import { useReport } from '@/hooks/useReport';
// import { TimePeriod } from '@/interfaces/interfaces';

// const periodOptions = [
//   { key: 'today', label: 'Today' },
//   { key: 'week', label: 'Week' },
//   { key: 'month', label: 'Month' },
//   { key: 'last6months', label: '6 Months' },
//   { key: 'year', label: 'Year' },
//   { key: 'lastyear', label: 'Last Year' },
//   { key: 'alltime', label: 'All Time' },
//   { key: 'custom', label: 'Custom' },
// ];

// const Report: React.FC = () => {
//   const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
//   const [showCustomRange, setShowCustomRange] = useState(false);
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // 🔥 Use the powerful useReport hook
//   const {
//     periodData,
//     aiInsights,
//     selectedPeriod,
//     customDateRange,
//     isLoading,
//     error,
//     setPeriod,
//     setCustomRange,
//     refreshData,
//     refreshInsights,
//     lastUpdated,
//     cacheStatus
//   } = useReport({
//     autoRefresh: true,
//     refreshInterval: 300000, // 5 minutes
//     enableInsights: true
//   });

//   // Calculate trend data for chart
//   const trendData = React.useMemo(() => {
//     const cr = periodData.overallMetrics.completionRate;
//     return [
//       Math.max(cr - 15, 0),
//       Math.max(cr - 8, 0),
//       Math.max(cr - 3, 0),
//       cr
//     ];
//   }, [periodData.overallMetrics.completionRate]);

//   // Handlers
//   const handlePeriodSelect = (period: TimePeriod) => {
//     if (period === 'custom') {
//       setShowCustomRange(true);
//     } else {
//       setPeriod(period);
//     }
//   };

//   const handleCustomRangeApply = () => {
//     setCustomRange(customDateRange.start, customDateRange.end);
//     setShowCustomRange(false);
//   };

//   const handleCustomRangeClose = () => {
//     setShowCustomRange(false);
//   };

//   // Time Period Selector Component
//   const TimePeriodSelector = () => (
//     <View className="mb-4">
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         className="flex-row"
//       >
//         {periodOptions.map((option) => (
//           <TouchableOpacity
//             key={option.key}
//             onPress={() => handlePeriodSelect(option.key as TimePeriod)}
//             className={`py-2 px-4 rounded-full mr-2 ${
//               selectedPeriod === option.key 
//                 ? 'bg-indigo-500 shadow-sm' 
//                 : 'bg-white dark:bg-gray-800'
//             }`}
//           >
//             <Text className={`text-sm font-medium ${
//               selectedPeriod === option.key ? 'text-white' : 'text-gray-500'
//             }`}>
//               {option.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
      
//       <View className="flex-row items-center justify-between mt-2 px-1">
//         <Text className="text-sm text-gray-500">
//           {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
//         </Text>
        
//         {/* Cache status indicator */}
//         <View className="flex-row items-center">
//           <View className={`w-2 h-2 rounded-full mr-1 ${
//             cacheStatus === 'fresh' ? 'bg-green-500' :
//             cacheStatus === 'stale' ? 'bg-yellow-500' : 'bg-gray-400'
//           }`} />
//           <Text className="text-xs text-gray-400">
//             {lastUpdated ? `Updated ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago` : 'Loading...'}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );

//   // Loading State
//   if (isLoading && !periodData.habits.length) {
//     return (
//       <View className="flex-1 app-background justify-center items-center">
//         <ActivityIndicator size="large" color="#6366f1" />
//         <Text className="text-gray-500 mt-4">Loading your report...</Text>
//       </View>
//     );
//   }

//   // Error State
//   if (error && !periodData.habits.length) {
//     return (
//       <View className="flex-1 app-background justify-center items-center p-4">
//         <Text className="text-red-500 text-center mb-4">⚠️ {error}</Text>
//         <TouchableOpacity
//           onPress={refreshData}
//           className="bg-indigo-500 px-6 py-3 rounded-lg"
//         >
//           <Text className="text-white font-medium">Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="app-background" showsVerticalScrollIndicator={false}>
//       <View className="p-4">
//         {/* Header with Refresh Button */}
//         <View className="flex-row justify-between items-center mb-4">
//           <Text className="text-2xl font-bold text-gray-900 dark:text-white">
//             Performance Report
//           </Text>
//           <TouchableOpacity
//             onPress={refreshData}
//             disabled={isLoading}
//             className={`p-2 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
//           >
//             <Text className="text-2xl">{isLoading ? '⏳' : '🔄'}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Time Period Selector */}
//         <TimePeriodSelector />

//         {/* Custom Range Modal */}
//         <CustomRangeModal
//           visible={showCustomRange}
//           startDate={customDateRange.start}
//           endDate={customDateRange.end}
//           showStartPicker={showStartPicker}
//           showEndPicker={showEndPicker}
//           onClose={handleCustomRangeClose}
//           onApply={handleCustomRangeApply}
//           onStartDateChange={(date) => setCustomRange(date, customDateRange.end)}
//           onEndDateChange={(date) => setCustomRange(customDateRange.start, date)}
//           onShowStartPicker={setShowStartPicker}
//           onShowEndPicker={setShowEndPicker}
//         />

//         {/* Metrics Overview */}
//         <MetricsOverview overallMetrics={periodData.overallMetrics} />

//         {/* AI Insights with Refresh */}
//         <View className="mb-4">
//           <View className="flex-row justify-between items-center mb-3">
//             <Text className="text-lg text-subheading">AI Insights</Text>
//             <TouchableOpacity
//               onPress={refreshInsights}
//               className="flex-row items-center"
//             >
//               <Text className="text-xs text-indigo-500 mr-1">Refresh</Text>
//               <Text className="text-sm">🤖</Text>
//             </TouchableOpacity>
//           </View>
          
//           {aiInsights.length > 0 ? (
//             <AIInsightsCard insights={aiInsights} />
//           ) : (
//             <View className="card p-4">
//               <Text className="text-gray-500 text-center">
//                 {isLoading ? 'Generating insights...' : 'No insights available yet'}
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Heatmap Calendar */}
//         <HeatmapCalendar />

//         {/* Trend Chart */}
//         <TrendChart
//           data={trendData}
//           title={`Completion Trend - ${periodData.periodLabel}`}
//           color="bg-indigo-500"
//           periodType={
//             selectedPeriod === 'today' ? 'daily' :
//             selectedPeriod === 'week' ? 'weekly' :
//             selectedPeriod === 'month' ? 'monthly' : 'custom'
//           }
//           showTarget={true}
//           targetValue={80}
//           showAverage={true}
//         />

//         {/* Habit Details */}
//         {periodData.habits.length > 0 ? (
//           <HabitDetailCard
//             habits={periodData.habits}
//             selectedHabit={selectedHabit}
//             onHabitSelect={setSelectedHabit}
//           />
//         ) : (
//           <View className="card p-8 mb-4">
//             <Text className="text-center text-gray-500 mb-2">
//               No habits tracked in this period
//             </Text>
//             <Text className="text-center text-sm text-gray-400">
//               Create your first habit to see detailed analytics
//             </Text>
//           </View>
//         )}

//         {/* Performance Summary */}
//         <PerformanceSummary periodData={periodData} />

//         {/* Debug Info (remove in production) */}
//         {__DEV__ && (
//           <View className="card p-3 mt-4 bg-gray-100 dark:bg-gray-800">
//             <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
//               Debug Info:
//             </Text>
//             <Text className="text-xs text-gray-500">
//               Cache: {cacheStatus} | Habits: {periodData.habits.length} | 
//               Insights: {aiInsights.length}
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// export default Report;


// app/screens/Report.tsx - Second Version
// import React, { useState } from 'react';
// import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import CustomRangeModal from '../components/reports/CustomRangeModal';
// import MetricsOverview from '../components/reports/MetricsOverview';
// import AIInsightsCard from '../components/reports/AIInsightCard';
// import TrendChart from '../components/reports/TrendChart';
// import { useReport } from '@/hooks/useReport';
// import { TimePeriod } from '@/interfaces/interfaces';

// const periodOptions = [
//   { key: 'today', label: 'Today' },
//   { key: 'week', label: 'Week' },
//   { key: 'month', label: 'Month' },
//   { key: 'last6months', label: '6 Months' },
//   { key: 'year', label: 'Year' },
//   { key: 'lastyear', label: 'Last Year' },
//   { key: 'alltime', label: 'All Time' },
//   { key: 'custom', label: 'Custom' },
// ];

// const Report: React.FC = () => {

//   const [showCustomRange, setShowCustomRange] = useState(false);
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   const {
//     periodData,
//     aiInsights,
//     selectedPeriod,
//     customDateRange,
//     isLoading,
//     error,
//     setPeriod,
//     setCustomRange,
//     refreshData,
//     refreshInsights,
//     lastUpdated,
//     cacheStatus
//   } = useReport({
//     autoRefresh: true,
//     refreshInterval: 300000,
//     enableInsights: true
//   });

//   const trendData = React.useMemo(() => {
//     const cr = periodData.overallMetrics.completionRate;
//     return [
//       Math.max(cr - 15, 0),
//       Math.max(cr - 8, 0),
//       Math.max(cr - 3, 0),
//       cr
//     ];
//   }, [periodData.overallMetrics.completionRate]);

//   const handlePeriodSelect = (period: TimePeriod) => {
//     if (period === 'custom') {
//       setShowCustomRange(true);
//     } else {
//       setPeriod(period);
//     }
//   };

//   const handleCustomRangeApply = () => {
//     setCustomRange(customDateRange.start, customDateRange.end);
//     setShowCustomRange(false);
//   };

//   const TimePeriodSelector = () => (
//     <View className="mb-4">
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         className="flex-row"
//       >
//         {periodOptions.map((option) => (
//           <TouchableOpacity
//             key={option.key}
//             onPress={() => handlePeriodSelect(option.key as TimePeriod)}
//             className={`py-2 px-4 rounded-full mr-2 ${
//               selectedPeriod === option.key 
//                 ? 'bg-indigo-500 shadow-sm' 
//                 : 'bg-white dark:bg-gray-800'
//             }`}
//           >
//             <Text className={`text-sm font-medium ${
//               selectedPeriod === option.key ? 'text-white' : 'text-gray-500'
//             }`}>
//               {option.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
      
//       <View className="flex-row items-center justify-between mt-2 px-1">
//         <Text className="text-sm text-gray-500">
//           {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
//         </Text>
        
//         <View className="flex-row items-center">
//           <View className={`w-2 h-2 rounded-full mr-1 ${
//             cacheStatus === 'fresh' ? 'bg-green-500' :
//             cacheStatus === 'stale' ? 'bg-yellow-500' : 'bg-gray-400'
//           }`} />
//           <Text className="text-xs text-gray-400">
//             {lastUpdated ? `Updated ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago` : 'Loading...'}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );

//   if (isLoading && !periodData.habits.length) {
//     return (
//       <View className="flex-1 bg-gray-50 dark:bg-black justify-center items-center">
//         <ActivityIndicator size="large" color="#6366f1" />
//         <Text className="text-gray-500 mt-4">Loading your report...</Text>
//       </View>
//     );
//   }

//   if (error && !periodData.habits.length) {
//     return (
//       <View className="flex-1 bg-gray-50 dark:bg-black justify-center items-center p-4">
//         <Text className="text-red-500 text-center mb-4">⚠️ {error}</Text>
//         <TouchableOpacity
//           onPress={refreshData}
//           className="bg-indigo-500 px-6 py-3 rounded-lg"
//         >
//           <Text className="text-white font-medium">Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // Calculate top performing habits (limit to 3)
//   const topHabits = [...periodData.habits]
//     .sort((a, b) => b.completionRate - a.completionRate)
//     .slice(0, 3);

//   return (
//     <ScrollView className="flex-1 bg-gray-50 dark:bg-black" showsVerticalScrollIndicator={false}>
//       <View className="p-4">
//         {/* Header */}
//         <View className="flex-row justify-between items-center mb-4">
//           <Text className="text-2xl font-bold text-gray-900 dark:text-white">
//             Performance Report
//           </Text>
//           <TouchableOpacity
//             onPress={refreshData}
//             disabled={isLoading}
//             className={`p-2 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
//           >
//             <Text className="text-2xl">{isLoading ? '⏳' : '🔄'}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Time Period Selector */}
//         <TimePeriodSelector />

//         {/* Custom Range Modal */}
//         <CustomRangeModal
//           visible={showCustomRange}
//           startDate={customDateRange.start}
//           endDate={customDateRange.end}
//           showStartPicker={showStartPicker}
//           showEndPicker={showEndPicker}
//           onClose={() => setShowCustomRange(false)}
//           onApply={handleCustomRangeApply}
//           onStartDateChange={(date) => setCustomRange(date, customDateRange.end)}
//           onEndDateChange={(date) => setCustomRange(customDateRange.start, date)}
//           onShowStartPicker={setShowStartPicker}
//           onShowEndPicker={setShowEndPicker}
//         />

//         {/* Core Metrics */}
//         <MetricsOverview 
//           overallMetrics={{
//             ...periodData.overallMetrics,
//             totalHabits: periodData.overallMetrics.totalHabits,
//             activeStreaks: periodData.overallMetrics.activeStreaks,
//             completionRate: periodData.overallMetrics.completionRate,
//             consistencyScore: periodData.overallMetrics.consistencyScore
//           }} 
//         />

//         {/* Trend Chart */}
//         <TrendChart
//           data={trendData}
//           title={`Completion Trend - ${periodData.periodLabel}`}
//           color="bg-indigo-500"
//           periodType={
//             selectedPeriod === 'today' ? 'daily' :
//             selectedPeriod === 'week' ? 'weekly' :
//             selectedPeriod === 'month' ? 'monthly' : 'custom'
//           }
//           showTarget={true}
//           targetValue={80}
//           showAverage={true}
//         />

//         {/* AI Insights */}
//         <View className="mb-4">
//           <View className="flex-row justify-between items-center mb-3">
//             <Text className="text-lg font-semibold text-gray-900 dark:text-white">
//               AI Insights
//             </Text>
//             <TouchableOpacity
//               onPress={refreshInsights}
//               className="flex-row items-center"
//             >
//               <Text className="text-xs text-indigo-500 mr-1">Refresh</Text>
//               <Text className="text-sm">🤖</Text>
//             </TouchableOpacity>
//           </View>
          
//           {aiInsights.length > 0 ? (
//             <AIInsightsCard insights={aiInsights} />
//           ) : (
//             <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
//               <Text className="text-gray-500 text-center">
//                 {isLoading ? 'Generating insights...' : 'No insights available yet'}
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Top Performing Habits */}
//         {topHabits.length > 0 && (
//           <View className="mb-6">
//             <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
//               Top Performers
//             </Text>
//             <View className="space-y-3">
//               {topHabits.map((habit, index) => (
//                 <View 
//                   key={habit.id}
//                   className="bg-white dark:bg-gray-900 mb-3 rounded-2xl p-4 shadow-sm"
//                 >
//                   <View className="flex-row items-center justify-between">
//                     <View className="flex-row items-center flex-1">
//                       <View className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mr-3">
//                         <Text className="text-2xl">{habit.icon}</Text>
//                       </View>
//                       <View className="flex-1">
//                         <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
//                           {habit.name}
//                         </Text>
//                         <View className="flex-row items-center">
//                           <Text className="text-xs text-gray-500 dark:text-gray-400 mr-3">
//                             🔥 {habit.currentStreak} day streak
//                           </Text>
//                           <Text className="text-xs text-gray-500 dark:text-gray-400">
//                             📊 {habit.consistencyScore}% consistency
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                     <View className="items-end ml-2">
//                       <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//                         {habit.completionRate}%
//                       </Text>
//                       {index === 0 && (
//                         <Text className="text-xs text-yellow-600 dark:text-yellow-400">
//                           🏆 Best
//                         </Text>
//                       )}
//                     </View>
//                   </View>
                  
//                   {/* Mini progress bar */}
//                   <View className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                     <View 
//                       className="h-full bg-indigo-500 rounded-full"
//                       style={{ width: `${habit.completionRate}%` }}
//                     />
//                   </View>
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}

//         {/* Empty State */}
//         {periodData.habits.length === 0 && (
//           <View className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-6 shadow-sm">
//             <Text className="text-center text-gray-500 mb-2">
//               No habits tracked in this period
//             </Text>
//             <Text className="text-center text-sm text-gray-400">
//               Create your first habit to see detailed analytics
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// export default Report;



// app/screens/Report.tsx - WITH AI INSIGHTS & AUTO-REFRESH
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import CustomRangeModal from '../components/reports/CustomRangeModal';
import MetricsOverview from '../components/reports/MetricsOverview';
import TrendChart from '../components/reports/TrendChart';
import AIInsightsCard from '../components/reports/AIInsightCard';
import { useReport } from '@/hooks/useReport';
import { useInsights } from '@/hooks/useInsights';
import { TimePeriod } from '@/interfaces/interfaces';
import { getStreakUnit } from '@/utils/streakCalculation';

const periodOptions = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'last6months', label: '6 Months' },
  { key: 'year', label: 'Year' },
  { key: 'lastyear', label: 'Last Year' },
  { key: 'alltime', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
];

const Report: React.FC = () => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
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
  } = useReport({
    autoRefresh: false,
    refreshInterval: 300000
  });

  // AI Insights with period context
  const insightsContext = useMemo(() => ({
    habits: periodData.habits.map(h => ({
      id: h.id,
      title: h.name,
      category: 'General',
      completionRate: h.completionRate,
      currentStreak: h.currentStreak,
      consistencyScore: h.consistencyScore
    })),
    stats: periodData.overallMetrics,
    period: {
      type: selectedPeriod,
      totalDays: periodData.totalDays,
      label: periodData.periodLabel
    }
  }), [periodData, selectedPeriod]);

  const {
    insights,
    loadingInsights,
    refreshInsights,
    error: insightsError,
    clearError: clearInsightsError
  } = useInsights({
    autoLoad: true,
    context: insightsContext
  });

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh when habits change (detect completion updates)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkForUpdates = async () => {
      // Only auto-refresh if we have a stable last update time
      if (lastUpdated && !isLoading) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime();
        
        // If more than 5 seconds since last update, check for changes
        if (timeSinceUpdate > 5000) {
          console.log('🔄 Auto-checking for habit updates...');
          await refreshData();
        }
      }
    };

    // Set up polling every 30 seconds when app is active
    timeoutId = setInterval(checkForUpdates, 30000);

    return () => {
      if (timeoutId) clearInterval(timeoutId);
    };
  }, [lastUpdated, isLoading, refreshData]);

  // Calculate top performers
  const topHabits = useMemo(() => {
    return periodData.habits
      .filter(h => {
        return h.frequency && h.frequency.actual > 0 && h.completionRate > 0;
      })
      .sort((a, b) => {
        const scoreA = a.completionRate * 0.5 + a.consistencyScore * 0.3 + a.momentum * 0.2;
        const scoreB = b.completionRate * 0.5 + b.consistencyScore * 0.3 + b.momentum * 0.2;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [periodData.habits]);

  const handlePeriodSelect = (period: TimePeriod) => {
    if (period === 'custom') {
      setShowCustomRange(true);
    } else {
      setPeriod(period);
    }
  };

  const handleCustomRangeApply = () => {
    setCustomRange(customDateRange.start, customDateRange.end);
    setShowCustomRange(false);
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshData(),
        isOnline ? refreshInsights() : Promise.resolve()
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData, refreshInsights, isOnline]);

  // Manual refresh with icon
  const handleManualRefresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  if (isLoading && periodData.habits.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">Loading your report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && periodData.habits.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 dark:text-red-400 text-center mt-4 mb-4">{error}</Text>
          <TouchableOpacity
            onPress={refreshData}
            className="bg-indigo-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
            title="Pull to refresh"
            titleColor="#9CA3AF"
          />
        }
      >
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance Report
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleManualRefresh}
              disabled={isLoading || isRefreshing}
              className={`p-2 rounded-lg ${(isLoading || isRefreshing) ? 'opacity-50' : ''}`}
            >
              <Ionicons 
                name="refresh" 
                size={24} 
                color="#6366f1"
                style={{ 
                  transform: [{ rotate: (isLoading || isRefreshing) ? '360deg' : '0deg' }] 
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Network Status Banner */}
          {!isOnline && (
            <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-4 flex-row items-center">
              <Ionicons name="cloud-offline-outline" size={20} color="#D97706" />
              <Text className="text-yellow-700 dark:text-yellow-400 text-sm ml-2 flex-1">
                You're offline. AI insights unavailable.
              </Text>
            </View>
          )}

          {/* Time Period Selector */}
          <View className="mb-4">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handlePeriodSelect(option.key as TimePeriod)}
                  className={`py-2 px-4 rounded-full mr-2 ${
                    selectedPeriod === option.key 
                      ? 'bg-indigo-500' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedPeriod === option.key 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Cache status */}
            <View className="flex-row items-center justify-end mt-2">
              <View className={`w-2 h-2 rounded-full mr-1 ${
                cacheStatus === 'fresh' ? 'bg-green-500' :
                cacheStatus === 'stale' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              <Text className="text-xs text-gray-400">
                {lastUpdated 
                  ? `Updated ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago` 
                  : 'Never updated'}
              </Text>
            </View>
          </View>

          {/* Custom Range Modal */}
          <CustomRangeModal
            visible={showCustomRange}
            startDate={customDateRange.start}
            endDate={customDateRange.end}
            showStartPicker={showStartPicker}
            showEndPicker={showEndPicker}
            onClose={() => setShowCustomRange(false)}
            onApply={handleCustomRangeApply}
            onStartDateChange={(date) => setCustomRange(date, customDateRange.end)}
            onEndDateChange={(date) => setCustomRange(customDateRange.start, date)}
            onShowStartPicker={setShowStartPicker}
            onShowEndPicker={setShowEndPicker}
          />

          {/* Core Metrics */}
          <MetricsOverview 
            overallMetrics={periodData.overallMetrics}
          />

          {/* AI Insights Section */}
          {periodData.habits.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Insights
                  </Text>
                  {!isOnline && (
                    <View className="ml-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      <Text className="text-xs text-gray-600 dark:text-gray-400">Offline</Text>
                    </View>
                  )}
                </View>
                {isOnline && (
                  <TouchableOpacity
                    onPress={refreshInsights}
                    disabled={loadingInsights}
                    className="flex-row items-center"
                  >
                    <Text className="text-xs text-indigo-500 mr-1">
                      {loadingInsights ? 'Loading...' : 'Refresh'}
                    </Text>
                    <Ionicons 
                      name="sparkles" 
                      size={16} 
                      color="#6366f1"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {!isOnline ? (
                <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <View className="items-center">
                    <Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
                    <Text className="text-gray-700 dark:text-gray-300 text-center mt-3 font-medium">
                      AI Insights Unavailable
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mt-2">
                      Connect to the internet to get personalized insights about your habits.
                    </Text>
                  </View>
                </View>
              ) : loadingInsights ? (
                <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <View className="items-center">
                    <ActivityIndicator size="small" color="#6366f1" />
                    <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mt-3">
                      Analyzing your habits for {periodData.periodLabel.toLowerCase()}...
                    </Text>
                  </View>
                </View>
              ) : insightsError ? (
                <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800">
                  <View className="flex-row items-start">
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <View className="flex-1 ml-3">
                      <Text className="text-red-700 dark:text-red-400 text-sm font-medium mb-1">
                        Failed to load insights
                      </Text>
                      <Text className="text-red-600 dark:text-red-500 text-xs">
                        {insightsError}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={clearInsightsError}>
                      <Ionicons name="close" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : insights.length > 0 ? (
                <AIInsightsCard insights={insights} />
              ) : (
                <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
                    No insights available for this period yet. Complete more habits to get personalized recommendations!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Trend Chart */}
          {periodData.habits.length > 0 && (
            <TrendChart
              habits={periodData.habits}
              periodLabel={periodData.periodLabel}
              totalDays={periodData.totalDays}
              selectedPeriod={selectedPeriod}
            />
          )}

          {/* Top Performers */}
          {topHabits.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performers
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Best {topHabits.length} habit{topHabits.length !== 1 ? 's' : ''}
                </Text>
              </View>
              
              <View className="space-y-3">
                {topHabits.map((habit, index) => {
                  const streakUnit = getStreakUnit(habit.frequency?.type || 'daily');
                  const isBest = index === 0;
                  
                  return (
                    <View 
                      key={habit.id}
                      className="bg-white dark:bg-gray-900 mb-3 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                            isBest 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                              : 'bg-indigo-100 dark:bg-indigo-900/30'
                          }`}>
                            <Text className="text-2xl">{habit.icon}</Text>
                          </View>
                          
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                              {habit.name}
                            </Text>
                            <View className="flex-row items-center flex-wrap">
                              <View className="flex-row items-center mr-3">
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  🔥 {habit.currentStreak} {streakUnit}
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  📊 {habit.consistencyScore}% consistent
                                </Text>
                              </View>
                            </View>
                            {habit.frequency && (
                              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {habit.frequency.actual}/{habit.frequency.expected} completed
                              </Text>
                            )}
                          </View>
                        </View>
                        
                        <View className="items-end ml-2">
                          <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {habit.completionRate}%
                          </Text>
                          {isBest && (
                            <View className="flex-row items-center mt-1">
                              <Text className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                🏆 Best
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <View 
                          className={`h-full rounded-full ${
                            isBest ? 'bg-yellow-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${habit.completionRate}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Empty State */}
          {periodData.habits.length === 0 && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-6 shadow-sm">
              <Text className="text-4xl text-center mb-3">📊</Text>
              <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold mb-2">
                No Data for This Period
              </Text>
              <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
                Create your first habit or select a different time period to see your analytics.
              </Text>
            </View>
          )}

          {/* No top performers message */}
          {periodData.habits.length > 0 && topHabits.length === 0 && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 shadow-sm">
              <Text className="text-center text-gray-600 dark:text-gray-400">
                Complete some habits to see your top performers! 💪
              </Text>
            </View>
          )}

          {/* Debug info */}
          {__DEV__ && (
            <View className="bg-gray-800 rounded-lg p-3 mb-4">
              <Text className="text-white text-xs mb-1">Debug Info:</Text>
              <Text className="text-gray-300 text-xs">Total Habits: {periodData.habits.length}</Text>
              <Text className="text-gray-300 text-xs">With Data: {periodData.habits.filter(h => h.frequency?.actual > 0).length}</Text>
              <Text className="text-gray-300 text-xs">Top Performers: {topHabits.length}</Text>
              <Text className="text-gray-300 text-xs">AI Insights: {insights.length}</Text>
              <Text className="text-gray-300 text-xs">Online: {isOnline ? 'Yes' : 'No'}</Text>
              <Text className="text-gray-300 text-xs">Avg Completion: {periodData.overallMetrics.completionRate}%</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Report;