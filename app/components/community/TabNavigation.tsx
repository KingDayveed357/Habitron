import React from 'react';
import { View } from 'react-native';
import TabButton from './TabButton';
import { TabType } from '@/interfaces/interfaces';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="flex-row bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
      <TabButton tab="feed" icon="📰" label="Feed" activeTab={activeTab} onTabPress={onTabChange} />
      <TabButton tab="challenges" icon="🏆" label="Challenges" activeTab={activeTab} onTabPress={onTabChange} />
      <TabButton tab="leaderboard" icon="👑" label="Leaders" activeTab={activeTab} onTabPress={onTabChange} />
      <TabButton tab="discussions" icon="💬" label="Discuss" activeTab={activeTab} onTabPress={onTabChange} />
    </View>
  );
};
