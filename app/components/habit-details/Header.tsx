// ==========================================
// components/habit-details/HabitDetailsHeader.tsx
// ==========================================
import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HabitDetailsHeaderProps {
  title: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitDetailsHeader = memo<HabitDetailsHeaderProps>(
  ({ title, onBack, onEdit, onDelete }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => setMenuVisible((prev) => !prev);

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shadow-sm">
        {/* Back Button */}
        <TouchableOpacity onPress={onBack} className="p-2" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Title */}
        <Text
          className="text-lg font-semibold text-gray-900 dark:text-white flex-1 text-center"
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Three Dots Icon */}
        <TouchableOpacity onPress={toggleMenu} className="p-2" accessibilityLabel="More options">
          <Ionicons name="ellipsis-vertical" size={22} color="#6B7280" />
        </TouchableOpacity>

        {/* Dropdown Menu Modal */}
        <Modal
          transparent
          animationType="fade"
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => setMenuVisible(false)} // close on outside tap
          >
            <View className="absolute right-4 top-14 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 w-36">
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  onEdit();
                }}
                className="flex-row items-center px-3 py-2"
              >
                <Ionicons name="create-outline" size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-800 dark:text-gray-200">Edit Habit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  onDelete();
                }}
                className="flex-row items-center px-3 py-2"
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text className="ml-2 text-red-600 dark:text-red-400">Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
);

HabitDetailsHeader.displayName = 'HabitDetailsHeader';
