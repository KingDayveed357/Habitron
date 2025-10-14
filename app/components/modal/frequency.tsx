// app/components/habit/HabitFrequency.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckIcon } from 'lucide-react-native';
import { HABIT_FREQUENCIES } from '@/types/habit';

const weekLabels = ['SU', 'M', 'TU', 'W', 'TH', 'F', 'SA'];

interface HabitFrequencyProps {
  frequencyType: 'daily' | 'weekly' | 'monthly';
  onFrequencyTypeChange: (type: 'daily' | 'weekly' | 'monthly') => void;
  
  // Daily
  selectedDays: string[];
  allDaysSelected: boolean;
  onToggleDailyDay: (day: string) => void;
  onToggleAllDays: () => void;
  
  // Weekly
  weeklyCount: number;
  onWeeklyCountChange: (count: number) => void;
  
  // Monthly
  monthlyDays: number[];
  onToggleMonthlyDay: (day: number) => void;
}

export const HabitFrequency: React.FC<HabitFrequencyProps> = ({
  frequencyType,
  onFrequencyTypeChange,
  selectedDays,
  allDaysSelected,
  onToggleDailyDay,
  onToggleAllDays,
  weeklyCount,
  onWeeklyCountChange,
  monthlyDays,
  onToggleMonthlyDay,
}) => {
  return (
    <>
      {/* Frequency Type Selector */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Frequency
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {HABIT_FREQUENCIES.map((frequency, index) => (
            <TouchableOpacity
              key={index}
              className={`px-6 py-3 rounded-xl border ${
                frequencyType === frequency.value
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}
              onPress={() => onFrequencyTypeChange(frequency.value as any)}
            >
              <Text
                className={`text-sm font-medium ${
                  frequencyType === frequency.value
                    ? 'text-white'
                    : 'text-gray-800 dark:text-white'
                }`}
              >
                {frequency.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Frequency Settings */}
      {frequencyType === 'daily' && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white">
              On these days
            </Text>
            <TouchableOpacity
              onPress={onToggleAllDays}
              className="flex-row items-center gap-2"
            >
              <Text className="text-gray-600 dark:text-gray-400">All days</Text>
              <View
                className={`w-5 h-5 border rounded items-center justify-center ${
                  allDaysSelected
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-gray-400'
                }`}
              >
                {allDaysSelected && <CheckIcon size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {weekLabels.map((day) => (
              <TouchableOpacity
                key={day}
                className={`w-12 h-12 items-center justify-center rounded-full border ${
                  selectedDays.includes(day)
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                }`}
                onPress={() => onToggleDailyDay(day)}
              >
                <Text
                  className={`text-sm ${
                    selectedDays.includes(day)
                      ? 'text-white'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Weekly Frequency Settings */}
      {frequencyType === 'weekly' && (
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            How many times per week?
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((count) => (
              <TouchableOpacity
                key={count}
                className={`w-12 h-12 items-center justify-center rounded-full border ${
                  weeklyCount === count
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                }`}
                onPress={() => onWeeklyCountChange(count)}
              >
                <Text
                  className={`text-sm ${
                    weeklyCount === count
                      ? 'text-white'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Monthly Frequency Settings */}
      {frequencyType === 'monthly' && (
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Select Days in the Month
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity
                key={day}
                className={`w-12 h-12 items-center justify-center rounded-full border ${
                  monthlyDays.includes(day)
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-400'
                }`}
                onPress={() => onToggleMonthlyDay(day)}
              >
                <Text
                  className={`text-sm ${
                    monthlyDays.includes(day)
                      ? 'text-white'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {monthlyDays.length > 0 && (
            <Text className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Every Month on {monthlyDays.sort((a, b) => a - b).join(', ')}
            </Text>
          )}
        </View>
      )}
    </>
  );
};