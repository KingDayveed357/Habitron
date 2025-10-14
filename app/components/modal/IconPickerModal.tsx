// app/components/habit/IconPickerModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const ALL_EMOJIS = [
  // Face emojis
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  
  // Activity & Sports
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🤿',
  '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂',
  
  // Health & Fitness
  '🏃‍♂️', '🏃‍♀️', '🚶‍♂️', '🚶‍♀️', '🧘‍♂️', '🧘‍♀️', '🏋️‍♂️', '🏋️‍♀️', '💪', '🦵',
  
  // Food & Drink
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍅', '🥥',
  '🥑', '🍆', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅',
  '🥛', '🍵', '☕', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷',
  
  // Study & Learning
  '📚', '📖', '📝', '✏️', '✒️', '🖊️', '🖋️', '🖍️', '📄', '📃',
  '📑', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏',
  '📐', '✂️', '🗃️', '🗄️', '🗂️', '📂', '📁', '📰', '🔍', '🔎',
  
  // Technology
  '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀', '☎️', '📞',
  '📱', '📲', '📧', '📨', '📩', '📤', '📥', '📮', '🗳️',
  
  // Music & Art
  '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻',
  '🎨', '🖌️', '🖍️', '🎭', '🩰', '🎪', '🎬', '🎤', '🎧', '🎮',
  
  // Time & Calendar
  '⏰', '⏲️', '⏱️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖',
  '📅', '📆', '🗓️', '📋', '📌', '📍', '🔔', '🔕', '📢', '📣',
  
  // Weather & Nature
  '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
  '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌊', '💧', '💦', '☔',
  
  // Transport
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚚', '🚛', '🚜', '🚲', '🛴', '🛵', '🏍️', '✈️', '🛩️', '🚁',
  
  // Hearts & Symbols
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  
  // Stars & Celebration
  '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂',
  '🍰', '🧁', '🥳', '🎆', '🎇', '🌠', '💥', '💢', '💯', '🔥'
];

const FUNCTIONAL_ICONS = [
  // Productivity & Work
  '📊', '📈', '📉', '💼', '💻', '📋', '✅', '📝', '🗓️', '⏰',
  '📌', '📎', '🗂️', '📁', '💾', '🖨️', '📧', '📞', '📱', '💡',
  
  // Health & Fitness
  '🏥', '💊', '🩺', '🌡️', '💉', '🦷', '👁️', '🫀', '🫁', '🧠',
  '💪', '🏃', '🚴', '🏊', '🤸', '🧘', '🛌', '🥗', '🥛', '💧',
  
  // Education & Learning
  '🎓', '📚', '📖', '✏️', '📐', '🧮', '🔬', '🔭', '🗺️', '🌍',
  '🎨', '🖌️', '🎭', '🎪', '🎬', '📹', '📷', '🎤', '🎧', '🎵',
  
  // Home & Living
  '🏠', '🏡', '🛏️', '🛋️', '🪑', '🚿', '🛁', '🧹', '🧽', '🗑️',
  '🔑', '🚪', '🪟', '💡', '🔌', '📺', '📻', '☎️', '🕯️', '🧯',
  
  // Food & Cooking
  '🍳', '🥘', '🍲', '🥗', '🍝', '🍜', '🥙', '🌮', '🌯', '🥪',
  '🔪', '🥄', '🍴', '🥢', '🧂', '📦', '🥫', '🍯', '🧈', '🥛'
];

interface IconPickerModalProps {
  visible: boolean;
  selectedIcon: string;
  activeTab: 'Emoji' | 'Icon';
  onTabChange: (tab: 'Emoji' | 'Icon') => void;
  onSelectIcon: (icon: string) => void;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  visible,
  selectedIcon,
  activeTab,
  onTabChange,
  onSelectIcon,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white">
              Choose Icon
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-lg text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-md ${
                activeTab === 'Emoji' ? 'bg-indigo-500' : 'bg-transparent'
              }`}
              onPress={() => onTabChange('Emoji')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'Emoji'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Emoji
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-md ${
                activeTab === 'Icon' ? 'bg-indigo-500' : 'bg-transparent'
              }`}
              onPress={() => onTabChange('Icon')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'Icon'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Icon
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        >
          <View className="flex-row flex-wrap justify-between">
            {(activeTab === 'Emoji' ? ALL_EMOJIS : FUNCTIONAL_ICONS).map(
              (icon, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-12 h-12 rounded-xl justify-center items-center border mb-3 ${
                    selectedIcon === icon
                      ? 'bg-indigo-100 dark:bg-indigo-500 border-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                  onPress={() => onSelectIcon(icon)}
                >
                  <Text className="text-xl">{icon}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </ScrollView>

        <View className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            className="bg-indigo-500 rounded-xl py-3"
            onPress={onClose}
          >
            <Text className="text-center text-base font-medium text-white">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};