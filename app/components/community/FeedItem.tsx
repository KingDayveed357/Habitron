import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedItem } from '@/interfaces/interfaces';

interface FeedItemComponentProps {
  item: FeedItem;
  onLike?: (itemId: string) => void;
  onEncourage?: (itemId: string) => void;
}

export const FeedItemComponent: React.FC<FeedItemComponentProps> = ({
  item,
  onLike,
  onEncourage
}) => {
  const getTypeIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'completion': return '✅';
      case 'streak': return '🔥';
      case 'milestone': return '🎯';
      default: return '⭐';
    }
  };

  const getActivityText = () => {
    switch (item.type) {
      case 'completion':
        return `Completed "${item.habit}"`;
      case 'streak':
        return `${item.user.streak} day streak on "${item.habit}"! 🔥`;
      case 'milestone':
        return `Hit a major milestone with "${item.habit}"! 🎯`;
      default:
        return `Activity with "${item.habit}"`;
    }
  };

  return (
    <View className="card">
      <View className="flex-row items-center mb-3">
        <Text className="text-2xl mr-3">{item.user.avatar}</Text>
        <View className="flex-1">
          <Text className="text-body font-semibold">{item.user.name}</Text>
          <Text className="text-caption">{item.timestamp}</Text>
        </View>
        <Text className="text-lg">{getTypeIcon(item.type)}</Text>
      </View>
      
      <Text className="text-body mb-3">{getActivityText()}</Text>
      
      <View className="flex-row items-center justify-between">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => onLike?.(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={item.isLiked ? "#ef4444" : "#6b7280"}
          />
          <Text className="ml-1 text-caption">{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEncourage?.(item.id)}>
          <Text className="text-blue-500 dark:text-blue-400 text-sm font-medium">Encourage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FeedItemComponent;