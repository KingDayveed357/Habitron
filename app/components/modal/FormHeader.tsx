import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface HabitFormHeaderProps {
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSave: () => void;
  loading: boolean;
  disabled: boolean;
}

export const HabitFormHeader: React.FC<HabitFormHeaderProps> = ({
  mode,
  onCancel,
  onSave,
  loading,
  disabled,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <TouchableOpacity onPress={onCancel} disabled={loading} className="p-2">
        <Text className="text-gray-600 dark:text-gray-400 font-medium">Cancel</Text>
      </TouchableOpacity>

      <Text className="text-lg font-semibold text-gray-800 dark:text-white">
        {mode === 'create' ? 'Create New Habit' : 'Edit Habit'}
      </Text>

      <TouchableOpacity
        onPress={onSave}
        disabled={loading || disabled}
        className={`px-4 py-2 rounded-lg ${
          loading || disabled ? 'bg-gray-300 dark:bg-gray-600' : 'bg-indigo-500'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            className={`font-semibold ${
              loading || disabled ? 'text-gray-500' : 'text-white'
            }`}
          >
            Save
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};