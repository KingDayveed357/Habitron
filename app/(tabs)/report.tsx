import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import TimePeriodSelector from '../components/reports/TimePeriodSelector';
import CustomRangeModal from '../components/reports/CustomRangeModal';
import MetricsOverview from '../components/reports/MetricsOverview';
import AIInsightsCard  from '../components/reports/AIInsightCard';
import HeatmapCalendar from '../components/reports/HeatMapCalendar';
import TrendChart from '../components/reports/TrendChart';
import HabitDetailCard from '../components/reports/HabitDetailCard';
import PerformanceSummary from '../components/reports/PerformanceSummary';

import { 
  HabitData, 
  periodOptions, 
  calculatePeriodData, 
  generateAIInsights 
} from '@/utils/mockReportData';

import { TimePeriod } from '@/interfaces/interfaces';

const Report: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Calculate period data
  const periodData = useMemo(() => {
    try {
      const result = calculatePeriodData(selectedPeriod, customStartDate, customEndDate, HabitData);
      return result;
    } catch (error) {
      console.error('[Error] calculatePeriodData failed:', error);
      return {
        habits: [],
        overallMetrics: {
          totalHabits: 0,
          activeStreaks: 0,
          completionRate: 0,
          consistencyScore: 0,
          momentum: 0,
          improvement: 0,
          weeklyGoal: 0,
          monthlyGoal: 0
        },
        periodLabel: 'Invalid',
        totalDays: 0
      };
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Generate AI insights
  const aiInsights = useMemo(() => {
    try {
      const insights = generateAIInsights(periodData);
      return insights;
    } catch (error) {
      console.error('[Error] generateAIInsights failed:', error);
      return [];
    }
  }, [periodData]);

  // Handlers
const handlePeriodSelect = (period: TimePeriod) => {
  console.log('[Handler] Period selected:', period);
  if (period === 'custom') {
    setShowCustomRange(true);
  } else {
    // 🛠 Small delay to avoid overlapping renders
   setSelectedPeriod(period);
  }
};

  const handleCustomRangeApply = () => {
    setSelectedPeriod('custom');
    setShowCustomRange(false);
  };

  const handleCustomRangeClose = () => {
    setShowCustomRange(false);
  };

  const trendData = useMemo(() => {
    const cr = periodData.overallMetrics.completionRate;
    const data = [
      Math.max(cr - 15, 0),
      Math.max(cr - 8, 0),
      Math.max(cr - 3, 0),
      cr
    ];
    return data;
  }, [periodData]);

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
            onPress={() => {
              if (option.key === 'custom') {
                setShowCustomRange(true);
              } else {
                setSelectedPeriod(option.key as TimePeriod);
              }
            }}
            className={`py-2 px-4 rounded-full mr-2 ${
              selectedPeriod === option.key 
                ? 'bg-indigo-500 shadow-sm' 
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <Text className={`text-sm font-medium  ${
              selectedPeriod === option.key ? 'text-white' : 'text-gray-500 '
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text className="text-center text-gray-500 text-sm mt-2">
        {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <ScrollView className="app-background" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Time Period Selector */}
        <TimePeriodSelector   />

        {/* Custom Range Modal */}
        <CustomRangeModal
          visible={showCustomRange}
          startDate={customStartDate}
          endDate={customEndDate}
          showStartPicker={showStartPicker}
          showEndPicker={showEndPicker}
          onClose={handleCustomRangeClose}
          onApply={handleCustomRangeApply}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
          onShowStartPicker={setShowStartPicker}
          onShowEndPicker={setShowEndPicker}
        />

        {/* Metrics Overview */}
        {periodData?.overallMetrics ? (
          <MetricsOverview overallMetrics={periodData.overallMetrics} />
        ) : (
          <Text className="text-red-500">Error loading metrics overview</Text>
        )}

        {/* AI Insights */}
        {aiInsights.length > 0 ? (
          <AIInsightsCard insights={aiInsights} />
        ) : (
          <Text className="text-red-500">No AI Insights available</Text>
        )}

        {/* Heatmap Calendar */}
        <HeatmapCalendar />

        {/* Trend Analysis */}
        <TrendChart
          data={trendData}
          title={`Completion Trend - ${periodData.periodLabel}`}
          color="bg-indigo-500"
        />

        {/* Detailed Habit Performance */}
        {periodData?.habits?.length > 0 ? (
          <HabitDetailCard
            habits={periodData.habits}
            selectedHabit={selectedHabit}
            onHabitSelect={setSelectedHabit}
          />
        ) : (
          <Text className="text-red-500">No habit data available</Text>
        )}

        {/* Performance Summary */}
        <PerformanceSummary periodData={periodData} />


      </View>
    </ScrollView>
  );
};

export default Report;