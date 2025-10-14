import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface BackButtonProps {
  onPress?: () => void;
  label?: string;
  showLabel?: boolean;
  color?: string;
  size?: number;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  label = 'Back',
  showLabel = false,
  color,
  size = 24,
  className = '',
}) => {
  const { isDark } = useTheme();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const iconColor = color || (isDark ? '#FFFFFF' : '#000000');

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center p-2 -ml-2 ${className}`}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 0, right: 10 }}
    >
      <View className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
        <ChevronLeft size={size} color={iconColor} strokeWidth={2.5} />
      </View>
      {showLabel && (
        <Text className="ml-2 text-base font-semibold text-gray-800 dark:text-white">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default BackButton;