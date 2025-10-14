import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const BASIC_ICONS = ['💧', '📚', '🏃', '🧘', '🍎', '💪', '🌱', '🎯', '✍️', '🎨'];

interface HabitBasicInfoProps {
  title: string;
  icon: string;
  category: string;
  categories: readonly string[];
  error?: string;
  onTitleChange: (text: string) => void;
  onIconChange: (icon: string) => void;
  onCategoryChange: (category: string) => void;
  onShowIconModal: () => void;
  isAddingCategory: boolean;
  customCategory: string;
  onCustomCategoryChange: (text: string) => void;
  onAddCategory: () => void;
  onToggleAddCategory: () => void;
}

export const HabitBasicInfo: React.FC<HabitBasicInfoProps> = ({
  title,
  icon,
  category,
  categories,
  error,
  onTitleChange,
  onIconChange,
  onCategoryChange,
  onShowIconModal,
  isAddingCategory,
  customCategory,
  onCustomCategoryChange,
  onAddCategory,
  onToggleAddCategory,
}) => {
  return (
    <>
      {/* Habit Name */}
      <View className="mb-6 mt-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          What habit would you like to build?
        </Text>
        <TextInput
          value={title}
          onChangeText={onTitleChange}
          placeholder="e.g., Drink 8 glasses of water"
          placeholderTextColor="#9CA3AF"
          className={`border rounded-xl p-4 text-gray-800 dark:text-white dark:bg-gray-800 ${
            error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-100'
          }`}
          maxLength={100}
          multiline
        />
        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>

      {/* Choose Icon */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white">
            Choose an Icon
          </Text>
          <TouchableOpacity
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full"
            onPress={onShowIconModal}
          >
            <Text className="text-sm text-blue-600 dark:text-blue-300">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {BASIC_ICONS.map((iconItem, index) => (
            <TouchableOpacity
              key={index}
              className={`w-12 h-12 rounded-xl justify-center items-center border ${
                icon === iconItem
                  ? 'bg-indigo-100 dark:bg-indigo-500 border-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-200'
              }`}
              onPress={() => onIconChange(iconItem)}
            >
              <Text className="text-xl">{iconItem}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Category
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              className={`px-4 py-3 rounded-xl border ${
                category === cat
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}
              onPress={() => onCategoryChange(cat)}
            >
              <Text
                className={`text-sm font-medium ${
                  category === cat ? 'text-white' : 'text-gray-800 dark:text-white'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}

          {isAddingCategory ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                value={customCategory}
                onChangeText={onCustomCategoryChange}
                placeholder="New category"
                className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 text-gray-800 dark:text-white"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={onAddCategory}
                className="bg-green-500 px-3 py-3 rounded-xl"
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onToggleAddCategory}
                className="bg-gray-300 px-3 py-3 rounded-xl"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="px-4 py-3 rounded-xl border border-dashed border-gray-400"
              onPress={onToggleAddCategory}
            >
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                + Add Category
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};
