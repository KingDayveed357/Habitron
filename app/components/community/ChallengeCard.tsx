import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Challenge } from '@/interfaces/interfaces'; // Adjust the import path as needed

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onContinue?: (challengeId: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  onJoin, 
  onContinue 
}) => {
  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleButtonPress = () => {
    if (challenge.progress) {
      onContinue?.(challenge.id);
    } else {
      onJoin?.(challenge.id);
    }
  };

  return (
    <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <Text className="text-3xl mr-3">{challenge.icon}</Text>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800 text-lg">{challenge.title}</Text>
          <Text className="text-gray-600 text-sm mt-1">{challenge.description}</Text>
        </View>
      </View>

      {challenge.progress && (
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-sm">Your Progress</Text>
            <Text className="text-gray-800 text-sm font-medium">{challenge.progress}%</Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${challenge.progress}%` }}
            />
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm mr-4">
            👥 {challenge.participants.toLocaleString()} joined
          </Text>
          <Text className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={handleButtonPress}
        >
          <Text className="text-white font-medium text-sm">
            {challenge.progress ? 'Continue' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChallengeCard;