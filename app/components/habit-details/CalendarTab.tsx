// ==========================================
// components/habit-details/CalendarTab.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitWithCompletion } from '@/types/habit';
import { CalendarDay } from '@/types/calendar';

const { width } = Dimensions.get('window');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarTabProps {
  habit: HabitWithCompletion;
  calendarData: CalendarDay[];
  currentMonth: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

export const CalendarTab = memo<CalendarTabProps>(({ 
  habit, 
  calendarData, 
  currentMonth, 
  onNavigateMonth 
}) => {
  const formatMonthYear = (date: Date) => 
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View className="px-4">
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity 
            onPress={() => onNavigateMonth('prev')}
            accessibilityLabel="Previous month"
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatMonthYear(currentMonth)}
          </Text>
          <TouchableOpacity 
            onPress={() => onNavigateMonth('next')}
            accessibilityLabel="Next month"
          >
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <CalendarHeader />
        
        <CalendarGrid 
          calendarData={calendarData} 
          habit={habit} 
          cellWidth={(width - 80) / 7 - 4}
        />

        <CalendarLegend />
      </View>
    </View>
  );
});

CalendarTab.displayName = 'CalendarTab';

const CalendarHeader = memo(() => (
  <View className="flex-row justify-between mb-2">
    {WEEKDAYS.map((day) => (
      <View key={day} className="w-10 items-center">
        <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">{day}</Text>
      </View>
    ))}
  </View>
));

CalendarHeader.displayName = 'CalendarHeader';

interface CalendarGridProps {
  calendarData: CalendarDay[];
  habit: HabitWithCompletion;
  cellWidth: number;
}

const CalendarGrid = memo<CalendarGridProps>(({ calendarData, habit, cellWidth }) => (
  <View className="flex-row flex-wrap">
    {calendarData.map((day, index) => (
      <CalendarCell
        key={index}
        day={day}
        targetCount={habit.target_count}
        cellWidth={cellWidth}
      />
    ))}
  </View>
));

CalendarGrid.displayName = 'CalendarGrid';

interface CalendarCellProps {
  day: CalendarDay;
  targetCount: number;
  cellWidth: number;
}

const CalendarCell = memo<CalendarCellProps>(({ day, targetCount, cellWidth }) => (
  <TouchableOpacity
    className={`h-10 items-center justify-center rounded-lg m-0.5 ${
      day.isToday ? 'bg-indigo-500' : 
      day.isCompleted ? 'bg-green-100 dark:bg-green-900' :
      day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : 'bg-transparent'
    }`}
    style={{ width: cellWidth }}
    accessibilityLabel={`${day.date}, ${day.isCompleted ? 'completed' : 'not completed'}`}
  >
    <Text className={`text-sm ${
      day.isToday ? 'text-white font-bold' :
      day.isCompleted ? 'text-green-800 dark:text-green-200 font-semibold' :
      day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
    }`}>
      {day.day}
    </Text>
    {day.completionCount > 0 && day.completionCount < targetCount && (
      <View className="w-1 h-1 bg-amber-500 rounded-full absolute bottom-1" />
    )}
  </TouchableOpacity>
));

CalendarCell.displayName = 'CalendarCell';

const CalendarLegend = memo(() => (
  <View className="flex-row justify-center mt-4 gap-4 space-x-4">
    <LegendItem color="bg-green-500" label="Completed" />
    <LegendItem color="bg-amber-500" label="Partial" />
    <LegendItem color="bg-indigo-500" label="Today" />
  </View>
));

CalendarLegend.displayName = 'CalendarLegend';

const LegendItem = memo<{ color: string; label: string }>(({ color, label }) => (
  <View className="flex-row items-center">
    <View className={`w-3 h-3 ${color} rounded-full mr-1`} />
    <Text className="text-xs text-gray-600 dark:text-gray-400">{label}</Text>
  </View>
));

LegendItem.displayName = 'LegendItem';