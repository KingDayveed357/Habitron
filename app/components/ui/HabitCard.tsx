//components/ui/HabitCard.tsx

import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SkeletonHabitCard } from './SkeletonHabitCard'

interface Habit {
  id: string
  title: string
  icon: string
  completed: number
  total: number
  streak: number
  isCompleted: boolean
  progress: number
  bg_color?: string
  category?: string
  name?: string
  conflict?: boolean
}

interface HabitCardProps {
  habit: Habit
  onToggle: (habitId: string) => void
  isLast?: boolean
  isLoading?: boolean
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, isLast = false, isLoading = false }) => {
  const router = useRouter()


  if (isLoading) {
    return <SkeletonHabitCard isLast={isLast} />
  }

  const handleCardPress = () => {
    router.push(`/screens/habit_details?id=${habit.id}`)
  }

  
  const isLightColor = (bgClass: string): boolean => {
    if (!bgClass) return true
    
    const lightColors = [
      'bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300',
      'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400',
      'bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400',
      'bg-green-100', 'bg-green-200', 'bg-green-300',
      'bg-blue-100', 'bg-blue-200', 'bg-blue-300',
      'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-400',
      'bg-pink-100', 'bg-pink-200', 'bg-pink-300',
      'bg-purple-100', 'bg-purple-200', 'bg-purple-300',
      'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300',
      'bg-orange-100', 'bg-orange-200', 'bg-orange-300',
      'bg-red-100', 'bg-red-200', 'bg-red-300',
      'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400',
      'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300',
      'bg-teal-100', 'bg-teal-200', 'bg-teal-300',
      'bg-sky-100', 'bg-sky-200', 'bg-sky-300',
      'bg-violet-100', 'bg-violet-200', 'bg-violet-300',
      'bg-fuchsia-100', 'bg-fuchsia-200', 'bg-fuchsia-300',
      'bg-rose-100', 'bg-rose-200', 'bg-rose-300'
    ]
    
    return lightColors.includes(bgClass)
  }

  const getBackgroundColorClass = () => {
    return habit.bg_color || 'bg-white dark:bg-zinc-900'
  }

  const getProgressColor = () => {
    if (habit.bg_color) {
      return 'bg-white/40'
    }
    return habit.isCompleted ? 'bg-green-500' : 'bg-indigo-500'
  }

  const getProgressBarBackground = () => {
    if (habit.bg_color) {
      return 'bg-white/20'
    }
    return 'bg-gray-200 dark:bg-gray-700'
  }

  const getTextColor = () => {
    if (habit.bg_color) {
      return isLightColor(habit.bg_color) 
        ? 'text-gray-900' 
        : 'text-white'
    }
    return 'text-gray-900 dark:text-white'
  }

  const getSubTextColor = () => {
    if (habit.bg_color) {
      return isLightColor(habit.bg_color) 
        ? 'text-gray-600' 
        : 'text-white/80'
    }
    return 'text-gray-600 dark:text-gray-400'
  }

  const getToggleButtonStyle = () => {
    if (habit.isCompleted) {
      return 'bg-green-500 shadow-lg'
    }
    
    if (habit.bg_color) {
      return isLightColor(habit.bg_color) 
        ? 'bg-gray-300 border-2 border-gray-400' 
        : 'bg-white/20 border-2 border-white/40'
    }
    
    return 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
  }

  
  const habitName = habit.name || habit.title || 'Untitled Habit'
  const completedCount = habit.completed || 0
  const totalCount = habit.total || 1
  const streakCount = habit.streak || 0
  const categoryName = habit.category || ''
  const progressValue = habit.progress || 0

  return (
    <View className={`${!isLast ? 'mb-4' : ''}`}>
      
      <View className={`${getBackgroundColorClass()} rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden`}>
        
        
        {habit.conflict && (
          <View className="bg-amber-100 dark:bg-amber-900/30 px-3 py-2 border-b border-amber-200 dark:border-amber-700">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#D97706" />
              <Text className="text-amber-700 dark:text-amber-300 text-xs font-medium ml-2">
                Sync conflict - tap to resolve
              </Text>
            </View>
          </View>
        )}
        
       
        <Pressable 
          onPress={handleCardPress}
          className="flex-1"
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <View className="p-4 pr-20"> 
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-3">{habit.icon}</Text>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${getTextColor()} mb-1`}>
                  {habitName}
                </Text>
                {categoryName.length > 0 && (
                  <Text className={`text-xs ${getSubTextColor()} mb-1`}>
                    {categoryName}
                  </Text>
                )}
                <Text className={`text-sm ${getSubTextColor()}`}>
                  {`${completedCount}/${totalCount} completed • ${streakCount} day streak`}
                </Text>
              </View>
            </View>
            
        
            <View className={`${getProgressBarBackground()} rounded-full h-2`}>
              <View 
                className={`rounded-full h-2 ${getProgressColor()} transition-all duration-300`}
                style={{ width: `${Math.min(progressValue * 100, 100)}%` }}
              />
            </View>
          </View>
        </Pressable>

   
        <TouchableOpacity 
          className={`absolute right-3 top-1/2 w-14 h-14 rounded-full items-center justify-center ${getToggleButtonStyle()} transform -translate-y-7`}
          onPress={() => onToggle(habit.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {habit.isCompleted ? (
            <Ionicons name="checkmark" size={24} color="white" />
          ) : (
            <View className={`w-7 h-7 rounded-full border-2 ${
              habit.bg_color && !isLightColor(habit.bg_color) 
                ? 'border-white/60' 
                : 'border-gray-400 dark:border-gray-500'
            }`} />
          )}
        </TouchableOpacity>

       
        {habit.isCompleted && (
          <View className="absolute top-3 right-20">
            <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              <Text className="text-green-700 dark:text-green-400 text-xs font-medium">
                Complete
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default HabitCard