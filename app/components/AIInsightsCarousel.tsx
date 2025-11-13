// components/AIInsightsCarousel.tsx - MODERN CAROUSEL WITH ACTIONABLE INSIGHTS
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import type { AIInsight } from '@/services/AIServices/insights';

interface AIInsightsCarouselProps {
  insights: AIInsight[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  isOnline: boolean;
}

const AIInsightsCarousel: React.FC<AIInsightsCarouselProps> = ({
  insights,
  loading,
  error,
  onRefresh,
  isOnline
}) => {
  const router = useRouter();

  // 🎨 Get insight styling based on type
  const getInsightStyle = useCallback((insight: AIInsight) => {
    switch (insight.type) {
      case 'achievement':
        return {
          gradient: 'from-green-500 to-emerald-600',
          badge: 'bg-green-100 dark:bg-green-900/40',
          badgeText: 'text-green-700 dark:text-green-300',
          icon: 'trophy' as const,
          iconColor: '#10B981'
        };
      case 'trend':
        return {
          gradient: 'from-blue-500 to-cyan-600',
          badge: 'bg-blue-100 dark:bg-blue-900/40',
          badgeText: 'text-blue-700 dark:text-blue-300',
          icon: 'trending-up' as const,
          iconColor: '#3B82F6'
        };
      case 'warning':
        return {
          gradient: 'from-orange-500 to-red-600',
          badge: 'bg-orange-100 dark:bg-orange-900/40',
          badgeText: 'text-orange-700 dark:text-orange-300',
          icon: 'alert-circle' as const,
          iconColor: '#F97316'
        };
      case 'tip':
        return {
          gradient: 'from-purple-500 to-pink-600',
          badge: 'bg-purple-100 dark:bg-purple-900/40',
          badgeText: 'text-purple-700 dark:text-purple-300',
          icon: 'bulb' as const,
          iconColor: '#A855F7'
        };
      case 'motivation':
        return {
          gradient: 'from-indigo-500 to-purple-600',
          badge: 'bg-indigo-100 dark:bg-indigo-900/40',
          badgeText: 'text-indigo-700 dark:text-indigo-300',
          icon: 'flash' as const,
          iconColor: '#6366F1'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          badge: 'bg-gray-100 dark:bg-gray-800',
          badgeText: 'text-gray-700 dark:text-gray-300',
          icon: 'information-circle' as const,
          iconColor: '#6B7280'
        };
    }
  }, []);

  // 🎯 Handle insight action
  const handleInsightAction = useCallback((insight: AIInsight) => {
    if (insight.actionable && insight.action) {
      switch (insight.action.type) {
        case 'create_habit':
          router.push('/screens/create_habit');
          break;
        case 'navigate':
          if (insight.action.data?.route) {
            router.push(insight.action.data.route as any);
          }
          break;
        case 'modify_habit':
          if (insight.action.data?.habitId) {
            router.push({
              pathname: '/screens/edit_habit',
              params: { id: insight.action.data.habitId }
            });
          }
          break;
        default:
          router.push('/(tabs)/ai_coach');
      }
    } else {
      router.push('/(tabs)/ai_coach');
    }
  }, [router]);

  // 🚫 Offline state
  if (!isOnline) {
    return (
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <View className="items-center">
          <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-3">
            <Ionicons name="cloud-offline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-1">
            AI Insights Offline
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Connect to the internet for personalized insights
          </Text>
        </View>
      </View>
    );
  }

  // ⏳ Loading state
  if (loading && insights.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <View className="items-center">
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mt-3">
            Analyzing your habits...
          </Text>
        </View>
      </View>
    );
  }

  // ❌ Error state
  if (error && insights.length === 0) {
    return (
      <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800">
        <View className="flex-row items-start">
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <View className="flex-1 ml-3">
            <Text className="text-red-700 dark:text-red-400 text-sm font-medium mb-1">
              Failed to load insights
            </Text>
            <Text className="text-red-600 dark:text-red-500 text-xs mb-2">
              {error}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded-lg self-start"
            >
              <Text className="text-red-700 dark:text-red-400 text-xs font-medium">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 🎯 Empty state
  if (insights.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <View className="items-center">
          <Text className="text-4xl mb-3">🤖</Text>
          <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-1">
            Building Your Profile
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Complete more habits to unlock personalized AI insights
          </Text>
        </View>
      </View>
    );
  }

  // ✨ MAIN CAROUSEL
  return (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full items-center justify-center mr-2">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ai_coach')}
          className="flex-row items-center bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full"
        >
          <Text className="text-purple-700 dark:text-purple-300 text-xs font-medium mr-1">
            View All
          </Text>
          <Ionicons name="arrow-forward" size={12} color="#A855F7" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        decelerationRate="fast"
        snapToInterval={300}
      >
        {insights.slice(0, 5).map((insight, index) => {
          const style = getInsightStyle(insight);
          
          return (
            <MotiView
              key={insight.id}
              from={{ opacity: 0, translateX: 50 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ 
                type: 'timing', 
                duration: 400, 
                delay: index * 100 
              }}
            >
              <TouchableOpacity
                onPress={() => handleInsightAction(insight)}
                activeOpacity={0.8}
                className="mr-3 w-72"
              >
                {/* Card with gradient border effect */}
                <View className={`bg-gradient-to-br ${style.gradient} p-0.5 rounded-2xl shadow-lg`}>
                  <View className="bg-white dark:bg-gray-900 rounded-2xl p-4">
                    {/* Header Row */}
                    <View className="flex-row justify-between items-start mb-3">
                      {/* Icon Badge */}
                      <View className={`${style.badge} w-10 h-10 rounded-xl items-center justify-center`}>
                        <Ionicons name={style.icon} size={20} color={style.iconColor} />
                      </View>
                      
                      {/* Priority Indicator */}
                      {insight.priority === 'high' && (
                        <View className="bg-red-500 w-2 h-2 rounded-full" />
                      )}
                    </View>

                    {/* Emoji Icon */}
                    <Text className="text-3xl mb-2">{insight.icon}</Text>

                    {/* Title */}
                    <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">
                      {insight.title}
                    </Text>

                    {/* Description */}
                    <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5 mb-3">
                      {insight.description}
                    </Text>

                    {/* Action CTA */}
                    {insight.actionable && insight.action && (
                      <View className="flex-row items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Text className={`text-xs font-semibold ${style.badgeText} mr-1`}>
                          {insight.action.label}
                        </Text>
                        <Ionicons name="arrow-forward" size={12} color={style.iconColor} />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        })}

        {/* See All Card */}
        <MotiView
          from={{ opacity: 0, translateX: 50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ 
            type: 'timing', 
            duration: 400, 
            delay: insights.length * 100 
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/ai_coach')}
            className="w-40 h-full"
          >
            <View className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 items-center justify-center h-full shadow-lg">
              <Ionicons name="chatbubble-ellipses" size={32} color="white" />
              <Text className="text-white font-bold mt-3">
                Chat with AI
              </Text>
              <Text className="text-white/80 text-xs mt-1 text-center">
                Get personalized advice
              </Text>
            </View>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>

      {/* Refresh button (subtle) */}
      {!loading && (
        <View className="flex-row justify-center mt-3">
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
          >
            <Ionicons name="refresh" size={14} color="#6B7280" />
            <Text className="text-gray-600 dark:text-gray-400 text-xs ml-1.5">
              Refresh Insights
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AIInsightsCarousel;