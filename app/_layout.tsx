import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { StatusBar, View } from "react-native";
import { ThemeProvider } from '../context/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import "./globals.css";
import { AppProviders } from './components/provider/AuthProvider';

function AppStack() {

  return (
    <>
      <StatusBar />
      <View className={`flex-1 `}>
        <View className="flex-1">
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{headerShown: false}}/>
          </Stack>
        </View>
      </View>
    </>
  );
}

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasOnboarded').then((value: any) => {
      setShowOnboarding(value !== 'true');
    });
  }, []);

  if (showOnboarding === null) return null;

  return (
     <AppProviders>
    <ThemeProvider>
      <AppStack />
    </ThemeProvider>
    </AppProviders>
  );
}
