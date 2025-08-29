import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  RefreshControl,
  Keyboard
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { useAICoach } from '@/hooks/useAICoach'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'

const AIChatScreen = () => {
  const { user } = useAuth()
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)
  const textInputRef = useRef<TextInput>(null)
  
  const {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    error,
    clearError,
    sendQuickMessage
  } = useAICoach()

  const [message, setMessage] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Quick action messages
  const quickActions = [
    "How can I build better habits?",
    "I'm feeling unmotivated today",
    "Suggest new habits for me",
    "Why do I keep breaking streaks?",
    "Help me stay consistent",
    "What's my biggest habit challenge?"
  ]

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })
    
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShow?.remove()
      keyboardDidHide?.remove()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive or keyboard shows
  useEffect(() => {
    if (messages.length > 0 || keyboardHeight > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length, keyboardHeight])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Focus text input when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure screen transition is complete
      setTimeout(() => {
        textInputRef.current?.focus()
      }, 300)
    }, [])
  )

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    const messageText = message.trim()
    setMessage('')
    await sendMessage(messageText)
  }

  const handleQuickAction = async (action: string) => {
    await sendQuickMessage(action)
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
    <SafeAreaView className='flex-1 bg-white dark:bg-gray-900' edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <LinearGradient 
          colors={['#8B5CF6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className='px-4 pb-4 pt-2'
        >
          <View className='flex-row items-center justify-between mb-3'>
            <View className='flex-row items-center'>
              <TouchableOpacity onPress={() => router.back()} className='mr-3'>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Ionicons name="sparkles" size={24} color="white" />
              <Text className='text-white text-xl font-bold ml-2'>AI Coach Chat</Text>
            </View>
            <TouchableOpacity onPress={clearChat} className='p-2'>
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className='text-white/90 text-sm ml-10'>
            Your personal habit optimization assistant
          </Text>
        </LinearGradient>

        {/* Error Banner */}
        {error && (
          <View className='bg-red-100 dark:bg-red-900/20 px-4 py-3 border-l-4 border-red-500'>
            <View className='flex-row items-center'>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text className='text-red-700 dark:text-red-400 ml-2 flex-1'>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Chat Content */}
        <View className='flex-1 mt-5'>
          <ScrollView 
            ref={scrollViewRef}
            className='flex-1 px-4'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: 20,
              flexGrow: 1
            }}
          >
            {/* Welcome Message */}
            {messages.length === 0 && (
              <View className='flex-1 justify-center items-center py-8'>
                <View className='bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-20 h-20 items-center justify-center mb-4'>
                  <Ionicons name="sparkles" size={32} color="#6366F1" />
                </View>
                <Text className='text-xl font-bold text-gray-800 dark:text-white mb-2 text-center'>
                  Welcome to AI Coach! 👋
                </Text>
                <Text className='text-gray-600 dark:text-gray-400 text-center mb-6 px-4'>
                  I'm here to help you build better habits and optimize your daily routine. Ask me anything!
                </Text>
              </View>
            )}

            {/* Quick Actions */}
            {messages.length === 0 && (
              <View className='pb-4 '>
                <Text className='text-gray-600 dark:text-gray-400 text-sm mb-3 font-medium'>
                  Try asking:
                </Text>
                <View className='space-y-2  gap-2'>
                  {quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleQuickAction(action)}
                      className='bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700'
                      disabled={isTyping}
                    >
                      <Text className='text-gray-700 dark:text-gray-300 text-sm'>
                        💬 {action}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Chat Messages */}
            <View className='space-y-4 gap-4 pb-4'>
              {messages.map((msg) => (
                <View key={msg.id} className={`flex-row ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!msg.isUser && (
                    <View className='w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-3 mt-1'>
                      <Ionicons name="sparkles" size={16} color="#6366F1" />
                    </View>
                  )}
                  <View className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.isUser 
                      ? 'bg-indigo-500 rounded-br-md ml-8' 
                      : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md border border-gray-200 dark:border-gray-700'
                  }`}>
                    <Text className={`text-sm leading-6 ${
                      msg.isUser ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {msg.text}
                    </Text>
                    <Text className={`text-xs mt-2 ${
                      msg.isUser ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {msg.timestamp}
                    </Text>
                  </View>
                  {msg.isUser && (
                    <View className='w-8 h-8 bg-indigo-500 rounded-full items-center justify-center ml-3 mt-1'>
                      <Ionicons name="person" size={16} color="white" />
                    </View>
                  )}
                </View>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <View className='flex-row justify-start'>
                  <View className='w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-3 mt-1'>
                    <Ionicons name="sparkles" size={16} color="#6366F1" />
                  </View>
                  <View className='bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md p-4 border border-gray-200 dark:border-gray-700'>
                    <View className='flex-row items-center space-x-1'>
                      <View className='w-2 h-2 bg-gray-400 rounded-full animate-pulse' />
                      <View className='w-2 h-2 bg-gray-400 rounded-full animate-pulse' style={{ animationDelay: '0.2s' }} />
                      <View className='w-2 h-2 bg-gray-400 rounded-full animate-pulse' style={{ animationDelay: '0.4s' }} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Message Input */}
          <View className='px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'>
            <View className='flex-row items-end space-x-3'>
              <View className='flex-1'>
                <TextInput
                  ref={textInputRef}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Ask your AI coach anything..."
                  placeholderTextColor="#9CA3AF"
                  className='bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 max-h-32 text-gray-900 dark:text-white text-base'
                  multiline
                  textAlignVertical="top"
                  editable={!isTyping}
                  onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSendMessage}
                  returnKeyType={Platform.OS === 'ios' ? 'default' : 'send'}
                  blurOnSubmit={false}
                  style={{
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className={`rounded-full w-12 h-12 items-center justify-center ${
                  message.trim() && !isTyping ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AIChatScreen