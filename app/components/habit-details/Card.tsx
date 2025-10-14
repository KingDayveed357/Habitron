// ==========================================
// components/habit-details/HabitDetailsCard.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { HabitWithCompletion } from '@/types/habit';
import { getFrequencyDisplay } from '@/utils/habitHelpers';

interface HabitDetailsCardProps {
  habit: HabitWithCompletion;
}

export const HabitDetailsCard = memo<HabitDetailsCardProps>(({ habit }) => (
  <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</Text>
    
    <View className="space-y-3">
      <DetailRow 
        label="Target" 
        value={`${habit.target_count} ${habit.target_unit}`} 
      />
      
      <DetailRow 
        label="Frequency" 
        value={getFrequencyDisplay(habit)} 
      />
      
      <DetailRow 
        label="Category" 
        value={habit.category} 
      />
      
      {habit.description && (
        <View className="py-2">
          <Text className="text-gray-600 dark:text-gray-400 mb-1">Description</Text>
          <Text className="text-gray-900 dark:text-white">{habit.description}</Text>
        </View>
      )}
    </View>
  </View>
));

HabitDetailsCard.displayName = 'HabitDetailsCard';

const DetailRow = memo<{ label: string; value: string }>(({ label, value }) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-gray-600 dark:text-gray-400">{label}</Text>
    <Text className="text-gray-900 dark:text-white font-medium">{value}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';