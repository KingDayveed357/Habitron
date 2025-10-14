// components/reports/HabitDetailCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { HabitDataProps } from '@/interfaces/interfaces';


interface HabitDetailCardProps {
  habits: HabitDataProps[];
  selectedHabit: string | null;
  onHabitSelect: (habitId: string) => void;
  isLoading?: boolean;
}

const HabitDetailCard: React.FC<HabitDetailCardProps> = ({ 
  habits, 
  selectedHabit, 
  onHabitSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <View className="mb-4">
        <Text className="text-lg text-gray-700 dark:text-gray-300 mb-3 px-1">
          Habit Performance
        </Text>
        <View className="card p-4 mb-3 h-32 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <View className="card p-4 mb-3 h-32 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View className="mb-4">
        <Text className="text-lg text-gray-700 dark:text-gray-300 mb-3 px-1">
          Habit Performance
        </Text>
        <View className="card p-8">
          <Text className="text-center text-gray-500 dark:text-gray-400 mb-2">
            No habits to display
          </Text>
          <Text className="text-center text-sm text-gray-400 dark:text-gray-500">
            Start tracking habits to see detailed performance metrics
          </Text>
        </View>
      </View>
    );
  }

  const renderHabitCard = (habit: HabitDataProps) => {
    const isSelected = selectedHabit === habit.id;
    
    return (
      <TouchableOpacity
        key={habit.id}
        onPress={() => onHabitSelect(habit.id === selectedHabit ? '' : habit.id)}
        className={`card p-4 mb-3 border-2 ${
          isSelected 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-transparent'
        }`}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-3xl mr-3">{habit.icon}</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 dark:text-white">
                {habit.name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {habit.totalDays} day{habit.totalDays !== 1 ? 's' : ''} tracked
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {habit.completionRate}%
            </Text>
            <View className={`px-2 py-1 rounded-full mt-1 ${
              habit.difficulty === 'Easy' || habit.difficulty === 'easy' 
                ? 'bg-green-100 dark:bg-green-900/30' :
              habit.difficulty === 'Medium' || habit.difficulty === 'medium' 
                ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Text className={`text-xs font-medium ${
                habit.difficulty === 'Easy' || habit.difficulty === 'easy' 
                  ? 'text-green-700 dark:text-green-400' :
                habit.difficulty === 'Medium' || habit.difficulty === 'medium' 
                  ? 'text-yellow-700 dark:text-yellow-400' 
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {habit.difficulty}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Progress bars */}
        <View className="flex-row justify-between mb-3 gap-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Completion
            </Text>
            <View className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <View 
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${habit.completionRate}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {habit.completionRate}%
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Current Streak
            </Text>
            <View className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <View 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${Math.min((habit.currentStreak / 30) * 100, 100)}%` 
                }}
              />
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {habit.currentStreak} days
            </Text>
          </View>
        </View>

        {/* Streak info */}
        <View className="flex-row justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mr-1">🔥</Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              Current: <Text className="font-semibold">{habit.currentStreak}</Text>
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 dark:text-gray-400 mr-1">🏆</Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              Best: <Text className="font-semibold">{habit.longestStreak}</Text>
            </Text>
          </View>
        </View>

        {/* Expanded details */}
        {isSelected && (
          <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Detailed Metrics
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Consistency Score
                </Text>
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  {habit.consistencyScore}%
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Momentum
                </Text>
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  {habit.momentum}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Optimal Time
                </Text>
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  {habit.optimalTime}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Correlation Score
                </Text>
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  {habit.correlationScore}%
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="mt-3 bg-indigo-500 py-2 rounded-lg">
              <Text className="text-white text-center text-sm font-medium">
                View Full Analytics
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">
          Habit Performance
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {habits.length} habit{habits.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits.map(renderHabitCard)}
      </ScrollView>
    </View>
  );
};


export default HabitDetailCard;