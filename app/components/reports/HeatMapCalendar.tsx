// components/reports/HeatMapCalendar.tsx

import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface HeatmapCalendarProps {
  dailyData?: Array<{ date: string; completed: boolean; count?: number }>;
  selectedPeriod?: string;
  totalDays?: number;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ 
  dailyData = [],
  selectedPeriod = 'Last 28 days',
  totalDays = 28
}) => {
  // Generate heatmap data
  const generateHeatmapData = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - Math.min(totalDays - 1, 27));

    const weeks: number[][] = [];
    let currentWeek: number[] = [];
    
    // Fill in leading empty days
    const startDay = startDate.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(-1); // -1 for empty cells
    }
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // Pad the week if needed
        while (currentWeek.length < 7) {
          currentWeek.push(-1);
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      const dateString = d.toISOString().split('T')[0];
      const dayData = dailyData.find(item => item.date.startsWith(dateString));
      
      // 0 = not completed, 1-5 = completion intensity
      currentWeek.push(dayData?.completed ? (dayData.count || 1) : 0);
    }
    
    // Add the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(-1);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeklyHeatmapData = generateHeatmapData();
  
  const getIntensityColor = (value: number): string => {
    if (value === -1) return 'bg-transparent';
    if (value === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (value === 1) return 'bg-green-200 dark:bg-green-900';
    if (value === 2) return 'bg-green-300 dark:bg-green-800';
    if (value === 3) return 'bg-green-400 dark:bg-green-700';
    if (value >= 4) return 'bg-green-500 dark:bg-green-600';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  const totalCompleted = dailyData.filter(d => d.completed).length;
  const completionRate = dailyData.length > 0 
    ? Math.round((totalCompleted / dailyData.length) * 100) 
    : 0;

  return (
    <View className="card p-4 mb-4">
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
            {completionRate}%
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {totalCompleted}/{dailyData.length} days
          </Text>
        </View>
      </View>

      {/* Day labels */}
      <View className="flex-row justify-between mb-2 px-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text 
            key={index} 
            className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center font-medium"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Heatmap grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {weeklyHeatmapData.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row justify-between mb-1">
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                disabled={day === -1}
                activeOpacity={0.7}
                className={`w-8 h-8 rounded-md ${getIntensityColor(day)}`}
              >
                {day > 0 && (
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-xs font-bold text-white">
                      {day > 1 ? day : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Text className="text-xs text-gray-500 dark:text-gray-400">Less</Text>
        <View className="flex-row items-center">
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              className={`w-4 h-4 rounded-sm mr-1 ${getIntensityColor(level)}`}
            />
          ))}
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">More</Text>
      </View>
    </View>
  );
};

export default HeatmapCalendar;