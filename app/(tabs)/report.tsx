// // app/(tabs)/report.tsx - MAIN REPORT SCREEN


// import React, { useState, useMemo } from 'react';
// import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
// // import TimePeriodSelector from '../components/reports/TimePeriodSelector';
// import CustomRangeModal from '../components/reports/CustomRangeModal';
// import MetricsOverview from '../components/reports/MetricsOverview';
// import AIInsightsCard  from '../components/reports/AIInsightCard';
// import HeatmapCalendar from '../components/reports/HeatMapCalendar';
// import TrendChart from '../components/reports/TrendChart';
// import HabitDetailCard from '../components/reports/HabitDetailCard';
// import PerformanceSummary from '../components/reports/PerformanceSummary';

// import { 
//   HabitData, 
//   periodOptions, 
//   calculatePeriodData, 
//   generateAIInsights 
// } from '@/utils/mockReportData';

// import { TimePeriod } from '@/interfaces/interfaces';

// const Report: React.FC = () => {
//   const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
//   const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
//   const [showCustomRange, setShowCustomRange] = useState(false);
//   const [customStartDate, setCustomStartDate] = useState(new Date());
//   const [customEndDate, setCustomEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // Calculate period data
//   const periodData = useMemo(() => {
//     try {
//       const result = calculatePeriodData(selectedPeriod, customStartDate, customEndDate, HabitData);
//       return result;
//     } catch (error) {
//       console.error('[Error] calculatePeriodData failed:', error);
//       return {
//         habits: [],
//         overallMetrics: {
//           totalHabits: 0,
//           activeStreaks: 0,
//           completionRate: 0,
//           consistencyScore: 0,
//           momentum: 0,
//           improvement: 0,
//           weeklyGoal: 0,
//           monthlyGoal: 0
//         },
//         periodLabel: 'Invalid',
//         totalDays: 0
//       };
//     }
//   }, [selectedPeriod, customStartDate, customEndDate]);

//   // Generate AI insights
//   const aiInsights = useMemo(() => {
//     try {
//       const insights = generateAIInsights(periodData);
//       return insights;
//     } catch (error) {
//       console.error('[Error] generateAIInsights failed:', error);
//       return [];
//     }
//   }, [periodData]);

//   // Handlers
// const handlePeriodSelect = (period: TimePeriod) => {
//   console.log('[Handler] Period selected:', period);
//   if (period === 'custom') {
//     setShowCustomRange(true);
//   } else {
//     // 🛠 Small delay to avoid overlapping renders
//    setSelectedPeriod(period);
//   }
// };

//   const handleCustomRangeApply = () => {
//     setSelectedPeriod('custom');
//     setShowCustomRange(false);
//   };

//   const handleCustomRangeClose = () => {
//     setShowCustomRange(false);
//   };

//   const trendData = useMemo(() => {
//     const cr = periodData.overallMetrics.completionRate;
//     const data = [
//       Math.max(cr - 15, 0),
//       Math.max(cr - 8, 0),
//       Math.max(cr - 3, 0),
//       cr
//     ];
//     return data;
//   }, [periodData]);

//  const TimePeriodSelector = () => (
//     <View className="mb-4">
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         className="flex-row"
//       >
//         {periodOptions.map((option) => (
//           <TouchableOpacity
//             key={option.key}
//             onPress={() => {
//               if (option.key === 'custom') {
//                 setShowCustomRange(true);
//               } else {
//                 setSelectedPeriod(option.key as TimePeriod);
//               }
//             }}
//             className={`py-2 px-4 rounded-full mr-2 ${
//               selectedPeriod === option.key 
//                 ? 'bg-indigo-500 shadow-sm' 
//                 : 'bg-white dark:bg-gray-800'
//             }`}
//           >
//             <Text className={`text-sm font-medium  ${
//               selectedPeriod === option.key ? 'text-white' : 'text-gray-500 '
//             }`}>
//               {option.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
      
//       <Text className="text-center text-gray-500 text-sm mt-2">
//         {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
//       </Text>
//     </View>
//   );

//   return (
//     <ScrollView className="app-background" showsVerticalScrollIndicator={false}>
//       <View className="p-4">
//         {/* Time Period Selector */}
//         <TimePeriodSelector   />

//         {/* Custom Range Modal */}
//         <CustomRangeModal
//           visible={showCustomRange}
//           startDate={customStartDate}
//           endDate={customEndDate}
//           showStartPicker={showStartPicker}
//           showEndPicker={showEndPicker}
//           onClose={handleCustomRangeClose}
//           onApply={handleCustomRangeApply}
//           onStartDateChange={setCustomStartDate}
//           onEndDateChange={setCustomEndDate}
//           onShowStartPicker={setShowStartPicker}
//           onShowEndPicker={setShowEndPicker}
//         />

//         {/* Metrics Overview */}
//         {periodData?.overallMetrics ? (
//           <MetricsOverview overallMetrics={periodData.overallMetrics} />
//         ) : (
//           <Text className="text-red-500">Error loading metrics overview</Text>
//         )}

//         {/* AI Insights */}
//         {aiInsights.length > 0 ? (
//           <AIInsightsCard insights={aiInsights} />
//         ) : (
//           <Text className="text-red-500">No AI Insights available</Text>
//         )}

//         {/* Heatmap Calendar */}
//         <HeatmapCalendar />

//         {/* Trend Analysis */}
//         <TrendChart
//           data={trendData}
//           title={`Completion Trend - ${periodData.periodLabel}`}
//           color="bg-indigo-500"
//         />

//         {/* Detailed Habit Performance */}
//         {periodData?.habits?.length > 0 ? (
//           <HabitDetailCard
//             habits={periodData.habits}
//             selectedHabit={selectedHabit}
//             onHabitSelect={setSelectedHabit}
//           />
//         ) : (
//           <Text className="text-red-500">No habit data available</Text>
//         )}

//         {/* Performance Summary */}
//         <PerformanceSummary periodData={periodData} />


//       </View>
//     </ScrollView>
//   );
// };

// export default Report;











// /////     ///// //    ////////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomRangeModal from '../components/reports/CustomRangeModal';
import MetricsOverview from '../components/reports/MetricsOverview';
import AIInsightsCard from '../components/reports/AIInsightCard';
import HeatmapCalendar from '../components/reports/HeatMapCalendar';
import TrendChart from '../components/reports/TrendChart';
import HabitDetailCard from '../components/reports/HabitDetailCard';
import PerformanceSummary from '../components/reports/PerformanceSummary';
import { useReport } from '@/hooks/useReport';
import { TimePeriod } from '@/interfaces/interfaces';

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
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // 🔥 Use the powerful useReport hook
  const {
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
  } = useReport({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    enableInsights: true
  });

  // Calculate trend data for chart
  const trendData = React.useMemo(() => {
    const cr = periodData.overallMetrics.completionRate;
    return [
      Math.max(cr - 15, 0),
      Math.max(cr - 8, 0),
      Math.max(cr - 3, 0),
      cr
    ];
  }, [periodData.overallMetrics.completionRate]);

  // Handlers
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

  const handleCustomRangeClose = () => {
    setShowCustomRange(false);
  };

  // Time Period Selector Component
  const TimePeriodSelector = () => (
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
                ? 'bg-indigo-500 shadow-sm' 
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <Text className={`text-sm font-medium ${
              selectedPeriod === option.key ? 'text-white' : 'text-gray-500'
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View className="flex-row items-center justify-between mt-2 px-1">
        <Text className="text-sm text-gray-500">
          {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
        </Text>
        
        {/* Cache status indicator */}
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-1 ${
            cacheStatus === 'fresh' ? 'bg-green-500' :
            cacheStatus === 'stale' ? 'bg-yellow-500' : 'bg-gray-400'
          }`} />
          <Text className="text-xs text-gray-400">
            {lastUpdated ? `Updated ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago` : 'Loading...'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Loading State
  if (isLoading && !periodData.habits.length) {
    return (
      <View className="flex-1 app-background justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-500 mt-4">Loading your report...</Text>
      </View>
    );
  }

  // Error State
  if (error && !periodData.habits.length) {
    return (
      <View className="flex-1 app-background justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">⚠️ {error}</Text>
        <TouchableOpacity
          onPress={refreshData}
          className="bg-indigo-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="app-background" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Header with Refresh Button */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Report
          </Text>
          <TouchableOpacity
            onPress={refreshData}
            disabled={isLoading}
            className={`p-2 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
          >
            <Text className="text-2xl">{isLoading ? '⏳' : '🔄'}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Period Selector */}
        <TimePeriodSelector />

        {/* Custom Range Modal */}
        <CustomRangeModal
          visible={showCustomRange}
          startDate={customDateRange.start}
          endDate={customDateRange.end}
          showStartPicker={showStartPicker}
          showEndPicker={showEndPicker}
          onClose={handleCustomRangeClose}
          onApply={handleCustomRangeApply}
          onStartDateChange={(date) => setCustomRange(date, customDateRange.end)}
          onEndDateChange={(date) => setCustomRange(customDateRange.start, date)}
          onShowStartPicker={setShowStartPicker}
          onShowEndPicker={setShowEndPicker}
        />

        {/* Metrics Overview */}
        <MetricsOverview overallMetrics={periodData.overallMetrics} />

        {/* AI Insights with Refresh */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg text-subheading">AI Insights</Text>
            <TouchableOpacity
              onPress={refreshInsights}
              className="flex-row items-center"
            >
              <Text className="text-xs text-indigo-500 mr-1">Refresh</Text>
              <Text className="text-sm">🤖</Text>
            </TouchableOpacity>
          </View>
          
          {aiInsights.length > 0 ? (
            <AIInsightsCard insights={aiInsights} />
          ) : (
            <View className="card p-4">
              <Text className="text-gray-500 text-center">
                {isLoading ? 'Generating insights...' : 'No insights available yet'}
              </Text>
            </View>
          )}
        </View>

        {/* Heatmap Calendar */}
        <HeatmapCalendar />

        {/* Trend Chart */}
        <TrendChart
          data={trendData}
          title={`Completion Trend - ${periodData.periodLabel}`}
          color="bg-indigo-500"
          periodType={
            selectedPeriod === 'today' ? 'daily' :
            selectedPeriod === 'week' ? 'weekly' :
            selectedPeriod === 'month' ? 'monthly' : 'custom'
          }
          showTarget={true}
          targetValue={80}
          showAverage={true}
        />

        {/* Habit Details */}
        {periodData.habits.length > 0 ? (
          <HabitDetailCard
            habits={periodData.habits}
            selectedHabit={selectedHabit}
            onHabitSelect={setSelectedHabit}
          />
        ) : (
          <View className="card p-8 mb-4">
            <Text className="text-center text-gray-500 mb-2">
              No habits tracked in this period
            </Text>
            <Text className="text-center text-sm text-gray-400">
              Create your first habit to see detailed analytics
            </Text>
          </View>
        )}

        {/* Performance Summary */}
        <PerformanceSummary periodData={periodData} />

        {/* Debug Info (remove in production) */}
        {__DEV__ && (
          <View className="card p-3 mt-4 bg-gray-100 dark:bg-gray-800">
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Debug Info:
            </Text>
            <Text className="text-xs text-gray-500">
              Cache: {cacheStatus} | Habits: {periodData.habits.length} | 
              Insights: {aiInsights.length}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Report;
