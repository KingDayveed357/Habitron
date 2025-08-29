// _layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { StatusBar } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { ThemeProvider } from '../context/ThemeContext';
import "./globals.css";
import { AppProviders } from './components/provider/AuthProvider';

// Database initialization function
async function initializeDatabase(db: any) {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      -- Habits table
      CREATE TABLE IF NOT EXISTS habits (
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        target_count INTEGER NOT NULL,
        target_unit TEXT NOT NULL,
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
        bg_color TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_synced_at TEXT,
        is_dirty INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),
        conflict_data TEXT
      );

      -- Habit completions table
      CREATE TABLE IF NOT EXISTS habit_completions (
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT UNIQUE NOT NULL,
        habit_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        completed_count INTEGER NOT NULL DEFAULT 0,
        completion_date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_synced_at TEXT,
        is_dirty INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
      CREATE INDEX IF NOT EXISTS idx_habits_updated_at ON habits(updated_at);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(user_id, completion_date);
      
      -- Add unique constraint for habit completions to prevent duplicates
      CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_completions_unique 
      ON habit_completions(habit_id, completion_date, user_id);
    `);

    console.log('Database tables created successfully');

    // Clean up any existing duplicate completions
    try {
      await cleanupDuplicateCompletions(db);
      console.log('Duplicate completions cleanup completed');
    } catch (cleanupError) {
      console.warn('Cleanup warning (non-critical):', cleanupError);
      // Don't throw here as this is a cleanup operation
    }
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Cleanup function for duplicate completions
async function cleanupDuplicateCompletions(db: any) {
  try {
    // Get all user IDs that have completions
    const users = await db.getAllAsync(`
      SELECT DISTINCT user_id FROM habit_completions
    `);

    for (const user of users) {
      const userId = user.user_id;
      
      // Remove duplicates for each user
      await db.runAsync(`
        DELETE FROM habit_completions 
        WHERE local_id NOT IN (
          SELECT MIN(local_id) 
          FROM habit_completions 
          WHERE user_id = ?
          GROUP BY habit_id, completion_date
        ) AND user_id = ?
      `, [userId, userId]);
    }

    // Get count of remaining completions
    const result = await db.getFirstAsync(`
      SELECT COUNT(*) as count FROM habit_completions
    `);
    
    console.log(`Cleanup completed. Remaining completions: ${result?.count || 0}`);
  } catch (error) {
    console.error('Error during duplicate cleanup:', error);
    throw error;
  }
}

function AppStack() {
  return (
    <>
      <StatusBar/>
      <Stack screenOptions={{
         headerShown: false,
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="screens" options={{ headerShown: false }} />
      </Stack>
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
    <SafeAreaProvider>
      <SQLiteProvider 
        databaseName="habits.db" 
        onInit={initializeDatabase}
      >
        <AppProviders>
          <ThemeProvider>
            <AppStack />
          </ThemeProvider>
        </AppProviders>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}