import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { HabitDataProps } from '@/interfaces/interfaces';

interface HabitDetailCardProps {
  habits: (HabitDataProps & { periodDailyData?: any[] })[];
  selectedHabit: string | null;
  onHabitSelect: (habitId: string) => void;
}

const HabitDetailCard: React.FC<HabitDetailCardProps> = ({ 
  habits, 
  selectedHabit, 
  onHabitSelect 
}) => {
  const renderHabitCard = (habit: HabitDataProps & { periodDailyData?: any[] }) => {
    const isSelected = selectedHabit === habit.id;
    
    return (
      <TouchableOpacity
        key={habit.id}
        onPress={() => onHabitSelect(habit.id)}
        className={`card p-4 mb-3 shadow-sm border-2 ${
          isSelected ? 'border-indigo-500 ' : 'border-transparent'
        }`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-2xl  mr-3">{habit.icon}</Text>
            <View>
              <Text className="text-body font-semibold">{habit.name}</Text>
              <Text className="text-gray-500 text-xs">
                {habit.totalDays} day{habit.totalDays !== 1 ? 's' : ''} tracked
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-gray-800">{habit.completionRate}%</Text>
            <View className={`px-2 py-1 rounded-full ${
              habit.difficulty === 'Easy' ? 'bg-green-100' :
              habit.difficulty === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs ${
                habit.difficulty === 'Easy' ? 'text-green-700' :
                habit.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {habit.difficulty}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-xs text-body mb-1">Completion Rate</Text>
            <View className="bg-gray-200 h-2 rounded-full">
              <View 
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${habit.completionRate}%` }}
              />
            </View>
            <Text className="text-xs text-body mt-1">{habit.completionRate}%</Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xs text-body mb-1">Current Streak</Text>
            <View className="bg-gray-200 h-2 rounded-full">
              <View 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min((habit.currentStreak / 30) * 100, 100)}%` }}
              />
            </View>
            <Text className="text-xs text-body mt-1">{habit.currentStreak} days</Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm text-body">Current: {habit.currentStreak} days</Text>
          <Text className="text-sm text-body">Best: {habit.longestStreak} days</Text>
        </View>

        {/* Additional details when selected */}
        {isSelected && (
          <View className="mt-4 pt-4 border-t border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-body">Consistency Score</Text>
              <Text className="text-sm font-medium text-body">{habit.consistencyScore}%</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-body">Momentum</Text>
              <Text className="text-sm font-medium text-body">{habit.momentum}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-body">Optimal Time</Text>
              <Text className="text-sm font-medium text-body">{habit.optimalTime}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-body">Correlation Score</Text>
              <Text className="text-sm font-medium text-body">{habit.correlationScore}%</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-4">
      <Text className="text-lg text-subheading mb-3 px-1">Habit Details</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits.map(renderHabitCard)}
      </ScrollView>
    </View>
  );
};

export default HabitDetailCard;