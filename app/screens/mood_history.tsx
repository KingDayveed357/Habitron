// app/screens/mood_history.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Stack } from 'expo-router';
import { DatabaseService } from '@/services/databaseService';
import { MoodService, LocalMoodRecord, MoodStats } from '@/services/moodService';

const { width } = Dimensions.get('window');

interface MoodCalendarEntry {
  day: number;
  mood?: LocalMoodRecord;
}

interface MonthData {
  month: string;
  year: number;
  entries: LocalMoodRecord[];
  avgMood: number;
  totalEntries: number;
}

interface LoadingState {
  overview: boolean;
  calendar: boolean;
  patterns: boolean;
}

const MoodHistoryScreen: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'patterns'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    overview: false,
    calendar: false,
    patterns: false
  });
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [calendarData, setCalendarData] = useState<MoodCalendarEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cachedEntries, setCachedEntries] = useState<LocalMoodRecord[]>([]);

  const router = useRouter();
  const db = useSQLiteContext();

  // Memoize services and constants
  const databaseService = useMemo(() => new DatabaseService(db), [db]);
  const moodService = useMemo(() => new MoodService(databaseService), [databaseService]);

  const daysOfWeek = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);
  const monthNames = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  // Optimized data loading with caching
  const loadMoodHistory = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load data in parallel
      const [stats, entries] = await Promise.all([
        moodService.getMoodStats(),
        moodService.getMoodEntries(180) // Cache last 6 months
      ]);

      setMoodStats(stats);
      setCachedEntries(entries);

      // Group entries by month efficiently
      const monthlyData = groupEntriesByMonth(entries);
      setMonthsData(monthlyData);

      // Set current month as selected and initialize calendar
      const currentDate = new Date();
      setCurrentMonth(currentDate);
      
      if (monthlyData.length > 0) {
        const currentMonthData = monthlyData.find(m => 
          m.year === currentDate.getFullYear() && 
          monthNames.indexOf(m.month) === currentDate.getMonth()
        ) || monthlyData[0];
        
        setSelectedMonth(currentMonthData);
        generateCalendarData(currentMonthData);
      } else {
        // Create empty month data for current month
        const emptyMonth = createEmptyMonthData(currentDate);
        setSelectedMonth(emptyMonth);
        generateCalendarData(emptyMonth);
      }

    } catch (error) {
      console.error('Error loading mood history:', error);
      Alert.alert('Error', 'Failed to load mood history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [moodService, monthNames]);

  // Memoized helper functions
  const groupEntriesByMonth = useCallback((entries: LocalMoodRecord[]): MonthData[] => {
    const monthGroups: { [key: string]: LocalMoodRecord[] } = {};

    entries.forEach(entry => {
      const date = new Date(entry.entry_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(entry);
    });

    return Object.keys(monthGroups)
      .sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)
      .slice(0, 6) // Only last 6 months
      .map(monthKey => {
        const [year, month] = monthKey.split('-').map(Number);
        const monthEntries = monthGroups[monthKey];
        const avgMood = monthEntries.length > 0 
          ? monthEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / monthEntries.length
          : 0;

        return {
          month: monthNames[month],
          year,
          entries: monthEntries,
          avgMood: Number(avgMood.toFixed(1)),
          totalEntries: monthEntries.length
        };
      });
  }, [monthNames]);

  const createEmptyMonthData = useCallback((date: Date): MonthData => ({
    month: monthNames[date.getMonth()],
    year: date.getFullYear(),
    entries: [],
    avgMood: 0,
    totalEntries: 0
  }), [monthNames]);

  const generateCalendarData = useCallback((monthData?: MonthData) => {
    const targetMonth = monthData || createEmptyMonthData(currentMonth);
    const year = targetMonth.year;
    const monthIndex = monthNames.indexOf(targetMonth.month);
    
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    
    const calendarDays: MoodCalendarEntry[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: 0 }); // 0 indicates empty cell
    }
    
    // Add days of the month with mood data
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const moodEntry = targetMonth.entries.find(entry => entry.entry_date === dateString);
      
      calendarDays.push({
        day,
        mood: moodEntry
      });
    }
    
    setCalendarData(calendarDays);
  }, [currentMonth, monthNames, createEmptyMonthData]);

  // Update calendar when month changes (memoized)
  useEffect(() => {
    if (selectedMonth) {
      generateCalendarData(selectedMonth);
    }
  }, [selectedMonth, generateCalendarData]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    
    // Find existing month data from cache or create empty month data
    const foundMonth = monthsData.find(m => 
      m.year === newMonth.getFullYear() && 
      monthNames.indexOf(m.month) === newMonth.getMonth()
    );
    
    if (foundMonth) {
      setSelectedMonth(foundMonth);
    } else {
      // Create month data from cached entries
      const monthEntries = cachedEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate.getFullYear() === newMonth.getFullYear() &&
               entryDate.getMonth() === newMonth.getMonth();
      });

      const avgMood = monthEntries.length > 0 
        ? monthEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / monthEntries.length
        : 0;

      const monthData: MonthData = {
        month: monthNames[newMonth.getMonth()],
        year: newMonth.getFullYear(),
        entries: monthEntries,
        avgMood: Number(avgMood.toFixed(1)),
        totalEntries: monthEntries.length
      };

      setSelectedMonth(monthData);
    }
  }, [currentMonth, monthsData, monthNames, cachedEntries]);

  useFocusEffect(
    useCallback(() => {
      loadMoodHistory();
      return () => moodService.destroy();
    }, [loadMoodHistory, moodService])
  );

  const handleMonthSelect = useCallback((monthData: MonthData) => {
    setSelectedMonth(monthData);
    const monthIndex = monthNames.indexOf(monthData.month);
    setCurrentMonth(new Date(monthData.year, monthIndex, 1));
    setActiveTab('calendar');
  }, [monthNames]);

  const getMoodColor = useCallback((moodScore: number): string => {
    if (moodScore >= 8) return 'bg-green-100 border-green-300';
    if (moodScore >= 6) return 'bg-blue-100 border-blue-300';
    if (moodScore >= 4) return 'bg-yellow-100 border-yellow-300';
    if (moodScore >= 2) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  }, []);

  // Memoized calendar grid renderer
  const renderCalendarGrid = useMemo(() => {
    if (!selectedMonth) return null;

    return (
      <View className="flex-row flex-wrap">
        {calendarData.map((entry, index) => {
          if (entry.day === 0) {
            return <View key={`empty-${index}`} style={{ width: (width - 80) / 7 - 4 }} className="h-16 m-0.5" />;
          }

          const isToday = selectedMonth && 
            new Date().getFullYear() === selectedMonth.year &&
            new Date().getMonth() === monthNames.indexOf(selectedMonth.month) &&
            new Date().getDate() === entry.day;

          return (
            <TouchableOpacity
              key={entry.day}
              style={{ width: (width - 80) / 7 - 4 }}
              className={`h-16 m-0.5 items-center justify-center rounded-lg border ${
                entry.mood 
                  ? getMoodColor(entry.mood.mood_score)
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              } ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <Text className={`text-sm font-medium mb-1 ${
                isToday ? 'text-indigo-600' : 'text-gray-800 dark:text-white'
              }`}>
                {entry.day}
              </Text>
              {entry.mood && (
                <>
                  <Text className="text-lg">{entry.mood.emoji}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.mood.mood_score}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [selectedMonth, calendarData, width, monthNames, getMoodColor]);

  const formatMonthYear = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  // Tab content renderers with loading states
  const renderOverview = () => (
    <View className="px-4">
      {loadingState.overview ? (
        <View className="space-y-4">
          <View className="card p-4">
            <View className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
            <View className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <View key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </View>
          </View>
        </View>
      ) : moodStats ? (
        <View className="card p-4 mb-4">
          <Text className="text-lg text-subheading mb-4">Overall Statistics</Text>
          
          <View className="grid grid-cols-2 gap-4 mb-4">
            <View className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-2xl">
              <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {moodStats.averageMood.toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Average Mood</Text>
            </View>
            
            <View className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl">
              <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                {moodStats.currentStreak}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Day Streak</Text>
            </View>
          </View>

          <View className="grid grid-cols-2 gap-4">
            <View className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-2xl">
              <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {moodStats.bestDay}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Best Day</Text>
            </View>
            
            <View className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-2xl">
              <Text className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {moodStats.totalEntries}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Total Entries</Text>
            </View>
          </View>
        </View>
      ) : null}
     
      <View className="card p-4">
        <Text className="text-lg text-subheading mb-4">Monthly History</Text>
        
        {monthsData.map((month, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            onPress={() => handleMonthSelect(month)}
          >
            <View className="flex-1">
              <Text className="text-base font-medium text-body">
                {month.month} {month.year}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {month.totalEntries} entries
              </Text>
            </View>
            <View className="items-end mr-3">
              <Text className="text-xl font-bold text-indigo-500">
                {month.avgMood > 0 ? month.avgMood.toFixed(1) : '-'}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Avg Mood</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCalendar = () => (
    <View className="px-4">
      <View className="card p-4">
        {/* Calendar Header with Month Navigation */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedMonth?.month} {selectedMonth?.year}
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigateMonth('next')}
            disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) > new Date()}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) > new Date() ? "#D1D5DB" : "#6B7280"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Days of week header */}
        <View className="flex-row justify-around mb-2">
          {daysOfWeek.map(day => (
            <View key={day} style={{ width: (width - 80) / 7 - 4 }} className="items-center">
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Calendar grid */}
        {renderCalendarGrid}

        {/* Month Statistics */}
        {selectedMonth && (
          <View className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {selectedMonth.month} {selectedMonth.year} Summary
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {selectedMonth.avgMood > 0 ? selectedMonth.avgMood.toFixed(1) : '-'}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">Avg Mood</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                  {selectedMonth.totalEntries}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">Total Entries</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {selectedMonth.totalEntries > 0 ? Math.round((selectedMonth.totalEntries / new Date(selectedMonth.year, monthNames.indexOf(selectedMonth.month) + 1, 0).getDate()) * 100) : 0}%
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Legend */}
        <View className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mood Scale</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-red-200 mr-2" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">1-2</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-orange-200 mr-2" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">3-4</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-yellow-200 mr-2" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">5-6</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-blue-200 mr-2" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">7-8</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-green-200 mr-2" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">9-10</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPatterns = () => (
    <View className="px-4">
      {moodStats && (
        <>
          <View className="card p-4 mb-4">
            <Text className="text-lg text-subheading mb-4">Mood Patterns</Text>
            
            <View className="flex-row justify-between mb-6">
              <View className="flex-1 mr-2">
                <Text className="text-sm text-body mb-1">Best Day</Text>
                <Text className="text-base text-subheading">{moodStats.bestDay}s</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                  <Text className="text-sm text-green-600 dark:text-green-400">Highest average</Text>
                </View>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm text-body mb-1">Challenging Day</Text>
                <Text className="text-base text-subheading">{moodStats.challengingDay}s</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-orange-500 mr-1" />
                  <Text className="text-sm text-orange-600 dark:text-orange-400">Needs attention</Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-sm text-body mb-1">Trend</Text>
                <Text className="text-base text-subheading capitalize">{moodStats.moodTrend}</Text>
                <View className="flex-row items-center mt-1">
                  <View className={`w-2 h-2 rounded-full mr-1 ${
                    moodStats.moodTrend === 'improving' ? 'bg-green-500' : 
                    moodStats.moodTrend === 'declining' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <Text className={`text-sm ${
                    moodStats.moodTrend === 'improving' ? 'text-green-600 dark:text-green-400' : 
                    moodStats.moodTrend === 'declining' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {moodStats.moodTrend === 'improving' ? 'Getting better' : 
                     moodStats.moodTrend === 'declining' ? 'Needs focus' : 'Consistent'}
                  </Text>
                </View>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm text-body mb-1">Weekly Avg</Text>
                <Text className="text-base text-subheading">{moodStats.weeklyAverage.toFixed(1)}/10</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
                  <Text className="text-sm text-indigo-600 dark:text-indigo-400">Last 7 days</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View className="card p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl items-center justify-center mr-3">
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg text-subheading">Insights</Text>
            </View>
            
            <View className="space-y-3 flex flex-col gap-3">
              <View className="flex-row items-start">
                <View className="w-2 h-2 rounded-full bg-indigo-500 mr-3 mt-2" />
                <Text className="text-sm text-body flex-1">
                  Your mood tracking streak is {moodStats.currentStreak} days. Consistency helps identify patterns.
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-3 mt-2" />
                <Text className="text-sm text-body flex-1">
                  You tend to feel better on {moodStats.bestDay}s. Consider what makes these days special.
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-2 h-2 rounded-full bg-blue-500 mr-3 mt-2" />
                <Text className="text-sm text-body flex-1">
                  Your overall mood trend is {moodStats.moodTrend}. 
                  {moodStats.moodTrend === 'improving' && ' Keep up the great work!'}
                  {moodStats.moodTrend === 'stable' && ' Consistency is valuable for wellbeing.'}
                  {moodStats.moodTrend === 'declining' && ' Consider what support might help.'}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );

  // Handle tab changes with loading states
  const handleTabChange = useCallback((tab: 'overview' | 'calendar' | 'patterns') => {
    setActiveTab(tab);
    
    // Set loading state for the new tab if needed
    if (tab === 'overview' && !moodStats) {
      setLoadingState(prev => ({ ...prev, overview: true }));
    }
  }, [moodStats]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-900 shadow-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">Mood History</Text>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading mood history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-900 shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Mood History</Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white dark:bg-gray-900 px-4 py-2">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'calendar', label: 'Calendar', icon: '📅' },
          { key: 'patterns', label: 'Patterns', icon: '📈' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabChange(tab.key as any)}
            className={`flex-1 flex-row items-center justify-center py-3 mx-1 rounded-lg ${
              activeTab === tab.key ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text className="mr-1">{tab.icon}</Text>
            <Text className={`text-sm font-medium ${
              activeTab === tab.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'calendar' && renderCalendar()}
          {activeTab === 'patterns' && renderPatterns()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

MoodHistoryScreen.displayName = 'MoodHistoryScreen';

export default MoodHistoryScreen;