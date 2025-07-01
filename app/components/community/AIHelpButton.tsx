import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AIHelpButtonProps {
  onPress?: () => void;
}

export const AIHelpButton: React.FC<AIHelpButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity 
      className="absolute bottom-20 right-4 bg-gradient-to-r from-purple-500 to-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      onPress={onPress}
    >
      <Ionicons name="chatbubble-ellipses" size={24} color="white" />
    </TouchableOpacity>
  );
};