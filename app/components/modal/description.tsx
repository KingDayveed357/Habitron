import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface HabitDescriptionProps {
  description: string;
  onDescriptionChange: (text: string) => void;
  error?: string;
}

export const HabitDescription: React.FC<HabitDescriptionProps> = ({
  description,
  onDescriptionChange,
  error,
}) => {
  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        Description (Optional)
      </Text>
      <TextInput
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Why is this habit important to you?"
        placeholderTextColor="#9CA3AF"
        className={`border rounded-xl p-4 h-20 text-gray-800 dark:text-white ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
        }`}
        multiline
        textAlignVertical="top"
        maxLength={500}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};