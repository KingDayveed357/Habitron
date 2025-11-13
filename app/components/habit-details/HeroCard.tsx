// ==========================================
// components/habit-details/HeroCard.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HabitWithCompletion } from '@/types/habit';
import { getColorFromBgClass, getFrequencyDisplay } from '@/utils/habitHelpers';
import { HabitStatistics } from '@/hooks/useHabitStatistics';

interface HabitHeroCardProps {
  habit: HabitWithCompletion;
  statistics: HabitStatistics;
}

export const HabitHeroCard = memo<HabitHeroCardProps>(({ habit, statistics }) => {
  const colors = getColorFromBgClass(habit.bg_color);

  return (
    <View className="px-4 py-4">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16 }}
        className="p-6"
      >
        <View className="flex-row items-center mb-4">
          <Text className="text-4xl mr-4">{habit.icon}</Text>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">
              {habit.title}
            </Text>
            <Text className="text-white/80 text-base">
              {habit.category} • {getFrequencyDisplay(habit)}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between">
          <View className="bg-white/20 rounded-xl p-4 flex-1 mr-3">
            <Text className="text-3xl font-bold text-white"> {statistics.currentStreak}</Text>
            <Text className="text-white/80 text-sm">Current Streak</Text>
          </View>
          <View className="bg-white/20 rounded-xl p-4 flex-1 ml-3">
            <Text className="text-3xl font-bold text-white">{Math.round(statistics.completionRate)}%</Text>
            <Text className="text-white/80 text-sm">Success Rate</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

HabitHeroCard.displayName = 'HabitHeroCard';