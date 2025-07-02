import React from 'react';
import { View, Text } from 'react-native';
import { User } from '@/interfaces/interfaces';

interface LeaderboardCardProps {
  user: User;
  rank: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user, rank }) => {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-600 dark:text-yellow-400' 
      };
      case 2: return { 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: 'text-gray-600 dark:text-gray-300' 
      };
      case 3: return { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-600 dark:text-orange-400' 
      };
      default: return { 
        bg: 'bg-blue-50 dark:bg-blue-900/20', 
        text: 'text-blue-600 dark:text-blue-400' 
      };
    }
  };

  const rankStyle = getRankStyle(rank);

  return (
    <View className="flex-row items-center card">
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${rankStyle.bg}`}>
        <Text className={`font-bold text-sm ${rankStyle.text}`}>{rank}</Text>
      </View>
      <Text className="text-2xl mr-3">{user.avatar}</Text>
      <View className="flex-1">
        <Text className="text-body font-semibold">{user.name}</Text>
        <Text className="text-caption">Level {user.level}</Text>
      </View>
      <View className="items-end">
        <Text className="text-body font-bold text-lg">{user.points.toLocaleString()}</Text>
        <View className="flex-row items-center">
          <Text className="text-orange-500 mr-1">🔥</Text>
          <Text className="text-caption">{user.streak}</Text>
        </View>
      </View>
    </View>
  );
};

export default LeaderboardCard;