// utils/queryOptimizer.ts
import { SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef } from 'react';

export class QueryOptimizer {
  private db: SQLiteDatabase;
  private queryCache = new Map<string, { data: any; expires: number }>();
  private batchQueue: Array<{ query: string; params: any[]; resolve: Function; reject: Function }> = [];
  private batchTimeout?: NodeJS.Timeout;
  
  constructor(database: SQLiteDatabase) {
    this.db = database;
  }

  // Batch multiple queries for better performance
  async batchQuery<T>(query: string, params: any[] = [], cacheKey?: string, ttl = 5 * 60 * 1000): Promise<T[]> {
    // Check cache first
    if (cacheKey && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!;
      if (Date.now() < cached.expires) {
        return cached.data;
      }
      this.queryCache.delete(cacheKey);
    }

    return new Promise((resolve, reject) => {
      this.batchQueue.push({ query, params, resolve, reject });
      
      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      // Execute batch after short delay or when queue is full
      this.batchTimeout = setTimeout(() => {
        this.executeBatch();
      }, 10); // 10ms delay for batching
      
      if (this.batchQueue.length >= 5) {
        this.executeBatch();
      }
    });
  }

  private async executeBatch() {
    if (this.batchQueue.length === 0) return;
    
    const currentBatch = [...this.batchQueue];
    this.batchQueue.length = 0;
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = undefined;
    }

    try {
      // Execute all queries in a transaction for better performance
      await this.db.withTransactionAsync(async () => {
        for (const { query, params, resolve, reject } of currentBatch) {
          try {
            const result = await this.db.getAllAsync(query, params);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });
    } catch (error) {
      // If transaction fails, reject all promises
      currentBatch.forEach(({ reject }) => reject(error));
    }
  }

  // Optimized mood queries with proper indexing hints
  static getMoodQueries() {
    return {
      // Weekly data with index hint
      weeklyMood: `
        SELECT * FROM mood_entries 
        WHERE user_id = ? AND entry_date >= ? AND entry_date <= ?
        ORDER BY entry_date ASC
      `,
      
      // Monthly stats with aggregation
      monthlyStats: `
        SELECT 
          strftime('%Y-%m', entry_date) as month_key,
          COUNT(*) as total_entries,
          AVG(mood_score) as avg_mood,
          MIN(mood_score) as min_mood,
          MAX(mood_score) as max_mood
        FROM mood_entries 
        WHERE user_id = ? AND entry_date >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', entry_date)
        ORDER BY month_key DESC
      `,
      
      // Streak calculation optimized
      streakData: `
        SELECT entry_date, ROW_NUMBER() OVER (ORDER BY entry_date DESC) as row_num
        FROM mood_entries 
        WHERE user_id = ?
        ORDER BY entry_date DESC 
        LIMIT 100
      `,
      
      // Day of week statistics
      dayStats: `
        SELECT 
          CAST(strftime('%w', entry_date) AS INTEGER) as day_of_week,
          AVG(mood_score) as avg_mood,
          COUNT(*) as entry_count
        FROM mood_entries 
        WHERE user_id = ? AND entry_date >= date('now', '-90 days')
        GROUP BY day_of_week
        ORDER BY avg_mood DESC
      `
    };
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now >= value.expires) {
        this.queryCache.delete(key);
      }
    }
  }

  // Clear all cache
  clearCache() {
    this.queryCache.clear();
  }
}

// Database connection pooling for better performance
export class DatabasePool {
  private static instance: DatabasePool;
  private connections: Map<string, SQLiteDatabase> = new Map();
  
  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  getConnection(key: string, db: SQLiteDatabase): QueryOptimizer {
    if (!this.connections.has(key)) {
      this.connections.set(key, db);
    }
    return new QueryOptimizer(this.connections.get(key)!);
  }
}

// React hook for optimized database queries

import { useSQLiteContext } from 'expo-sqlite';

export function useOptimizedQueries() {
  const db = useSQLiteContext();
  const optimizerRef = useRef<QueryOptimizer | null>(null);

  const getOptimizer = useCallback(() => {
    if (!optimizerRef.current) {
      optimizerRef.current = DatabasePool.getInstance().getConnection('main', db);
    }
    return optimizerRef.current;
  }, [db]);

  const batchQuery = useCallback(async <T>(
    query: string, 
    params: any[] = [], 
    cacheKey?: string, 
    ttl?: number
  ): Promise<T[]> => {
    return getOptimizer().batchQuery<T>(query, params, cacheKey, ttl);
  }, [getOptimizer]);

  return { batchQuery, optimizer: getOptimizer() };
}