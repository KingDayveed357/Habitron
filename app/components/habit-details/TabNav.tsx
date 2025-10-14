// ==========================================
// components/habit-details/HabitDetailsTabNav.tsx
// ==========================================
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Tab {
  key: 'overview' | 'calendar' | 'stats';
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
  { key: 'stats', label: 'Stats', icon: '📈' },
];

interface HabitDetailsTabNavProps {
  activeTab: 'overview' | 'calendar' | 'stats';
  onTabChange: (tab: 'overview' | 'calendar' | 'stats') => void;
}

export const HabitDetailsTabNav = memo<HabitDetailsTabNavProps>(({ 
  activeTab, 
  onTabChange 
}) => (
  <View className="flex-row bg-white dark:bg-gray-900 px-4 py-2">
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onTabChange(tab.key)}
        className={`flex-1 flex-row items-center justify-center py-3 mx-1 rounded-lg ${
          activeTab === tab.key ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'
        }`}
        accessibilityLabel={`${tab.label} tab`}
        accessibilityState={{ selected: activeTab === tab.key }}
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
));

HabitDetailsTabNav.displayName = 'HabitDetailsTabNav';