// // components/reports/TrendChart.tsx - FIXED VERSION

// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";

// interface TrendDataPoint {
//   value: number;
//   label: string;
//   date?: string | null;
//   target?: number;
// }

// interface TrendChartProps {
//   data: number[] | TrendDataPoint[];
//   title: string;
//   color: string;
//   periodType?: 'daily' | 'weekly' | 'monthly' | 'custom';
//   showTarget?: boolean;
//   targetValue?: number;
//   showAverage?: boolean;
//   interactive?: boolean;
//   gradientColors?: string[];
//   animationDuration?: number;
// }

// const TrendChart: React.FC<TrendChartProps> = ({ 
//   data, 
//   title, 
//   color,
//   periodType = 'daily',
//   showTarget = false,
//   targetValue = 80,
//   showAverage = true,
//   interactive = true,
//   gradientColors,
//   animationDuration = 1000
// }) => {
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
//   const [showDetails, setShowDetails] = useState(false);
  
//   // 🔥 FIX 1: Initialize animated values ONCE with useRef
//   const animatedValuesRef = useRef<Animated.Value[]>([]);
//   const detailsOpacity = useRef(new Animated.Value(0)).current;
  
//   const screenWidth = Dimensions.get('window').width;

//   // Helper functions
//   const getPeriodLabel = (index: number, type: string): string => {
//     const labels: Record<string, string[]> = {
//       daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//       weekly: [`W${index + 1}`, `W${index + 2}`, `W${index + 3}`, `W${index + 4}`],
//       monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     };
//     return labels[type]?.[index] || `P${index + 1}`;
//   };

//   const getPeriodDate = (index: number, type: string): string => {
//     const today = new Date();
//     const date = new Date(today);
    
//     switch (type) {
//       case 'daily':
//         date.setDate(today.getDate() - (normalizedData.length - 1 - index));
//         break;
//       case 'weekly':
//         date.setDate(today.getDate() - (normalizedData.length - 1 - index) * 7);
//         break;
//       case 'monthly':
//         date.setMonth(today.getMonth() - (normalizedData.length - 1 - index));
//         break;
//     }
    
//     return date.toLocaleDateString();
//   };

//   // Normalize data to consistent format
//   const normalizedData: TrendDataPoint[] = useMemo(() => 
//     data.map((item, index) => {
//       if (typeof item === 'number') {
//         return {
//           value: item,
//           label: getPeriodLabel(index, periodType),
//           date: getPeriodDate(index, periodType)
//         };
//       }
//       return item;
//     }),
//     [data, periodType]
//   );

//   const values = normalizedData.map(item => item.value);
//   const maxValue = Math.max(...values, showTarget ? targetValue : 0);
//   const minValue = Math.min(...values, 0);
//   const range = maxValue - minValue || 1;
//   const average = values.reduce((sum, val) => sum + val, 0) / values.length;

//   // 🔥 FIX 2: Initialize animated values only when data length changes
//   useEffect(() => {
//     // Only create new animated values if count changed
//     if (animatedValuesRef.current.length !== normalizedData.length) {
//       animatedValuesRef.current = normalizedData.map(() => new Animated.Value(0));
//     }
    
//     // Animate bars with staggered effect
//     const animations = animatedValuesRef.current.map((animValue, index) => {
//       animValue.setValue(0); // Reset before animating
//       return Animated.timing(animValue, {
//         toValue: 1,
//         duration: animationDuration,
//         delay: index * 50,
//         useNativeDriver: false,
//       });
//     });

//     Animated.stagger(50, animations).start();
//   }, [normalizedData.length, animationDuration]);

//   // 🔥 FIX 3: Animate details panel properly
//   useEffect(() => {
//     Animated.timing(detailsOpacity, {
//       toValue: showDetails ? 1 : 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   }, [showDetails]);

//   const getBarHeight = (value: number): number => {
//     return ((value - minValue) / range) * 100;
//   };

//   const getBarColor = (value: number, index: number): string => {
//     if (gradientColors && gradientColors.length >= 2) {
//       const intensity = value / maxValue;
//       return intensity > 0.7 ? gradientColors[1] : 
//              intensity > 0.4 ? gradientColors[0] : 
//              'bg-gray-300 dark:bg-gray-600';
//     }
    
//     if (showTarget && targetValue) {
//       if (value >= targetValue) return 'bg-green-500';
//       if (value >= targetValue * 0.8) return 'bg-yellow-500';
//       if (value >= targetValue * 0.6) return 'bg-orange-500';
//       return 'bg-red-400';
//     }
    
//     return selectedIndex === index ? 'bg-indigo-600' : color;
//   };

//   const handleBarPress = (index: number) => {
//     if (!interactive) return;
    
//     const newIndex = selectedIndex === index ? null : index;
//     setSelectedIndex(newIndex);
//     setShowDetails(newIndex !== null);
//   };

//   const getTrendDirection = (): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
//     if (values.length < 2) return { direction: 'stable', percentage: 0 };
    
//     const firstHalf = values.slice(0, Math.floor(values.length / 2));
//     const secondHalf = values.slice(Math.floor(values.length / 2));
    
//     const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
//     const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
//     const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
//     if (Math.abs(change) < 2) return { direction: 'stable', percentage: Math.abs(change) };
//     return { direction: change > 0 ? 'up' : 'down', percentage: Math.abs(change) };
//   };

//   const trend = getTrendDirection();

//   return (
//     <View className="bg-gray-900 rounded-2xl p-4 mb-4">
//       {/* Header */}
//       <View className="flex-row justify-between items-center mb-6">
//         <View className="flex-1">
//           <Text className="text-lg font-semibold text-white mb-2">{title}</Text>
//           <View className="flex-row items-center flex-wrap">
//             <View className="flex-row items-center mr-4 mb-1">
//               <Text className={`text-sm font-medium mr-1 ${
//                 trend.direction === 'up' ? 'text-green-400' : 
//                 trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
//               }`}>
//                 {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
//               </Text>
//               <Text className={`text-sm font-medium ${
//                 trend.direction === 'up' ? 'text-green-400' : 
//                 trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
//               }`}>
//                 {trend.percentage.toFixed(1)}%
//               </Text>
//             </View>
//             {showAverage && (
//               <View className="mb-1">
//                 <Text className="text-sm text-gray-400">
//                   Avg: {average.toFixed(1)}%
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
        
//         {/* Current value display */}
//         <View className="items-end">
//           <Text className="text-2xl font-bold text-white">
//             {selectedIndex !== null ? normalizedData[selectedIndex].value : values[values.length - 1]}%
//           </Text>
//           <Text className="text-xs text-gray-400">
//             {selectedIndex !== null ? 'Selected' : 'Latest'}
//           </Text>
//         </View>
//       </View>

//       {/* Chart Container */}
//       <View className="relative mb-6">
//         {/* Y-axis labels */}
//         <View className="absolute left-0 top-0 bottom-0 justify-between w-8 z-5">
//           <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue)}%</Text>
//           <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue * 0.75)}%</Text>
//           <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue * 0.5)}%</Text>
//           <Text className="text-xs text-gray-400 text-right">{Math.ceil(maxValue * 0.25)}%</Text>
//           <Text className="text-xs text-gray-400 text-right">0%</Text>
//         </View>

//         {/* Grid lines */}
//         <View className="absolute left-10 right-0 top-0 bottom-0 justify-between">
//           {[0, 0.25, 0.5, 0.75, 1].map((position, index) => (
//             <View 
//               key={index}
//               className="border-t border-gray-700 opacity-30"
//               style={{ width: '100%' }}
//             />
//           ))}
//         </View>

//         {/* Target Line */}
//         {showTarget && targetValue && (
//           <View 
//             className="absolute left-10 right-0 border-t-2 border-dashed border-yellow-400 z-20"
//             style={{ 
//               top: `${(1 - (targetValue - minValue) / range) * 100}%`,
//             }}
//           >
//             <View className="absolute -right-1 -top-4 bg-yellow-400 px-2 py-1 rounded">
//               <Text className="text-xs text-black font-medium">
//                 Target {targetValue}%
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Average Line */}
//         {showAverage && (
//           <View 
//             className="absolute left-10 right-0 border-t border-dotted border-blue-400 z-20"
//             style={{ 
//               top: `${(1 - (average - minValue) / range) * 100}%`,
//             }}
//           >
//             <View className="absolute -right-1 -top-3 bg-blue-400 px-1 py-0.5 rounded">
//               <Text className="text-xs text-white">Avg</Text>
//             </View>
//           </View>
//         )}

//         {/* Bars Container */}
//         <View className="ml-10 mt-12 flex-row items-end justify-between h-48 px-2">
//           {normalizedData.map((dataPoint, index) => {
//             const animatedHeight = animatedValuesRef.current[index];
//             const barHeight = getBarHeight(dataPoint.value);
//             const barColor = getBarColor(dataPoint.value, index);
//             const isSelected = selectedIndex === index;
//             const barWidth = Math.max(16, (screenWidth - 120) / normalizedData.length - 8);

//             return (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => handleBarPress(index)}
//                 className="items-center justify-end flex-1 max-w-12"
//                 activeOpacity={0.7}
//                 style={{ minHeight: 192 }}
//               >
//                 {/* Value Label */}
//                 {isSelected && (
//                   <View className="absolute -top-10 bg-white dark:bg-gray-700 px-2 py-1 rounded-lg shadow-lg z-30">
//                     <Text className="text-xs text-gray-900 dark:text-white font-semibold">
//                       {dataPoint.value}%
//                     </Text>
//                     <View className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-700" />
//                   </View>
//                 )}

//                 {/* 🔥 FIX 4: Use Animated.View directly (not wrapped in TouchableOpacity) */}
//                 <Animated.View
//                   className={`${barColor} rounded-t-xl shadow-sm ${isSelected ? 'shadow-lg' : ''}`}
//                   style={{
//                     width: barWidth,
//                     height: animatedHeight?.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [4, Math.max(4, (barHeight * 192) / 100)],
//                     }) || Math.max(4, (barHeight * 192) / 100),
//                     transform: isSelected ? [{ scaleX: 1.1 }, { scaleY: 1.05 }] : [{ scaleX: 1 }, { scaleY: 1 }],
//                     elevation: isSelected ? 8 : 2,
//                   }}
//                 />

//                 {/* Period Label */}
//                 <Text className={`text-xs mt-3 text-center ${
//                   isSelected ? 'text-blue-400 font-semibold' : 'text-gray-400'
//                 }`}>
//                   {dataPoint.label}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </View>

//       {/* Detailed Information */}
//       {showDetails && selectedIndex !== null && (
//         <Animated.View 
//           className="bg-gray-700 dark:bg-gray-800 rounded-xl p-4 border border-gray-600"
//           style={{ opacity: detailsOpacity }}
//         >
//           <Text className="text-base font-semibold text-white mb-3">
//             {normalizedData[selectedIndex].label} Details
//           </Text>
//           <View className="flex-row justify-between items-center">
//             <View className="flex-1">
//               <Text className="text-xs text-gray-400 mb-1">Completion Rate</Text>
//               <Text className="text-xl font-bold text-blue-400">
//                 {normalizedData[selectedIndex].value}%
//               </Text>
//             </View>
//             <View className="flex-1 items-center">
//               <Text className="text-xs text-gray-400 mb-1">Date</Text>
//               <Text className="text-sm text-white">
//                 {normalizedData[selectedIndex].date}
//               </Text>
//             </View>
//             {showTarget && (
//               <View className="flex-1 items-end">
//                 <Text className="text-xs text-gray-400 mb-1">vs Target</Text>
//                 <Text className={`text-sm font-semibold ${
//                   normalizedData[selectedIndex].value >= targetValue 
//                     ? 'text-green-400' : 'text-red-400'
//                 }`}>
//                   {normalizedData[selectedIndex].value >= targetValue ? '+' : ''}
//                   {(normalizedData[selectedIndex].value - targetValue).toFixed(1)}%
//                 </Text>
//               </View>
//             )}
//           </View>
//         </Animated.View>
//       )}

//       {/* Interactive hint */}
//       {interactive && !showDetails && (
//         <View className="flex-row justify-center mt-2">
//           <Text className="text-xs text-gray-500">
//             Tap bars for details
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default TrendChart;


// components/reports/TrendChart.tsx
import React, { useMemo } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { Svg, Line, Circle, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { HabitDataProps, TimePeriod } from '@/interfaces/interfaces';

interface TrendChartProps {
  habits: HabitDataProps[];
  periodLabel: string;
  totalDays: number;
  selectedPeriod: TimePeriod;
}

interface DataPoint {
  date: string;
  value: number;
  label: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  habits, 
  periodLabel, 
  totalDays,
  selectedPeriod 
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32; // Account for padding
  const chartHeight = 220;
  const padding = { top: 20, right: 10, bottom: 40, left: 40 };
  
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  /**
   * Generate data points based on period type
   */
  const dataPoints = useMemo((): DataPoint[] => {
    if (habits.length === 0) return [];

    const points: DataPoint[] = [];
    const today = new Date();

    switch (selectedPeriod) {
      case 'today':
        // Hourly breakdown for today
        for (let hour = 0; hour < 24; hour += 4) {
          const completedHabits = habits.filter(h => {
            const completions = h.dailyData?.filter(d => d.completed) || [];
            return completions.length > 0;
          }).length;
          
          const rate = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;
          points.push({
            date: `${hour}:00`,
            value: Math.round(rate),
            label: `${hour}:00`
          });
        }
        break;

      case 'week':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = formatDateString(date);
          
          const completedCount = habits.filter(h => {
            const dayCompletion = h.dailyData?.find(d => d.date === dateStr);
            return dayCompletion?.completed;
          }).length;
          
          const rate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
          points.push({
            date: dateStr,
            value: Math.round(rate),
            label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
          });
        }
        break;

      case 'month':
        // Last 30 days in weekly segments
        const weeksInMonth = 4;
        for (let i = weeksInMonth - 1; i >= 0; i--) {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - (i * 7 + 6));
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() - (i * 7));

          let weekTotal = 0;
          let weekCount = 0;

          for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDateString(d);
            const completedCount = habits.filter(h => {
              const dayCompletion = h.dailyData?.find(day => day.date === dateStr);
              return dayCompletion?.completed;
            }).length;
            
            if (habits.length > 0) {
              weekTotal += (completedCount / habits.length) * 100;
              weekCount++;
            }
          }

          const avgRate = weekCount > 0 ? weekTotal / weekCount : 0;
          points.push({
            date: formatDateString(weekStart),
            value: Math.round(avgRate),
            label: `W${weeksInMonth - i}`
          });
        }
        break;

      case 'last6months':
      case 'year':
        // Monthly breakdown
        const months = selectedPeriod === 'last6months' ? 6 : 12;
        for (let i = months - 1; i >= 0; i--) {
          const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          let monthTotal = 0;
          let monthCount = 0;

          for (let d = new Date(monthDate); d <= monthEnd && d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDateString(d);
            const completedCount = habits.filter(h => {
              const dayCompletion = h.dailyData?.find(day => day.date === dateStr);
              return dayCompletion?.completed;
            }).length;
            
            if (habits.length > 0) {
              monthTotal += (completedCount / habits.length) * 100;
              monthCount++;
            }
          }

          const avgRate = monthCount > 0 ? monthTotal / monthCount : 0;
          points.push({
            date: formatDateString(monthDate),
            value: Math.round(avgRate),
            label: monthDate.toLocaleDateString('en', { month: 'short' })
          });
        }
        break;

      case 'lastyear':
        // Monthly breakdown for last year
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(today.getFullYear() - 1, i, 1);
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          let monthTotal = 0;
          let monthCount = 0;

          for (let d = new Date(monthDate); d <= monthEnd; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDateString(d);
            const completedCount = habits.filter(h => {
              const dayCompletion = h.dailyData?.find(day => day.date === dateStr);
              return dayCompletion?.completed;
            }).length;
            
            if (habits.length > 0) {
              monthTotal += (completedCount / habits.length) * 100;
              monthCount++;
            }
          }

          const avgRate = monthCount > 0 ? monthTotal / monthCount : 0;
          points.push({
            date: formatDateString(monthDate),
            value: Math.round(avgRate),
            label: monthDate.toLocaleDateString('en', { month: 'short' })
          });
        }
        break;

      case 'alltime':
        // Quarterly breakdown
        const quarters = 8; // Last 2 years
        for (let i = quarters - 1; i >= 0; i--) {
          const quarterStart = new Date(today);
          quarterStart.setMonth(today.getMonth() - (i * 3 + 2));
          quarterStart.setDate(1);
          
          const quarterEnd = new Date(quarterStart);
          quarterEnd.setMonth(quarterStart.getMonth() + 3);
          quarterEnd.setDate(0);

          let quarterTotal = 0;
          let quarterCount = 0;

          for (let d = new Date(quarterStart); d <= quarterEnd && d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDateString(d);
            const completedCount = habits.filter(h => {
              const dayCompletion = h.dailyData?.find(day => day.date === dateStr);
              return dayCompletion?.completed;
            }).length;
            
            if (habits.length > 0) {
              quarterTotal += (completedCount / habits.length) * 100;
              quarterCount++;
            }
          }

          const avgRate = quarterCount > 0 ? quarterTotal / quarterCount : 0;
          const qNum = (Math.floor(quarterStart.getMonth() / 3) + 1);
          points.push({
            date: formatDateString(quarterStart),
            value: Math.round(avgRate),
            label: `Q${qNum}`
          });
        }
        break;

      default:
        // Custom range - use smart bucketing
        if (totalDays <= 7) {
          // Daily view
          for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = formatDateString(date);
            
            const completedCount = habits.filter(h => {
              const dayCompletion = h.dailyData?.find(d => d.date === dateStr);
              return dayCompletion?.completed;
            }).length;
            
            const rate = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
            points.push({
              date: dateStr,
              value: Math.round(rate),
              label: date.getDate().toString()
            });
          }
        } else if (totalDays <= 30) {
          // Weekly view
          const weeks = Math.ceil(totalDays / 7);
          for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (i * 7 + 6));
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() - (i * 7));

            let weekTotal = 0;
            let weekCount = 0;

            for (let d = new Date(weekStart); d <= weekEnd && d <= today; d.setDate(d.getDate() + 1)) {
              const dateStr = formatDateString(d);
              const completedCount = habits.filter(h => {
                const dayCompletion = h.dailyData?.find(day => day.date === dateStr);
                return dayCompletion?.completed;
              }).length;
              
              if (habits.length > 0) {
                weekTotal += (completedCount / habits.length) * 100;
                weekCount++;
              }
            }

            const avgRate = weekCount > 0 ? weekTotal / weekCount : 0;
            points.push({
              date: formatDateString(weekStart),
              value: Math.round(avgRate),
              label: `W${weeks - i}`
            });
          }
        } else {
          // Monthly view
          const months = Math.ceil(totalDays / 30);
          for (let i = months - 1; i >= 0; i--) {
            const monthDate = new Date(today);
            monthDate.setMonth(today.getMonth() - i);
            monthDate.setDate(1);
            
            const monthEnd = new Date(monthDate);
            monthEnd.setMonth(monthDate.getMonth() + 1);
            monthEnd.setDate(0);

            let monthTotal = 0;
            let monthCount = 0;

            for (let d = new Date(monthDate); d <= monthEnd && d <= today; d.setDate(d.getDate() + 1)) {
              const dateStr = formatDateString(d);
              const completedCount = habits.filter(h => {
                const dayCompletion = h.dailyData?.find(day => day.date === dateStr);
                return dayCompletion?.completed;
              }).length;
              
              if (habits.length > 0) {
                monthTotal += (completedCount / habits.length) * 100;
                monthCount++;
              }
            }

            const avgRate = monthCount > 0 ? monthTotal / monthCount : 0;
            points.push({
              date: formatDateString(monthDate),
              value: Math.round(avgRate),
              label: monthDate.toLocaleDateString('en', { month: 'short' })
            });
          }
        }
        break;
    }

    return points;
  }, [habits, selectedPeriod, totalDays]);

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    if (dataPoints.length === 0) return { avg: 0, max: 0, min: 0, trend: 0 };

    const values = dataPoints.map(p => p.value);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate trend (first half vs second half)
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = Math.round(secondAvg - firstAvg);

    return { avg, max, min, trend };
  }, [dataPoints]);

  /**
   * Scale data points to graph coordinates
   */
  const scaledPoints = useMemo(() => {
    if (dataPoints.length === 0) return [];

    const maxValue = Math.max(...dataPoints.map(p => p.value), 100);
    const minValue = Math.min(...dataPoints.map(p => p.value), 0);
    const range = maxValue - minValue || 1;

    return dataPoints.map((point, index) => {
      const x = padding.left + (index / (dataPoints.length - 1)) * graphWidth;
      const y = padding.top + graphHeight - ((point.value - minValue) / range) * graphHeight;
      return { ...point, x, y };
    });
  }, [dataPoints, graphWidth, graphHeight]);

  /**
   * Generate SVG path for line
   */
  const linePath = useMemo(() => {
    if (scaledPoints.length === 0) return '';

    const path = scaledPoints.map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      
      // Smooth curve using quadratic bezier
      const prevPoint = scaledPoints[index - 1];
      const controlX = (prevPoint.x + point.x) / 2;
      
      return `Q ${controlX} ${prevPoint.y}, ${point.x} ${point.y}`;
    }).join(' ');

    return path;
  }, [scaledPoints]);

  /**
   * Generate SVG path for area fill
   */
  const areaPath = useMemo(() => {
    if (scaledPoints.length === 0) return '';

    const bottomY = padding.top + graphHeight;
    const path = linePath + ` L ${scaledPoints[scaledPoints.length - 1].x} ${bottomY} L ${scaledPoints[0].x} ${bottomY} Z`;
    
    return path;
  }, [linePath, scaledPoints, graphHeight]);

  if (habits.length === 0) {
    return (
      <View className="mb-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Performance Trend
        </Text>
        <View className="items-center justify-center py-12">
          <Text className="text-4xl mb-2">📊</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            No data available yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Trend
        </Text>
        <View className="flex-row items-center">
          <Text className={`text-sm font-medium ${
            stats.trend > 0 
              ? 'text-green-600 dark:text-green-400' 
              : stats.trend < 0 
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {stats.trend > 0 ? '↑' : stats.trend < 0 ? '↓' : '→'} {Math.abs(stats.trend)}%
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row space-x-3 gap-4 px-1">
          <View className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 min-w-[100px]">
            <Text className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Average</Text>
            <Text className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {stats.avg}%
            </Text>
          </View>
          
          <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 min-w-[100px]">
            <Text className="text-xs text-green-600 dark:text-green-400 mb-1">Best</Text>
            <Text className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.max}%
            </Text>
          </View>
          
          <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 min-w-[100px]">
            <Text className="text-xs text-amber-600 dark:text-amber-400 mb-1">Lowest</Text>
            <Text className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {stats.min}%
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Chart */}
      <View className="bg-white dark:bg-gray-900 rounded-2xl  shadow-sm border border-gray-100 dark:border-gray-800">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = padding.top + graphHeight - (value / 100) * graphHeight;
            return (
              <React.Fragment key={`grid-${value}`}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
                <SvgText
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {value}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Area fill */}
          <Path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <Path
            d={linePath}
            stroke="#6366f1"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {scaledPoints.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          {/* X-axis labels */}
          {scaledPoints.map((point, index) => {
            // Show fewer labels on smaller screens
            const shouldShow = scaledPoints.length <= 7 || index % Math.ceil(scaledPoints.length / 6) === 0;
            
            if (!shouldShow) return null;

            return (
              <SvgText
                key={`label-${index}`}
                x={point.x}
                y={chartHeight - 10}
                fontSize="10"
                fill="#9CA3AF"
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-center mt-3">
        <View className="flex-row items-center mr-4">
          <View className="w-3 h-3 rounded-full bg-indigo-500 mr-2" />
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            Completion Rate
          </Text>
        </View>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          • {dataPoints.length} data points
        </Text>
      </View>
    </View>
  );
};

// Helper function
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default TrendChart;