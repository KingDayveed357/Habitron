// components/community/FeedItem.tsx - PREMIUM VERSION
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface FeedItemProps {
  item: {
    id: string;
    type: string;
    metadata: any;
    created_at: string;
    likes_count: number;
    is_liked_by_user: boolean;
    user_name: string;
    user_avatar: string | null;
    user_streak: number;
  };
  onLike?: (itemId: string) => void;
  onEncourage?: (itemId: string) => void;
}

export const FeedItemComponent: React.FC<FeedItemProps> = ({
  item,
  onLike,
  onEncourage
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const likeScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);

  const getTypeIcon = () => {
    switch (item.type) {
      case 'completion': return '✅';
      case 'streak': return '🔥';
      case 'milestone': return '🎯';
      case 'challenge_joined': return '🏆';
      case 'challenge_completed': return '🎉';
      case 'habit_created': return '⭐';
      case 'habit_revived': return '🌱';
      default: return '⭐';
    }
  };

  const getActivityText = () => {
    const habitTitle = item.metadata?.habit_title || 'a habit';
    const challengeTitle = item.metadata?.challenge_title || 'a challenge';

    switch (item.type) {
      case 'completion':
        return `Completed "${habitTitle}"`;
      case 'streak':
        return `${item.metadata?.streak_days || 0} day streak on "${habitTitle}"! 🔥`;
      case 'milestone':
        return `Hit ${item.metadata?.total_completions || 0} completions with "${habitTitle}"! 🎯`;
      case 'challenge_joined':
        return `Joined "${challengeTitle}" challenge`;
      case 'challenge_completed':
        return `Completed "${challengeTitle}" challenge! 🎉`;
      case 'habit_created':
        return `Created new habit: "${habitTitle}"`;
      case 'habit_revived':
        return `Revived "${habitTitle}" after a break`;
      default:
        return `Activity with "${habitTitle}"`;
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const createdAt = new Date(item.created_at);
    const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return createdAt.toLocaleDateString();
  };

  const getStreakRingColor = () => {
    const streak = item.user_streak || 0;
    if (streak >= 30) return 'border-purple-500';
    if (streak >= 14) return 'border-blue-500';
    if (streak >= 7) return 'border-green-500';
    return 'border-gray-300 dark:border-gray-600';
  };

  const handleLikePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(likeScaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      })
    ]).start();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onLike?.(item.id);
  };

  const handleEncouragePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onEncourage?.(item.id);
  };

  const getAvatar = () => {
    if (item.user_avatar) return item.user_avatar;
    
    // Generate avatar from name
    const initial = item.user_name?.charAt(0)?.toUpperCase() || '?';
    return initial;
  };

  return (
    <Animated.View
      className="card mb-4 overflow-hidden"
      style={{
        transform: [{ scale: scaleAnim }]
      }}
    >
      {/* User Header */}
      <View className="flex-row items-center mb-3">
        {/* Avatar with Streak Ring */}
        <View className={`relative mr-3`}>
          <View
            className={`w-12 h-12 rounded-full border-2 ${getStreakRingColor()} items-center justify-center bg-blue-100 dark:bg-blue-900`}
          >
            <Text className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {getAvatar()}
            </Text>
          </View>
          {item.user_streak > 0 && (
            <View className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full px-1.5 py-0.5 border-2 border-white dark:border-gray-900">
              <Text className="text-white text-xs font-bold">
                {item.user_streak}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text className="text-body font-semibold text-base">
            {item.user_name}
          </Text>
          <Text className="text-caption text-sm">{getTimeAgo()}</Text>
        </View>

        {/* Type Icon */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
          <Text className="text-2xl">{getTypeIcon()}</Text>
        </View>
      </View>

      {/* Activity Text */}
      <Text className="text-body mb-4 text-base leading-6">
        {getActivityText()}
      </Text>

      {/* Metadata Pills */}
      {item.metadata && (
        <View className="flex-row flex-wrap mb-3">
          {item.metadata.habit_category && (
            <View className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                {item.metadata.habit_category}
              </Text>
            </View>
          )}
          {item.metadata.challenge_difficulty && (
            <View className={`px-3 py-1 rounded-full mr-2 mb-2 ${
              item.metadata.challenge_difficulty === 'Easy' ? 'bg-green-50 dark:bg-green-900/30' :
              item.metadata.challenge_difficulty === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
              'bg-red-50 dark:bg-red-900/30'
            }`}>
              <Text className={`text-xs font-medium ${
                item.metadata.challenge_difficulty === 'Easy' ? 'text-green-600 dark:text-green-400' :
                item.metadata.challenge_difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {item.metadata.challenge_difficulty}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* Like Button */}
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={handleLikePress}
        >
          <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
            <Ionicons
              name={item.is_liked_by_user ? 'heart' : 'heart-outline'}
              size={24}
              color={item.is_liked_by_user ? '#ef4444' : '#6b7280'}
            />
          </Animated.View>
          <Text className={`ml-2 font-medium ${
            item.is_liked_by_user 
              ? 'text-red-500' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {item.likes_count > 0 ? item.likes_count : ''}
          </Text>
        </TouchableOpacity>

        {/* Encourage Button */}
        <TouchableOpacity
          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
          onPress={handleEncouragePress}
        >
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
            💪 Encourage
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default FeedItemComponent;