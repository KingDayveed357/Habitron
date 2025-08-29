// components/AIInsights.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAICoach } from '@/hooks/useAICoach';
import { useRouter } from 'expo-router';

interface AIInsightsProps {
  maxInsights?: number;
  showHeader?: boolean;
  compact?: boolean;
  onInsightPress?: (insight: any) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  maxInsights = 3,
  showHeader = true,
  compact = false,
  onInsightPress
}) => {
  const router = useRouter();
  const { insights, loadingInsights, refreshInsights, error } = useAICoach();
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded && !loadingInsights && insights.length === 0) {
      refreshInsights();
      setHasLoaded(true);
    }
  }, [hasLoaded, loadingInsights, insights.length, refreshInsights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return '📈';
      case 'achievement': return '🏆';
      case 'warning': return '⚠️';
      case 'tip': return '💡';
      case 'motivation': return '🔥';
      default: return '✨';
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'achievement': return 'bg-green-50 dark:bg-green-900/20 border-green-200';
        case 'warning': return 'bg-red-50 dark:bg-red-900/20 border-red-200';
        case 'trend': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
        default: return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200';
      }
    }
    return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200';
  };

  const handleInsightPress = (insight: any) => {
    if (onInsightPress) {
      onInsightPress(insight);
    } else if (insight.actionable && insight.action) {
      // Handle default actions
      switch (insight.action.type) {
        case 'create_habit':
          router.push('/screens/create_habit');
          break;
        case 'navigate':
          router.push(insight.action.data.route);
          break;
        case 'modify_habit':
          // Handle habit modification
          break;
      }
    } else {
      // Default: open AI coach for more details
      router.push('/(tabs)/ai_coach');
    }
  };

  if (error && insights.length === 0) {
    return (
      <View className={`rounded-2xl p-4 border border-gray-200 dark:border-gray-700 ${compact ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">🤖</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Coach</Text>
          </View>
          <TouchableOpacity onPress={refreshInsights} className="p-1">
            <Ionicons name="refresh" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          Unable to load insights right now. Tap refresh to try again.
        </Text>
      </View>
    );
  }

  if (loadingInsights && insights.length === 0) {
    return (
      <View className={`rounded-2xl p-4 border border-gray-200 dark:border-gray-700 ${compact ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row items-center mb-3">
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="text-gray-600 dark:text-gray-400 ml-2">
            Your AI coach is analyzing your habits...
          </Text>
        </View>
      </View>
    );
  }

  if (insights.length === 0) {
    return (
      <View className={`rounded-2xl p-4 border border-gray-200 dark:border-gray-700 ${compact ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">🤖</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Coach</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ai_coach')} className="p-1">
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          Start building habits to get personalized AI insights and coaching.
        </Text>
      </View>
    );
  }

  const displayInsights = insights.slice(0, maxInsights);

  return (
    <View className={compact ? 'mb-4' : 'mb-6'}>
      {showHeader && (
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">🧠</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/ai_coach')}
            className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full"
          >
            <Text className="text-purple-700 dark:text-purple-300 text-xs font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View className="space-y-3 gap-3">
        {displayInsights.map((insight, index) => (
          <TouchableOpacity
            key={insight.id}
            className={`rounded-xl p-4 border ${getInsightColor(insight.type, insight.priority)}`}
            onPress={() => handleInsightPress(insight)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">{getInsightIcon(insight.type)}</Text>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </Text>
                  {insight.priority === 'high' && (
                    <View className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </View>
                <Text className="text-gray-700 dark:text-gray-300 text-sm leading-5">
                  {insight.description}
                </Text>
                {insight.actionable && (
                  <View className="flex-row items-center mt-2">
                    <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-medium mr-1">
                      Tap for action
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color="#6366F1" />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AIInsights;