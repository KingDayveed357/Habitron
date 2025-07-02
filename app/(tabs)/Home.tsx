import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import HabitCard from '../components/ui/HabitCard'
import { Ionicons } from '@expo/vector-icons'

const Home = () => {
  const router = useRouter()
  
  const [habits, setHabits] = useState([
    {
      id: 1,
      title: "Drink 8 glasses of water",
      icon: "💧",
      completed: 6,
      total: 8,
      streak: 12,
      isCompleted: false,
      progress: 0.75,
      bgColor: "bg-blue-500",
      category: "Health & Fitness"
    },
    {
      id: 2,
      title: "Read for 30 minutes",
      icon: "📚",
      completed: 1,
      total: 1,
      streak: 5,
      isCompleted: true,
      progress: 1.0,
      bgColor: "bg-amber-500",
      category: "Learning"
    },
    {
      id: 3,
      title: "Exercise",
      icon: "🏃",
      completed: 0,
      total: 1,
      streak: 3,
      isCompleted: false,
      progress: 0,
      bgColor: "bg-green-500",
      category: "Health & Fitness"
    },
    {
      id: 4,
      title: "Meditate",
      icon: "🧘",
      completed: 1,
      total: 1,
      streak: 8,
      isCompleted: true,
      progress: 1.0,
      bgColor: "bg-purple-500",
      category: "Mindfulness"
    }
  ])

  const toggleHabit = (habitId: number) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            isCompleted: !habit.isCompleted,
            completed: habit.isCompleted ? 0 : habit.total,
            progress: habit.isCompleted ? 0 : 1.0
          }
        : habit
    ))
  }

  const completedHabits = habits.filter(habit => habit.isCompleted).length
  const totalHabits = habits.length
  const overallProgress = totalHabits > 0 ? (completedHabits / totalHabits) : 0

  return (
    <SafeAreaView className="flex-1 app-background" edges={['bottom']}>
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 20}}
      >
      
        {/* Greeting Section */}
        {/* <View className="card">
          <Text className="text-heading">
            Good Morning, David! 👋
          </Text>
          <Text className="text-body">
            Let's make today productive
          </Text>
        </View> */}

        {/* Progress Card */}
        <View className="card">
          <View className='flex flex-row justify-between'>
          <View>
             <Text className="text-heading">Today's Progress</Text>
          <Text className="text-body mb-4">
            {completedHabits} of {totalHabits} habits completed
          </Text>
          </View>
     
          <Text className="text-heading">{Math.round(overallProgress * 100)}%</Text>
         
          </View>
       
          
          {/* Progress Bar */}
          <View className="bg-white/20 rounded-full h-2 mb-4">
            <View 
              className="bg-indigo-500 rounded-full h-2" 
              style={{ width: `${overallProgress * 100}%` }}
            />
          </View>
          
          
        </View>

        {/* Action Buttons */}
        {/* <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="btn-primary flex-1 justify-center mr-3" 
            onPress={() => router.push('/screens/create_habit')}
          >
            <Text className=" text-white text-center font-medium">+ Add Habit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
          className="border border-indigo-500 rounded-xl p-4 flex-1 ml-3"
          onPress={() => router.push('/(tabs)/ai_coach')}
          >
            <Text className="text-body text-center font-medium">Ask AI Coach</Text>
          </TouchableOpacity>
        </View> */}

        {/* Today's Habits Section */}
        <View className="">
          <Text className="text-heading mb-4">Today's Habits</Text>
          
          {habits.map((habit, index) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={toggleHabit}
              isLast={index === habits.length - 1}
            />
          ))}
        </View>

          {/* AI Insights */}
                <View className="bg-pink-50 rounded-2xl mt-7 p-6 ">
                  <View className="flex-row items-center mb-4">
                    <Text className="text-pink-500 text-xl mr-2">🧠</Text>
                    <Text className="text-lg font-semibold text-gray-900">AI Insights</Text>
                  </View>
                  
                
                    <View  className="flex-row items-start mb-3">
                      <Text className="text-purple-500 mr-2">•</Text>
                      <Text className="text-gray-700 flex-1">Drink more water</Text>
                    </View>

                      <View  className="flex-row items-start mb-3">
                      <Text className="text-purple-500 mr-2">•</Text>
                      <Text className="text-gray-700 flex-1">Read a book after meditate</Text>
                    </View>
                
                </View>
      </ScrollView>
      <View className="absolute bottom-24 right-6 space-y-4 z-50">
  {/* Add Habit Button */}
  <TouchableOpacity
    onPress={() => router.push('/screens/create_habit')}
    className="bg-indigo-500 p-4 rounded-full shadow-md items-center justify-center"
    style={{ elevation: 6 }}
  >
    <Ionicons name="add" size={28} color="white" />
  </TouchableOpacity>

  {/* Ask AI Coach Button */}
  <TouchableOpacity
    onPress={() => router.push('/(tabs)/ai_coach')}
    className="bg-white dark:bg-zinc-900 mt-2 p-4 rounded-full shadow-md items-center justify-center border border-indigo-500"
    style={{ elevation: 6 }}
  >
    <Ionicons name="chatbubbles-outline" size={24} color="#4F46E5" />
  </TouchableOpacity>
</View>

    </SafeAreaView>
  )
}

export default Home