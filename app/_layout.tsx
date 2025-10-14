import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { ThemeProvider } from '../context/ThemeContext';
import { AppProviders } from './components/provider/AuthProvider';
import { SplashScreen } from './components/ui/SplashScreen';
import { NavigationRouter } from './components/ui/NavigationRouter';
import { DatabaseInitializer } from '@/utils/DatabaseInitializer';
import { DatabaseMigration } from '@/utils/DatabaseInitializer';
import { AppStateManager, type AppState } from '@/utils/AppStateManager';
import "./globals.css";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<AppState>('loading');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const state = await AppStateManager.getInitialState();
      setInitialState(state.state);
      
      // Smooth transition delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsReady(true);
    } catch (error) {
      console.error('App initialization error:', error);
      setInitialState('onboarding');
      setIsReady(true);
    }
  };

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <SQLiteProvider 
        databaseName="habits.db" 
        onInit={(db) => DatabaseInitializer.initialize(db)}
      >
        <AppProviders>
          <ThemeProvider>
            <StatusBar barStyle="light-content" />
            <NavigationRouter initialState={initialState} />
          </ThemeProvider>
        </AppProviders>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}