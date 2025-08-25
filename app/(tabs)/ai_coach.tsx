import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants/images'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

const AICoach = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi David! I'm your AI habit coach. How are you feeling about your habits today?",
      isUser: false,
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      text: "I'm struggling to stay consistent with my morning routine",
      isUser: true,
      timestamp: '10:32 AM'
    }
  ])

  const quickActions = [
    "How can I build better habits?",
    "I'm feeling unmotivated today",
    "Suggest new habits for me",
    "Why do I keep breaking streaks?"
  ]

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages([...chatMessages, newMessage])
      setMessage('')
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I understand it can be challenging to maintain consistency. Let's work together to identify what's blocking your progress and create a more sustainable routine.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setChatMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  const handleQuickAction = (action: string) => {
    setMessage(action)
  }

  return (
    <SafeAreaView className='flex-1 app-background' edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView className='flex-1 px-4'>

          {/* Today's Insights Section */}
          <View className='mb-6'>
            <LinearGradient 
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{borderRadius: 10}}
              className=' p-6 mb-4'>
              <View className='flex-row items-center mb-2'>
                <Ionicons name="sparkles" size={24} color="white" />
                <Text className='text-white text-xl font-bold ml-2'>AI Coach</Text>
              </View>
              <Text className='text-white/90 text-base'>Your personal habit optimization assistant</Text>
            </LinearGradient>

            <Text className='text-subheading mb-4'>Today's Insights</Text>
            
            {/* Insight Cards */}
            <View className='space-y-3'>
              <View className='card  p-4  mb-3'>
                <View className='flex-row items-center mb-2'>
                  <View className='w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3'>
                    <Ionicons name="trending-up" size={16} color="#10B981" />
                  </View>
                  <Text className='text-subheading '>Trending Up</Text>
                </View>
                <Text className='text-body '>Your weekend completion rate improved 23% this month!</Text>
              </View>

              <View className='card p-4 mb-3'>
                <View className='flex-row items-center mb-2'>
                  <View className='w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3'>
                    <Ionicons name="bulb" size={16} color="#F59E0B" />
                  </View>
                  <Text className='text-subheading'>Smart Insight</Text>
                </View>
                <Text className='text-body'>You're 40% more likely to complete all habits when you meditate first.</Text>
              </View>

              <View className='card p-4 shadow-sm mb-3'>
                <View className='flex-row items-center mb-2'>
                  <View className='w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3'>
                    <Ionicons name="heart" size={16} color="#EF4444" />
                  </View>
                  <Text className='text-subheading'>Mood Boost</Text>
                </View>
                <Text className='text-body'>Your mood scores are highest on days with 3+ completed habits.</Text>
              </View>
            </View>
          </View>

          {/* Chat Section */}
          <View className='card p-4 mb-6 '>
            <View className='flex-row items-center mb-4'>
              <Ionicons name="chatbubble-ellipses" size={20} color="#6B7280" />
              <Text className='text-body ml-2'>Hi {user.name}! 👋 I'm your AI habit coach. I noticed</Text>
            </View>

            {/* Chat Messages */}
            <View className='space-y-3 gap-3 mb-4'>
              {chatMessages.map((msg) => (
                <View key={msg.id} className={`flex-row ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <View className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.isUser 
                      ? 'bg-indigo-500 rounded-br-md' 
                      : 'bg-gray-100 dark:bg-gray-900 rounded-bl-md'
                  }`}>
                    <Text className={`text-sm ${msg.isUser ? 'text-white' : 'text-gray-900  dark:text-white'}`}>
                      {msg.text}
                    </Text>
                    <Text className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <View className='flex-row flex-wrap gap-2 mb-4'>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickAction(action)}
                  className=' bg-gray-100 dark:bg-gray-900 rounded-full px-3 py-2'
                >
                  <Text className='text-body text-sm'>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message Input */}
            <View className='flex-row items-center space-x-2'>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Ask your AI coach anything..."
                 placeholderTextColor="#888"
                className='flex-1 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-3 text-body'
                multiline
              />
              <TouchableOpacity
                onPress={sendMessage}
                className='bg-indigo-500 rounded-full w-10 h-10 items-center justify-center'
              >
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

      
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AICoach