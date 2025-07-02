import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Thread } from '@/interfaces/interfaces';

interface ThreadCardProps {
  thread: Thread;
  onPress?: (threadId: string) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onPress }) => {
  return (
    <TouchableOpacity 
      className="card"
      onPress={() => onPress?.(thread.id)}
    >
      <View className="flex-row items-start mb-2">
        <View className="flex-1">
          <Text className="text-body font-semibold mb-1">{thread.title}</Text>
          <Text className="text-caption">by {thread.author}</Text>
        </View>
        <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
          <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium">{thread.category}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
          <Text className="ml-1 text-caption">{thread.replies} replies</Text>
        </View>
        <Text className="text-caption">{thread.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
};