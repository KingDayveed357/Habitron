import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

interface Habit {
  id: string // Changed from number to string to match Supabase UUID
  title: string
  icon: string
  completed: number
  total: number
  streak: number
  isCompleted: boolean
  progress: number
  bg_color?: string // Tailwind class like 'bg-green-500'
  category?: string
  name?: string // Alternative field name from Supabase
}

interface HabitCardProps {
  habit: Habit
  onToggle: (habitId: string) => void // Updated to match string ID
  isLast?: boolean
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, isLast = false }) => {
  const router = useRouter()

  const handleCardPress = () => {
    router.push(`/screens/habit_details?id=${habit.id}`)
  }

  // Helper function to determine if a Tailwind color is light
  const isLightColor = (bgClass: string): boolean => {
    if (!bgClass) return true
    
    // Light colors that need dark text
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
      // Use a darker shade or contrasting color for progress bar
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
      return 'bg-white/90'
    }
    
    if (habit.bg_color) {
      return isLightColor(habit.bg_color) 
        ? 'bg-gray-300' 
        : 'bg-white/20'
    }
    
    return 'bg-gray-200 dark:bg-gray-700'
  }

  const getToggleButtonTextColor = () => {
    if (habit.isCompleted) {
      return 'text-green-600'
    }
    
    if (habit.bg_color && !isLightColor(habit.bg_color)) {
      return 'text-white'
    }
    
    return 'text-gray-600 dark:text-gray-300'
  }

  return (
    <View className={`${!isLast ? 'mb-4' : ''}`}>
      <TouchableOpacity 
        className={`${getBackgroundColorClass()} rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800`}
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-3">{habit.icon}</Text>
            <View className="flex-1">
              <Text className={`text-base font-semibold ${getTextColor()} mb-1`}>
                {habit.name || habit.title}
              </Text>
              {habit.category && (
                <Text className={`text-xs ${getSubTextColor()} mb-1`}>
                  {habit.category}
                </Text>
              )}
              <Text className={`text-sm ${getSubTextColor()}`}>
                {habit.completed}/{habit.total} completed • {habit.streak} day streak
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className={`w-8 h-8 rounded-full items-center justify-center ${getToggleButtonStyle()}`}
            onPress={(e) => {
              e.stopPropagation() // Prevent card navigation when toggling
              onToggle(habit.id)
            }}
          >
            {habit.isCompleted && (
              <Text className={`text-sm font-bold ${getToggleButtonTextColor()}`}>✓</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View className={`${getProgressBarBackground()} rounded-full h-2`}>
          <View 
            className={`rounded-full h-2 ${getProgressColor()}`}
            style={{ width: `${habit.progress * 100}%` }}
          />
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default HabitCard