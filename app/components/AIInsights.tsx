// components/AIInsights.tsx - OFFLINE-FIRST VERSION
/**
 * 🎯 AI INSIGHTS COMPONENT - Entry Point
 * 
 * Features:
 * - Auto-loads insights from local SQLite data
 * - Shows personalized insights based on user profile
 * - Entry point to AI Coach screen
 * - Gracefully handles offline/error states
 * 
 * @version 4.0.0
 */

import React, { useEffect, useMemo } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useInsights, buildInsightsContext } from '@/hooks/useInsights'
import { useHabits } from '@/hooks/usehabits'
import { useAuth } from '@/hooks/useAuth'
import { AIInsight } from '@/services/AIServices/insights'

interface AIInsightsProps {
  maxInsights?: number
  showHeader?: boolean
  compact?: boolean
  onInsightPress?: (insight: AIInsight) => void
  autoLoad?: boolean
}

const AIInsights: React.FC<AIInsightsProps> = ({
  maxInsights = 3,
  showHeader = true,
  compact = false,
  onInsightPress,
  autoLoad = true
}) => {
  const router = useRouter()
  const { user } = useAuth()
  const { habits, stats, getAllCompletions } = useHabits()

  /**
   * 🆕 Build context from local SQLite data
   */
  const insightsContext = useMemo(async () => {
    if (!user || !habits) {
      return {
        habits: [],
        stats: {
          totalHabits: 0,
          completedToday: 0,
          completionRate: 0,
          activeStreak: 0
        },
        timeframe: 'week' as const
      }
    }

    // Get completions from SQLite
    const completions = await getAllCompletions(user.id, 30)

    // Transform habits to context format
    const habitsContext = habits.map(habit => ({
      id: habit.id,
      title: habit.title,
      icon: habit.icon,
      category: 'General', // You can add category to your habit type
      target_count: habit.target_count,
      target_unit: habit.target_unit,
      frequency_type: habit.frequency_type,
      currentStreak: habit.streak,
      completionRate: habit.progress * 100,
      is_active: true
    }))

    return {
      habits: habitsContext,
      stats: stats || {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        activeStreak: 0
      },
      habitHistory: completions,
      timeframe: 'week' as const
    }
  }, [habits, stats, user, getAllCompletions])

  const { 
    insights, 
    loadingInsights, 
    refreshInsights, 
    error,
    clearError
  } = useInsights({
    autoLoad,
    context: insightsContext
  })

  /**
   * Auto-clear errors after 5 seconds
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const getInsightIcon = (insight: AIInsight) => {
    return insight.icon || '✨'
  }

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'achievement': 
          return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        case 'warning': 
          return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        case 'trend': 
          return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
        case 'motivation':
          return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
        default: 
          return 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
      }
    }
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
  }

  const handleInsightPress = (insight: AIInsight) => {
    if (onInsightPress) {
      onInsightPress(insight)
    } else if (insight.actionable && insight.action) {
      switch (insight.action.type) {
        case 'create_habit':
          router.push('/screens/create_habit')
          break
        case 'navigate':
          if (insight.action.data?.route) {
            router.push(insight.action.data.route as any)
          }
          break
        case 'modify_habit':
          if (insight.action.data?.habitId) {
            router.push({
              pathname: '/screens/edit_habit',
              params: { id: insight.action.data.habitId }
            })
          }
          break
      }
    } else {
      router.push('/(tabs)/ai_coach')
    }
  }

  // Error state
  if (error && insights.length === 0) {
    return (
      <View className={`rounded-2xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${compact ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">🤖</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</Text>
          </View>
          <TouchableOpacity onPress={refreshInsights} className="p-1">
            <Ionicons name="refresh" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          Unable to load insights. Tap refresh to try again.
        </Text>
      </View>
    )
  }

  // Loading state
  if (loadingInsights && insights.length === 0) {
    return (
      <View className={`rounded-2xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${compact ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row items-center mb-3">
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
            Analyzing your habits...
          </Text>
        </View>
      </View>
    )
  }

  // Empty state
  if (insights.length === 0) {
    return (
      <View className={`rounded-2xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${compact ? 'mb-4' : 'mb-6'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">🤖</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ai_coach')} className="p-1">
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          Start building habits to get personalized AI insights.
        </Text>
      </View>
    )
  }

  const displayInsights = insights.slice(0, maxInsights)

  return (
    <View className={compact ? 'mb-4' : 'mb-6'}>
      {showHeader && (
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">🧠</Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity 
              onPress={refreshInsights}
              disabled={loadingInsights}
              className="p-1"
            >
              <Ionicons 
                name="refresh" 
                size={18} 
                color={loadingInsights ? "#9CA3AF" : "#6366F1"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/ai_coach')}
              className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full"
            >
              <Text className="text-purple-700 dark:text-purple-300 text-xs font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View className="space-y-3 gap-3">
        {displayInsights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            className={`rounded-xl p-4 border ${getInsightColor(insight.type, insight.priority)}`}
            onPress={() => handleInsightPress(insight)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">{getInsightIcon(insight)}</Text>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-semibold text-gray-900 dark:text-white flex-1">
                    {insight.title}
                  </Text>
                  {insight.priority === 'high' && (
                    <View className="w-2 h-2 bg-red-500 rounded-full ml-2" />
                  )}
                </View>
                <Text className="text-gray-700 dark:text-gray-300 text-sm leading-5">
                  {insight.description}
                </Text>
                {insight.actionable && insight.action && (
                  <View className="flex-row items-center mt-2">
                    <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-medium mr-1">
                      {insight.action.label}
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
  )
}

export default AIInsights