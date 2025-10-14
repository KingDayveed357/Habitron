// app/(tabs)/ai_coach.tsx - FIXED VERSION
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal
} from 'react-native'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { useInsights } from '@/hooks/useInsights'
import { useHabits } from '@/hooks/usehabits'
import { useRouter } from 'expo-router'
import { Chat, ChatWithPreview, chatService } from '@/services/AIServices/chat'

const AICoach = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { habits, stats } = useHabits()
  
  // Memoize context to prevent unnecessary re-renders
const insightsContext = useMemo(() => ({
  habits: habits || [],
  stats: stats || {
    totalHabits: 0,
    completedToday: 0,
    completionRate: 0,
    activeStreak: 0
  },
  userProfile: {
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  timeframe: 'week' as const // Add explicit timeframe
}), [
  habits?.length, 
  stats?.totalHabits, 
  stats?.completedToday, 
  stats?.completionRate,
  stats?.activeStreak,
  user?.id
])

const {
  insights,
  loadingInsights,
  refreshInsights,
  suggestions,
  loadingSuggestions,
  generateSuggestions,
  error: insightsError,
  clearError: clearInsightsError
} = useInsights({
  autoLoad: true,
  context: insightsContext
})



  const [chats, setChats] = useState<ChatWithPreview[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [chatsError, setChatsError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chats' | 'insights' | 'suggestions'>('chats')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)

  const subscriptionRef = useRef<any>(null)
  const mountedRef = useRef(true)


   const isInitialLoading = loadingInsights && insights.length === 0
const isRefreshing = loadingInsights && insights.length > 0


const handleRefreshInsights = useCallback(async () => {
  try {
    clearInsightsError()
    await refreshInsights()
  } catch (error) {
    console.error('Refresh failed:', error)
  }
}, [refreshInsights, clearInsightsError])

const handleGenerateSuggestions = useCallback(async () => {
  try {
    clearInsightsError()
    await generateSuggestions()
  } catch (error) {
    console.error('Generate suggestions failed:', error)
  }
}, [generateSuggestions, clearInsightsError])

  // Load all chats
  useEffect(() => {
    if (!user) {
      setLoadingChats(false)
      return
    }

    const loadChats = async () => {
      try {
        setLoadingChats(true)
        const userChats = await chatService.getUserChatsWithPreview(user.id)
        setChats(userChats)
        setChatsError(null)
      } catch (error: any) {
        console.error('Failed to load chats:', error)
        setChatsError(error.message || 'Failed to load chats')
      } finally {
        setLoadingChats(false)
      }
    }

    loadChats()
  }, [user])

  // Subscribe to real-time chat updates
  useEffect(() => {
    if (!user) return

    const subscription = chatService.subscribeToChats(
      user.id,
      (updatedChat: Chat) => {
        if (!mountedRef.current) return
        
        setChats(prevChats => {
          const index = prevChats.findIndex(c => c.id === updatedChat.id)
          if (index === -1) return prevChats
          
          const updated = [...prevChats]
          updated[index] = {
            ...updated[index],
            ...updatedChat
          }
          
          return updated.sort((a, b) => 
            new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
          )
        })
      },
      (deletedChatId: string) => {
        if (!mountedRef.current) return
        setChats(prevChats => prevChats.filter(c => c.id !== deletedChatId))
      }
    )

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [user])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refreshChats = async () => {
    if (!user) return
    
    try {
      setLoadingChats(true)
      const userChats = await chatService.getUserChatsWithPreview(user.id)
      setChats(userChats)
      setChatsError(null)
    } catch (error: any) {
      console.error('Failed to refresh chats:', error)
      setChatsError(error.message || 'Failed to refresh chats')
    } finally {
      setLoadingChats(false)
    }
  }

  const clearChatsError = () => setChatsError(null)

  useEffect(() => {
    if (insightsError) {
      const timer = setTimeout(clearInsightsError, 5000)
      return () => clearTimeout(timer)
    }
  }, [insightsError, clearInsightsError])

  useEffect(() => {
    if (chatsError) {
      const timer = setTimeout(clearChatsError, 5000)
      return () => clearTimeout(timer)
    }
  }, [chatsError])

  const handleCreateChat = async () => {
    if (creatingChat || !user) return
    
    try {
      setCreatingChat(true)
      const newChat = await chatService.createChat(user.id, 'New Chat', 'default')
      if (newChat) {
        const newChatWithPreview: ChatWithPreview = {
          ...newChat,
          message_count: 0,
          memory_count: 0
        }
        setChats(prev => [newChatWithPreview, ...prev])
        
        router.push({
          pathname: '/screens/ai-chat',
          params: { chatId: newChat.id }
        })
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
      Alert.alert('Error', 'Failed to create new chat. Please try again.')
    } finally {
      setCreatingChat(false)
    }
  }

  const handleOpenChat = (chatId: string) => {
    router.push({
      pathname: '/screens/ai-chat',
      params: { chatId }
    })
  }

  const handleRenameChat = (chat: ChatWithPreview) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
    setShowRenameModal(true)
  }

  const handleSaveRename = async () => {
    if (editingChatId && editTitle.trim()) {
      try {
        await chatService.updateChatTitle(editingChatId, editTitle.trim())
        setShowRenameModal(false)
        setEditingChatId(null)
        setEditTitle('')
      } catch (error) {
        Alert.alert('Error', 'Failed to rename chat')
      }
    }
  }

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete "${chatTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteChat(chatId)
            } catch (error) {
              Alert.alert('Error', 'Failed to delete chat')
            }
          }
        }
      ]
    )
  }

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No messages yet'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const truncateMessage = (message?: string, maxLength: number = 60) => {
    if (!message) return 'Start a conversation...'
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
  }

  const getPersonalityIcon = (personality: string) => {
    const icons: Record<string, string> = {
      default: '🤖',
      motivator: '🔥',
      calm: '🧘',
      analyst: '📊',
      friend: '👋'
    }
    return icons[personality] || '🤖'
  }

  const renderInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      switch (type) {
        case 'achievement': return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        case 'warning': return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        case 'trend': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
        default: return 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
      }
    }
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
  }

  const renderDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[difficulty] || colors.medium
  }

  if (!user) {
    return (
      <SafeAreaView className='flex-1 bg-gray-50 dark:bg-gray-900'>
        <View className='flex-1 justify-center items-center px-6'>
          <View className='bg-white dark:bg-gray-800 rounded-2xl p-8 items-center shadow-lg'>
            <Ionicons name="lock-closed" size={48} color="#6366F1" />
            <Text className='text-xl font-bold text-gray-800 dark:text-white mt-4 mb-2'>
              Sign In Required
            </Text>
            <Text className='text-gray-600 dark:text-gray-400 text-center mb-6'>
              Access your personalized AI coach
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/signin')}
              className='bg-indigo-500 px-8 py-3 rounded-xl'
            >
              <Text className='text-white font-semibold'>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50 dark:bg-gray-900' edges={['top']}>
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
          {activeTab === 'chats' && (
            <TouchableOpacity 
              onPress={handleCreateChat} 
              disabled={creatingChat}
              className='bg-white/20 rounded-full w-10 h-10 items-center justify-center'
            >
              {creatingChat ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="add" size={24} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
        <Text className='text-white/90 text-sm'>
          {activeTab === 'chats' 
            ? `${chats.length} conversation${chats.length !== 1 ? 's' : ''}`
            : 'Powered by AI • Personalized for you'}
        </Text>
      </LinearGradient>

      <View className='flex-row bg-white dark:bg-gray-800 mx-4 mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700'>
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${
            activeTab === 'chats' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
          }`}
          onPress={() => setActiveTab('chats')}
        >
          <Text className={`font-semibold text-sm ${
            activeTab === 'chats' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${
            activeTab === 'insights' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
          }`}
          onPress={() => setActiveTab('insights')}
        >
          <Text className={`font-semibold text-sm ${
            activeTab === 'insights' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            Insights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${
            activeTab === 'suggestions' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
          }`}
          onPress={() => setActiveTab('suggestions')}
        >
          <Text className={`font-semibold text-sm ${
            activeTab === 'suggestions' 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            Suggestions
          </Text>
        </TouchableOpacity>
      </View>

      {(insightsError || chatsError) && (
        <View className='bg-red-50 dark:bg-red-900/20 px-4 py-3 mx-4 mt-3 rounded-xl border border-red-200 dark:border-red-800'>
          <View className='flex-row items-center'>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text className='text-red-700 dark:text-red-400 ml-2 flex-1 text-sm'>
              {insightsError || chatsError}
            </Text>
            <TouchableOpacity onPress={() => {
              clearInsightsError()
              clearChatsError()
            }}>
              <Ionicons name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'insights' && (
  <ScrollView 
    className='flex-1 px-4 py-4'
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl 
        refreshing={isRefreshing} 
        onRefresh={handleRefreshInsights}
        colors={['#6366F1']}
        tintColor="#6366F1"
      />
    }
  >
    {isInitialLoading ? (
      <View className='flex-1 justify-center items-center py-16'>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className='text-gray-500 dark:text-gray-400 mt-4'>
          Generating personalized insights...
        </Text>
      </View>
    ) : (
      <View className='pb-6'>
        <View className='flex-row items-center justify-between mb-4'>
          <Text className='text-lg font-bold text-gray-800 dark:text-white'>
            Today's Insights
          </Text>
          <TouchableOpacity 
            onPress={handleRefreshInsights} 
            disabled={loadingInsights}
            className='bg-indigo-100 dark:bg-indigo-900/30 px-3 py-2 rounded-lg flex-row items-center'
          >
            <Ionicons 
              name={loadingInsights ? "sync" : "refresh"} 
              size={16} 
              color="#6366F1"
              style={loadingInsights ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
            <Text className='text-indigo-600 dark:text-indigo-400 text-sm font-medium ml-1.5'>
              {loadingInsights ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {insights.length === 0 ? (
          <View className='bg-white dark:bg-gray-800 rounded-2xl p-8 items-center border border-gray-100 dark:border-gray-700'>
            <Text className='text-4xl mb-3'>🤖</Text>
            <Text className='text-gray-700 dark:text-gray-300 font-semibold mb-2'>
              No insights available
            </Text>
            <Text className='text-gray-500 dark:text-gray-400 text-sm text-center mb-4'>
              {stats?.totalHabits === 0 
                ? 'Create habits to get personalized insights'
                : 'Try refreshing to generate new insights'
              }
            </Text>
            {stats?.totalHabits === 0 ? (
              <TouchableOpacity
                onPress={() => router.push('/screens/create_habit')}
                className='bg-indigo-500 px-6 py-2.5 rounded-xl'
              >
                <Text className='text-white font-semibold'>Create First Habit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleRefreshInsights}
                disabled={loadingInsights}
                className='bg-indigo-500 px-6 py-2.5 rounded-xl'
              >
                <Text className='text-white font-semibold'>
                  {loadingInsights ? 'Generating...' : 'Generate Insights'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className='space-y-3 gap-3'>
            {insights.map((insight) => (
              <View 
                key={insight.id}
                className={`rounded-2xl p-4 border ${renderInsightColor(insight.type, insight.priority)}`}
              >
                <View className='flex-row items-start mb-2'>
                  <Text className='text-2xl mr-3'>{insight.icon}</Text>
                  <View className='flex-1'>
                    <Text className='font-bold text-gray-900 dark:text-white mb-1 text-base'>
                      {insight.title}
                    </Text>
                    <Text className='text-gray-700 dark:text-gray-300 text-sm leading-5'>
                      {insight.description}
                    </Text>
                  </View>
                </View>
                {insight.actionable && insight.action && (
                  <TouchableOpacity 
                    className='bg-indigo-500 rounded-xl py-2.5 px-4 mt-3 self-start'
                    onPress={() => {
                      if (insight.action?.type === 'create_habit') {
                        router.push('/screens/create_habit')
                      }
                    }}
                  >
                    <Text className='text-white text-sm font-semibold'>
                      {insight.action.label}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    )}
  </ScrollView>
)}

     {activeTab === 'suggestions' && (
  <ScrollView 
    className='flex-1 px-4 py-4'
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl 
        refreshing={loadingSuggestions && suggestions.length > 0} 
        onRefresh={handleGenerateSuggestions}
        colors={['#6366F1']}
        tintColor="#6366F1"
      />
    }
  >
    <View className='flex-row justify-between items-center mb-4'>
      <Text className='text-lg font-bold text-gray-800 dark:text-white'>
        Habit Suggestions
      </Text>
      <TouchableOpacity 
        onPress={handleGenerateSuggestions}
        disabled={loadingSuggestions}
        className='bg-indigo-500 px-4 py-2 rounded-xl flex-row items-center'
      >
        {loadingSuggestions ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text className='text-white text-sm font-semibold ml-2'>Generating...</Text>
          </>
        ) : (
          <>
            <Ionicons name="bulb-outline" size={16} color="white" />
            <Text className='text-white text-sm font-semibold ml-2'>Generate</Text>
          </>
        )}
      </TouchableOpacity>
    </View>

    {loadingSuggestions && suggestions.length === 0 ? (
      <View className='flex-1 justify-center items-center py-16'>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className='text-gray-500 dark:text-gray-400 mt-4'>
          Creating personalized suggestions...
        </Text>
      </View>
    ) : suggestions.length === 0 ? (
      <View className='bg-white dark:bg-gray-800 rounded-2xl p-8 items-center border border-gray-100 dark:border-gray-700'>
        <Text className='text-4xl mb-3'>💡</Text>
        <Text className='font-bold text-gray-800 dark:text-white mb-2 text-base'>
          No suggestions yet
        </Text>
        <Text className='text-gray-600 dark:text-gray-400 text-center text-sm mb-4'>
          Generate AI-powered habit recommendations tailored to your progress
        </Text>
        <TouchableOpacity
          onPress={handleGenerateSuggestions}
          disabled={loadingSuggestions}
          className='bg-indigo-500 px-6 py-2.5 rounded-xl'
        >
          <Text className='text-white font-semibold'>
            {loadingSuggestions ? 'Generating...' : 'Generate Suggestions'}
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View className='space-y-4 pb-6 gap-4'>
        {suggestions.map((suggestion) => (
          <View 
            key={suggestion.id}
            className='bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700'
          >
            <View className='flex-row items-start mb-3'>
              <View className='w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl items-center justify-center mr-3'>
                <Text className='text-2xl'>{suggestion.icon}</Text>
              </View>
              <View className='flex-1'>
                <Text className='font-bold text-gray-900 dark:text-white mb-1 text-base'>
                  {suggestion.title}
                </Text>
                <View className='flex-row items-center mb-2 flex-wrap'>
                  <View className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mr-2 mb-1'>
                    <Text className='text-xs text-gray-600 dark:text-gray-400'>
                      {suggestion.category}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-lg mb-1 ${renderDifficultyBadge(suggestion.difficulty)}`}>
                    <Text className='text-xs font-medium capitalize'>
                      {suggestion.difficulty}
                    </Text>
                  </View>
                </View>
                <Text className='text-gray-700 dark:text-gray-300 text-sm mb-2 leading-5'>
                  {suggestion.description}
                </Text>
                <View className='bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg mb-2'>
                  <Text className='text-indigo-700 dark:text-indigo-300 text-xs leading-4'>
                    💭 {suggestion.reasoning}
                  </Text>
                </View>
                <View className='flex-row items-center'>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text className='text-gray-500 dark:text-gray-400 text-xs ml-1'>
                    {suggestion.targetCount} {suggestion.targetUnit} • {suggestion.estimatedTime}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => handleCreateHabitFromSuggestion(suggestion)}
              className='bg-indigo-500 rounded-xl py-3 items-center'
            >
              <Text className='text-white font-semibold'>Add This Habit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}
  </ScrollView>
)}

      {activeTab === 'chats' && (
        <ScrollView 
          className='flex-1 px-4 py-4'
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loadingChats} onRefresh={refreshChats} />
          }
        >
          {loadingChats && chats.length === 0 ? (
            <View className='flex-1 justify-center items-center py-16'>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text className='text-gray-500 dark:text-gray-400 mt-4'>
                Loading chats...
              </Text>
            </View>
          ) : chats.length === 0 ? (
            <View className='flex-1 justify-center items-center py-16'>
              <View className='bg-white dark:bg-gray-800 rounded-2xl p-8 items-center border border-gray-100 dark:border-gray-700'>
                <Text className='text-6xl mb-4'>💬</Text>
                <Text className='text-xl font-bold text-gray-800 dark:text-white mb-2'>
                  No Chats Yet
                </Text>
                <Text className='text-gray-600 dark:text-gray-400 text-center mb-6'>
                  Start a conversation with your AI coach
                </Text>
                <TouchableOpacity
                  onPress={handleCreateChat}
                  disabled={creatingChat}
                  className='bg-indigo-500 px-6 py-3 rounded-xl flex-row items-center'
                >
                  {creatingChat ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color="white" />
                      <Text className='text-white font-semibold ml-2'>New Chat</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className='space-y-3 gap-3 pb-6'>
              {chats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  onPress={() => handleOpenChat(chat.id)}
                  className='bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'
                  activeOpacity={0.7}
                >
                  <View className='flex-row items-start'>
                    <View className='bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-12 h-12 items-center justify-center mr-3'>
                      <Text className='text-2xl'>{getPersonalityIcon(chat.personality)}</Text>
                    </View>
                    <View className='flex-1'>
                      <View className='flex-row items-center justify-between mb-1'>
                        <Text className='font-bold text-gray-900 dark:text-white text-base flex-1' numberOfLines={1}>
                          {chat.title}
                        </Text>
                        <Text className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
                          {formatDate(chat.last_message_at || chat.last_activity_at)}
                        </Text>
                      </View>
                      <Text className='text-gray-600 dark:text-gray-400 text-sm mb-2' numberOfLines={2}>
                        {chat.last_message_sender === 'user' && 'You: '}
                        {truncateMessage(chat.last_message)}
                      </Text>
                      <View className='flex-row items-center justify-between'>
                        <View className='flex-row items-center gap-4'>
                          <View className='flex-row items-center'>
                            <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
                            <Text className='text-xs text-gray-500 dark:text-gray-400 ml-1'>
                              {chat.message_count}
                            </Text>
                          </View>
                          {(chat.memory_count ?? 0) > 0 && (
                            <View className='flex-row items-center'>
                              <Ionicons name="bookmark" size={14} color="#6B7280" />
                              <Text className='text-xs text-gray-500 dark:text-gray-400 ml-1'>
                                {chat.memory_count}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View className='flex-row items-center gap-2'>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation()
                              handleRenameChat(chat)
                            }}
                            className='p-2'
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="create-outline" size={18} color="#6366F1" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation()
                              handleDeleteChat(chat.id, chat.title)
                            }}
                            className='p-2'
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View className='flex-1 bg-black/50 justify-center items-center px-6'>
          <View className='bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm'>
            <Text className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
              Rename Chat
            </Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter chat name"
              placeholderTextColor="#9CA3AF"
              className='bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white mb-4'
              autoFocus
            />
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={() => {
                  setShowRenameModal(false)
                  setEditingChatId(null)
                  setEditTitle('')
                }}
                className='flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3 items-center'
              >
                <Text className='text-gray-700 dark:text-gray-300 font-semibold'>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveRename}
                className='flex-1 bg-indigo-500 rounded-xl py-3 items-center'
                disabled={!editTitle.trim()}
              >
                <Text className='text-white font-semibold'>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default AICoach