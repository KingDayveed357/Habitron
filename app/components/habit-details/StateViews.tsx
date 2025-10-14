// ==========================================
// components/habit-details/StateViews.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const LoadingState = memo<{ onBack: () => void }>(({ onBack }) => (
  <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
    <Stack.Screen options={{ headerShown: false }} />
    
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-sm">
      <TouchableOpacity onPress={onBack} className="p-2">
        <Ionicons name="arrow-back" size={24} color="#6B7280" />
      </TouchableOpacity>
      
      <View className="bg-gray-200 dark:bg-gray-700 rounded-lg h-5 w-32" />
      
      <View className="p-2">
        <View className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
      </View>
    </View>

    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading habit details...</Text>
    </View>
  </SafeAreaView>
));

LoadingState.displayName = 'LoadingState';

export const EmptyState = memo<{ onBack: () => void }>(({ onBack }) => (
  <SafeAreaView className="flex-1 bg-white dark:bg-black">
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">Habit Not Found</Text>
      <TouchableOpacity
        onPress={onBack}
        className="bg-indigo-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Go Back</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
));

EmptyState.displayName = 'EmptyState'
