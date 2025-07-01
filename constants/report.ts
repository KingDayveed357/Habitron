// import { HabitData } from '@/interfaces/interfaces';
// import { AIInsight } from '@/interfaces/interfaces';
// import { PeriodData } from '@/interfaces/interfaces';
// import { selectedPeriod } from '@/app/(tabs)/report';
// import { useMemo } from 'react';
// import { customStartDate } from '@/app/(tabs)/report';
// import { customEndDate } from '@/app/(tabs)/report';
// import { TimePeriod } from '@/interfaces/interfaces';

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
//   export const habitData: HabitData[] = [
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
// export const periodData = useMemo(() => {
//   const today = new Date();
//   let startDate = new Date();
//   let endDate = new Date();

//   switch (selectedPeriod) {
//     case 'today':
//       startDate = new Date(today);
//       endDate = new Date(today);
//       break;
//     case 'week':
//       startDate = new Date(today);
//       startDate.setDate(today.getDate() - 6);
//       endDate = new Date(today);
//       break;
//     case 'month':
//       startDate = new Date(today);
//       startDate.setDate(1);
//       endDate = new Date(today);
//       break;
//     case 'last6months':
//       startDate = new Date(today);
//       startDate.setMonth(today.getMonth() - 6);
//       endDate = new Date(today);
//       break;
//     case 'year':
//       startDate = new Date(today.getFullYear(), 0, 1);
//       endDate = new Date(today);
//       break;
//     case 'lastyear':
//       startDate = new Date(today.getFullYear() - 1, 0, 1);
//       endDate = new Date(today.getFullYear() - 1, 11, 31);
//       break;
//     case 'alltime':
//       startDate = new Date(today);
//       startDate.setFullYear(today.getFullYear() - 2);
//       endDate = new Date(today);
//       break;
//     case 'custom':
//       startDate = customStartDate;
//       endDate = customEndDate;
//       break;
//   }

//   // Calculate metrics for the selected period
//   const filteredData = habitData.map(habit => {
//     const periodDailyData = habit.dailyData.filter(day => {
//       const dayDate = new Date(day.date);
//       return dayDate >= startDate && dayDate <= endDate;
//     });

//     const completedDays = periodDailyData.filter(day => day.completed).length;
//     const totalDays = periodDailyData.length;
//     const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;


    
//     // Calculate current streak for the period
//     let currentStreak = 0;
//     for (let i = periodDailyData.length - 1; i >= 0; i--) {
//       if (periodDailyData[i].completed) {
//         currentStreak++;
//       } else {
//         break;
//       }
//     }

//     return {
//       ...habit,
//       completionRate,
//       currentStreak,
//       totalDays,
//       periodDailyData
//     };
//   });

//   const overallCompletionRate = Math.round(
//     filteredData.reduce((sum, habit) => sum + habit.completionRate, 0) / filteredData.length
//   );

//   const activeStreaks = filteredData.filter(habit => habit.currentStreak > 0).length;

//   const getPeriodLabel = (period: TimePeriod, start: Date, end: Date): string => {
//     const options: Intl.DateTimeFormatOptions = { 
//       month: 'short', 
//       day: 'numeric',
//       year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
//     };

//     switch (period) {
//       case 'today':
//         return 'Today';
//       case 'week':
//         return 'This Week';
//       case 'month':
//         return 'This Month';
//       case 'last6months':
//         return 'Last 6 Months';
//       case 'year':
//         return 'This Year';
//       case 'lastyear':
//         return 'Last Year';
//       case 'alltime':
//         return 'All Time';
//       case 'custom':
//         return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
//       default:
//         return 'Unknown Period';
//     }
//   };

//   return {
//     habits: filteredData,
//     overallMetrics: {
//       totalHabits: filteredData.length,
//       activeStreaks,
//       completionRate: overallCompletionRate,
//       consistencyScore: Math.min(overallCompletionRate + 10, 100),
//       momentum: Math.min(overallCompletionRate + 15, 100),
//       improvement: Math.floor(Math.random() * 20) + 5,
//       weeklyGoal: 85,
//       monthlyGoal: 80
//     },
//     periodLabel: getPeriodLabel(selectedPeriod, startDate, endDate),
//     totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
//   };
// }, [selectedPeriod, customStartDate, customEndDate, habitData]);



// export const periodOptions = [
//   { key: 'today', label: 'Today' },
//   { key: 'week', label: 'This Week' },
//   { key: 'month', label: 'This Month' },
//   { key: 'last6months', label: 'Last 6M' },
//   { key: 'year', label: 'This Year' },
//   { key: 'lastyear', label: 'Last Year' },
//   { key: 'alltime', label: 'All Time' },
//   { key: 'custom', label: 'Custom' }
// ];

//  export const aiInsights: AIInsight[] = [
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



