import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Thread } from '@/interfaces/interfaces'; // Adjust the import path as needed

interface ThreadCardProps {
  thread: Thread;
  onPress?: (threadId: string) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onPress }) => {
  return (
    <TouchableOpacity 
      className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100"
      onPress={() => onPress?.(thread.id)}
    >
      <View className="flex-row items-start mb-2">
        <View className="flex-1">
          <Text className="font-semibold text-gray-800 text-base mb-1">{thread.title}</Text>
          <Text className="text-gray-600 text-sm">by {thread.author}</Text>
        </View>
        <View className="bg-blue-100 px-2 py-1 rounded-lg">
          <Text className="text-blue-600 text-xs font-medium">{thread.category}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
          <Text className="ml-1 text-gray-600 text-sm">{thread.replies} replies</Text>
        </View>
        <Text className="text-gray-500 text-sm">{thread.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
};