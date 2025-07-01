import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient';

const HabitDetails = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  
  // Mock habit data - in real app, fetch from state/API
  const [habit, setHabit] = useState({
    id: 1,
    title: "Drink 8 glasses of water",
    icon: "💧",
    completed: 6,
    total: 8,
    streak: 12,
    successRate: 85,
    isCompleted: false,
    progress: 0.75,
    bgColor: "bg-blue-500",
    category: "Health & Fitness",
    frequency: "Daily",
    reminder: "09:00",
    daysTracked: 30,
    weeklyData: [8, 8, 5, 8, 7, 8, 8], // Mon-Sun
    insights: [
      "You're most successful completing this habit in the morning",
      "Your completion rate increases by 40% on weekdays",
      "Pairing this with your meditation habit boosts success by 25%"
    ]
  })

  const [todayProgress, setTodayProgress] = useState(habit.completed)

  const incrementProgress = () => {
    if (todayProgress < habit.total) {
      setTodayProgress(prev => prev + 1)
    }
  }

  const incrementByTwo = () => {
    if (todayProgress < habit.total - 1) {
      setTodayProgress(prev => prev + 2)
    } else if (todayProgress < habit.total) {
      setTodayProgress(habit.total)
    }
  }

  const markComplete = () => {
    setTodayProgress(habit.total)
    setHabit(prev => ({
      ...prev,
      isCompleted: true,
      completed: habit.total
    }))
  }

  const getDayLabel = (index: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days[index]
  }

  const renderWeeklyChart = () => {
    return (
      <View className="flex-row justify-between items-end mb-6">
        {habit.weeklyData.map((value, index) => (
          <View key={index} className="items-center">
            <View 
              className={`w-8 ${value >= habit.total ? 'bg-green-400' : value > 0 ? 'bg-green-300' : 'bg-gray-200'} rounded-t-md mb-2`}
              style={{ height: Math.max(20, (value / habit.total) * 60) }}
            />
            <Text className="text-white text-xs">{getDayLabel(index)}</Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView className="app-background" edges={['bottom']}>
      
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20}}
      >
        {/* Main Habit Card */}
        
         <LinearGradient
            colors={['#60A5FA', '#2563EB']}  // from-blue-400 to-blue-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{borderRadius: 10}}
            className="p-6 mb-6 rounded-full mx-1">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">{habit.icon}</Text>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-1">
                {habit.title}
              </Text>
              <Text className="text-blue-100">
                {habit.category}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-6">
            <View className="bg-white/20 rounded-lg p-3 flex-1 mr-3">
              <Text className="text-heading font-bold text-white">{habit.streak}</Text>
              <Text className="text-body text-sm">Day Streak</Text>
            </View>
            <View className="bg-white/20 rounded-lg p-3 flex-1 ml-3">
              <Text className="text-2xl font-bold text-white">{habit.successRate}%</Text>
              <Text className="text-body text-sm">Success Rate</Text>
            </View>
          </View>
       </LinearGradient>


        {/* Today's Progress */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-subheading">Today's Progress</Text>
            <Text className="text-body">{todayProgress}/{habit.total} glasses</Text>
          </View>
          
          {/* Progress Bar */}
          <View className="bg-gray-200 rounded-full h-3 mb-6">
            <View 
              className="bg-indigo-500 rounded-full h-3" 
              style={{ width: `${(todayProgress / habit.total) * 100}%` }}
            />
          </View>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-indigo-500 rounded-lg px-4 py-3 flex-1 mr-2"
              onPress={markComplete}
            >
              <Text className="text-white font-medium text-center">✓ Mark Complete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="border border-indigo-500 rounded-lg px-4 py-3"
              onPress={incrementProgress}
            >
              <Text className="text-body text-center font-mediumm">+1 Glass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="border border-indigo-500 rounded-lg px-4 py-3 ml-2"
              onPress={incrementByTwo}
            >
              <Text className="text-body text-center font-medium">+2 Glasses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* This Week Chart */}
        <View className="card rounded-2xl p-6 mb-6">
          <Text className="text-subheading mb-4">This Week</Text>
          {renderWeeklyChart()}
        </View>

        {/* Habit Details */}
        <View className="card rounded-2xl p-6 mb-6">
          <Text className="text-subheading mb-4">Habit Details</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-3">📅</Text>
                <Text className="text-gray-700">Frequency</Text>
              </View>
              <Text className="text-gray-900 font-medium">{habit.frequency}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-3">⏰</Text>
                <Text className="text-gray-700">Reminder</Text>
              </View>
              <Text className="text-gray-900 font-medium">{habit.reminder}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-3">📊</Text>
                <Text className="text-gray-700">Days Tracked</Text>
              </View>
              <Text className="text-gray-900 font-medium">{habit.daysTracked} days</Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View className="bg-pink-50 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-pink-500 text-xl mr-2">🧠</Text>
            <Text className="text-lg font-semibold text-gray-900">AI Insights</Text>
          </View>
          
          {habit.insights.map((insight, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-purple-500 mr-2">•</Text>
              <Text className="text-gray-700 flex-1">{insight}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity className="border border-gray-300 rounded-xl p-4 flex-1 mr-3">
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-700 mr-2">⚙️</Text>
              <Text className="text-gray-700 font-medium">Edit Habit</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-purple-500 rounded-xl p-4 flex-1 ml-3">
            <Text className="text-white font-medium text-center">Ask AI Coach</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HabitDetails