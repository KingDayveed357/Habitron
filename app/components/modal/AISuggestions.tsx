import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAICoach } from '@/hooks/useAICoach';

interface HabitAISuggestionsProps {
  onSelectSuggestion: (suggestion: any) => void;
}

export const HabitAISuggestions: React.FC<HabitAISuggestionsProps> = ({
  onSelectSuggestion,
}) => {
  const { suggestions, generateSuggestions, loadingSuggestions } = useAICoach();

  useEffect(() => {
    if (suggestions.length === 0) {
      generateSuggestions();
    }
  }, []);

  if (loadingSuggestions && suggestions.length === 0) {
    return (
      <View className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-4 mb-6">
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#6366F1" className="mr-2" />
          <Text className="text-gray-600 dark:text-gray-400">
            Loading personalized suggestions...
          </Text>
        </View>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl p-4 mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">🤖</Text>
          <Text className="text-lg font-semibold text-gray-800 dark:text-white">
            AI Suggestions
          </Text>
        </View>
        {loadingSuggestions && <ActivityIndicator size="small" color="#6366F1" />}
      </View>
      <Text className="text-gray-600 dark:text-gray-400 mb-4">
        Based on your goals and current habits, here are some recommendations:
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {suggestions.slice(0, 6).map((suggestion, index) => {
          const title = typeof suggestion === 'string' ? suggestion : suggestion.title;
          return (
            <TouchableOpacity
              key={index}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2"
              onPress={() => onSelectSuggestion(suggestion)}
            >
              <Text className="text-sm text-gray-700 dark:text-gray-300">{title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};