// services/AIServices/insights.ts - BACKWARD COMPATIBLE VERSION
/**
 * AI Insights Service - Enhanced with Period Support
 * 
 * ✅ BACKWARD COMPATIBLE - All existing methods work exactly as before
 * ✨ NEW - Period context support added to existing methods
 * 
 * @version 2.0.0 - Backward compatible enhancement
 */

import { apiPost } from '../apiClient'

// ============================================================================
// TYPES (All existing types preserved)
// ============================================================================

export interface AIInsight {
  id: string
  type: 'trend' | 'achievement' | 'warning' | 'tip' | 'motivation'
  title: string
  description: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  actionable?: boolean
  action?: {
    label: string
    type: 'navigate' | 'create_habit' | 'modify_habit'
    data: any
  }
  metadata?: any
}

export interface HabitSuggestion {
  id: string
  title: string
  icon: string
  category: string
  description: string
  reasoning: string
  targetCount: number
  targetUnit: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
}

export interface MoodInsight {
  id: string
  type: 'correlation' | 'pattern' | 'recommendation'
  title: string
  description: string
  moodTrend: 'improving' | 'declining' | 'stable'
  correlatedHabits: string[]
  confidence: number
}

// NEW: Optional period info (doesn't break existing code)
export interface PeriodInfo {
  type: 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom'
  startDate?: string
  endDate?: string
  totalDays: number
  label: string
}

// EXISTING: Context interface (period is optional, so backward compatible)
export interface InsightsContext {
  habits?: any[]
  stats?: {
    totalHabits: number
    completedToday: number
    completionRate: number
    activeStreak: number
  }
  userProfile?: {
    name: string
    timezone?: string
    preferences?: string[]
  }
  moodData?: any[]
  habitHistory?: any[]
  timeframe?: 'today' | 'week' | 'month' | 'all'
  period?: PeriodInfo // NEW but optional - won't break existing code
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  periodKey?: string // Optional for backward compatibility
}

// ============================================================================
// INSIGHTS SERVICE CLASS
// ============================================================================

class InsightsService {
  private static instance: InsightsService
  private insightsCache = new Map<string, CacheEntry<AIInsight[]>>()
  private suggestionsCache = new Map<string, CacheEntry<HabitSuggestion[]>>()
  private moodInsightsCache = new Map<string, CacheEntry<MoodInsight[]>>()
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
  // Track in-flight requests (existing functionality)
  private pendingInsights = new Map<string, Promise<AIInsight[]>>()
  private pendingSuggestions = new Map<string, Promise<HabitSuggestion[]>>()
  private pendingMoodInsights = new Map<string, Promise<MoodInsight[]>>()

  static getInstance(): InsightsService {
    if (!InsightsService.instance) {
      InsightsService.instance = new InsightsService()
    }
    return InsightsService.instance
  }

  /**
   * Get general insights
   * ✅ BACKWARD COMPATIBLE - Works exactly as before
   * ✨ ENHANCED - Now accepts optional period info in context
   */
  async getInsights(
    userId: string,
    context: InsightsContext,
    options: { forceRefresh?: boolean; cacheTTL?: number } = {}
  ): Promise<AIInsight[]> {
    if (!userId || !context) {
      console.warn('Missing userId or context for insights')
      return this.getFallbackInsights(context || {})
    }

    const { forceRefresh = false, cacheTTL = this.DEFAULT_CACHE_TTL } = options
    const cacheKey = this.generateCacheKey(userId, context, 'insights')

    // Check cache first
    if (!forceRefresh) {
      const cached = this.insightsCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt) {
        console.log('📦 Returning cached insights')
        return cached.data
      }
    }

    // Check if request already in flight
    const pending = this.pendingInsights.get(cacheKey)
    if (pending) {
      console.log('⏳ Request already in flight, waiting...')
      return pending
    }

    // Create new request
    const promise = this.fetchInsights(userId, context, cacheTTL, cacheKey)
    this.pendingInsights.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      this.pendingInsights.delete(cacheKey)
    }
  }

  /**
   * Get habit suggestions
   * ✅ BACKWARD COMPATIBLE
   * ✨ ENHANCED - Period-aware suggestions
   */
  async getSuggestions(
    userId: string,
    context: InsightsContext,
    options: { forceRefresh?: boolean; cacheTTL?: number } = {}
  ): Promise<HabitSuggestion[]> {
    const { forceRefresh = false, cacheTTL = this.DEFAULT_CACHE_TTL } = options
    const cacheKey = this.generateCacheKey(userId, context, 'suggestions')

    if (!forceRefresh) {
      const cached = this.suggestionsCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt) {
        console.log('📦 Returning cached suggestions')
        return cached.data
      }
    }

    const pending = this.pendingSuggestions.get(cacheKey)
    if (pending) return pending

    const promise = this.fetchSuggestions(userId, context, cacheTTL, cacheKey)
    this.pendingSuggestions.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      this.pendingSuggestions.delete(cacheKey)
    }
  }

  /**
   * Get mood insights
   * ✅ BACKWARD COMPATIBLE
   * ✨ ENHANCED - Period context
   */
  async getMoodInsights(
    userId: string,
    context: InsightsContext,
    options: { forceRefresh?: boolean; cacheTTL?: number } = {}
  ): Promise<MoodInsight[]> {
    const { forceRefresh = false, cacheTTL = this.DEFAULT_CACHE_TTL } = options
    const cacheKey = this.generateCacheKey(userId, context, 'mood')

    if (!forceRefresh) {
      const cached = this.moodInsightsCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt) return cached.data
    }

    const pending = this.pendingMoodInsights.get(cacheKey)
    if (pending) return pending

    const promise = this.fetchMoodInsights(userId, context, cacheTTL, cacheKey)
    this.pendingMoodInsights.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      this.pendingMoodInsights.delete(cacheKey)
    }
  }

  /**
   * Fetch insights from API
   * ✨ ENHANCED - Automatically adds period info if not present
   */
  private async fetchInsights(
    userId: string,
    context: InsightsContext,
    cacheTTL: number,
    cacheKey: string
  ): Promise<AIInsight[]> {
    try {
      console.log('🔄 Fetching insights from API...')
      
      // NEW: Auto-add default period if not provided (backward compatible)
      const enhancedContext = this.ensurePeriodContext(context)
      
      const response = await apiPost<{ insights: AIInsight[] }>(
        '/ai-insights',
        {
          userId,
          type: 'insights',
          context: enhancedContext
        },
        { timeout: 15000 }
      )

      let insights = Array.isArray(response?.insights) ? response.insights : []
      
      // Ensure unique IDs
      insights = insights.map((insight, index) => ({
        ...insight,
        id: insight.id || `insight_${Date.now()}_${index}`
      }))

      console.log(`✅ Got ${insights.length} insights from API`)

      // Cache results
      if (insights.length > 0) {
        this.insightsCache.set(cacheKey, {
          data: insights,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTTL,
          periodKey: context.period?.label
        })
      }

      return insights
    } catch (error: any) {
      console.error('❌ Failed to fetch insights:', error.message)
      
      // Try stale cache
      const cached = this.insightsCache.get(cacheKey)
      if (cached) {
        console.log('📦 Returning stale cache due to error')
        return cached.data
      }

      // Return fallback
      return this.getFallbackInsights(context)
    }
  }

  /**
   * Fetch suggestions from API
   */
  private async fetchSuggestions(
    userId: string,
    context: InsightsContext,
    cacheTTL: number,
    cacheKey: string
  ): Promise<HabitSuggestion[]> {
    try {
      console.log('🔄 Fetching suggestions from API...')
      
      const enhancedContext = this.ensurePeriodContext(context)
      
      const response = await apiPost<{ suggestions: HabitSuggestion[] }>(
        '/ai-insights',
        {
          userId,
          type: 'suggestions',
          context: enhancedContext
        },
        { timeout: 15000 }
      )

      let suggestions = Array.isArray(response?.suggestions) ? response.suggestions : []
      
      suggestions = suggestions.map((suggestion, index) => ({
        ...suggestion,
        id: suggestion.id || `suggestion_${Date.now()}_${index}`
      }))

      console.log(`✅ Got ${suggestions.length} suggestions from API`)

      if (suggestions.length > 0) {
        this.suggestionsCache.set(cacheKey, {
          data: suggestions,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTTL,
          periodKey: context.period?.label
        })
      }

      return suggestions
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      
      const cached = this.suggestionsCache.get(cacheKey)
      if (cached) return cached.data

      return []
    }
  }

  /**
   * Fetch mood insights from API
   */
  private async fetchMoodInsights(
    userId: string,
    context: InsightsContext,
    cacheTTL: number,
    cacheKey: string
  ): Promise<MoodInsight[]> {
    try {
      const enhancedContext = this.ensurePeriodContext(context)
      
      const response = await apiPost<{ moodInsights: MoodInsight[] }>(
        '/ai-insights',
        {
          userId,
          type: 'mood_analysis',
          context: enhancedContext
        },
        { timeout: 15000 }
      )

      let moodInsights = Array.isArray(response?.moodInsights) ? response.moodInsights : []
      
      moodInsights = moodInsights.map((insight, index) => ({
        ...insight,
        id: insight.id || `mood_${Date.now()}_${index}`
      }))

      if (moodInsights.length > 0) {
        this.moodInsightsCache.set(cacheKey, {
          data: moodInsights,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTTL,
          periodKey: context.period?.label
        })
      }

      return moodInsights
    } catch (error) {
      console.error('Failed to fetch mood insights:', error)
      
      const cached = this.moodInsightsCache.get(cacheKey)
      if (cached) return cached.data

      return this.getFallbackMoodInsights(context)
    }
  }

  /**
   * Get habit-specific insights
   * ✅ BACKWARD COMPATIBLE
   */
  async getHabitDetailInsights(
    userId: string,
    habitId: string,
    context: InsightsContext
  ): Promise<AIInsight[]> {
    try {
      const enhancedContext = this.ensurePeriodContext(context)
      
      const response = await apiPost<{ insights: AIInsight[] }>(
        '/ai-insights',
        {
          userId,
          type: 'habit_detail',
          habitId,
          context: enhancedContext
        },
        { timeout: 15000 }
      )

      let insights = Array.isArray(response?.insights) ? response.insights : []
      
      insights = insights.map((insight, index) => ({
        ...insight,
        id: insight.id || `habit_detail_${habitId}_${Date.now()}_${index}`
      }))

      return insights
    } catch (error) {
      console.error('Failed to fetch habit detail insights:', error)
      return this.getFallbackHabitInsights(context, habitId)
    }
  }

  /**
   * NEW: Ensure period context exists (backward compatible helper)
   * If period is not provided, auto-generate based on timeframe
   */
  private ensurePeriodContext(context: InsightsContext): InsightsContext {
    // If period already exists, return as-is
    if (context.period) {
      return context
    }

    // Auto-generate period from timeframe (backward compatible)
    const timeframe = context.timeframe || 'today'
    let periodType: PeriodInfo['type'] = 'today'
    let totalDays = 1
    let label = 'Today'

    switch (timeframe) {
      case 'today':
        periodType = 'today'
        totalDays = 1
        label = 'Today'
        break
      case 'week':
        periodType = 'week'
        totalDays = 7
        label = 'This Week'
        break
      case 'month':
        periodType = 'month'
        totalDays = 30
        label = 'This Month'
        break
      case 'all':
        periodType = 'alltime'
        totalDays = 365
        label = 'All Time'
        break
    }

    return {
      ...context,
      period: {
        type: periodType,
        totalDays,
        label
      }
    }
  }

  /**
   * Generate cache key
   * ✅ BACKWARD COMPATIBLE - Works with or without period info
   */
  private generateCacheKey(userId: string, context: InsightsContext, type: string): string {
    const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute buckets
    const habitsCount = context.habits?.length || 0
    const completionRate = context.stats?.completionRate || 0
    
    // NEW: Include period in cache key if available
    const periodKey = context.period 
      ? `${context.period.type}_${context.period.totalDays}`
      : (context.timeframe || 'default')
    
    return `${userId}_${type}_${periodKey}_${habitsCount}_${completionRate}_${timestamp}`
  }

  /**
   * Clear cache
   * ✅ BACKWARD COMPATIBLE - Existing signature preserved
   */
  clearCache(userId?: string): void {
    if (userId) {
      const keysToDelete: string[] = []
      
      this.insightsCache.forEach((_, key) => {
        if (key.startsWith(userId)) keysToDelete.push(key)
      })
      
      this.suggestionsCache.forEach((_, key) => {
        if (key.startsWith(userId)) keysToDelete.push(key)
      })
      
      this.moodInsightsCache.forEach((_, key) => {
        if (key.startsWith(userId)) keysToDelete.push(key)
      })
      
      keysToDelete.forEach(key => {
        this.insightsCache.delete(key)
        this.suggestionsCache.delete(key)
        this.moodInsightsCache.delete(key)
      })

      console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for user ${userId}`)
    } else {
      this.insightsCache.clear()
      this.suggestionsCache.clear()
      this.moodInsightsCache.clear()
      console.log('🗑️ Cleared all cache')
    }
  }

  /**
   * Preload insights
   * ✅ BACKWARD COMPATIBLE
   */
  async preloadInsights(userId: string, context: InsightsContext): Promise<void> {
    this.getInsights(userId, context, { forceRefresh: false }).catch(err => {
      console.warn('Preload insights failed:', err)
    })
  }

  /**
   * Get cache statistics
   * ✅ BACKWARD COMPATIBLE - Returns same format
   */
  getCacheStats(): { insights: number; suggestions: number; moodInsights: number } {
    return {
      insights: this.insightsCache.size,
      suggestions: this.suggestionsCache.size,
      moodInsights: this.moodInsightsCache.size
    }
  }

  /**
   * Fallback insights
   * ✅ BACKWARD COMPATIBLE - Same behavior, period-aware messaging
   */
  private getFallbackInsights(context: InsightsContext): AIInsight[] {
    const insights: AIInsight[] = []
    const stats = context.stats
    const period = context.period
    const timestamp = Date.now()

    const periodLabel = period?.label || 'this period'

    if (!stats || stats.totalHabits === 0) {
      return [{
        id: `fallback_welcome_${timestamp}`,
        type: 'motivation',
        title: 'Start Your Journey',
        description: 'Create your first habit to begin building better routines.',
        icon: '🚀',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Create Habit',
          type: 'create_habit',
          data: {}
        }
      }]
    }

    if (stats.completionRate > 80) {
      insights.push({
        id: `fallback_high_completion_${timestamp}`,
        type: 'achievement',
        title: 'Excellent Consistency!',
        description: `Your ${stats.completionRate}% completion rate shows incredible dedication.`,
        icon: '🎉',
        priority: 'high'
      })
    }

    if (stats.completionRate < 50 && stats.totalHabits > 0) {
      insights.push({
        id: `fallback_low_completion_${timestamp}`,
        type: 'tip',
        title: 'Focus on Fewer Habits',
        description: 'Try focusing on 1-2 core habits to build momentum.',
        icon: '💡',
        priority: 'medium'
      })
    }

    if (stats.activeStreak >= 7) {
      insights.push({
        id: `fallback_streak_${timestamp}`,
        type: 'achievement',
        title: `${stats.activeStreak} Day Streak!`,
        description: "You're building serious momentum. Keep it going!",
        icon: '🔥',
        priority: 'high'
      })
    }

    return insights.slice(0, 3)
  }

  private getFallbackHabitInsights(context: InsightsContext, habitId: string): AIInsight[] {
    return [{
      id: `fallback_habit_tip_${habitId}_${Date.now()}`,
      type: 'tip',
      title: 'Keep Building',
      description: 'Consistency is key. Focus on showing up every day.',
      icon: '💪',
      priority: 'medium'
    }]
  }

  private getFallbackMoodInsights(context: InsightsContext): MoodInsight[] {
    if (!context.moodData || context.moodData.length === 0) {
      return []
    }

    return [{
      id: `fallback_mood_${Date.now()}`,
      type: 'pattern',
      title: 'Track More for Insights',
      description: 'Continue logging your mood to see patterns and correlations with your habits.',
      moodTrend: 'stable',
      correlatedHabits: [],
      confidence: 0.5
    }]
  }
}

export const insightsService = InsightsService.getInstance()