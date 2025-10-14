import { SQLiteDatabase } from 'expo-sqlite';


export class DatabaseMigration {
  /**
   * Get current database version
   */
  private static async getCurrentVersion(db: SQLiteDatabase): Promise<number> {
    try {
      const result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
      );
      return result?.user_version || 0;
    } catch (error) {
      console.error('Error getting database version:', error);
      return 0;
    }
  }

  /**
   * Set database version
   */
  private static async setVersion(db: SQLiteDatabase, version: number): Promise<void> {
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }

  /**
   * Run all pending migrations
   */
  static async migrate(db: SQLiteDatabase): Promise<void> {
    const currentVersion = await this.getCurrentVersion(db);
    console.log(`Current database version: ${currentVersion}`);

    // Define migrations in order
    const migrations = [
      this.migration_1_add_frequency_columns,
      // Add future migrations here
    ];

    // Run pending migrations
    for (let i = currentVersion; i < migrations.length; i++) {
      const migrationVersion = i + 1;
      console.log(`Running migration ${migrationVersion}...`);
      
      try {
        await migrations[i](db);
        await this.setVersion(db, migrationVersion);
        console.log(`✅ Migration ${migrationVersion} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migrationVersion} failed:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  }

  /**
   * Migration 1: Add frequency columns to habits table
   * FIX: Ensure frequency_type defaults to 'daily' and is never null
   */
  private static async migration_1_add_frequency_columns(db: SQLiteDatabase): Promise<void> {
    try {
      // Check if columns already exist
      const tableInfo = await db.getAllAsync<{ name: string }>(
        `PRAGMA table_info(habits)`
      );
      
      const columnNames = tableInfo.map(col => col.name);
      
      // Add frequency_type if it doesn't exist
      // FIX: Changed DEFAULT to NOT NULL with DEFAULT 'daily'
      if (!columnNames.includes('frequency_type')) {
        await db.execAsync(`
          ALTER TABLE habits ADD COLUMN frequency_type TEXT NOT NULL DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly'));
        `);
        console.log('Added frequency_type column');
      }

      // Add frequency_count if it doesn't exist
      if (!columnNames.includes('frequency_count')) {
        await db.execAsync(`
          ALTER TABLE habits ADD COLUMN frequency_count INTEGER;
        `);
        console.log('Added frequency_count column');
      }

      // Add frequency_days if it doesn't exist
      if (!columnNames.includes('frequency_days')) {
        await db.execAsync(`
          ALTER TABLE habits ADD COLUMN frequency_days TEXT;
        `);
        console.log('Added frequency_days column');
      }

      // FIX: Update existing records to ensure frequency_type is never null
      // await db.runAsync(`
      //   UPDATE habits 
      //   SET frequency_type = 'daily' 
      //   WHERE frequency_type IS NULL OR frequency_type = ''
      // `);

      console.log('Frequency columns migration completed');
    } catch (error) {
      console.error('Error in frequency columns migration:', error);
      throw error;
    }
  }

  /**
   * Emergency: Drop and recreate all tables (use with caution!)
   */
  static async resetDatabase(db: SQLiteDatabase): Promise<void> {
    console.warn('⚠️ RESETTING DATABASE - ALL DATA WILL BE LOST');
    
    await db.execAsync(`
      DROP TABLE IF EXISTS mood_patterns;
      DROP TABLE IF EXISTS mood_entries;
      DROP TABLE IF EXISTS habit_completions;
      DROP TABLE IF EXISTS habits;
      PRAGMA user_version = 0;
    `);
    
    console.log('Database reset completed');
  }

  /**
   * Verify database integrity
   */
  static async verifyIntegrity(db: SQLiteDatabase): Promise<boolean> {
    try {
      const result = await db.getFirstAsync<{ integrity_check: string }>(
        'PRAGMA integrity_check'
      );
      
      if (result?.integrity_check === 'ok') {
        console.log('✅ Database integrity check passed');
        return true;
      } else {
        console.error('❌ Database integrity check failed:', result);
        return false;
      }
    } catch (error) {
      console.error('Error checking database integrity:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(db: SQLiteDatabase): Promise<{
    version: number;
    habits: number;
    completions: number;
    moodEntries: number;
  }> {
    const version = await this.getCurrentVersion(db);
    
    const habits = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habits WHERE is_active = 1'
    );
    
    const completions = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habit_completions'
    );
    
    const moodEntries = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM mood_entries'
    );

    return {
      version,
      habits: habits?.count || 0,
      completions: completions?.count || 0,
      moodEntries: moodEntries?.count || 0
    };
  }
}


export class DatabaseInitializer {
  /**
   * Initialize all database tables and indexes
   */
  static async initialize(db: SQLiteDatabase): Promise<void> {
    try {
      await this.createTables(db);
      await this.createIndexes(db);
      
      // Run migrations to add any missing columns
      await DatabaseMigration.migrate(db);
      
      await this.cleanupDuplicates(db);
      
      // Verify database integrity
      await DatabaseMigration.verifyIntegrity(db);
      
      // Log stats
      const stats = await DatabaseMigration.getStats(db);
      console.log('📊 Database stats:', stats);
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create all required tables
   */
  private static async createTables(db: SQLiteDatabase): Promise<void> {
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
        frequency_count INTEGER,
        frequency_days TEXT,
        frequency_type TEXT NOT NULL DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly')),
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

      -- Mood entries table
      CREATE TABLE IF NOT EXISTS mood_entries (
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
        emoji TEXT NOT NULL,
        notes TEXT,
        entry_date TEXT NOT NULL,
        entry_time TEXT,
        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
        stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
        sleep_hours REAL,
        sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
        weather TEXT,
        location TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_synced_at TEXT,
        is_dirty INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),
        conflict_data TEXT,
        CONSTRAINT unique_user_date UNIQUE (user_id, entry_date)
      );

      -- Mood patterns cache table
      CREATE TABLE IF NOT EXISTS mood_patterns (
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        confidence_score REAL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  /**
   * Create indexes for performance optimization
   */
  private static async createIndexes(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
      CREATE INDEX IF NOT EXISTS idx_habits_updated_at ON habits(updated_at);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(user_id, completion_date);
      CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, entry_date DESC);
      CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created ON mood_entries(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_mood_entries_mood_score ON mood_entries(mood_score);
      CREATE INDEX IF NOT EXISTS idx_mood_patterns_user_type ON mood_patterns(user_id, pattern_type);
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_completions_unique 
      ON habit_completions(habit_id, completion_date, user_id);
    `);
  }

  /**
   * Clean up duplicate records
   */
  private static async cleanupDuplicates(db: SQLiteDatabase): Promise<void> {
    try {
      await this.cleanupDuplicateCompletions(db);
      await this.cleanupDuplicateMoodEntries(db);
      
      console.log('✅ Duplicate cleanup completed');
    } catch (error) {
      console.warn('⚠️ Cleanup warning (non-critical):', error);
    }
  }

  /**
   * Remove duplicate habit completions
   */
  private static async cleanupDuplicateCompletions(db: SQLiteDatabase): Promise<void> {
    const users = await db.getAllAsync<{ user_id: string }>(`
      SELECT DISTINCT user_id FROM habit_completions
    `);

    for (const user of users) {
      await db.runAsync(
        `DELETE FROM habit_completions 
         WHERE local_id NOT IN (
           SELECT MIN(local_id) 
           FROM habit_completions 
           WHERE user_id = ?
           GROUP BY habit_id, completion_date
         ) AND user_id = ?`,
        [user.user_id, user.user_id]
      );
    }

    const result = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count FROM habit_completions
    `);
    
    console.log(`Remaining completions: ${result?.count || 0}`);
  }

  /**
   * Remove duplicate mood entries
   */
  private static async cleanupDuplicateMoodEntries(db: SQLiteDatabase): Promise<void> {
    const users = await db.getAllAsync<{ user_id: string }>(`
      SELECT DISTINCT user_id FROM mood_entries
    `);

    for (const user of users) {
      await db.runAsync(
        `DELETE FROM mood_entries 
         WHERE local_id NOT IN (
           SELECT MAX(local_id) 
           FROM mood_entries 
           WHERE user_id = ?
           GROUP BY user_id, entry_date
         ) AND user_id = ?`,
        [user.user_id, user.user_id]
      );
    }

    const result = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count FROM mood_entries
    `);
    
    console.log(`Remaining mood entries: ${result?.count || 0}`);
  }
}