import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HABIT_COLORS } from '@/types/habit';

interface HabitColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const HabitColorPicker: React.FC<HabitColorPickerProps> = ({
  selectedColor,
  onColorChange,
}) => {
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-green-500': '#10B981',
    'bg-purple-500': '#8B5CF6',
    'bg-amber-500': '#F59E0B',
    'bg-red-500': '#EF4444',
    'bg-pink-500': '#EC4899',
    'bg-indigo-500': '#6366F1',
    'bg-teal-500': '#14B8A6',
    'bg-orange-500': '#F97316',
    'bg-cyan-500': '#06B6D4',
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        Choose Color
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {HABIT_COLORS.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={{ backgroundColor: colorMap[color] }}
            className={`w-10 h-10 rounded-full border-2 ${
              selectedColor === color
                ? 'border-black dark:border-white'
                : 'border-transparent'
            }`}
            onPress={() => onColorChange(color)}
          />
        ))}
      </View>
    </View>
  );
};