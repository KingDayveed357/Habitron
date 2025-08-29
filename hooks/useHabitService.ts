// hooks/useHabitService.ts
import { useContext, useMemo, useEffect, useRef } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { DatabaseService } from '@/services/databaseService';
import { HabitService } from '@/services/habitService';

export const useHabitService = (): HabitService => {
  const db = useSQLiteContext();
  const habitServiceRef = useRef<HabitService | null>(null);

  const habitService = useMemo(() => {
    // Clean up previous instance if it exists
    if (habitServiceRef.current) {
      habitServiceRef.current.destroy();
    }

    // Create new services
    const databaseService = new DatabaseService(db);
    const newHabitService = new HabitService(databaseService);
    
    habitServiceRef.current = newHabitService;
    return newHabitService;
  }, [db]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (habitServiceRef.current) {
        habitServiceRef.current.destroy();
        habitServiceRef.current = null;
      }
    };
  }, []);

  return habitService;
};