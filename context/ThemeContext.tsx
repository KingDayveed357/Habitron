// Enhanced ThemeProvider.tsx with better layout handling
import React, { createContext, useContext, useState, useEffect } from "react";
import { View, useColorScheme as useDeviceColorScheme, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themes } from "@/utils/color-theme";
import { ThemeContextType } from "@/interfaces/interfaces";

type ThemeMode = "light" | "dark" | "system";

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  effectiveTheme: "light",
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { setColorScheme } = useColorScheme();
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const insets = useSafeAreaInsets();

  // Determine the effective theme
  const effectiveTheme: "light" | "dark" =
    theme === "system"
      ? (deviceColorScheme === "dark" ? "dark" : "light")
      : theme;

  const isDark = effectiveTheme === "dark";

  // Update NativeWind whenever effective theme changes
  useEffect(() => {
    setColorScheme(effectiveTheme);
  }, [effectiveTheme, setColorScheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isDark,
      effectiveTheme
    }}>
      <View 
        style={[
          styles.container,
          themes[effectiveTheme],
          { 
            paddingTop: 0, // Remove automatic padding top
            paddingBottom: 0, // Remove automatic padding bottom
          }
        ]} 
        className="flex-1 app-background"
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});