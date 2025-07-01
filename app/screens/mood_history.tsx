import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

interface MoodEntry {
  day: number;
  mood: number;
  emoji: string;
}

interface MonthData {
  month: string;
  year: number;
  entries: number;
  avgMood: number;
  dailyMoods: MoodEntry[];
}

const MoodHistoryScreen: React.FC = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'calendar' | 'patterns'>('overview');
  
  const monthsData: MonthData[] = [
    {
      month: 'December',
      year: 2024,
      entries: 28,
      avgMood: 7.8,
      dailyMoods: [
        { day: 1, mood: 6, emoji: '😔' },
        { day: 2, mood: 2, emoji: '😞' },
        { day: 3, mood: 2, emoji: '😔' },
        { day: 4, mood: 3, emoji: '😔' },
        { day: 6, mood: 7, emoji: '😊' },
        { day: 7, mood: 6, emoji: '😊' },
        { day: 8, mood: 8, emoji: '😞' },
        { day: 9, mood: 5, emoji: '😊' },
        { day: 10, mood: 5, emoji: '😊' },
        { day: 11, mood: 3, emoji: '😞' },
        { day: 12, mood: 5, emoji: '😐' },
        { day: 13, mood: 4, emoji: '😊' },
        { day: 14, mood: 3, emoji: '😞' },
        { day: 15, mood: 6, emoji: '😊' },
        { day: 16, mood: 3, emoji: '😞' },
        { day: 17, mood: 5, emoji: '😐' },
        { day: 18, mood: 8, emoji: '😞' },
        { day: 19, mood: 3, emoji: '😊' },
        { day: 20, mood: 5, emoji: '😊' },
        { day: 21, mood: 2, emoji: '😊' },
        { day: 22, mood: 5, emoji: '😞' },
        { day: 23, mood: 4, emoji: '😊' },
        { day: 24, mood: 9, emoji: '😊' },
        { day: 25, mood: 5, emoji: '😊' },
        { day: 26, mood: 9, emoji: '😊' },
        { day: 27, mood: 7, emoji: '😊' },
        { day: 29, mood: 6, emoji: '😊' },
        { day: 31, mood: 9, emoji: '😔' },
      ]
    },
    {
      month: 'November',
      year: 2024,
      entries: 30,
      avgMood: 7.2,
      dailyMoods: []
    },
    {
      month: 'October',
      year: 2024,
      entries: 31,
      avgMood: 6.9,
      dailyMoods: []
    }
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendarGrid = (monthData: MonthData) => {
    const daysInMonth = getDaysInMonth(monthData.year, monthData.month === 'December' ? 12 : monthData.month === 'November' ? 11 : 10);
    const firstDay = getFirstDayOfMonth(monthData.year, monthData.month === 'December' ? 12 : monthData.month === 'November' ? 11 : 10);
    
    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <View key={`empty-${i}`} className="w-12 h-1 m-1" />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const moodEntry = monthData.dailyMoods.find(entry => entry.day === day);
      
      calendarDays.push(
        <View key={day} className="w-12 h-16 m-1 items-center justify-center bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-gray-800">
          <Text className="text-sm font-medium text-gray-800 dark:text-white mb-1">{day}</Text>
          {moodEntry && (
            <>
              <Text className="text-lg">{moodEntry.emoji}</Text>
              <Text className="text-xs text-gray-500 dark:text-white">{moodEntry.mood}</Text>
            </>
          )}
        </View>
      );
    }
    
    return calendarDays;
  };

  const renderOverview = () => (
    <View className="px-4">
      <View className="card p-4">
        <Text className="text-lg text-subheading mb-4">Monthly Overview</Text>
        
        {monthsData.map((month, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
            onPress={() => setCurrentView('calendar')}
          >
            <View>
              <Text className="text-base font-medium text-body">{month.month} {month.year}</Text>
              <Text className="text-sm text-gray-500">{month.entries} entries</Text>
            </View>
            <View className="items-end">
              <Text className="text-xl font-bold text-indigo-500">{month.avgMood}/10</Text>
              <Text className="text-xs text-gray-500">Avg Mood</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCalendar = () => (
    <View className="px-4">
      <View className="card p-4">
        <Text className="text-lg text-subheading mb-4">December 2024</Text>
        
        {/* Days of week header */}
        <View className="flex-row justify-around mb-2">
          {daysOfWeek.map(day => (
            <Text key={day} className="text-sm font-medium text-gray-500 dark:text-white w-12 text-center">
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View className="flex-row flex-wrap justify-start">
          {renderCalendarGrid(monthsData[0])}
        </View>
      </View>
    </View>
  );

  const renderPatterns = () => (
    <View className="px-4">
      <View className="card mb-4 ">
        <Text className="text-lg text-subheading mb-4">Mood Patterns</Text>
        
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 mr-2">
            <Text className="text-sm text-body mb-1">Best Day</Text>
            <Text className="text-base text-subheading">Fridays</Text>
            <Text className="text-sm text-green-500">+15%</Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-sm text-body mb-1">Challenging Day</Text>
            <Text className="text-base text-subheading">Mondays</Text>
            <Text className="text-sm text-red-500">-8%</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-sm text-body mb-1">Evening Mood</Text>
            <Text className="text-base text-subheading">Higher</Text>
            <Text className="text-sm text-green-500">+12%</Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-sm text-body mb-1">Morning Mood</Text>
            <Text className="text-base text-subheading">Stable</Text>
            <Text className="text-sm text-body">0%</Text>
          </View>
        </View>
      </View>
      
      <View className="card mb-4">
        <View className="flex-row items-center mb-3">
          <Text className="text-2xl mr-2">📈</Text>
          <Text className="text-lg text-subheading">Long-term Insights</Text>
        </View>
        
        <View className="space-y-3">
          <View className="flex-row items-start">
            <Text className="text-red-500 mr-2">•</Text>
            <Text className="text-sm text-body flex-1">
              Your mood has improved by 12% over the last 3 months
            </Text>
          </View>
          
          <View className="flex-row items-start">
            <Text className="text-red-500 mr-2">•</Text>
            <Text className="text-sm text-body flex-1">
              Meditation consistently boosts your mood by 2-3 points
            </Text>
          </View>
          
          <View className="flex-row items-start">
            <Text className="text-red-500 mr-2">•</Text>
            <Text className="text-sm text-body flex-1">
              You have the highest mood scores on days with exercise
            </Text>
          </View>
          
          <View className="flex-row items-start">
            <Text className="text-red-500 mr-2">•</Text>
            <Text className="text-sm text-body flex-1">
              Sleep quality strongly correlates with next-day mood (+0.8 correlation)
            </Text>
          </View>
        </View>
      </View>
      
      <View className="card">
        <Text className="text-lg text-subheading mb-4">Export & Backup</Text>
        
        <View className="flex-row justify-between">
          <TouchableOpacity className="flex-row items-center justify-center flex-1 mr-2 py-3 bg-gray-50 rounded-lg">
            <Text className="text-lg mr-2">🗑️</Text>
            <Text className="text-base font-medium text-gray-700">Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-center flex-1 ml-2 py-3 bg-gray-50 rounded-lg">
            <Text className="text-lg mr-2">📅</Text>
            <Text className="text-base font-medium text-gray-700">Share Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 app-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-36">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'calendar' && renderCalendar()}
          {currentView === 'patterns' && renderPatterns()}
        </View>
      </ScrollView>
      
      {/* Navigation buttons for testing different views */}
      <View className="absolute bottom-6 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg flex-row z-50">
        <TouchableOpacity
          className={`flex-1 py-2 px-3 rounded-lg mr-1 ${currentView === 'overview' ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-slate-700'}`}
          onPress={() => setCurrentView('overview')}
        >
          <Text className={`text-center font-medium ${currentView === 'overview' ? 'text-white' : 'text-gray-700 dark:text-white'}`}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-2 px-3 rounded-lg mx-1 ${currentView === 'calendar' ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-slate-700'}`}
          onPress={() => setCurrentView('calendar')}
        >
          <Text className={`text-center font-medium ${currentView === 'calendar' ? 'text-white' : 'text-gray-700 dark:text-white'}`}>
            Calendar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-2 px-3 rounded-lg ml-1 ${currentView === 'patterns' ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-slate-700'}`}
          onPress={() => setCurrentView('patterns')}
        >
          <Text className={`text-center font-medium ${currentView === 'patterns' ? 'text-white' : 'text-gray-700 dark:text-white'}`}>
            Patterns
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MoodHistoryScreen;