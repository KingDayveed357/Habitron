// components/MetricCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: number;
  icon?: string;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color, 
  trend,
  icon,
  onPress
}) => (
  <TouchableOpacity 
    className="card p-4 flex-1 shadow-sm"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View className="flex-row justify-between items-start mb-2">
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
        {title}
      </Text>
      {icon && <Text className="text-lg">{icon}</Text>}
    </View>
    
    <View className="flex-row items-end justify-between">
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      {trend !== undefined && trend !== 0 && (
        <View className={`flex-row items-center px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          <Text className={`text-xs font-semibold ${
            trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
    
    <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">{subtitle}</Text>
  </TouchableOpacity>
);

export default MetricCard;