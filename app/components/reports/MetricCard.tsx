// components/MetricCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color, 
  trend 
}) => (
  <View className="card p-4 flex-1  shadow-sm">
    <Text className="text-gray-500 dark:text-white text-xs font-medium uppercase tracking-wide mb-1">{title}</Text>
    <View className="flex-row items-end">
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      {trend && (
        <Text className={`text-sm ml-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </Text>
      )}
    </View>
    <Text className="text-gray-400 text-xs mt-1">{subtitle}</Text>
  </View>
);


export default MetricCard