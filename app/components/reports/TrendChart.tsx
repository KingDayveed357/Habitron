import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";

interface TrendDataPoint {
  value: number;
  label: any;
  date?: string | null;
  target?: number;
}

interface TrendChartProps {
  data: number[] | TrendDataPoint[];
  title: string;
  color: string;
  periodType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  showTarget?: boolean;
  targetValue?: number;
  showAverage?: boolean;
  interactive?: boolean;
  gradientColors?: string[];
  animationDuration?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  title, 
  color,
  periodType = 'daily',
  showTarget = false,
  targetValue = 80,
  showAverage = true,
  interactive = true,
  gradientColors,
  animationDuration = 1000
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const animatedValues = useRef<Animated.Value[]>([]);
  const screenWidth = Dimensions.get('window').width;

  // Normalize data to consistent format
  const normalizedData: TrendDataPoint[] = data.map((item, index) => {
    if (typeof item === 'number') {
      return {
        value: item,
        label: getPeriodLabel == null ? null : getPeriodLabel(index, periodType),
        date: getPeriodDate == null ? null : getPeriodDate(index, periodType)
      };
    }
    return item;
  });

  const values = normalizedData.map(item => item.value);
  const maxValue = Math.max(...values, showTarget ? targetValue : 0);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Initialize animated values
  useEffect(() => {
    animatedValues.current = normalizedData.map(() => new Animated.Value(0));
    
    // Animate bars with staggered effect
    const animations = animatedValues.current.map((animValue, index) =>
      Animated.timing(animValue, {
        toValue: 1,
        duration: animationDuration,
        delay: index * 100,
        useNativeDriver: false,
      })
    );

    Animated.stagger(50, animations).start();
  }, [data, animationDuration]);

  const getPeriodLabel = (index: number, type: string): string => {
    const labels: any = {
      daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekly: [`W${index + 1}`, `W${index + 2}`, `W${index + 3}`, `W${index + 4}`],
      monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    return labels[type]?.[index] || `P${index + 1}`;
  };

  const getPeriodDate = (index: number, type: string): string => {
    const today = new Date();
    const date = new Date(today);
    
    switch (type) {
      case 'daily':
        date.setDate(today.getDate() - (normalizedData.length - 1 - index));
        break;
      case 'weekly':
        date.setDate(today.getDate() - (normalizedData.length - 1 - index) * 7);
        break;
      case 'monthly':
        date.setMonth(today.getMonth() - (normalizedData.length - 1 - index));
        break;
    }
    
    return date.toLocaleDateString();
  };

  const getBarHeight = (value: number): number => {
    return ((value - minValue) / range) * 100;
  };

  const getBarColor = (value: number, index: number): string => {
    if (gradientColors && gradientColors.length >= 2) {
      const intensity = value / maxValue;
      return intensity > 0.7 ? gradientColors[1] : 
             intensity > 0.4 ? gradientColors[0] : 
             'bg-gray-300 dark:bg-gray-600';
    }
    
    // Performance-based coloring
    if (showTarget && targetValue) {
      if (value >= targetValue) return 'bg-green-500';
      if (value >= targetValue * 0.8) return 'bg-yellow-500';
      if (value >= targetValue * 0.6) return 'bg-orange-500';
      return 'bg-red-400';
    }
    
    return selectedIndex === index ? 'bg-indigo-600' : color;
  };

  const handleBarPress = (index: number) => {
    if (!interactive) return;
    
    setSelectedIndex(selectedIndex === index ? null : index);
    setShowDetails(!showDetails || selectedIndex !== index);
  };

  const getTrendDirection = (): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
    if (values.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(change) < 2) return { direction: 'stable', percentage: Math.abs(change) };
    return { direction: change > 0 ? 'up' : 'down', percentage: Math.abs(change) };
  };

  const trend = getTrendDirection();

  return (
    <View className="card p-4">
      {/* Header - Fixed positioning */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-white mb-2">{title}</Text>
          <View className="flex-row items-center flex-wrap">
            <View className="flex-row items-center mr-4 mb-1">
              <Text className={`text-sm font-medium mr-1 ${
                trend.direction === 'up' ? 'text-green-400' : 
                trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
              </Text>
              <Text className={`text-sm font-medium ${
                trend.direction === 'up' ? 'text-green-400' : 
                trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend.percentage.toFixed(1)}%
              </Text>
            </View>
            {showAverage && (
              <View className="mb-1">
                <Text className="text-sm text-gray-400">
                  Avg: {average.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Current value display */}
        <View className="items-end">
          <Text className="text-2xl font-bold text-white">
            {selectedIndex !== null ? normalizedData[selectedIndex].value : values[values.length - 1]}%
          </Text>
          <Text className="text-xs text-gray-400">
            {selectedIndex !== null ? 'Selected' : 'Latest'}
          </Text>
        </View>
      </View>

      {/* Chart Container - Improved spacing and positioning */}
      <View className="relative mb-6">
        {/* Y-axis labels */}
        <View className="absolute left-0 top-0 bottom-0 justify-between w-8 z-5">
          <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue)}%</Text>
          <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue * 0.75)}%</Text>
          <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue * 0.5)}%</Text>
          <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue * 0.25)}%</Text>
          <Text className="text-xs text-gray-400 text-right">0%</Text>
        </View>

        {/* Grid lines */}
        <View className="absolute left-10 right-0 top-0 bottom-0 justify-between">
          {[0, 0.25, 0.5, 0.75, 1].map((position, index) => (
            <View 
              key={index}
              className="border-t border-gray-700 opacity-30"
              style={{ width: '100%' }}
            />
          ))}
        </View>

        {/* Target Line - Better positioning */}
        {showTarget && targetValue && (
          <View 
            className="absolute left-10 right-0 border-t-2 border-dashed border-yellow-400 z-20"
            style={{ 
              top: `${(1 - (targetValue - minValue) / range) * 100}%`,
            }}
          >
            <View className="absolute -right-1 -top-4 bg-yellow-400 px-2 py-1 rounded">
              <Text className="text-xs text-black font-medium">
                Target {targetValue}%
              </Text>
            </View>
          </View>
        )}

        {/* Average Line - Better positioning */}
        {showAverage && (
          <View 
            className="absolute left-10 right-0 border-t border-dotted border-blue-400 z-20"
            style={{ 
              top: `${(1 - (average - minValue) / range) * 100}%`,
            }}
          >
            <View className="absolute -right-1 -top-3 bg-blue-400 px-1 py-0.5 rounded">
              <Text className="text-xs text-white">Avg</Text>
            </View>
          </View>
        )}

        {/* Bars Container - Better spacing */}
        <View className="ml-10 mt-12 flex-row items-end justify-between h-48 px-2">
          {normalizedData.map((dataPoint, index) => {
            const animatedHeight = animatedValues.current[index];
            const barHeight = getBarHeight(dataPoint.value);
            const barColor = getBarColor(dataPoint.value, index);
            const isSelected = selectedIndex === index;
            const barWidth = Math.max(16, (screenWidth - 120) / normalizedData.length - 8);

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleBarPress(index)}
                className="items-center justify-end flex-1 max-w-12"
                activeOpacity={0.7}
                style={{ minHeight: 192 }} // Full height for touch area
              >
                {/* Value Label - Better positioning */}
                {isSelected && (
                  <View className="absolute -top-10 bg-white dark:bg-gray-700 px-2 py-1 rounded-lg shadow-lg z-30">
                    <Text className="text-xs text-gray-900 dark:text-white font-semibold">
                      {dataPoint.value}%
                    </Text>
                    <View className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-700" />
                  </View>
                )}

                {/* Animated Bar - Improved styling */}
                <Animated.View
                  className={`${barColor} rounded-t-xl shadow-sm ${isSelected ? 'shadow-lg' : ''}`}
                  style={{
                    width: barWidth,
                    height: animatedHeight?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, Math.max(4, (barHeight * 192) / 100)], // Minimum height of 4
                    }) || Math.max(4, (barHeight * 192) / 100),
                    transform: isSelected ? [{ scaleX: 1.1 }, { scaleY: 1.05 }] : [{ scaleX: 1 }, { scaleY: 1 }],
                    elevation: isSelected ? 8 : 2,
                  }}
                />

                {/* Period Label - Better positioning */}
                <Text className={`text-xs mt-3 text-center ${
                  isSelected ? 'text-blue-400 font-semibold' : 'text-gray-400'
                }`}>
                  {dataPoint.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Detailed Information - Enhanced layout */}
      {showDetails && selectedIndex !== null && (
        <Animated.View 
          className="bg-gray-700 dark:bg-gray-800 rounded-xl p-4 border border-gray-600"
          style={{
            opacity: new Animated.Value(0),
          }}
        >
          <Text className="text-base font-semibold text-white mb-3">
            {normalizedData[selectedIndex].label} Details
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-1">Completion Rate</Text>
              <Text className="text-xl font-bold text-blue-400">
                {normalizedData[selectedIndex].value}%
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xs text-gray-400 mb-1">Date</Text>
              <Text className="text-sm text-white">
                {normalizedData[selectedIndex].date}
              </Text>
            </View>
            {showTarget && (
              <View className="flex-1 items-end">
                <Text className="text-xs text-gray-400 mb-1">vs Target</Text>
                <Text className={`text-sm font-semibold ${
                  normalizedData[selectedIndex].value >= targetValue 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {normalizedData[selectedIndex].value >= targetValue ? '+' : ''}
                  {(normalizedData[selectedIndex].value - targetValue).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Interactive hint */}
      {interactive && !showDetails && (
        <View className="flex-row justify-center mt-2">
          <Text className="text-xs text-gray-500">
            Tap bars for details
          </Text>
        </View>
      )}
    </View>
  );
};

export default TrendChart;