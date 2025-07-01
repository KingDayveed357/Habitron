// components/themeToggle.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function EnhancedThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${isDark ? 'Dark' : 'Light'})`;
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  const getNextTheme = () => {
    if (theme === 'light') return 'Dark';
    if (theme === 'dark') return 'System';
    return 'Light';
  };

  return (
    <View className="mt-10 items-center">
      {/* <Text className="text-lg mb-2 text-foreground">
        Current Theme: {getThemeLabel()}
      </Text> */}
      <TouchableOpacity
        className="bg-primary px-4 py-2 rounded-lg"
        onPress={toggleTheme}
      >
        <Text className="text-white font-bold">
          Switch to {getNextTheme()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}