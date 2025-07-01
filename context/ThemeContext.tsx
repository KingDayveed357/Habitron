// Enhanced ThemeProvider.tsx (if you want system theme support)
import React, { createContext, useContext, useState, useEffect } from "react";
import { View, useColorScheme as useDeviceColorScheme } from "react-native";
import { useColorScheme } from "nativewind";
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
      <View style={themes[effectiveTheme]} className="flex-1 app-background">
        {children}
      </View>
    </ThemeContext.Provider>
  );
};