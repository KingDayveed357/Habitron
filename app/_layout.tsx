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
import * as Notifications from 'expo-notifications';
import "./globals.css";
import { useNotifications } from '@/hooks/useNotification';

// SplashScreen.preventAutoHideAsync();

function NotificationInitializer() {
  useNotifications(); 
  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<AppState>('loading');

  // Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   
    shouldPlaySound: true,   
    shouldSetBadge: true,    
    shouldShowBanner: true,  
    shouldShowList: true,    
  }),
});

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
            <NotificationInitializer />
            <StatusBar barStyle="light-content" />
            <NavigationRouter initialState={initialState} />
          </ThemeProvider>
        </AppProviders>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}