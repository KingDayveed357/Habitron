// // context/ThemeContext.tsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useColorScheme, View } from 'react-native';

// type Theme = 'light' | 'dark' | 'system';

// interface ThemeContextType {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
//   isDark: boolean;
// }

// const ThemeContext = createContext<ThemeContextType | null>(null);

// export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
//   const [theme, setTheme] = useState<Theme>('system');
//   const systemColorScheme = useColorScheme();
  
//   // Determine if we should use dark mode
//   const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  
//   // Load saved theme on mount
//   useEffect(() => {
//     const loadTheme = async () => {
//       try {
//         const savedTheme = await AsyncStorage.getItem('theme');
//         if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
//           setTheme(savedTheme as Theme);
//         }
//       } catch (error) {
//         console.error('Error loading theme:', error);
//       }
//     };
//     loadTheme();
//   }, []);

//   // Save theme when it changes
//   const updateTheme = async (newTheme: Theme) => {
//     try {
//       setTheme(newTheme);
//       await AsyncStorage.setItem('theme', newTheme);
//     } catch (error) {
//       console.error('Error saving theme:', error);
//     }
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme: updateTheme, isDark }}>
//          <View className={isDark ? 'dark flex-1' : 'flex-1'}>
//         {children}
//       </View>
//     </ThemeContext.Provider>
//   );
// };

// export const useAppTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useAppTheme must be used within a ThemeProvider');
//   }
//   return context;
// };