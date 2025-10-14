// ==========================================
// components/habit-details/ProgressCard.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HabitWithCompletion } from '@/types/habit';

interface ProgressCardProps {
  habit: HabitWithCompletion;
  todayProgress: number;
  isUpdating: boolean;
  onProgressUpdate: (increment: number) => void;
}

export const ProgressCard = memo<ProgressCardProps>(({ 
  habit, 
  todayProgress, 
  isUpdating, 
  onProgressUpdate 
}) => {
  const progressPercentage = (todayProgress / habit.target_count) * 100;
  const isCompleted = todayProgress >= habit.target_count;

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Today's Progress</Text>
        <Text className="text-gray-600 dark:text-gray-400">
          {todayProgress}/{habit.target_count} {habit.target_unit}
        </Text>
      </View>
      
      <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
        <View 
          className="bg-indigo-500 rounded-full h-3" 
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
      
      <View className="flex-row justify-between">
        <TouchableOpacity 
          className={`rounded-xl px-6 py-3 flex-1 mr-2 ${
            isCompleted ? 'bg-green-500' : 'bg-indigo-500'
          }`}
          onPress={() => onProgressUpdate(habit.target_count - todayProgress)}
          disabled={isCompleted || isUpdating}
          accessibilityLabel={isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-medium text-center">
              {isCompleted ? '✓ Completed' : 'Mark Complete'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="border border-indigo-500 rounded-xl px-4 py-3 mr-2"
          onPress={() => onProgressUpdate(1)}
          disabled={isCompleted || isUpdating}
          accessibilityLabel="Increment by 1"
        >
          <Text className="text-indigo-500 font-medium">+1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="border border-red-500 rounded-xl px-4 py-3"
          onPress={() => onProgressUpdate(-1)}
          disabled={todayProgress <= 0 || isUpdating}
          accessibilityLabel="Decrement by 1"
        >
          <Text className="text-red-500 font-medium">-1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

ProgressCard.displayName = 'ProgressCard';