
// components/community/TabButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from "react-native";
import { TabType } from '@/interfaces/interfaces';

interface TabButtonProps {
  tab: TabType;
  icon: string;
  label: string;
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, icon, label, activeTab, onTabPress }) => (
  <TouchableOpacity
    onPress={() => onTabPress(tab)}
    className={`flex-1 items-center py-3 px-2 rounded-lg mx-1 ${
      activeTab === tab 
        ? 'bg-blue-100 dark:bg-blue-900/30 border-b-2 border-blue-500' 
        : 'bg-transparent'
    }`}
  >
    <Text className="text-lg mb-1">{icon}</Text>
    <Text className={`text-xs font-medium ${
      activeTab === tab 
        ? 'text-blue-600 dark:text-blue-400' 
        : 'text-gray-600 dark:text-gray-400'
    }`}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default TabButton;