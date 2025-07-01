import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

interface Habit {
  id: number
  title: string
  icon: string
  completed: number
  total: number
  streak: number
  isCompleted: boolean
  progress: number
  bgColor?: string
  category?: string
}

interface HabitCardProps {
  habit: Habit
  onToggle: (habitId: number) => void
  isLast?: boolean
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, isLast = false }) => {
  const router = useRouter()

  const handleCardPress = () => {
    router.push(`/screens/habit_details?id=${habit.id}`)
  }

  const getBackgroundColor = () => {
    return habit.bgColor || 'bg-white'
  }

  const getProgressColor = () => {
    if (habit.bgColor) {
      // If custom background, use a darker shade for progress
      return 'bg-black/20'
    }
    return habit.isCompleted ? 'bg-green-500' : 'bg-gray-800'
  }

  const getTextColor = () => {
    if (habit.bgColor && habit.bgColor.includes('white')) {
      return 'text-gray-900'
    }
    return habit.bgColor ? 'text-white' : 'text-gray-900'
  }

  const getSubTextColor = () => {
    if (habit.bgColor && habit.bgColor.includes('white')) {
      return 'text-gray-500'
    }
    return habit.bgColor ? 'text-white/70' : 'text-gray-500'
  }

  return (
    <View className={`${!isLast ? 'mb-4' : ''}`}>
      <TouchableOpacity 
        className={`${getBackgroundColor()} rounded-xl p-4 shadow-sm`}
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-3">{habit.icon}</Text>
            <View className="flex-1">
              <Text className={`text-base font-semibold ${getTextColor()} mb-1`}>
                {habit.title}
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
            className={`w-8 h-8 rounded-full items-center justify-center ${
              habit.isCompleted 
                ? 'bg-green-500' 
                : habit.bgColor 
                  ? 'bg-white/20' 
                  : 'bg-gray-200'
            }`}
            onPress={(e) => {
              e.stopPropagation() // Prevent card navigation when toggling
              onToggle(habit.id)
            }}
          >
            {habit.isCompleted && (
              <Text className="text-white text-sm font-bold">✓</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View className={`${habit.bgColor ? 'bg-white/20' : 'bg-gray-200'} rounded-full h-2`}>
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