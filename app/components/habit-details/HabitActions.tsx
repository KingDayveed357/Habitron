// ==========================================
// components/habit-details/HabitActions.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HabitActions = memo<{ onEdit: () => void; onDelete: () => void }>(({ onEdit, onDelete }) => (
  <View className="px-4 pb-8">
    <View className="flex-row space-x-3 gap-3">
      <TouchableOpacity 
        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm"
        onPress={onEdit}
        accessibilityLabel="Edit habit"
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="create-outline" size={20} color="#6B7280" />
          <Text className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Edit</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 bg-red-500 rounded-xl p-4 shadow-sm"
        onPress={onDelete}
        accessibilityLabel="Delete habit"
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text className="ml-2 text-white font-medium">Delete</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
));

HabitActions.displayName = 'HabitActions';