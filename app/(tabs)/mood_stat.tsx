import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface MoodOption {
  emoji: string
  label: string
  value: number
}

interface WeeklyMood {
  day: string
  emoji: string
  score: string
}

interface HabitMoodCorrelation {
  icon: string
  name: string
  boost: string
  color: string
  bgColor: string
}

export default function MoodStat () {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  const router = useRouter()

  const moodOptions: MoodOption[] = [
    { emoji: '🤩', label: 'Excellent', value: 5 },
    { emoji: '😊', label: 'Good', value: 4 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😔', label: 'Bad', value: 2 },
    { emoji: '😰', label: 'Terrible', value: 1 },
  ]

  const weeklyMoods: WeeklyMood[] = [
    { day: 'Mon', emoji: '😊', score: '8/10' },
    { day: 'Tue', emoji: '😊', score: '6/10' },
    { day: 'Wed', emoji: '😔', score: '4/10' },
    { day: 'Thu', emoji: '😊', score: '8/10' },
    { day: 'Fri', emoji: '🤩', score: '9/10' },
    { day: 'Sat', emoji: '😊', score: '8/10' },
    { day: 'Sun', emoji: '😔', score: '5/10' },
  ]

  const habitCorrelations: HabitMoodCorrelation[] = [
    { icon: '🧘', name: 'Meditation', boost: '+2.3 mood boost', color: '#10B981', bgColor: '#D1FAE5' },
    { icon: '🏃', name: 'Exercise', boost: '+1.8 mood boost', color: '#3B82F6', bgColor: '#DBEAFE' },
    { icon: '📚', name: 'Reading', boost: '+1.2 mood boost', color: '#F59E0B', bgColor: '#FEF3C7' },
  ]

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value)
  }


  return (
    <SafeAreaView className='app-background' edges={['top']}>
      <ScrollView className='flex-1 px-4'>
        {/* Main Mood Selection Card */}
     
          <View className='mb-6 mt-2'>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className='rounded-3xl p-8 mb-6'
            >
              <Text className='text-white text-xl font-semibold text-center mb-4'>
                How are you feeling today?
              </Text>
              <View className='items-center mb-6'>
                <Text className='text-6xl'>😊</Text>
              </View>
              <Text className='text-white/90 text-center text-base'>
                Tap to update your mood
              </Text>
            </LinearGradient>
          </View>
       

        {/* Mood Options */}
        <View className='mb-6 '>
          <View className='flex-row justify-between'>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                onPress={() => handleMoodSelect(mood.value)}
                className={`items-center p-3 rounded-2xl ${
                  selectedMood === mood.value ? 'border-indigo-500 border' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <Text className='text-3xl mb-2'>{mood.emoji}</Text>
                <Text className={`text-xs font-medium ${
                  selectedMood === mood.value ? 'text-indigo-500' : 'text-gray-600 dark:text-white'
                }`}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* This Week Section */}
        <View className='card p-4'>
          <View className='flex-row justify-between items-center mb-4'>
            <Text className='text-subheading text-lg '>This Week</Text>
            <TouchableOpacity 
              onPress={() => router.push('/screens/mood_history')}
              className='flex-row items-center'
            >
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className='text-gray-600 dark:text-gray-400 text-sm ml-1'>View History</Text>
            </TouchableOpacity>
          </View>

          
            <>
              {/* Weekly Mood Grid */}
              <View className='flex-row justify-between mb-6 '>
                {weeklyMoods.map((day, index) => (
                  <View key={index} className='items-center'>
                    <Text className='text-xs text-body mb-2'>{day.day}</Text>
                    <View className='w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center mb-1'>
                      <Text className='text-xl'>{day.emoji}</Text>
                    </View>
                    <Text className='text-xs text-gray-400'>{day.score}</Text>
                  </View>
                ))}
              </View>

              {/* Average Mood Score */}
              <View className='flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-4'>
                <Text className='text-body font-medium'>Average Mood Score</Text>
                <Text className='text-2xl font-bold text-indigo-500'>7/10</Text>
              </View>
            </>
         
        </View>

        {/* Mood Pattern Insight */}
        <View className='card'>
          <View className='flex-row items-center mb-4'>
            <View className='w-10 h-10 bg-green-100 rounded-2xl items-center justify-center mr-3'>
              <Text className='text-xl'>📊</Text>
            </View>
            <Text className='text-lg text-subheading'>Mood Pattern Insight</Text>
          </View>
          <View className='bg-green-50 rounded-2xl p-4'>
            <Text className='text-gray-700 text-sm leading-relaxed'>
              Your mood tends to be higher on days when you complete your meditation habit. Keep up the mindfulness practice!
            </Text>
          </View>
        </View>

        {/* Habits & Mood Correlation */}
          <View className='card p-6 mb-6 '>
            <Text className='text-lg text-subheading mb-4'>
              Habits & Mood Correlation
            </Text>
            <View className='space-y-3 flex flex-col gap-3'>
              {habitCorrelations.map((habit, index) => (
                <View key={index} className='flex-row items-center justify-between p-4 rounded-2xl' style={{ backgroundColor: habit.bgColor }}>
                  <View className='flex-row items-center'>
                    <Text className='text-2xl mr-3'>{habit.icon}</Text>
                    <Text className='font-medium text-gray-900'>{habit.name}</Text>
                  </View>
                  <Text className='font-semibold text-sm' style={{ color: habit.color }}>
                    {habit.boost}
                  </Text>
                </View>
              ))}
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export const options = {
  title: 'Mood Stat',
};
// export default MoodStat