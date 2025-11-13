// components/reports/HeatMapCalendar.tsx - FULLY FUNCTIONAL

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface DayData {
  date: string;
  completed: boolean;
  count?: number;
}

interface HeatmapCalendarProps {
  dailyData?: DayData[];
  selectedPeriod?: string;
  totalDays?: number;
}

interface DayCell {
  date: string;
  value: number; // -1 = empty, 0 = not completed, 1+ = completion count
  isToday: boolean;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ 
  dailyData = [],
  selectedPeriod = 'Last 28 days',
  totalDays = 28
}) => {
  
  // Generate heatmap data
  const { weeks, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    
    // Fill leading empty days
    const startDayOfWeek = startDate.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        value: -1,
        isToday: false
      });
    }
    
    let totalCompleted = 0;
    let totalScheduled = 0;
    
    // Generate calendar days
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateString = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay();
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: '',
            value: -1,
            isToday: false
          });
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      const dayData = dailyData.find(item => {
        const itemDate = item.date.split('T')[0];
        return itemDate === dateString;
      });
      
      const isCompleted = dayData?.completed || false;
      const count = dayData?.count || 0;
      
      if (isCompleted) totalCompleted++;
      totalScheduled++;
      
      currentWeek.push({
        date: dateString,
        value: isCompleted ? Math.max(count, 1) : 0,
        isToday: dateString === formatDate(today)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          value: -1,
          isToday: false
        });
      }
      weeks.push(currentWeek);
    }
    
    const completionRate = totalScheduled > 0 
      ? Math.round((totalCompleted / totalScheduled) * 100) 
      : 0;
    
    return { 
      weeks, 
      stats: { 
        totalCompleted, 
        totalScheduled, 
        completionRate 
      } 
    };
  }, [dailyData, totalDays]);

  // Get color based on completion value
  const getIntensityColor = (value: number): string => {
    if (value === -1) return 'bg-transparent';
    if (value === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (value === 1) return 'bg-green-300 dark:bg-green-800';
    if (value === 2) return 'bg-green-400 dark:bg-green-700';
    if (value === 3) return 'bg-green-500 dark:bg-green-600';
    if (value >= 4) return 'bg-green-600 dark:bg-green-500';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  // Format date helper
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for display
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-semibold text-gray-800 dark:text-white">
            Activity Heatmap
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {selectedPeriod}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completionRate}%
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {stats.totalCompleted}/{stats.totalScheduled} days
          </Text>
        </View>
      </View>

      {/* Day labels */}
      <View className="flex-row justify-between mb-2 px-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text 
            key={`day-label-${index}`}
            className="text-xs text-gray-500 dark:text-gray-400 w-9 text-center font-medium"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Heatmap grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 280 }}
      >
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} className="flex-row justify-between mb-1.5">
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={`day-${weekIndex}-${dayIndex}`}
                disabled={day.value === -1}
                activeOpacity={0.7}
                className={`w-9 h-9 rounded-lg ${getIntensityColor(day.value)} ${
                  day.isToday ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {day.value > 0 && (
                  <View className="absolute inset-0 items-center justify-center">
                    {day.value > 1 && (
                      <Text className="text-xs font-bold text-white">
                        {day.value}
                      </Text>
                    )}
                  </View>
                )}
                {day.isToday && (
                  <View className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Text className="text-xs text-gray-500 dark:text-gray-400">Less</Text>
        <View className="flex-row items-center gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={`legend-${level}`}
              className={`w-5 h-5 rounded ${getIntensityColor(level)}`}
            />
          ))}
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">More</Text>
      </View>

      {/* Summary */}
      <View className="mt-3 flex-row items-center justify-center">
        <View className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          Today
        </Text>
      </View>
    </View>
  );
};

export default HeatmapCalendar;