import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-700 dark:text-gray-200"
          placeholder="Search community..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};