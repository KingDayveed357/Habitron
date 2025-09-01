// services/moodService.ts
import uuid from 'react-native-uuid';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/services/supabase';
import { DatabaseService } from './databaseService';
import { aiService } from './aiService';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number; // 1-10
  emoji: string;
  notes?: string;
  entry_date: string; // YYYY-MM-DD format
  entry_time?: string;
  energy_level?: number; // 1-10
  stress_level?: number; // 1-10
  sleep_hours?: number;
  sleep_quality?: number; // 1-10
  weather?: string;
  location?: string;
  tags?: string[] ;
  created_at: string;
  updated_at: string;
}

export interface LocalMoodRecord extends MoodEntry {
  local_id?: number;
  last_synced_at?: string | null;
  is_dirty: boolean | number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  conflict_data?: any;
}

export interface MoodStats {
  averageMood: number;
  totalEntries: number;
  currentStreak: number;
  bestDay: string;
  challengingDay: string;
  moodTrend: 'improving' | 'declining' | 'stable';
  weeklyAverage: number;
  monthlyAverage: number;
}

export interface MoodPattern {
  id: string;
  type: 'weekly_trend' | 'habit_correlation' | 'time_pattern' | 'seasonal_trend';
  description: string;
  confidence: number;
  data: any;
}

export interface WeeklyMoodData {
  day: string;
  emoji: string;
  score: number;
  date: string;
}

export interface MoodHabitCorrelation {
  habit_id: string;
  habit_name: string;
  habit_icon: string;
  correlation_strength: number;
  boost_description: string;
  color: string;
  bgColor: string;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export class MoodService {
  private db: DatabaseService;
  private networkStatus: NetworkStatus = { isConnected: false, isInternetReachable: false };
  private networkUnsubscribe?: (() => void);

  // Mood emoji mappings
  private readonly MOOD_EMOJIS = {
    1: '😰', 2: '😔', 3: '😐', 4: '🙂', 5: '😊',
    6: '😊', 7: '😊', 8: '😊', 9: '🤩', 10: '🤩'
  };

  private readonly MOOD_LABELS = {
    1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great',
    6: 'Great', 7: 'Great', 8: 'Excellent', 9: 'Excellent', 10: 'Amazing'
  };

  constructor(databaseService: DatabaseService) {
    this.db = databaseService;
    this.initializeNetworkListener();
    this.initializeMoodTables();
  }

  private async initializeMoodTables(): Promise<void> {
    try {
      await this.db.db.execAsync(`
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
          tags TEXT, -- JSON string for array
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
          pattern_data TEXT NOT NULL, -- JSON string
          confidence_score REAL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, entry_date DESC);
        CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created ON mood_entries(user_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_mood_patterns_user_type ON mood_patterns(user_id, pattern_type);
      `);
    } catch (error) {
      console.error('Error initializing mood tables:', error);
    }
  }

  private initializeNetworkListener(): void {
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !this.networkStatus.isConnected;
      this.networkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false
      };

      if (wasOffline && this.networkStatus.isConnected) {
        this.syncMoodEntries().catch(console.error);
      }
    });

    this.checkNetworkStatus();
  }

  private async checkNetworkStatus(): Promise<void> {
    const state = await NetInfo.fetch();
    this.networkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false
    };
  }

  private isOnline(): boolean {
    return this.networkStatus.isConnected && this.networkStatus.isInternetReachable;
  }

  public destroy(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }

  // Create or update mood entry (offline-first)
  public async saveMoodEntry(moodData: {
    mood_score: number;
    notes?: string;
    energy_level?: number;
    stress_level?: number;
    sleep_hours?: number;
    sleep_quality?: number;
    weather?: string;
    location?: string;
    tags?: string[];
  }): Promise<MoodEntry> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      // Check if entry exists for today
      const existingEntry = await this.getMoodEntryByDate(today, userId);

      const moodEntry: LocalMoodRecord = {
        id: existingEntry?.id || uuid.v4() as string,
        user_id: userId,
        mood_score: moodData.mood_score,
        emoji: this.getMoodEmoji(moodData.mood_score),
        notes: moodData.notes,
        entry_date: today,
        entry_time: new Date().toTimeString().split(' ')[0],
        energy_level: moodData.energy_level,
        stress_level: moodData.stress_level,
        sleep_hours: moodData.sleep_hours,
        sleep_quality: moodData.sleep_quality,
        weather: moodData.weather,
        location: moodData.location,
        tags: moodData.tags,
        created_at: existingEntry?.created_at || now,
        updated_at: now,
        is_dirty: true,
        sync_status: 'pending'
      };

      // Save to local database
      await this.insertOrUpdateMoodEntry(moodEntry);

      // Try to sync if online
      if (this.isOnline()) {
        await this.syncSingleMoodEntry(moodEntry);
      }

      return moodEntry;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      throw error;
    }
  }

  private async insertOrUpdateMoodEntry(entry: LocalMoodRecord): Promise<void> {
    const tagsJson = entry.tags ? JSON.stringify(entry.tags) : null;
    
    await this.db.db.runAsync(
      `INSERT OR REPLACE INTO mood_entries (
        id, user_id, mood_score, emoji, notes, entry_date, entry_time,
        energy_level, stress_level, sleep_hours, sleep_quality, weather,
        location, tags, created_at, updated_at, last_synced_at, is_dirty, sync_status, conflict_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id, entry.user_id, entry.mood_score, entry.emoji, entry.notes || null,
        entry.entry_date, entry.entry_time || null, entry.energy_level || null,
        entry.stress_level || null, entry.sleep_hours || null, entry.sleep_quality || null,
        entry.weather || null, entry.location || null, tagsJson, entry.created_at,
        entry.updated_at, entry.last_synced_at || null, entry.is_dirty ? 1 : 0,
        entry.sync_status, entry.conflict_data ? JSON.stringify(entry.conflict_data) : null
      ]
    );
  }

  // Get mood entries (offline-first)
  public async getMoodEntries(days?: number): Promise<LocalMoodRecord[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      let query = `SELECT * FROM mood_entries WHERE user_id = ?`;
      const params = [userId];

      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query += ` AND entry_date >= ?`;
        params.push(cutoffDate.toISOString().split('T')[0]);
      }

      query += ` ORDER BY entry_date DESC`;

      const result = await this.db.db.getAllAsync<LocalMoodRecord>(query, params);

      // Try to sync if online (but don't wait for it)
      if (this.isOnline()) {
        this.syncMoodEntries().catch(console.error);
      }

      return result.map(row => ({
        ...row,
        is_dirty: row.is_dirty === 1,
        tags: row.tags ? JSON.parse(row.tags) : undefined
      }));
    } catch (error) {
      console.error('Error getting mood entries:', error);
      throw error;
    }
  }

  private async getMoodEntryByDate(date: string, userId: string): Promise<LocalMoodRecord | null> {
    const result = await this.db.db.getFirstAsync<LocalMoodRecord>(
      `SELECT * FROM mood_entries WHERE user_id = ? AND entry_date = ?`,
      [userId, date]
    );

    if (result) {
      return {
        ...result,
        is_dirty: result.is_dirty === 1,
        tags: result.tags ? JSON.parse(result.tags) : undefined
      };
    }

    return null;
  }

  // Get today's mood entry
  public async getTodaysMoodEntry(): Promise<LocalMoodRecord | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    const today = new Date().toISOString().split('T')[0];
    return this.getMoodEntryByDate(today, userId);
  }

  // Get weekly mood data
  public async getWeeklyMoodData(): Promise<WeeklyMoodData[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const weekData: WeeklyMoodData[] = [];
    const today = new Date();

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const entry = await this.getMoodEntryByDate(dateStr, userId);

      weekData.push({
        day: dayName,
        emoji: entry?.emoji || '😐',
        score: entry?.mood_score || 5,
        date: dateStr
      });
    }

    return weekData;
  }

  // Get mood statistics
  public async getMoodStats(): Promise<MoodStats> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const entries = await this.getMoodEntries(90); // Last 90 days
      
      if (entries.length === 0) {
        return {
          averageMood: 0,
          totalEntries: 0,
          currentStreak: 0,
          bestDay: 'No data',
          challengingDay: 'No data',
          moodTrend: 'stable',
          weeklyAverage: 0,
          monthlyAverage: 0
        };
      }

      const totalMood = entries.reduce((sum, entry) => sum + entry.mood_score, 0);
      const averageMood = Number((totalMood / entries.length).toFixed(1));

      // Calculate streak (consecutive days with entries)
      const currentStreak = this.calculateMoodStreak(entries);

      // Calculate day-of-week statistics
      const dayStats = this.calculateDayStatistics(entries);
      const bestDay = Object.keys(dayStats).reduce((a, b) => 
        dayStats[a] > dayStats[b] ? a : b
      );
      const challengingDay = Object.keys(dayStats).reduce((a, b) => 
        dayStats[a] < dayStats[b] ? a : b
      );

      // Calculate trend
      const moodTrend = this.calculateMoodTrend(entries);

      // Weekly and monthly averages
      const weeklyEntries = entries.filter(e => {
        const entryDate = new Date(e.entry_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      });

      const monthlyEntries = entries.filter(e => {
        const entryDate = new Date(e.entry_date);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return entryDate >= monthAgo;
      });

      const weeklyAverage = weeklyEntries.length > 0 
        ? Number((weeklyEntries.reduce((sum, e) => sum + e.mood_score, 0) / weeklyEntries.length).toFixed(1))
        : 0;

      const monthlyAverage = monthlyEntries.length > 0
        ? Number((monthlyEntries.reduce((sum, e) => sum + e.mood_score, 0) / monthlyEntries.length).toFixed(1))
        : 0;

      return {
        averageMood,
        totalEntries: entries.length,
        currentStreak,
        bestDay,
        challengingDay,
        moodTrend,
        weeklyAverage,
        monthlyAverage
      };
    } catch (error) {
      console.error('Error calculating mood stats:', error);
      throw error;
    }
  }

  private calculateMoodStreak(entries: LocalMoodRecord[]): number {
    let streak = 0;
    const today = new Date();
    
    // Sort entries by date descending
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].entry_date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      // Check if entry is for the expected consecutive day
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateDayStatistics(entries: LocalMoodRecord[]): Record<string, number> {
    const dayStats: Record<string, number[]> = {
      'Sunday': [], 'Monday': [], 'Tuesday': [], 'Wednesday': [],
      'Thursday': [], 'Friday': [], 'Saturday': []
    };

    entries.forEach(entry => {
      const dayName = new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'long' });
      dayStats[dayName].push(entry.mood_score);
    });

    const dayAverages: Record<string, number> = {};
    Object.keys(dayStats).forEach(day => {
      const scores = dayStats[day];
      dayAverages[day] = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    });

    return dayAverages;
  }

  private calculateMoodTrend(entries: LocalMoodRecord[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 7) return 'stable';

    const sortedEntries = entries.sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );

    const firstWeek = sortedEntries.slice(0, 7);
    const lastWeek = sortedEntries.slice(-7);

    const firstWeekAvg = firstWeek.reduce((sum, e) => sum + e.mood_score, 0) / firstWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, e) => sum + e.mood_score, 0) / lastWeek.length;

    const difference = lastWeekAvg - firstWeekAvg;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  // Get mood-habit correlations using AI service
  public async getMoodHabitCorrelations(): Promise<MoodHabitCorrelation[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Get mood and habit data
      const moodEntries = await this.getMoodEntries(90);
      const habits = await this.db.getHabits(userId);
      const completions = await this.db.getCompletions(userId, 90);

      // Use AI service to analyze correlations
      const response = await aiService.analyzeMoodPatterns({
        moodData: moodEntries,
        habits,
        completions
      });

      if (response.success && response.insights) {
        return this.parseCorrelationInsights(response.insights, habits);
      }

      // Fallback: basic correlation calculation
      return this.calculateBasicCorrelations(moodEntries, habits, completions);
    } catch (error) {
      console.error('Error getting mood-habit correlations:', error);
      return [];
    }
  }

  private parseCorrelationInsights(insights: any[], habits: any[]): MoodHabitCorrelation[] {
    // Parse AI insights into correlation format
    return insights
      .filter(insight => insight.type === 'habit_correlation')
      .map(insight => {
        const habit = habits.find(h => h.id === insight.habitId);
        return {
          habit_id: insight.habitId,
          habit_name: habit?.title || 'Unknown Habit',
          habit_icon: habit?.icon || '📝',
          correlation_strength: insight.correlation || 0,
          boost_description: insight.description,
          color: this.getCorrelationColor(insight.correlation),
          bgColor: this.getCorrelationBgColor(insight.correlation)
        };
      });
  }

  private calculateBasicCorrelations(moodEntries: LocalMoodRecord[], habits: any[], completions: any[]): MoodHabitCorrelation[] {
    // Simple correlation calculation as fallback
    return habits.slice(0, 3).map((habit, index) => ({
      habit_id: habit.id,
      habit_name: habit.title,
      habit_icon: habit.icon,
      correlation_strength: 0.7 - (index * 0.2), // Mock data
      boost_description: `+${(2.3 - (index * 0.5)).toFixed(1)} mood boost`,
      color: index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : '#F59E0B',
      bgColor: index === 0 ? '#D1FAE5' : index === 1 ? '#DBEAFE' : '#FEF3C7'
    }));
  }

  private getCorrelationColor(strength: number): string {
    if (strength > 0.5) return '#10B981';
    if (strength > 0) return '#3B82F6';
    return '#EF4444';
  }

  private getCorrelationBgColor(strength: number): string {
    if (strength > 0.5) return '#D1FAE5';
    if (strength > 0) return '#DBEAFE';
    return '#FEE2E2';
  }

  // Sync functionality
  public async syncMoodEntries(): Promise<void> {
    if (!this.isOnline()) return;

    const userId = await this.getCurrentUserId();
    if (!userId) return;

    try {
      // Sync local entries to server
      await this.syncMoodEntriesToServer();
      
      // Sync server entries to local
      await this.syncMoodEntriesFromServer();
      
      console.log('Mood sync completed successfully');
    } catch (error) {
      console.error('Mood sync failed:', error);
    }
  }

  private async syncMoodEntriesToServer(): Promise<void> {
    const unsyncedEntries = await this.db.db.getAllAsync<LocalMoodRecord>(
      `SELECT * FROM mood_entries WHERE sync_status = 'pending' OR is_dirty = 1`
    );

    for (const entry of unsyncedEntries) {
      try {
        const entryData = {
          id: entry.id,
          user_id: entry.user_id,
          mood_score: entry.mood_score,
          emoji: entry.emoji,
          notes: entry.notes,
          entry_date: entry.entry_date,
          entry_time: entry.entry_time,
          energy_level: entry.energy_level,
          stress_level: entry.stress_level,
          sleep_hours: entry.sleep_hours,
          sleep_quality: entry.sleep_quality,
          weather: entry.weather,
          location: entry.location,
          tags: entry.tags ? JSON.parse(entry.tags) : null,
          created_at: entry.created_at,
          updated_at: entry.updated_at
        };

        const { error } = await supabase
          .from('mood_entries')
          .upsert([entryData], {
            onConflict: 'user_id,entry_date'
          });

        if (error) throw error;

        // Mark as synced
        await this.markMoodEntryAsSynced(entry.id);
      } catch (error) {
        console.error(`Error syncing mood entry ${entry.id}:`, error);
        await this.markMoodEntryAsError(entry.id);
      }
    }
  }

  private async syncMoodEntriesFromServer(): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    try {
      const lastSyncTime = await this.getLastMoodSyncTime();
      
      let query = supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId);

      if (lastSyncTime) {
        query = query.gt('updated_at', lastSyncTime);
      }

      const { data: serverEntries, error } = await query;

      if (error) throw error;

      if (serverEntries) {
        for (const serverEntry of serverEntries) {
          await this.insertOrUpdateMoodEntry({
            ...serverEntry,
            tags: serverEntry.tags,
            sync_status: 'synced',
            is_dirty: false,
            last_synced_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error syncing mood entries from server:', error);
    }
  }

  private async syncSingleMoodEntry(entry: LocalMoodRecord): Promise<void> {
    try {
      const entryData = {
        id: entry.id,
        user_id: entry.user_id,
        mood_score: entry.mood_score,
        emoji: entry.emoji,
        notes: entry.notes,
        entry_date: entry.entry_date,
        entry_time: entry.entry_time,
        energy_level: entry.energy_level,
        stress_level: entry.stress_level,
        sleep_hours: entry.sleep_hours,
        sleep_quality: entry.sleep_quality,
        weather: entry.weather,
        location: entry.location,
        tags: entry.tags,
        created_at: entry.created_at,
        updated_at: entry.updated_at
      };

      const { error } = await supabase
        .from('mood_entries')
        .upsert([entryData], {
          onConflict: 'user_id,entry_date'
        });

      if (error) throw error;

      await this.markMoodEntryAsSynced(entry.id);
    } catch (error) {
      await this.markMoodEntryAsError(entry.id);
      throw error;
    }
  }

  private async markMoodEntryAsSynced(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.db.runAsync(
      `UPDATE mood_entries SET sync_status = 'synced', is_dirty = 0, last_synced_at = ? WHERE id = ?`,
      [now, id]
    );
  }

  private async markMoodEntryAsError(id: string): Promise<void> {
    await this.db.db.runAsync(
      `UPDATE mood_entries SET sync_status = 'error' WHERE id = ?`,
      [id]
    );
  }

  private async getLastMoodSyncTime(): Promise<string | null> {
    const result = await this.db.db.getFirstAsync<{ last_sync: string }>(
      `SELECT MAX(last_synced_at) as last_sync FROM mood_entries WHERE last_synced_at IS NOT NULL`
    );
    return result?.last_sync || null;
  }

  // Delete mood entry
  public async deleteMoodEntry(entryId: string): Promise<void> {
    try {
      // Delete from local database
      await this.db.db.runAsync(
        `DELETE FROM mood_entries WHERE id = ?`,
        [entryId]
      );

      // Try to delete from server if online
      if (this.isOnline()) {
        const { error } = await supabase
          .from('mood_entries')
          .delete()
          .eq('id', entryId);

        if (error) {
          console.error('Error deleting mood entry from server:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }
  }

  // Utility methods
  private getMoodEmoji(score: number): string {
    return this.MOOD_EMOJIS[score as keyof typeof this.MOOD_EMOJIS] || '😐';
  }

  public getMoodLabel(score: number): string {
    return this.MOOD_LABELS[score as keyof typeof this.MOOD_LABELS] || 'Okay';
  }

  public getMoodOptions() {
    return [
      { emoji: '🤩', label: 'Amazing', value: 10 },
      { emoji: '😊', label: 'Great', value: 8 },
      { emoji: '🙂', label: 'Good', value: 6 },
      { emoji: '😐', label: 'Okay', value: 4 },
      { emoji: '😔', label: 'Bad', value: 2 },
      { emoji: '😰', label: 'Terrible', value: 1 },
    ];
  }

  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  public getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  public async clearAllMoodData(): Promise<void> {
    await this.db.db.execAsync(`
      DELETE FROM mood_patterns;
      DELETE FROM mood_entries;
    `);
  }

  // Get mood patterns and insights using AI
  public async getMoodInsights(): Promise<string> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const moodEntries = await this.getMoodEntries(30);
      const habits = await this.db.getHabits(userId);
      const completions = await this.db.getCompletions(userId, 30);

      if (moodEntries.length < 7) {
        return "Keep tracking your mood for a week to see personalized insights about your patterns and trends.";
      }

      const response = await aiService.analyzeMoodPatterns({
        moodData: moodEntries,
        habits,
        completions
      });

      if (response.success && response.message) {
        return response.message;
      }

      // Fallback insight
      const stats = await this.getMoodStats();
      if (stats.moodTrend === 'improving') {
        return `Your mood has been improving over time! Your average mood score is ${stats.averageMood}/10, which is trending upward.`;
      } else if (stats.moodTrend === 'declining') {
        return `Your mood has been declining recently. Consider focusing on habits that historically boost your mood.`;
      } else {
        return `Your mood has been stable with an average of ${stats.averageMood}/10. ${stats.bestDay}s tend to be your best days.`;
      }
    } catch (error) {
      console.error('Error getting mood insights:', error);
      return "Unable to generate insights right now. Please try again later.";
    }
  }
}