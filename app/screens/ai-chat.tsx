// app/screens/ai-chat.tsx (Fixed - Complete)
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard,
  Modal,
  Alert
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { chatService, PERSONALITIES } from '@/services/AIServices/chat'

const AIChatScreen = () => {
  const { user } = useAuth()
  const router = useRouter()
  const params = useLocalSearchParams()
  const scrollViewRef = useRef<ScrollView>(null)
  const textInputRef = useRef<TextInput>(null)
  
  const {
    chat,
    messages,
    isLoading,
    isSending,
    sendMessage,
    deleteChat,
    updateTitle,
    updatePersonality,
    clearMessages,
    error,
    clearError,
    memoryInfo,
    shouldShowScrollButton,
    setShouldShowScrollButton
  } = useChat({
    chatId: params.chatId as string,
    autoCreate: !params.chatId,
    personality: 'default'
  })

  const [inputMessage, setInputMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showPersonalityModal, setShowPersonalityModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  const quickActions = [
    { text: "How can I build better habits?", icon: "💪" },
    { text: "I'm feeling unmotivated today", icon: "😔" },
    { text: "Suggest new habits for me", icon: "✨" },
    { text: "Help me stay consistent", icon: "🎯" },
    { text: "Why do I keep breaking streaks?", icon: "🔗" },
    { text: "What's my biggest challenge?", icon: "🤔" }
  ]

  useEffect(() => {
    if (messages.length > 0 && !shouldShowScrollButton) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length, shouldShowScrollButton])

  useEffect(() => {
    if (messages.length > 2) {
      setShowQuickActions(false)
    }
  }, [messages.length])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const isNearBottom = contentSize.height - layoutMeasurement.height - contentOffset.y < 100
    setShouldShowScrollButton(!isNearBottom && messages.length > 5)
  }

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
    setShouldShowScrollButton(false)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return
    
    const messageText = inputMessage.trim()
    setInputMessage('')
    Keyboard.dismiss()
    
    await sendMessage(messageText)
  }

  const handleQuickAction = async (text: string) => {
    setShowQuickActions(false)
    await sendMessage(text)
  }

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? All messages and memories will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteChat()
            router.back()
          }
        }
      ]
    )
  }

  const handleClearChat = () => {
    Alert.alert(
      'Clear Messages',
      'This will delete all messages but keep the chat. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearMessages()
            setShowOptionsMenu(false)
          }
        }
      ]
    )
  }

  const handleRename = () => {
    setEditTitle(chat?.title || 'New Chat')
    setShowRenameModal(true)
    setShowOptionsMenu(false)
  }

  const handleSaveRename = async () => {
    if (editTitle.trim()) {
      await updateTitle(editTitle.trim())
      setShowRenameModal(false)
    }
  }

  const handleChangePersonality = (personalityId: string) => {
    updatePersonality(personalityId)
    setShowPersonalityModal(false)
    setShowOptionsMenu(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getPersonalityIcon = (personality: string) => {
    const p = chatService.getPersonality(personality)
    return p?.icon || '🤖'
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
              Please sign in to chat with your AI coach
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/signin')}
              className='bg-indigo-500 px-8 py-3 rounded-xl'>
              <Text className='text-white font-semibold'>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView className='flex-1 bg-white dark:bg-gray-900'>
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className='text-gray-500 dark:text-gray-400 mt-4'>
            Loading chat...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-white dark:bg-gray-900' edges={['top']}>
      {/* Header */}
      <LinearGradient 
        colors={['#8B5CF6', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className='px-4 pb-4 pt-2'
      >
        <View className='flex-row items-center justify-between mb-2'>
          <View className='flex-row items-center flex-1'>
            <TouchableOpacity 
              onPress={() => router.back()} 
              className='mr-3 w-8 h-8 items-center justify-center'
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className='bg-white/20 rounded-full w-10 h-10 items-center justify-center mr-3'>
              <Text className='text-xl'>{getPersonalityIcon(chat?.personality || 'default')}</Text>
            </View>
            <View className='flex-1'>
              <Text className='text-white text-lg font-bold' numberOfLines={1}>
                {chat?.title || 'New Chat'}
              </Text>
              <Text className='text-white/80 text-xs'>
                {isSending ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => setShowOptionsMenu(true)}
            className='w-8 h-8 items-center justify-center'
          >
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {memoryInfo.savedCount > 0 && (
          <View className='bg-white/10 rounded-lg px-3 py-1.5 self-start'>
            <Text className='text-white/90 text-xs'>
              💾 {memoryInfo.savedCount} saved • {memoryInfo.relevantCount} recalled
            </Text>
          </View>
        )}
      </LinearGradient>

      {error && (
        <View className='bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-200 dark:border-red-800'>
          <View className='flex-row items-center'>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text className='text-red-700 dark:text-red-400 ml-2 flex-1 text-sm'>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* FIX: Proper KeyboardAvoidingView with correct structure */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1 '
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Content */}
        <ScrollView 
          ref={scrollViewRef}
          className='flex-1 px-4 pt-4'
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ 
            paddingBottom: 20,
            flexGrow: 1
          }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View className='flex-1 justify-center items-center py-8'>
              <View className='bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-20 h-20 items-center justify-center mb-4'>
                <Text className='text-4xl'>{getPersonalityIcon(chat?.personality || 'default')}</Text>
              </View>
              <Text className='text-xl font-bold text-gray-800 dark:text-white mb-2 text-center'>
                Welcome! 👋
              </Text>
              <Text className='text-gray-600 dark:text-gray-400 text-center mb-6 px-4'>
                I'm your AI habit coach. Let's work together to build better habits!
              </Text>
            </View>
          )}

          {showQuickActions && messages.length === 0 && (
            <View className='pb-4'>
              <Text className='text-gray-600 dark:text-gray-400 text-sm mb-3 font-medium'>
                Try asking:
              </Text>
              <View className='space-y-2 gap-2'>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickAction(action.text)}
                    className='bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700'
                    disabled={isSending}
                  >
                    <Text className='text-gray-700 dark:text-gray-300 text-sm'>
                      {action.icon} {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className='space-y-4 gap-4 pb-4'>
            {messages.map((msg) => (
              <View 
                key={msg.id} 
                className={`flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <View className='w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-2 mt-1'>
                    <Text className='text-base'>{getPersonalityIcon(chat?.personality || 'default')}</Text>
                  </View>
                )}
                <View className={`max-w-[75%] rounded-2xl p-3.5 ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-500 rounded-br-md' 
                    : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md border border-gray-200 dark:border-gray-700'
                }`}>
                  <Text className={`text-sm leading-6 ${
                    msg.sender === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {msg.content}
                  </Text>
                  <Text className={`text-xs mt-2 ${
                    msg.sender === 'user' ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.created_at)}
                  </Text>
                </View>
                {msg.sender === 'user' && (
                  <View className='w-8 h-8 bg-indigo-500 rounded-full items-center justify-center ml-2 mt-1'>
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                )}
              </View>
            ))}

            {isSending && (
              <View className='flex-row justify-start'>
                <View className='w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-2 mt-1'>
                  <Text className='text-base'>{getPersonalityIcon(chat?.personality || 'default')}</Text>
                </View>
                <View className='bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md p-3.5 border border-gray-200 dark:border-gray-700'>
                  <View className='flex-row items-center space-x-1'>
                    <View className='w-2 h-2 bg-gray-400 rounded-full' />
                    <View className='w-2 h-2 bg-gray-400 rounded-full' />
                    <View className='w-2 h-2 bg-gray-400 rounded-full' />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {shouldShowScrollButton && (
          <TouchableOpacity
            onPress={scrollToBottom}
            className='absolute bottom-20 right-4 bg-indigo-500 rounded-full w-12 h-12 items-center justify-center shadow-lg z-10'
            style={{ elevation: 5 }}
          >
            <Ionicons name="arrow-down" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Message Input - Inside KeyboardAvoidingView */}
        <View className='px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'>
          <View className='flex-row items-end gap-2'>
            <View className='flex-1'>
              <TextInput
                ref={textInputRef}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Message your AI coach..."
                placeholderTextColor="#9CA3AF"
                className='bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-base min-h-[44px] max-h-[120px]'
                multiline
                editable={!isSending}
                onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSendMessage}
                returnKeyType={Platform.OS === 'ios' ? 'default' : 'send'}
                blurOnSubmit={false}
                style={{ paddingTop: 12 }}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className={`rounded-full w-12 h-12 items-center justify-center ${
                inputMessage.trim() && !isSending ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity 
          className='flex-1 bg-black/50 justify-center items-center px-6'
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm overflow-hidden'>
            <TouchableOpacity
              onPress={handleRename}
              className='flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'
            >
              <Ionicons name="create-outline" size={24} color="#6366F1" />
              <Text className='text-gray-900 dark:text-white ml-3 text-base font-medium'>
                Rename Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowOptionsMenu(false)
                setShowPersonalityModal(true)
              }}
              className='flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'
            >
              <Ionicons name="person-outline" size={24} color="#6366F1" />
              <Text className='text-gray-900 dark:text-white ml-3 text-base font-medium'>
                Change Personality
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearChat}
              className='flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700'
            >
              <Ionicons name="refresh-outline" size={24} color="#F59E0B" />
              <Text className='text-gray-900 dark:text-white ml-3 text-base font-medium'>
                Clear Messages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteChat}
              className='flex-row items-center px-4 py-4 active:bg-gray-50 dark:active:bg-gray-700'
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <Text className='text-red-600 dark:text-red-400 ml-3 text-base font-medium'>
                Delete Chat
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Personality Modal */}
      <Modal
        visible={showPersonalityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPersonalityModal(false)}
      >
        <TouchableOpacity 
          className='flex-1 bg-black/50 justify-center items-center px-6'
          activeOpacity={1}
          onPress={() => setShowPersonalityModal(false)}
        >
          <View className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6'>
            <Text className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
              Choose Personality
            </Text>
            <ScrollView className='max-h-96'>
              {PERSONALITIES.map((personality) => (
                <TouchableOpacity
                  key={personality.id}
                  onPress={() => handleChangePersonality(personality.id)}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${
                    chat?.personality === personality.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500' 
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <Text className='text-3xl mr-3'>{personality.icon}</Text>
                  <View className='flex-1'>
                    <Text className='font-bold text-gray-900 dark:text-white mb-1'>
                      {personality.name}
                    </Text>
                    <Text className='text-gray-600 dark:text-gray-400 text-sm'>
                      {personality.description}
                    </Text>
                  </View>
                  {chat?.personality === personality.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal */}
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
                onPress={() => setShowRenameModal(false)}
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

export default AIChatScreen