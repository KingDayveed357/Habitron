import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { useAICoach } from '@/hooks/useAICoach'
import { useRouter } from 'expo-router'

const AICoach = () => {
  const { user } = useAuth()
  const router = useRouter()
  
  const {
    messages,
    insights,
    loadingInsights,
    refreshInsights,
    suggestions,
    loadingSuggestions,
    generateSuggestions,
    error,
    clearError
  } = useAICoach()

  const [activeTab, setActiveTab] = useState<'insights' | 'suggestions'>('insights')

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleCreateHabitFromSuggestion = (suggestion: any) => {
    router.push({
      pathname: '/screens/create_habit',
      params: {
        title: suggestion.title,
        icon: suggestion.icon,
        category: suggestion.category,
        description: suggestion.description,
        targetCount: suggestion.targetCount,
        targetUnit: suggestion.targetUnit
      }
    })
  }

  const renderInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return '📈'
      case 'achievement': return '🏆'
      case 'warning': return '⚠️'
      case 'tip': return '💡'
      case 'motivation': return '🔥'
      default: return '✨'
    }
  }

  const renderInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'achievement': return 'bg-green-100 dark:bg-green-900/20 border-green-200'
        case 'warning': return 'bg-red-100 dark:bg-red-900/20 border-red-200'
        default: return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200'
      }
    }
    return 'bg-gray-100 dark:bg-gray-900/20 border-gray-200'
  }

  if (!user) {
    return (
      <SafeAreaView className='flex-1 app-background'>
        <View className='flex-1 justify-center items-center px-6'>
          <Text className='text-xl font-bold text-gray-800 dark:text-white mb-2'>
            Sign In Required
          </Text>
          <Text className='text-gray-600 dark:text-gray-400 text-center mb-6'>
            You need to be signed in to access your AI coach.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/signin')}
            className='bg-indigo-500 px-8 py-3 rounded-xl'
          >
            <Text className='text-white font-semibold'>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 app-background' edges={['top']}>
      {/* Header */}
      <LinearGradient 
        colors={['#8B5CF6', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className='px-4 pb-4 pt-2'
      >
        <View className='flex-row items-center justify-between mb-3'>
          <View className='flex-row items-center'>
            <Ionicons name="sparkles" size={24} color="white" />
            <Text className='text-white text-xl font-bold ml-2'>AI Coach</Text>
          </View>
          <View className='flex-row space-x-2'>
            <TouchableOpacity 
              onPress={() => router.push('/screens/ai-chat')} 
              className='bg-white/20 rounded-lg px-3 py-2'
            >
              <View className='flex-row items-center'>
                <Ionicons name="chatbubble-ellipses" size={16} color="white" />
                <Text className='text-white text-sm font-medium ml-1'>Chat</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text className='text-white/90 text-md'>
          Your personal habit optimization assistant
        </Text>
      </LinearGradient>

      {/* Chat Quick Access */}
      <TouchableOpacity
        onPress={() => router.push('/screens/ai-chat')}
        className='mx-4 mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg'
      >
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center'>
            <View className='bg-white/20 rounded-full w-12 h-12 items-center justify-center mr-3'>
              <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            </View>
            <View>
              <Text className='text-white font-bold text-lg'>Start Chat</Text>
              <Text className='text-white/80 text-sm'>
                {messages.length > 0 
                  ? `${messages.length} messages in conversation`
                  : 'Ask me anything about your habits'
                }
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </View>
      </TouchableOpacity>

      {/* Tab Navigation */}
      <View className='flex-row bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mx-4 mt-4 rounded-xl overflow-hidden'>
        {(['insights', 'suggestions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-4 items-center ${
              activeTab === tab 
                ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                : ''
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`capitalize font-medium ${
              activeTab === tab 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {tab}
              {tab === 'suggestions' && loadingSuggestions && (
                <ActivityIndicator size="small" color="#6366F1" style={{ marginLeft: 8 }} />
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error Banner */}
      {error && (
        <View className='bg-red-100 dark:bg-red-900/20 px-4 py-3 mx-4 mt-2 rounded-lg border-l-4 border-red-500'>
          <View className='flex-row items-center'>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text className='text-red-700 dark:text-red-400 ml-2 flex-1'>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {activeTab === 'insights' && (
        <ScrollView 
          className='flex-1 px-4 py-4'
          refreshControl={
            <RefreshControl refreshing={loadingInsights} onRefresh={refreshInsights} />
          }
        >
          {loadingInsights ? (
            <View className='flex-1 justify-center items-center py-12'>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text className='text-gray-500 dark:text-gray-400 mt-4'>
                Generating personalized insights...
              </Text>
            </View>
          ) : (
            <View className='space-y-4 gap-4'>
              <Text className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                Today's Insights
              </Text>
              {insights.map((insight) => (
                <View 
                  key={insight.id} 
                  className={`rounded-xl p-4 border ${renderInsightColor(insight.type, insight.priority)}`}
                >
                  <View className='flex-row items-start mb-2'>
                    <Text className='text-2xl mr-3'>{renderInsightIcon(insight.type)}</Text>
                    <View className='flex-1'>
                      <Text className='font-semibold text-gray-900 dark:text-white mb-1'>
                        {insight.title}
                      </Text>
                      <Text className='text-gray-700 dark:text-gray-300 text-sm'>
                        {insight.description}
                      </Text>
                    </View>
                  </View>
                  {insight.actionable && insight.action && (
                    <TouchableOpacity 
                      className='bg-indigo-500 rounded-lg py-2 px-4 mt-3 self-start'
                      onPress={() => {
                        if (insight.action?.type === 'create_habit') {
                          router.push('/screens/create_habit')
                        }
                      }}
                    >
                      <Text className='text-white text-sm font-medium'>
                        {insight.action.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'suggestions' && (
        <ScrollView 
          className='flex-1 px-4 py-4'
          refreshControl={
            <RefreshControl refreshing={loadingSuggestions} onRefresh={generateSuggestions} />
          }
        >
          <View className='flex-row justify-between items-center mb-4'>
            <Text className='text-lg font-semibold text-gray-800 dark:text-white'>
              Habit Suggestions
            </Text>
            <TouchableOpacity 
              onPress={generateSuggestions}
              disabled={loadingSuggestions}
              className='bg-indigo-500 px-4 py-2 rounded-lg'
            >
              {loadingSuggestions ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className='text-white text-sm font-medium'>Refresh</Text>
              )}
            </TouchableOpacity>
          </View>

          {suggestions.length === 0 && !loadingSuggestions && (
            <TouchableOpacity 
              onPress={generateSuggestions}
              className='bg-gray-100 dark:bg-gray-800 rounded-xl p-6 items-center'
            >
              <Text className='text-2xl mb-2'>🤖</Text>
              <Text className='font-semibold text-gray-800 dark:text-white mb-2'>
                Get AI Suggestions
              </Text>
              <Text className='text-gray-600 dark:text-gray-400 text-center'>
                Tap to generate personalized habit recommendations based on your current routine
              </Text>
            </TouchableOpacity>
          )}

          <View className='space-y-4 mb-8 gap-4'>
            {suggestions.map((suggestion) => (
              <View key={suggestion.id} className='bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700'>
                <View className='flex-row items-start mb-3'>
                  <View className='w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl items-center justify-center mr-3'>
                    <Text className='text-xl'>{suggestion.icon}</Text>
                  </View>
                  <View className='flex-1'>
                    <Text className='font-semibold text-gray-900 dark:text-white mb-1'>
                      {suggestion.title}
                    </Text>
                    <View className='flex-row items-center mb-2'>
                      <Text className='text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400 mr-2'>
                        {suggestion.category}
                      </Text>
                      <Text className={`text-xs px-2 py-1 rounded-full ${
                        suggestion.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : suggestion.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {suggestion.difficulty}
                      </Text>
                    </View>
                    <Text className='text-gray-700 dark:text-gray-300 text-sm mb-2'>
                      {suggestion.description}
                    </Text>
                    <Text className='text-gray-500 dark:text-gray-400 text-xs mb-3'>
                      Why this works: {suggestion.reasoning}
                    </Text>
                    <Text className='text-gray-500 dark:text-gray-400 text-xs'>
                      Goal: {suggestion.targetCount} {suggestion.targetUnit} • {suggestion.estimatedTime}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleCreateHabitFromSuggestion(suggestion)}
                  className='bg-indigo-500 rounded-lg py-3 items-center'
                >
                  <Text className='text-white font-medium'>Add This Habit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default AICoach