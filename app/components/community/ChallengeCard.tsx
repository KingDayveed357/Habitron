// components/community/ChallengeCard.tsx - FIXED VERSION
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    participants: number;
    duration: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: string;
    progress?: number;
  };
  onJoin?: (challengeId: string) => void;
  onContinue?: (challengeId: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onJoin,
  onContinue
}) => {
  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleButtonPress = () => {
    if (challenge.progress !== undefined) {
      onContinue?.(challenge.id);
    } else {
      onJoin?.(challenge.id);
    }
  };

  return (
    <View className="card mb-4">
      <View className="flex-row items-center mb-3">
        <Text className="text-3xl mr-3">{challenge.icon}</Text>
        <View className="flex-1">
          <Text className="text-body font-semibold text-lg">{challenge.title}</Text>
          <Text className="text-caption mt-1">{challenge.description}</Text>
        </View>
      </View>
      
      {challenge.progress !== undefined && (
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-caption">Your Progress</Text>
            <Text className="text-body text-sm font-medium">{challenge.progress}%</Text>
          </View>
          <View className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <View 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${challenge.progress}%` }}
            />
          </View>
        </View>
      )}
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-4">
            <Text className="text-caption">
              👥 {challenge.participants.toLocaleString()} joined
            </Text>
          </View>
          <View>
            <Text className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          className="btn-primary px-4 py-2 rounded-lg"
          onPress={handleButtonPress}
        >
          <Text className="text-btn-primary-text font-medium text-sm">
            {challenge.progress !== undefined ? 'Continue' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChallengeCard;