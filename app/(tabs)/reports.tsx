// // OLD CODE
// // TimePeriodSelector - main control (today, this week, this month, last 6 months, this year, last year, custom)
// // Key Metrics Overview - Overall completion Rate, Active Streaks, Consistency, Total Days

// import React, { useState, useMemo } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';

// const { width } = Dimensions.get('window');

// interface HabitData {
//   id: string;
//   name: string;
//   icon: string;
//   completionRate: number;
//   currentStreak: number;
//   longestStreak: number;
//   totalDays: number;
//   consistencyScore: number;
//   momentum: number;
//   optimalTime: string;
//   difficulty: 'Easy' | 'Medium' | 'Hard';
//   weeklyPattern: number[];
//   monthlyTrend: number[];
//   correlationScore: number;
//   dailyData: { date: string; completed: boolean }[];
// }

// interface AIInsight {
//   type: 'prediction' | 'warning' | 'recommendation' | 'achievement';
//   title: string;
//   message: string;
//   confidence: number;
//   action?: string;
// }

// interface TimelineData {
//   date: string;
//   habits: { [key: string]: boolean };
//   mood: number;
//   energy: number;
//   weather: string;
// }

// type TimePeriod = 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom';

// const ReportScreen: React.FC = () => {
//   const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
//   const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
//   const [showCustomRange, setShowCustomRange] = useState(false);
//   const [customStartDate, setCustomStartDate] = useState(new Date());
//   const [customEndDate, setCustomEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // Generate mock daily data for the last 2 years
//   const generateDailyData = (habitId: string) => {
//     const data = [];
//     const today = new Date();
//     const startDate = new Date(today);
//     startDate.setFullYear(today.getFullYear() - 2);

//     for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
//       const randomSuccess = Math.random() > 0.3; // 70% success rate on average
//       data.push({
//         date: d.toISOString().split('T')[0],
//         completed: randomSuccess
//       });
//     }
//     return data;
//   };

//   // Mock data with daily tracking
//   const habitData: HabitData[] = [
//     {
//       id: '1',
//       name: 'Morning Meditation',
//       icon: '🧘',
//       completionRate: 92,
//       currentStreak: 12,
//       longestStreak: 28,
//       totalDays: 45,
//       consistencyScore: 94,
//       momentum: 88,
//       optimalTime: '7:00 AM',
//       difficulty: 'Medium',
//       weeklyPattern: [95, 90, 85, 92, 88, 78, 82],
//       monthlyTrend: [85, 87, 90, 92],
//       correlationScore: 0.85,
//       dailyData: generateDailyData('1')
//     },
//     {
//       id: '2',
//       name: 'Drink Water',
//       icon: '💧',
//       completionRate: 85,
//       currentStreak: 8,
//       longestStreak: 15,
//       totalDays: 60,
//       consistencyScore: 82,
//       momentum: 76,
//       optimalTime: 'Throughout day',
//       difficulty: 'Easy',
//       weeklyPattern: [90, 88, 85, 82, 80, 75, 85],
//       monthlyTrend: [78, 82, 85, 85],
//       correlationScore: 0.65,
//       dailyData: generateDailyData('2')
//     },
//     {
//       id: '3',
//       name: 'Exercise',
//       icon: '🏃',
//       completionRate: 65,
//       currentStreak: 3,
//       longestStreak: 8,
//       totalDays: 30,
//       consistencyScore: 68,
//       momentum: 72,
//       optimalTime: '6:00 PM',
//       difficulty: 'Hard',
//       weeklyPattern: [70, 75, 65, 68, 72, 55, 48],
//       monthlyTrend: [55, 62, 68, 65],
//       correlationScore: 0.42,
//       dailyData: generateDailyData('3')
//     },
//     {
//       id: '4',
//       name: 'Reading',
//       icon: '📖',
//       completionRate: 78,
//       currentStreak: 6,
//       longestStreak: 12,
//       totalDays: 35,
//       consistencyScore: 75,
//       momentum: 82,
//       optimalTime: '9:00 PM',
//       difficulty: 'Medium',
//       weeklyPattern: [85, 80, 75, 78, 82, 70, 72],
//       monthlyTrend: [70, 74, 78, 78],
//       correlationScore: 0.78,
//       dailyData: generateDailyData('4')
//     }
//   ];

//   // Dynamic data calculation based on selected period
//   const periodData = useMemo(() => {
//     const today = new Date();
//     let startDate = new Date();
//     let endDate = new Date();

//     switch (selectedPeriod) {
//       case 'today':
//         startDate = new Date(today);
//         endDate = new Date(today);
//         break;
//       case 'week':
//         startDate = new Date(today);
//         startDate.setDate(today.getDate() - 6);
//         endDate = new Date(today);
//         break;
//       case 'month':
//         startDate = new Date(today);
//         startDate.setDate(1);
//         endDate = new Date(today);
//         break;
//       case 'last6months':
//         startDate = new Date(today);
//         startDate.setMonth(today.getMonth() - 6);
//         endDate = new Date(today);
//         break;
//       case 'year':
//         startDate = new Date(today.getFullYear(), 0, 1);
//         endDate = new Date(today);
//         break;
//       case 'lastyear':
//         startDate = new Date(today.getFullYear() - 1, 0, 1);
//         endDate = new Date(today.getFullYear() - 1, 11, 31);
//         break;
//       case 'alltime':
//         startDate = new Date(today);
//         startDate.setFullYear(today.getFullYear() - 2);
//         endDate = new Date(today);
//         break;
//       case 'custom':
//         startDate = customStartDate;
//         endDate = customEndDate;
//         break;
//     }

//     // Calculate metrics for the selected period
//     const filteredData = habitData.map(habit => {
//       const periodDailyData = habit.dailyData.filter(day => {
//         const dayDate = new Date(day.date);
//         return dayDate >= startDate && dayDate <= endDate;
//       });

//       const completedDays = periodDailyData.filter(day => day.completed).length;
//       const totalDays = periodDailyData.length;
//       const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;


      
//       // Calculate current streak for the period
//       let currentStreak = 0;
//       for (let i = periodDailyData.length - 1; i >= 0; i--) {
//         if (periodDailyData[i].completed) {
//           currentStreak++;
//         } else {
//           break;
//         }
//       }

//       return {
//         ...habit,
//         completionRate,
//         currentStreak,
//         totalDays,
//         periodDailyData
//       };
//     });

//     const overallCompletionRate = Math.round(
//       filteredData.reduce((sum, habit) => sum + habit.completionRate, 0) / filteredData.length
//     );

//     const activeStreaks = filteredData.filter(habit => habit.currentStreak > 0).length;

//     const getPeriodLabel = (period: TimePeriod, start: Date, end: Date): string => {
//       const options: Intl.DateTimeFormatOptions = { 
//         month: 'short', 
//         day: 'numeric',
//         year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
//       };
  
//       switch (period) {
//         case 'today':
//           return 'Today';
//         case 'week':
//           return 'This Week';
//         case 'month':
//           return 'This Month';
//         case 'last6months':
//           return 'Last 6 Months';
//         case 'year':
//           return 'This Year';
//         case 'lastyear':
//           return 'Last Year';
//         case 'alltime':
//           return 'All Time';
//         case 'custom':
//           return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
//         default:
//           return 'Unknown Period';
//       }
//     };

//     return {
//       habits: filteredData,
//       overallMetrics: {
//         totalHabits: filteredData.length,
//         activeStreaks,
//         completionRate: overallCompletionRate,
//         consistencyScore: Math.min(overallCompletionRate + 10, 100),
//         momentum: Math.min(overallCompletionRate + 15, 100),
//         improvement: Math.floor(Math.random() * 20) + 5,
//         weeklyGoal: 85,
//         monthlyGoal: 80
//       },
//       periodLabel: getPeriodLabel(selectedPeriod, startDate, endDate),
//       totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
//     };
//   }, [selectedPeriod, customStartDate, customEndDate, habitData]);



//   const aiInsights: AIInsight[] = [
//     {
//       type: 'prediction',
//       title: 'High Success Probability',
//       message: `You have a ${94}% chance of completing all habits today based on your current patterns.`,
//       confidence: 94,
//       action: 'Stay consistent'
//     },
//     {
//       type: 'warning',
//       title: 'Streak Risk Alert',
//       message: 'Your exercise streak is at risk. Historical data shows 73% chance of missing workouts on busy days.',
//       confidence: 73,
//       action: 'Set reminder for 5:30 PM'
//     },
//     {
//       type: 'recommendation',
//       title: 'Optimal Habit Stacking',
//       message: 'Pairing meditation with reading increases completion rates by 31%. Try reading immediately after meditation.',
//       confidence: 89,
//       action: 'Try habit stacking'
//     },
//     {
//       type: 'achievement',
//       title: 'Consistency Milestone',
//       message: `You've achieved ${periodData.overallMetrics.consistencyScore}% consistency score for ${periodData.periodLabel.toLowerCase()}!`,
//       confidence: 100,
//       action: 'Celebrate progress'
//     }
//   ];

//   const periodOptions = [
//     { key: 'today', label: 'Today' },
//     { key: 'week', label: 'This Week' },
//     { key: 'month', label: 'This Month' },
//     { key: 'last6months', label: 'Last 6M' },
//     { key: 'year', label: 'This Year' },
//     { key: 'lastyear', label: 'Last Year' },
//     { key: 'alltime', label: 'All Time' },
//     { key: 'custom', label: 'Custom' }
//   ];

//   const TimePeriodSelector = () => (
//     <View className="mb-4">
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         className="flex-row"
//       >
//         {periodOptions.map((option, index) => (
//           <TouchableOpacity
//             key={option.key}
//             onPress={() => {
//               if (option.key === 'custom') {
//                 setShowCustomRange(true);
//               } else {
//                 setSelectedPeriod(option.key as TimePeriod);
//               }
//             }}
//             className={`py-2 px-4 rounded-full mr-2 ${
//               selectedPeriod === option.key 
//                 ? 'bg-blue-600 shadow-sm' 
//                 : 'bg-gray-100'
//             }`}
//           >
//             <Text className={`text-sm font-medium ${
//               selectedPeriod === option.key ? 'text-white' : 'text-gray-600'
//             }`}>
//               {option.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
      
//       <Text className="text-center text-gray-500 text-sm mt-2">
//         {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
//       </Text>
//     </View>
//   );

//   const CustomRangeModal = () => (
//     <Modal
//       visible={showCustomRange}
//       transparent
//       animationType="slide"
//     >
//       <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
//         <View className="bg-white rounded-xl p-6 m-4 w-80">
//           <Text className="text-lg font-semibold text-gray-800 mb-4">Select Custom Range</Text>
          
//           <View className="mb-4">
//             <Text className="text-sm text-gray-600 mb-2">Start Date</Text>
//             <TouchableOpacity
//               onPress={() => setShowStartPicker(true)}
//               className="border border-gray-300 rounded-lg p-3"
//             >
//               <Text className="text-gray-800">{customStartDate.toDateString()}</Text>
//             </TouchableOpacity>
//           </View>

//           <View className="mb-6">
//             <Text className="text-sm text-gray-600 mb-2">End Date</Text>
//             <TouchableOpacity
//               onPress={() => setShowEndPicker(true)}
//               className="border border-gray-300 rounded-lg p-3"
//             >
//               <Text className="text-gray-800">{customEndDate.toDateString()}</Text>
//             </TouchableOpacity>
//           </View>

//           <View className="flex-row justify-end">
//             <TouchableOpacity
//               onPress={() => setShowCustomRange(false)}
//               className="px-4 py-2 mr-2"
//             >
//               <Text className="text-gray-600">Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => {
//                 setSelectedPeriod('custom');
//                 setShowCustomRange(false);
//               }}
//               className="bg-blue-600 px-4 py-2 rounded-lg"
//             >
//               <Text className="text-white font-medium">Apply</Text>
//             </TouchableOpacity>
//           </View>

//           {showStartPicker && (
//             <DateTimePicker
//               value={customStartDate}
//               mode="date"
//               display="default"
//               onChange={(event, selectedDate) => {
//                 setShowStartPicker(false);
//                 if (selectedDate) {
//                   setCustomStartDate(selectedDate);
//                 }
//               }}
//             />
//           )}

//           {showEndPicker && (
//             <DateTimePicker
//               value={customEndDate}
//               mode="date"
//               display="default"
//               onChange={(event, selectedDate) => {
//                 setShowEndPicker(false);
//                 if (selectedDate) {
//                   setCustomEndDate(selectedDate);
//                 }
//               }}
//             />
//           )}
//         </View>
//       </View>
//     </Modal>
//   );

//   const MetricCard: React.FC<{ title: string; value: string; subtitle: string; color: string; trend?: number }> = ({ 
//     title, value, subtitle, color, trend 
//   }) => (
//     <View className="bg-white rounded-xl p-4 flex-1 mr-2 last:mr-0 shadow-sm">
//       <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1">{title}</Text>
//       <View className="flex-row items-end">
//         <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
//         {trend && (
//           <Text className={`text-sm ml-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
//             {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
//           </Text>
//         )}
//       </View>
//       <Text className="text-gray-400 text-xs mt-1">{subtitle}</Text>
//     </View>
//   );

//   const AIInsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
//     const getInsightColor = () => {
//       switch (insight.type) {
//         case 'prediction': return 'border-blue-200 bg-blue-50';
//         case 'warning': return 'border-orange-200 bg-orange-50';
//         case 'recommendation': return 'border-green-200 bg-green-50';
//         case 'achievement': return 'border-purple-200 bg-purple-50';
//         default: return 'border-gray-200 bg-gray-50';
//       }
//     };

//     const getIconColor = () => {
//       switch (insight.type) {
//         case 'prediction': return 'text-blue-600';
//         case 'warning': return 'text-orange-600';
//         case 'recommendation': return 'text-green-600';
//         case 'achievement': return 'text-purple-600';
//         default: return 'text-gray-600';
//       }
//     };

//     const getIcon = () => {
//       switch (insight.type) {
//         case 'prediction': return '🔮';
//         case 'warning': return '⚠️';
//         case 'recommendation': return '💡';
//         case 'achievement': return '🏆';
//         default: return '📊';
//       }
//     };

//     return (
//       <View className={`border-2 rounded-xl p-4 mb-3 ${getInsightColor()}`}>
//         <View className="flex-row items-center justify-between mb-2">
//           <View className="flex-row items-center">
//             <Text className="text-xl mr-2">{getIcon()}</Text>
//             <Text className="font-semibold text-gray-800">{insight.title}</Text>
//           </View>
//           <View className="bg-white px-2 py-1 rounded-full">
//             <Text className="text-xs text-gray-600">{insight.confidence}%</Text>
//           </View>
//         </View>
//         <Text className="text-gray-700 text-sm mb-3">{insight.message}</Text>
//         {insight.action && (
//           <TouchableOpacity className="bg-white border border-gray-200 rounded-lg px-3 py-2 self-start">
//             <Text className={`text-sm font-medium ${getIconColor()}`}>{insight.action}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   const HeatmapCalendar = () => {
//     // Generate heatmap data based on selected period
//     const generateHeatmapData = () => {
//       const today = new Date();
//       const startDate = new Date(today);
//       startDate.setDate(today.getDate() - 27); // Show last 4 weeks

//       const weeks = [];
//       let currentWeek = [];
      
//       for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
//         const dayOfWeek = d.getDay();
//         if (dayOfWeek === 0 && currentWeek.length > 0) {
//           weeks.push([...currentWeek]);
//           currentWeek = [];
//         }
        
//         const completed = Math.random() > 0.3; // Mock completion data
//         currentWeek.push(completed ? 1 : 0);
//       }
      
//       if (currentWeek.length > 0) {
//         // Pad the last week with zeros if needed
//         while (currentWeek.length < 7) {
//           currentWeek.push(0);
//         }
//         weeks.push(currentWeek);
//       }
      
//       return weeks;
//     };

//     const weeklyHeatmapData = generateHeatmapData();

//     return (
//       <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">Completion Heatmap</Text>
//         <View className="flex-row justify-between mb-2">
//           {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
//             <Text key={index} className="text-xs text-gray-500 w-6 text-center">{day}</Text>
//           ))}
//         </View>
//         {weeklyHeatmapData.map((week, weekIndex) => (
//           <View key={weekIndex} className="flex-row justify-between mb-1">
//             {week.map((day, dayIndex) => (
//               <View
//                 key={dayIndex}
//                 className={`w-6 h-6 rounded-sm ${
//                   day ? 'bg-green-500' : 'bg-gray-200'
//                 }`}
//               />
//             ))}
//           </View>
//         ))}
//         <View className="flex-row justify-between items-center mt-3">
//           <Text className="text-xs text-gray-500">Less</Text>
//           <View className="flex-row">
//             {[1, 2, 3, 4, 5].map((level) => (
//               <View
//                 key={level}
//                 className={`w-3 h-3 rounded-sm mr-1 ${
//                   level <= 2 ? 'bg-gray-200' : level <= 4 ? 'bg-green-300' : 'bg-green-500'
//                 }`}
//               />
//             ))}
//           </View>
//           <Text className="text-xs text-gray-500">More</Text>
//         </View>
//       </View>
//     );
//   };

//   const TrendChart: React.FC<{ data: number[]; title: string; color: string }> = ({ data, title, color }) => {
//     const maxValue = Math.max(...data);
//     const minValue = Math.min(...data);
//     const range = maxValue - minValue;

//     return (
//       <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">{title}</Text>
//         <View className="flex-row items-end justify-between h-32">
//           {data.map((value, index) => {
//             const height = range === 0 ? 50 : ((value - minValue) / range) * 100 + 20;
//             return (
//               <View key={index} className="flex-1 items-center">
//                 <View
//                   className={`${color} rounded-t-lg w-8`}
//                   style={{ height: `${height}%` }}
//                 />
//                 <Text className="text-xs text-gray-500 mt-2">{value}%</Text>
//               </View>
//             );
//           })}
//         </View>
//       </View>
//     );
//   };

//   const HabitDetailCard: React.FC<{ habit: any }> = ({ habit }) => (
//     <TouchableOpacity
//       onPress={() => setSelectedHabit(selectedHabit === habit.id ? null : habit.id)}
//       className="bg-white rounded-xl p-4 mb-3 shadow-sm"
//     >
//       <View className="flex-row items-center justify-between mb-3">
//         <View className="flex-row items-center">
//           <Text className="text-2xl mr-3">{habit.icon}</Text>
//           <View>
//             <Text className="text-gray-800 font-semibold">{habit.name}</Text>
//             <Text className="text-gray-500 text-xs">
//               {habit.totalDays} day{habit.totalDays !== 1 ? 's' : ''} tracked
//             </Text>
//           </View>
//         </View>
//         <View className="items-end">
//           <Text className="text-xl font-bold text-gray-800">{habit.completionRate}%</Text>
//           <View className={`px-2 py-1 rounded-full ${
//             habit.difficulty === 'Easy' ? 'bg-green-100' :
//             habit.difficulty === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
//           }`}>
//             <Text className={`text-xs ${
//               habit.difficulty === 'Easy' ? 'text-green-700' :
//               habit.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'
//             }`}>
//               {habit.difficulty}
//             </Text>
//           </View>
//         </View>
//       </View>
      
//       <View className="flex-row justify-between mb-3">
//         <View className="flex-1 mr-2">
//           <Text className="text-xs text-gray-500 mb-1">Completion Rate</Text>
//           <View className="bg-gray-200 h-2 rounded-full">
//             <View 
//               className="bg-blue-500 h-2 rounded-full"
//               style={{ width: `${habit.completionRate}%` }}
//             />
//           </View>
//           <Text className="text-xs text-gray-700 mt-1">{habit.completionRate}%</Text>
//         </View>
//         <View className="flex-1 ml-2">
//           <Text className="text-xs text-gray-500 mb-1">Current Streak</Text>
//           <View className="bg-gray-200 h-2 rounded-full">
//             <View 
//               className="bg-green-500 h-2 rounded-full"
//               style={{ width: `${Math.min((habit.currentStreak / 30) * 100, 100)}%` }}
//             />
//           </View>
//           <Text className="text-xs text-gray-700 mt-1">{habit.currentStreak} days</Text>
//         </View>
//       </View>

//       <View className="flex-row justify-between">
//         <Text className="text-sm text-gray-600">Current: {habit.currentStreak} days</Text>
//         <Text className="text-sm text-gray-600">Total: {habit.totalDays} days</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <ScrollView className="app-background" showsVerticalScrollIndicator={false}>
//       <View className="p-4">
//         {/* Time Period Selector */}
//         <TimePeriodSelector />

//         {/* Custom Range Modal */}
//         <CustomRangeModal />

//         {/* Key Metrics Overview */}
//         <View className="flex-row mb-4">
//           <MetricCard 
//             title="Overall Rate" 
//             value={`${periodData.overallMetrics.completionRate}%`}
//             subtitle={periodData.periodLabel}
//             color="text-blue-600"
//             trend={periodData.overallMetrics.improvement}
//           />
//           <MetricCard 
//             title="Active Streaks" 
//             value={`${periodData.overallMetrics.activeStreaks}`}
//             subtitle={`Of ${periodData.overallMetrics.totalHabits} habits`}
//             color="text-green-600"
//           />
//         </View>

//         <View className="flex-row mb-4">
//           <MetricCard 
//             title="Consistency" 
//             value={`${periodData.overallMetrics.consistencyScore}`}
//             subtitle="Score"
//             color="text-purple-600"
//             trend={15}
//           />
//           <MetricCard 
//             title="Total Days" 
//             value={`${periodData.totalDays}`}
//             subtitle="In period"
//             color="text-orange-600"
//           />
//         </View>

//         {/* AI Insights */}
//         <Text className="text-xl font-bold text-gray-800 mb-4">🤖 AI Insights</Text>
//         {aiInsights.map((insight, index) => (
//           <AIInsightCard key={index} insight={insight} />
//         ))}

//         {/* Heatmap Calendar */}
//         <HeatmapCalendar />

//         {/* Trend Analysis */}
//         <TrendChart 
//           data={[
//             Math.max(periodData.overallMetrics.completionRate - 15, 0),
//             Math.max(periodData.overallMetrics.completionRate - 8, 0),
//             Math.max(periodData.overallMetrics.completionRate - 3, 0),
//             periodData.overallMetrics.completionRate
//           ]} 
//           title={`Completion Trend - ${periodData.periodLabel}`}
//           color="bg-blue-500" 
//         />

//         {/* Detailed Habit Performance */}
//         <Text className="text-xl font-bold text-gray-800 mb-4">📊 Habit Performance</Text>
//         {periodData.habits.map((habit) => (
//           <HabitDetailCard key={habit.id} habit={habit} />
//         ))}

//         {/* Performance Summary */}
//         <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
//           <Text className="text-lg font-semibold text-gray-800 mb-4">Period Summary</Text>
//           <View className="space-y-2">
//             <Text className="text-sm text-gray-600">
//               Period: {periodData.periodLabel}
//             </Text>
//             <Text className="text-sm text-gray-600">
//               Total Days Tracked: {periodData.totalDays}
//             </Text>
//             <Text className="text-sm text-gray-600">
//               Overall Completion: {periodData.overallMetrics.completionRate}%
//             </Text>
//             <Text className="text-sm text-gray-600">
//               Active Streaks: {periodData.overallMetrics.activeStreaks}/{periodData.overallMetrics.totalHabits}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default ReportScreen;







// import React, { useState, useMemo } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { HabitData, AIInsight, TimelineData, TimePeriod, PeriodOption } from '@/interfaces/interfaces';

// import TimePeriodSelector from '../components/reports/TimePeriodSelector';
// import CustomRangeModal from '../components/reports/CustomRangeModal';
// import MetricsOverview from '../components/reports/MetricsOverview';
// import AIInsightsCard  from '../components/reports/AIInsightCard';
// import HeatmapCalendar from '../components/reports/HeatMapCalendar';
// import TrendChart from '../components/reports/TrendChart';
// import HabitDetailCard from '../components/reports/HabitDetailCard';
// import PerformanceSummary from '../components/reports/PerformanceSummary';


// const { width } = Dimensions.get('window');



// const ReportScreen: React.FC = () => {
//   const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
//   const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
//   const [showCustomRange, setShowCustomRange] = useState(false);
//   const [customStartDate, setCustomStartDate] = useState(new Date());
//   const [customEndDate, setCustomEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // Generate mock daily data for the last 2 years
//   const generateDailyData = (habitId: string) => {
//     const data = [];
//     const today = new Date();
//     const startDate = new Date(today);
//     startDate.setFullYear(today.getFullYear() - 2);

//     for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
//       const randomSuccess = Math.random() > 0.3; // 70% success rate on average
//       data.push({
//         date: d.toISOString().split('T')[0],
//         completed: randomSuccess
//       });
//     }
//     return data;
//   };

//   // Mock data with daily tracking
//   const habitData: HabitData[] = [
//     {
//       id: '1',
//       name: 'Morning Meditation',
//       icon: '🧘',
//       completionRate: 92,
//       currentStreak: 12,
//       longestStreak: 28,
//       totalDays: 45,
//       consistencyScore: 94,
//       momentum: 88,
//       optimalTime: '7:00 AM',
//       difficulty: 'Medium',
//       weeklyPattern: [95, 90, 85, 92, 88, 78, 82],
//       monthlyTrend: [85, 87, 90, 92],
//       correlationScore: 0.85,
//       dailyData: generateDailyData('1')
//     },
//     {
//       id: '2',
//       name: 'Drink Water',
//       icon: '💧',
//       completionRate: 85,
//       currentStreak: 8,
//       longestStreak: 15,
//       totalDays: 60,
//       consistencyScore: 82,
//       momentum: 76,
//       optimalTime: 'Throughout day',
//       difficulty: 'Easy',
//       weeklyPattern: [90, 88, 85, 82, 80, 75, 85],
//       monthlyTrend: [78, 82, 85, 85],
//       correlationScore: 0.65,
//       dailyData: generateDailyData('2')
//     },
//     {
//       id: '3',
//       name: 'Exercise',
//       icon: '🏃',
//       completionRate: 65,
//       currentStreak: 3,
//       longestStreak: 8,
//       totalDays: 30,
//       consistencyScore: 68,
//       momentum: 72,
//       optimalTime: '6:00 PM',
//       difficulty: 'Hard',
//       weeklyPattern: [70, 75, 65, 68, 72, 55, 48],
//       monthlyTrend: [55, 62, 68, 65],
//       correlationScore: 0.42,
//       dailyData: generateDailyData('3')
//     },
//     {
//       id: '4',
//       name: 'Reading',
//       icon: '📖',
//       completionRate: 78,
//       currentStreak: 6,
//       longestStreak: 12,
//       totalDays: 35,
//       consistencyScore: 75,
//       momentum: 82,
//       optimalTime: '9:00 PM',
//       difficulty: 'Medium',
//       weeklyPattern: [85, 80, 75, 78, 82, 70, 72],
//       monthlyTrend: [70, 74, 78, 78],
//       correlationScore: 0.78,
//       dailyData: generateDailyData('4')
//     }
//   ];

//   // Dynamic data calculation based on selected period
//   const periodData = useMemo(() => {
//     const today = new Date();
//     let startDate = new Date();
//     let endDate = new Date();

//     switch (selectedPeriod) {
//       case 'today':
//         startDate = new Date(today);
//         endDate = new Date(today);
//         break;
//       case 'week':
//         startDate = new Date(today);
//         startDate.setDate(today.getDate() - 6);
//         endDate = new Date(today);
//         break;
//       case 'month':
//         startDate = new Date(today);
//         startDate.setDate(1);
//         endDate = new Date(today);
//         break;
//       case 'last6months':
//         startDate = new Date(today);
//         startDate.setMonth(today.getMonth() - 6);
//         endDate = new Date(today);
//         break;
//       case 'year':
//         startDate = new Date(today.getFullYear(), 0, 1);
//         endDate = new Date(today);
//         break;
//       case 'lastyear':
//         startDate = new Date(today.getFullYear() - 1, 0, 1);
//         endDate = new Date(today.getFullYear() - 1, 11, 31);
//         break;
//       case 'alltime':
//         startDate = new Date(today);
//         startDate.setFullYear(today.getFullYear() - 2);
//         endDate = new Date(today);
//         break;
//       case 'custom':
//         startDate = customStartDate;
//         endDate = customEndDate;
//         break;
//     }

//     // Calculate metrics for the selected period
//     const filteredData = habitData.map(habit => {
//       const periodDailyData = habit.dailyData.filter(day => {
//         const dayDate = new Date(day.date);
//         return dayDate >= startDate && dayDate <= endDate;
//       });

//       const completedDays = periodDailyData.filter(day => day.completed).length;
//       const totalDays = periodDailyData.length;
//       const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;


      
//       // Calculate current streak for the period
//       let currentStreak = 0;
//       for (let i = periodDailyData.length - 1; i >= 0; i--) {
//         if (periodDailyData[i].completed) {
//           currentStreak++;
//         } else {
//           break;
//         }
//       }

//       return {
//         ...habit,
//         completionRate,
//         currentStreak,
//         totalDays,
//         periodDailyData
//       };
//     });

//     const overallCompletionRate = Math.round(
//       filteredData.reduce((sum, habit) => sum + habit.completionRate, 0) / filteredData.length
//     );

//     const activeStreaks = filteredData.filter(habit => habit.currentStreak > 0).length;

//     const getPeriodLabel = (period: TimePeriod, start: Date, end: Date): string => {
//       const options: Intl.DateTimeFormatOptions = { 
//         month: 'short', 
//         day: 'numeric',
//         year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
//       };
  
//       switch (period) {
//         case 'today':
//           return 'Today';
//         case 'week':
//           return 'This Week';
//         case 'month':
//           return 'This Month';
//         case 'last6months':
//           return 'Last 6 Months';
//         case 'year':
//           return 'This Year';
//         case 'lastyear':
//           return 'Last Year';
//         case 'alltime':
//           return 'All Time';
//         case 'custom':
//           return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
//         default:
//           return 'Unknown Period';
//       }
//     };

//     return {
//       habits: filteredData,
//       overallMetrics: {
//         totalHabits: filteredData.length,
//         activeStreaks,
//         completionRate: overallCompletionRate,
//         consistencyScore: Math.min(overallCompletionRate + 10, 100),
//         momentum: Math.min(overallCompletionRate + 15, 100),
//         improvement: Math.floor(Math.random() * 20) + 5,
//         weeklyGoal: 85,
//         monthlyGoal: 80
//       },
//       periodLabel: getPeriodLabel(selectedPeriod, startDate, endDate),
//       totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
//     };
//   }, [selectedPeriod, customStartDate, customEndDate, habitData]);



//   const aiInsights: AIInsight[] = [
//     {
//       type: 'prediction',
//       title: 'High Success Probability',
//       message: `You have a ${94}% chance of completing all habits today based on your current patterns.`,
//       confidence: 94,
//       action: 'Stay consistent'
//     },
//     {
//       type: 'warning',
//       title: 'Streak Risk Alert',
//       message: 'Your exercise streak is at risk. Historical data shows 73% chance of missing workouts on busy days.',
//       confidence: 73,
//       action: 'Set reminder for 5:30 PM'
//     },
//     {
//       type: 'recommendation',
//       title: 'Optimal Habit Stacking',
//       message: 'Pairing meditation with reading increases completion rates by 31%. Try reading immediately after meditation.',
//       confidence: 89,
//       action: 'Try habit stacking'
//     },
//     {
//       type: 'achievement',
//       title: 'Consistency Milestone',
//       message: `You've achieved ${periodData.overallMetrics.consistencyScore}% consistency score for ${periodData.periodLabel.toLowerCase()}!`,
//       confidence: 100,
//       action: 'Celebrate progress'
//     }
//   ];

//   const periodOptions: PeriodOption[] = [
//     { key: 'today', label: 'Today' },
//     { key: 'week', label: 'This Week' },
//     { key: 'month', label: 'This Month' },
//     { key: 'last6months', label: 'Last 6M' },
//     { key: 'year', label: 'This Year' },
//     { key: 'lastyear', label: 'Last Year' },
//     { key: 'alltime', label: 'All Time' },
//     { key: 'custom', label: 'Custom' }
//   ];

//   // const TimePeriodSelector = () => (


//   //   <View className="mb-4">
//   //     <ScrollView 
//   //       horizontal 
//   //       showsHorizontalScrollIndicator={false}
//   //       className="flex-row"
//   //     >
//   //       {periodOptions.map((option, index) => (
//   //         <TouchableOpacity
//   //           key={option.key}
//   //           onPress={() => {
//   //             if (option.key === 'custom') {
//   //               setShowCustomRange(true);
//   //             } else {
//   //               setSelectedPeriod(option.key as TimePeriod);
//   //             }
//   //           }}
//   //           className={`py-2 px-4 rounded-full mr-2 ${
//   //             selectedPeriod === option.key 
//   //               ? 'bg-blue-600 shadow-sm' 
//   //               : 'bg-gray-100'
//   //           }`}
//   //         >
//   //           <Text className={`text-sm font-medium ${
//   //             selectedPeriod === option.key ? 'text-white' : 'text-gray-600'
//   //           }`}>
//   //             {option.label}
//   //           </Text>
//   //         </TouchableOpacity>
//   //       ))}
//   //     </ScrollView>
      
//   //     <Text className="text-center text-gray-500 text-sm mt-2">
//   //       {periodData.periodLabel} • {periodData.totalDays} day{periodData.totalDays !== 1 ? 's' : ''}
//   //     </Text>
//   //   </View>
//   // );
// const handlePeriodSelect = (period: TimePeriod) => {
//   console.log('[Handler] Period selected:', period);
//   if (period === 'custom') {
//     setShowCustomRange(true);
//   } else {
//     // 🛠 Small delay to avoid overlapping renders
//    setSelectedPeriod(period);
//   }
// };


//   const CustomRangeModal = () => (
//     <Modal
//       visible={showCustomRange}
//       transparent
//       animationType="slide"
//     >
//       <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
//         <View className="bg-white rounded-xl p-6 m-4 w-80">
//           <Text className="text-lg font-semibold text-gray-800 mb-4">Select Custom Range</Text>
          
//           <View className="mb-4">
//             <Text className="text-sm text-gray-600 mb-2">Start Date</Text>
//             <TouchableOpacity
//               onPress={() => setShowStartPicker(true)}
//               className="border border-gray-300 rounded-lg p-3"
//             >
//               <Text className="text-gray-800">{customStartDate.toDateString()}</Text>
//             </TouchableOpacity>
//           </View>

//           <View className="mb-6">
//             <Text className="text-sm text-gray-600 mb-2">End Date</Text>
//             <TouchableOpacity
//               onPress={() => setShowEndPicker(true)}
//               className="border border-gray-300 rounded-lg p-3"
//             >
//               <Text className="text-gray-800">{customEndDate.toDateString()}</Text>
//             </TouchableOpacity>
//           </View>

//           <View className="flex-row justify-end">
//             <TouchableOpacity
//               onPress={() => setShowCustomRange(false)}
//               className="px-4 py-2 mr-2"
//             >
//               <Text className="text-gray-600">Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => {
//                 setSelectedPeriod('custom');
//                 setShowCustomRange(false);
//               }}
//               className="bg-blue-600 px-4 py-2 rounded-lg"
//             >
//               <Text className="text-white font-medium">Apply</Text>
//             </TouchableOpacity>
//           </View>

//           {showStartPicker && (
//             <DateTimePicker
//               value={customStartDate}
//               mode="date"
//               display="default"
//               onChange={(event, selectedDate) => {
//                 setShowStartPicker(false);
//                 if (selectedDate) {
//                   setCustomStartDate(selectedDate);
//                 }
//               }}
//             />
//           )}

//           {showEndPicker && (
//             <DateTimePicker
//               value={customEndDate}
//               mode="date"
//               display="default"
//               onChange={(event, selectedDate) => {
//                 setShowEndPicker(false);
//                 if (selectedDate) {
//                   setCustomEndDate(selectedDate);
//                 }
//               }}
//             />
//           )}
//         </View>
//       </View>
//     </Modal>
//   );

//   const MetricCard: React.FC<{ title: string; value: string; subtitle: string; color: string; trend?: number }> = ({ 
//     title, value, subtitle, color, trend 
//   }) => (
//     <View className="bg-white rounded-xl p-4 flex-1 mr-2 last:mr-0 shadow-sm">
//       <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1">{title}</Text>
//       <View className="flex-row items-end">
//         <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
//         {trend && (
//           <Text className={`text-sm ml-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
//             {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
//           </Text>
//         )}
//       </View>
//       <Text className="text-gray-400 text-xs mt-1">{subtitle}</Text>
//     </View>
//   );

//   const AIInsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
//     const getInsightColor = () => {
//       switch (insight.type) {
//         case 'prediction': return 'border-blue-200 bg-blue-50';
//         case 'warning': return 'border-orange-200 bg-orange-50';
//         case 'recommendation': return 'border-green-200 bg-green-50';
//         case 'achievement': return 'border-purple-200 bg-purple-50';
//         default: return 'border-gray-200 bg-gray-50';
//       }
//     };

//     const getIconColor = () => {
//       switch (insight.type) {
//         case 'prediction': return 'text-blue-600';
//         case 'warning': return 'text-orange-600';
//         case 'recommendation': return 'text-green-600';
//         case 'achievement': return 'text-purple-600';
//         default: return 'text-gray-600';
//       }
//     };

//     const getIcon = () => {
//       switch (insight.type) {
//         case 'prediction': return '🔮';
//         case 'warning': return '⚠️';
//         case 'recommendation': return '💡';
//         case 'achievement': return '🏆';
//         default: return '📊';
//       }
//     };

//     return (
//       <View className={`border-2 rounded-xl p-4 mb-3 ${getInsightColor()}`}>
//         <View className="flex-row items-center justify-between mb-2">
//           <View className="flex-row items-center">
//             <Text className="text-xl mr-2">{getIcon()}</Text>
//             <Text className="font-semibold text-gray-800">{insight.title}</Text>
//           </View>
//           <View className="bg-white px-2 py-1 rounded-full">
//             <Text className="text-xs text-gray-600">{insight.confidence}%</Text>
//           </View>
//         </View>
//         <Text className="text-gray-700 text-sm mb-3">{insight.message}</Text>
//         {insight.action && (
//           <TouchableOpacity className="bg-white border border-gray-200 rounded-lg px-3 py-2 self-start">
//             <Text className={`text-sm font-medium ${getIconColor()}`}>{insight.action}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   const HeatmapCalendar = () => {
//     // Generate heatmap data based on selected period
//     const generateHeatmapData = () => {
//       const today = new Date();
//       const startDate = new Date(today);
//       startDate.setDate(today.getDate() - 27); // Show last 4 weeks

//       const weeks = [];
//       let currentWeek = [];
      
//       for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
//         const dayOfWeek = d.getDay();
//         if (dayOfWeek === 0 && currentWeek.length > 0) {
//           weeks.push([...currentWeek]);
//           currentWeek = [];
//         }
        
//         const completed = Math.random() > 0.3; // Mock completion data
//         currentWeek.push(completed ? 1 : 0);
//       }
      
//       if (currentWeek.length > 0) {
//         // Pad the last week with zeros if needed
//         while (currentWeek.length < 7) {
//           currentWeek.push(0);
//         }
//         weeks.push(currentWeek);
//       }
      
//       return weeks;
//     };

//     const weeklyHeatmapData = generateHeatmapData();

//     return (
//       <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">Completion Heatmap</Text>
//         <View className="flex-row justify-between mb-2">
//           {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
//             <Text key={index} className="text-xs text-gray-500 w-6 text-center">{day}</Text>
//           ))}
//         </View>
//         {weeklyHeatmapData.map((week, weekIndex) => (
//           <View key={weekIndex} className="flex-row justify-between mb-1">
//             {week.map((day, dayIndex) => (
//               <View
//                 key={dayIndex}
//                 className={`w-6 h-6 rounded-sm ${
//                   day ? 'bg-green-500' : 'bg-gray-200'
//                 }`}
//               />
//             ))}
//           </View>
//         ))}
//         <View className="flex-row justify-between items-center mt-3">
//           <Text className="text-xs text-gray-500">Less</Text>
//           <View className="flex-row">
//             {[1, 2, 3, 4, 5].map((level) => (
//               <View
//                 key={level}
//                 className={`w-3 h-3 rounded-sm mr-1 ${
//                   level <= 2 ? 'bg-gray-200' : level <= 4 ? 'bg-green-300' : 'bg-green-500'
//                 }`}
//               />
//             ))}
//           </View>
//           <Text className="text-xs text-gray-500">More</Text>
//         </View>
//       </View>
//     );
//   };

//   const TrendChart: React.FC<{ data: number[]; title: string; color: string }> = ({ data, title, color }) => {
//     const maxValue = Math.max(...data);
//     const minValue = Math.min(...data);
//     const range = maxValue - minValue;

//     return (
//       <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">{title}</Text>
//         <View className="flex-row items-end justify-between h-32">
//           {data.map((value, index) => {
//             const height = range === 0 ? 50 : ((value - minValue) / range) * 100 + 20;
//             return (
//               <View key={index} className="flex-1 items-center">
//                 <View
//                   className={`${color} rounded-t-lg w-8`}
//                   style={{ height: `${height}%` }}
//                 />
//                 <Text className="text-xs text-gray-500 mt-2">{value}%</Text>
//               </View>
//             );
//           })}
//         </View>
//       </View>
//     );
//   };

//   const HabitDetailCard: React.FC<{ habit: any }> = ({ habit }) => (
//     <TouchableOpacity
//       onPress={() => setSelectedHabit(selectedHabit === habit.id ? null : habit.id)}
//       className="bg-white rounded-xl p-4 mb-3 shadow-sm"
//     >
//       <View className="flex-row items-center justify-between mb-3">
//         <View className="flex-row items-center">
//           <Text className="text-2xl mr-3">{habit.icon}</Text>
//           <View>
//             <Text className="text-gray-800 font-semibold">{habit.name}</Text>
//             <Text className="text-gray-500 text-xs">
//               {habit.totalDays} day{habit.totalDays !== 1 ? 's' : ''} tracked
//             </Text>
//           </View>
//         </View>
//         <View className="items-end">
//           <Text className="text-xl font-bold text-gray-800">{habit.completionRate}%</Text>
//           <View className={`px-2 py-1 rounded-full ${
//             habit.difficulty === 'Easy' ? 'bg-green-100' :
//             habit.difficulty === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
//           }`}>
//             <Text className={`text-xs ${
//               habit.difficulty === 'Easy' ? 'text-green-700' :
//               habit.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'
//             }`}>
//               {habit.difficulty}
//             </Text>
//           </View>
//         </View>
//       </View>
      
//       <View className="flex-row justify-between mb-3">
//         <View className="flex-1 mr-2">
//           <Text className="text-xs text-gray-500 mb-1">Completion Rate</Text>
//           <View className="bg-gray-200 h-2 rounded-full">
//             <View 
//               className="bg-blue-500 h-2 rounded-full"
//               style={{ width: `${habit.completionRate}%` }}
//             />
//           </View>
//           <Text className="text-xs text-gray-700 mt-1">{habit.completionRate}%</Text>
//         </View>
//         <View className="flex-1 ml-2">
//           <Text className="text-xs text-gray-500 mb-1">Current Streak</Text>
//           <View className="bg-gray-200 h-2 rounded-full">
//             <View 
//               className="bg-green-500 h-2 rounded-full"
//               style={{ width: `${Math.min((habit.currentStreak / 30) * 100, 100)}%` }}
//             />
//           </View>
//           <Text className="text-xs text-gray-700 mt-1">{habit.currentStreak} days</Text>
//         </View>
//       </View>

//       <View className="flex-row justify-between">
//         <Text className="text-sm text-gray-600">Current: {habit.currentStreak} days</Text>
//         <Text className="text-sm text-gray-600">Total: {habit.totalDays} days</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <ScrollView className="app-background" showsVerticalScrollIndicator={false}>
//       <View className="p-4">
//         {/* Time Period Selector */}
//          <TimePeriodSelector
//           selectedPeriod={selectedPeriod}
//           periodOptions={periodOptions}
//           periodData={periodData}
//           onPeriodSelect={handlePeriodSelect}
//         />

//         {/* Custom Range Modal */}
//         <CustomRangeModal />

//         {/* Key Metrics Overview */}
//         <View className="flex-row mb-4">
//           <MetricCard 
//             title="Overall Rate" 
//             value={`${periodData.overallMetrics.completionRate}%`}
//             subtitle={periodData.periodLabel}
//             color="text-blue-600"
//             trend={periodData.overallMetrics.improvement}
//           />
//           <MetricCard 
//             title="Active Streaks" 
//             value={`${periodData.overallMetrics.activeStreaks}`}
//             subtitle={`Of ${periodData.overallMetrics.totalHabits} habits`}
//             color="text-green-600"
//           />
//         </View>

//         <View className="flex-row mb-4">
//           <MetricCard 
//             title="Consistency" 
//             value={`${periodData.overallMetrics.consistencyScore}`}
//             subtitle="Score"
//             color="text-purple-600"
//             trend={15}
//           />
//           <MetricCard 
//             title="Total Days" 
//             value={`${periodData.totalDays}`}
//             subtitle="In period"
//             color="text-orange-600"
//           />
//         </View>

//         {/* AI Insights */}
//         <Text className="text-xl font-bold text-gray-800 mb-4">🤖 AI Insights</Text>
//         {aiInsights.map((insight, index) => (
//           <AIInsightCard key={index} insight={insight} />
//         ))}

//         {/* Heatmap Calendar */}
//         <HeatmapCalendar />

//         {/* Trend Analysis */}
//         <TrendChart 
//           data={[
//             Math.max(periodData.overallMetrics.completionRate - 15, 0),
//             Math.max(periodData.overallMetrics.completionRate - 8, 0),
//             Math.max(periodData.overallMetrics.completionRate - 3, 0),
//             periodData.overallMetrics.completionRate
//           ]} 
//           title={`Completion Trend - ${periodData.periodLabel}`}
//           color="bg-blue-500" 
//         />

//         {/* Detailed Habit Performance */}
//         <Text className="text-xl font-bold text-gray-800 mb-4">📊 Habit Performance</Text>
//         {periodData.habits.map((habit) => (
//           <HabitDetailCard key={habit.id} habit={habit} />
//         ))}

//         {/* Performance Summary */}
//         <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
//           <Text className="text-lg font-semibold text-gray-800 mb-4">Period Summary</Text>
//           <View className="space-y-2">
//             <Text className="text-sm text-gray-600">
//               Period: {periodData.periodLabel}
//             </Text>
//             <Text className="text-sm text-gray-600">
//               Total Days Tracked: {periodData.totalDays}
//             </Text>
//             <Text className="text-sm text-gray-600">
//               Overall Completion: {periodData.overallMetrics.completionRate}%
//             </Text>
//             <Text className="text-sm text-gray-600">
//               Active Streaks: {periodData.overallMetrics.activeStreaks}/{periodData.overallMetrics.totalHabits}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default ReportScreen;