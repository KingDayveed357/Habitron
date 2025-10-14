import React from 'react';
import { View, Text } from 'react-native';

interface HabitPreviewProps {
  title: string;
  icon: string;
  bgColor: string;
  targetCount: number;
  targetUnit: string;
  frequencyType: 'daily' | 'weekly' | 'monthly';
  selectedDays: string[];
  weeklyCount: number;
  monthlyDays: number[];
  description?: string;
}

export const HabitPreview: React.FC<HabitPreviewProps> = ({
  title,
  icon,
  bgColor,
  targetCount,
  targetUnit,
  frequencyType,
  selectedDays,
  weeklyCount,
  monthlyDays,
  description,
}) => {
  const getFrequencyDescription = () => {
    if (frequencyType === 'daily') {
      if (selectedDays.length === 0) return 'Select days';
      if (selectedDays.length === 7) return 'Every day';
      return `${selectedDays.length} days/week`;
    } else if (frequencyType === 'weekly') {
      return `${weeklyCount}x per week`;
    } else if (frequencyType === 'monthly') {
      if (monthlyDays.length === 0) return 'Select days';
      return `${monthlyDays.length} days/month`;
    }
    return 'Not set';
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Preview
      </Text>
      <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <View className="flex-row items-center">
          <View
            className={`w-12 h-12 ${bgColor} rounded-xl items-center justify-center mr-3`}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-800 dark:text-white">
              {title || 'Your habit name'}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {targetCount} {targetUnit} • {getFrequencyDescription()}
            </Text>
            {description && (
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};