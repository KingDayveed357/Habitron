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
      case 1: return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      case 2: return { bg: 'bg-gray-100', text: 'text-gray-600' };
      case 3: return { bg: 'bg-orange-100', text: 'text-orange-600' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600' };
    }
  };

  const rankStyle = getRankStyle(rank);

  return (
    <View className="flex-row items-center bg-white p-4 mb-2 rounded-xl shadow-sm border border-gray-100">
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${rankStyle.bg}`}>
        <Text className={`font-bold text-sm ${rankStyle.text}`}>{rank}</Text>
      </View>
      <Text className="text-2xl mr-3">{user.avatar}</Text>
      <View className="flex-1">
        <Text className="font-semibold text-gray-800">{user.name}</Text>
        <Text className="text-gray-500 text-sm">Level {user.level}</Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-lg text-gray-800">{user.points.toLocaleString()}</Text>
        <View className="flex-row items-center">
          <Text className="text-orange-500 mr-1">🔥</Text>
          <Text className="text-gray-600 text-sm">{user.streak}</Text>
        </View>
      </View>
    </View>
  );
};

export default LeaderboardCard;