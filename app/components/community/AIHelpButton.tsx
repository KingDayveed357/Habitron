import React from 'react';
import { View, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AIHelpButtonProps {
  onPress?: () => void;
}

export const AIHelpButton: React.FC<AIHelpButtonProps> = ({ onPress }) => {
  return (
    // <TouchableOpacity 
    //   className="absolute bottom-20 right-4  w-14 h-14 rounded-full items-center justify-center "
    //   onPress={onPress}
    // >
    //   <Ionicons name="chatbubble-ellipses" size={24} color="white" />
    // </TouchableOpacity>
     <View className="absolute bottom-24 right-6 space-y-4 z-50">
     <TouchableOpacity
        onPress={onPress}
        className="bg-white dark:bg-zinc-900 mt-2 p-4 rounded-full shadow-md items-center justify-center border border-indigo-500"
        style={{ elevation: 6 }}
      >
        <Ionicons name="chatbubbles-outline" size={24} color="#4F46E5" />
      </TouchableOpacity>
      </View>
  );
};