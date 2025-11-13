// components/habit-details/CalendarTab.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitWithCompletion } from '@/types/habit';
import { CalendarDay } from '@/types/calendar';

interface CalendarTabProps {
  habit: HabitWithCompletion;
  calendarData: CalendarDay[];
  currentMonth: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  loading?: boolean;
}

export const CalendarTab = memo<CalendarTabProps>(({ 
  habit, 
  calendarData, 
  currentMonth, 
  onNavigateMonth,
  loading = false
}) => {
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Calculate summary for current month
  const summary = calculateMonthSummary(calendarData);

  return (
    <View className="px-4 pb-6">
      {/* Calendar Header */}
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => onNavigateMonth('prev')}
            className="p-2"
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={24} color="#6366f1" />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthName}
          </Text>
          
          <TouchableOpacity
            onPress={() => onNavigateMonth('next')}
            className="p-2"
            disabled={loading}
          >
            <Ionicons name="chevron-forward" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View className="flex-row mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {calendarData.map((day, index) => (
              <CalendarDayCell key={index} day={day} />
            ))}
          </View>
        )}
      </View>

      {/* Calendar Legend */}
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Legend
        </Text>
        <View className="space-y-3">
          <LegendItem color="bg-green-500" label="Completed" emoji="✅" />
          <LegendItem color="bg-yellow-400" label="Partial Progress" emoji="⚡" />
          <LegendItem color="bg-red-400" label="Missed (Scheduled)" emoji="⚪" />
          <LegendItem color="bg-gray-400" label="Rest Day / Not Scheduled" emoji="🔵" />
        </View>
      </View>

      {/* Month Summary */}
      <View className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-semibold text-white mb-4">Month Summary</Text>
        
        <View className="space-y-3">
          <SummaryRow 
            label="Completed" 
            value={summary.completed} 
            emoji="✅"
            color="text-green-300"
          />
          <SummaryRow 
            label="Missed" 
            value={summary.missed} 
            emoji="⚪"
            color="text-red-300"
          />
          <SummaryRow 
            label="Partial" 
            value={summary.partial} 
            emoji="⚡"
            color="text-yellow-300"
          />
          <SummaryRow 
            label="Rest Days" 
            value={summary.restDays} 
            emoji="🔵"
            color="text-gray-300"
          />
          
          <View className="border-t border-white/20 pt-3 mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-medium">Success Rate</Text>
              <Text className="text-2xl font-bold text-white">
                {Math.round(summary.successRate)}%
              </Text>
            </View>
            <Text className="text-white/70 text-xs mt-1">
              Based on {summary.scheduledDays} scheduled days
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

CalendarTab.displayName = 'CalendarTab';

// Calendar Day Cell Component
const CalendarDayCell = memo<{ day: CalendarDay }>(({ day }) => {
  const getDayStyle = () => {
    let baseClass = 'w-full aspect-square items-center justify-center rounded-lg m-0.5';
    
    if (!day.isCurrentMonth) {
      return `${baseClass} opacity-30`;
    }

    if (day.isToday) {
      baseClass += ' border-2 border-indigo-500';
    }

    switch (day.status) {
      case 'completed':
        return `${baseClass} bg-green-500`;
      case 'partial':
        return `${baseClass} bg-yellow-400`;
      case 'missed':
        return `${baseClass} bg-red-400`;
      case 'rest':
        return `${baseClass} bg-gray-300 dark:bg-gray-700`;
      case 'future':
        return `${baseClass} bg-gray-100 dark:bg-gray-800`;
      default:
        return `${baseClass} bg-gray-100 dark:bg-gray-800`;
    }
  };

  const getTextColor = () => {
    if (!day.isCurrentMonth) return 'text-gray-400';
    
    switch (day.status) {
      case 'completed':
      case 'partial':
      case 'missed':
        return 'text-white font-semibold';
      case 'rest':
      case 'future':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const getStatusEmoji = () => {
    switch (day.status) {
      case 'completed':
        return '✓';
      case 'partial':
        return day.completionCount > 0 ? day.completionCount.toString() : '';
      case 'missed':
        return '○';
      default:
        return '';
    }
  };

  return (
    <View style={{ width: '14.28%' }} className="p-0.5">
      <View className={getDayStyle()}>
        <Text className={`text-xs ${getTextColor()}`}>
          {day.day}
        </Text>
        {getStatusEmoji() && (
          <Text className="text-xs text-white mt-0.5">
            {getStatusEmoji()}
          </Text>
        )}
      </View>
    </View>
  );
});

CalendarDayCell.displayName = 'CalendarDayCell';

// Legend Item Component
const LegendItem = memo<{ color: string; label: string; emoji: string }>(
  ({ color, label, emoji }) => (
    <View className="flex-row items-center">
      <View className={`w-4 h-4 rounded ${color} mr-3`} />
      <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">{label}</Text>
      <Text className="text-lg">{emoji}</Text>
    </View>
  )
);

LegendItem.displayName = 'LegendItem';

// Summary Row Component
const SummaryRow = memo<{ 
  label: string; 
  value: number; 
  emoji: string;
  color: string;
}>(({ label, value, emoji, color }) => (
  <View className="flex-row justify-between items-center">
    <View className="flex-row items-center">
      <Text className="text-lg mr-2">{emoji}</Text>
      <Text className="text-white/90">{label}</Text>
    </View>
    <Text className={`text-xl font-bold ${color}`}>
      {value}
    </Text>
  </View>
));

SummaryRow.displayName = 'SummaryRow';

// Helper function to calculate month summary
function calculateMonthSummary(calendarData: CalendarDay[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonthDays = calendarData.filter(day => {
    const dayDate = new Date(day.date);
    return day.isCurrentMonth && dayDate <= today;
  });

  let completed = 0;
  let missed = 0;
  let restDays = 0;
  let partial = 0;
  let scheduledDays = 0;

  currentMonthDays.forEach(day => {
    switch (day.status) {
      case 'completed':
        completed++;
        scheduledDays++;
        break;
      case 'partial':
        partial++;
        scheduledDays++;
        break;
      case 'missed':
        missed++;
        scheduledDays++;
        break;
      case 'rest':
        restDays++;
        break;
    }
  });

  const successRate = scheduledDays > 0 ? (completed / scheduledDays) * 100 : 0;

  return {
    completed,
    missed,
    restDays,
    partial,
    successRate,
    scheduledDays
  };
}