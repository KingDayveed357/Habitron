import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface HabitGoalSettingsProps {
  targetCount: number;
  targetUnit: string;
  onTargetCountChange: (count: number) => void;
  onTargetUnitChange: (unit: string) => void;
  errors?: {
    targetCount?: string;
    targetUnit?: string;
  };
}

export const HabitGoalSettings: React.FC<HabitGoalSettingsProps> = ({
  targetCount,
  targetUnit,
  onTargetCountChange,
  onTargetUnitChange,
  errors,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        Goal Settings
      </Text>

      <View className="flex-row space-x-3 gap-3">
        <View className="flex-1">
          <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Target {errors?.targetCount && <Text className="text-red-500">*</Text>}
          </Text>
          <TextInput
            value={targetCount.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 1;
              onTargetCountChange(Math.max(1, Math.min(100, num)));
            }}
            placeholder="1"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className={`border rounded-xl p-4 text-gray-800 dark:text-white dark:bg-gray-800 ${
              errors?.targetCount
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-100'
            }`}
          />
        </View>

        <View className="flex-1">
          <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Unit {errors?.targetUnit && <Text className="text-red-500">*</Text>}
          </Text>
          <TextInput
            value={targetUnit}
            onChangeText={onTargetUnitChange}
            placeholder="times, glasses, etc."
            placeholderTextColor="#9CA3AF"
            className={`border rounded-xl p-4 text-gray-800 dark:text-white dark:bg-gray-800 ${
              errors?.targetUnit
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-100'
            }`}
          />
        </View>
      </View>
    </View>
  );
};