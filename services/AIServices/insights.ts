// services/AIServices/insights.ts - OFFLINE-FIRST VERSION
/**
 * 🎯 OFFLINE-FIRST AI INSIGHTS SERVICE
 * 
 * Key Features:
 * - Works with LocalHabitRecord and LocalCompletionRecord
 * - Automatically loads user profile from onboarding
 * - Builds context from SQLite data (not Supabase)
 * - Caches insights with period + profile awareness
 * - Backward compatible with existing API
 * 
 * @version 4.0.0 - Offline-first with profile personalization
 */

import { apiPost } from '../apiClient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LocalHabitRecord, LocalCompletionRecord } from '@/types/habit'

// ============================================================================
// TYPES - Enhanced with Offline-First Support
// ============================================================================

export interface UserProfile {
  focusAreas?: string[]
  wakeupTime?: string
  primaryChallenge?: string
  routineLevel?: string
  peakProductivityTime?: string
  dailyTimeCommitment?: string
  motivationFactors?: string[]
  hasCommitment?: boolean
}

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

export interface PeriodInfo {
  type: 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom'
  startDate?: string
  endDate?: string
  totalDays: number
  label: string
}

// NEW: Offline-aware context built from local SQLite data
export interface InsightsContext {
  habits?: Array<{
    id: string
    title: string
    icon: string
    category: string
    target_count: number
    target_unit: string
    frequency_type: string
    currentStreak?: number
    completionRate?: number
    is_active: boolean
  }>
  stats?: {
    totalHabits: number
    completedToday: number
    completionRate: number
    activeStreak: number
  }
  userProfile?: UserProfile
  moodData?: any[]
  habitHistory?: LocalCompletionRecord[]
  timeframe?: 'today' | 'week' | 'month' | 'all'
  period?: PeriodInfo
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  periodKey?: string
  hasProfile?: boolean
  contextHash?: string
}

// ============================================================================
// INSIGHTS SERVICE CLASS - Offline-First Implementation
// ============================================================================

class InsightsService {
  private static instance: InsightsService
  private insightsCache = new Map<string, CacheEntry<AIInsight[]>>()
  private suggestionsCache = new Map<string, CacheEntry<HabitSuggestion[]>>()
  private moodInsightsCache = new Map<string, CacheEntry<MoodInsight[]>>()
  private userProfileCache: UserProfile | null = null
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  
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
   * 🆕 Load user profile from AsyncStorage (onboarding data)
   */
  private async loadUserProfile(): Promise<UserProfile | null> {
    if (this.userProfileCache) {
      return this.userProfileCache
    }

    try {
      const profileJson = await AsyncStorage.getItem('userProfile')
      if (profileJson) {
        this.userProfileCache = JSON.parse(profileJson)
        console.log('✅ User profile loaded for personalization:', {
          focusAreas: this.userProfileCache.focusAreas?.length || 0,
          hasChallenge: !!this.userProfileCache.primaryChallenge,
          timeCommitment: this.userProfileCache.dailyTimeCommitment
        })
        return this.userProfileCache
      }
    } catch (error) {
      console.warn('⚠️ Failed to load user profile:', error)
    }

    return null
  }

  /**
   * 🆕 Refresh user profile cache (call after onboarding updates)
   */
  async refreshUserProfile(): Promise<void> {
    this.userProfileCache = null
    await this.loadUserProfile()
  }

  /**
   * 🆕 Build context hash for cache invalidation
   */
  private buildContextHash(context: InsightsContext): string {
    const parts = [
      context.habits?.length || 0,
      context.stats?.totalHabits || 0,
      context.stats?.completedToday || 0,
      context.stats?.completionRate || 0,
      context.period?.type || 'today',
      context.period?.totalDays || 1,
      context.userProfile ? 'personalized' : 'generic'
    ]
    return parts.join('_')
  }

  /**
   * 🆕 Enhance context with user profile and local SQLite data
   */
  private async enhanceContext(context: InsightsContext): Promise<InsightsContext> {
    // Load user profile if not already in context
    if (!context.userProfile) {
      const profile = await this.loadUserProfile()
      if (profile) {
        context = { ...context, userProfile: profile }
      }
    }

    // Ensure period context exists
    return this.ensurePeriodContext(context)
  }

  /**
   * Get general insights - OFFLINE-FIRST
   * ✅ Works with LocalHabitRecord
   * ✅ Automatically adds user profile
   * ✅ Cache-aware with proper invalidation
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
    
    // Enhance context with user profile
    const enhancedContext = await this.enhanceContext(context)
    const contextHash = this.buildContextHash(enhancedContext)
    const cacheKey = this.generateCacheKey(userId, enhancedContext, 'insights')

    console.log('📊 Getting insights:', {
      userId: userId.substring(0, 8),
      habitsCount: enhancedContext.habits?.length || 0,
      hasProfile: !!enhancedContext.userProfile,
      period: enhancedContext.period?.label || 'today',
      contextHash,
      forceRefresh
    })

    // Check cache first
    if (!forceRefresh) {
      const cached = this.insightsCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt && cached.contextHash === contextHash) {
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
    const promise = this.fetchInsights(userId, enhancedContext, cacheTTL, cacheKey, contextHash)
    this.pendingInsights.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      this.pendingInsights.delete(cacheKey)
    }
  }

  /**
   * Get habit suggestions - OFFLINE-FIRST
   */
  async getSuggestions(
    userId: string,
    context: InsightsContext,
    options: { forceRefresh?: boolean; cacheTTL?: number } = {}
  ): Promise<HabitSuggestion[]> {
    const { forceRefresh = false, cacheTTL = this.DEFAULT_CACHE_TTL } = options
    
    const enhancedContext = await this.enhanceContext(context)
    const contextHash = this.buildContextHash(enhancedContext)
    const cacheKey = this.generateCacheKey(userId, enhancedContext, 'suggestions')

    if (!forceRefresh) {
      const cached = this.suggestionsCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt && cached.contextHash === contextHash) {
        console.log('📦 Returning cached suggestions')
        return cached.data
      }
    }

    const pending = this.pendingSuggestions.get(cacheKey)
    if (pending) return pending

    const promise = this.fetchSuggestions(userId, enhancedContext, cacheTTL, cacheKey, contextHash)
    this.pendingSuggestions.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      this.pendingSuggestions.delete(cacheKey)
    }
  }

  /**
   * Get mood insights - OFFLINE-FIRST
   */
  async getMoodInsights(
    userId: string,
    context: InsightsContext,
    options: { forceRefresh?: boolean; cacheTTL?: number } = {}
  ): Promise<MoodInsight[]> {
    const { forceRefresh = false, cacheTTL = this.DEFAULT_CACHE_TTL } = options
    
    const enhancedContext = await this.enhanceContext(context)
    const contextHash = this.buildContextHash(enhancedContext)
    const cacheKey = this.generateCacheKey(userId, enhancedContext, 'mood')

    if (!forceRefresh) {
      const cached = this.moodInsightsCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt && cached.contextHash === contextHash) {
        return cached.data
      }
    }

    const pending = this.pendingMoodInsights.get(cacheKey)
    if (pending) return pending

    const promise = this.fetchMoodInsights(userId, enhancedContext, cacheTTL, cacheKey, contextHash)
    this.pendingMoodInsights.set(cacheKey, promise)

    try {
      return await promise
    } finally {
      this.pendingMoodInsights.delete(cacheKey)
    }
  }

  /**
   * Fetch insights from API with offline-first context
   */
  private async fetchInsights(
    userId: string,
    context: InsightsContext,
    cacheTTL: number,
    cacheKey: string,
    contextHash: string
  ): Promise<AIInsight[]> {
    try {
      console.log('🔄 Fetching personalized insights from API...', {
        habitsCount: context.habits?.length || 0,
        hasProfile: !!context.userProfile,
        period: context.period?.label
      })
      
      const response = await apiPost<{ insights: AIInsight[] }>(
        '/ai-insights',
        {
          userId,
          type: 'insights',
          context
        },
        { timeout: 15000 }
      )

      let insights = Array.isArray(response?.insights) ? response.insights : []
      
      insights = insights.map((insight, index) => ({
        ...insight,
        id: insight.id || `insight_${Date.now()}_${index}`
      }))

      console.log(`✅ Got ${insights.length} personalized insights from API`)

      if (insights.length > 0) {
        this.insightsCache.set(cacheKey, {
          data: insights,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTTL,
          periodKey: context.period?.label,
          hasProfile: !!context.userProfile,
          contextHash
        })
      }

      return insights
    } catch (error: any) {
      console.error('❌ Failed to fetch insights:', error.message)
      
      const cached = this.insightsCache.get(cacheKey)
      if (cached) {
        console.log('📦 Returning stale cache due to error')
        return cached.data
      }

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
    cacheKey: string,
    contextHash: string
  ): Promise<HabitSuggestion[]> {
    try {
      console.log('🔄 Fetching personalized suggestions from API...')
      
      const response = await apiPost<{ suggestions: HabitSuggestion[] }>(
        '/ai-insights',
        {
          userId,
          type: 'suggestions',
          context
        },
        { timeout: 15000 }
      )

      let suggestions = Array.isArray(response?.suggestions) ? response.suggestions : []
      
      suggestions = suggestions.map((suggestion, index) => ({
        ...suggestion,
        id: suggestion.id || `suggestion_${Date.now()}_${index}`
      }))

      console.log(`✅ Got ${suggestions.length} personalized suggestions from API`)

      if (suggestions.length > 0) {
        this.suggestionsCache.set(cacheKey, {
          data: suggestions,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTTL,
          periodKey: context.period?.label,
          hasProfile: !!context.userProfile,
          contextHash
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
    cacheKey: string,
    contextHash: string
  ): Promise<MoodInsight[]> {
    try {
      const response = await apiPost<{ moodInsights: MoodInsight[] }>(
        '/ai-insights',
        {
          userId,
          type: 'mood_analysis',
          context
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
          periodKey: context.period?.label,
          hasProfile: !!context.userProfile,
          contextHash
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
   */
  async getHabitDetailInsights(
    userId: string,
    habitId: string,
    context: InsightsContext
  ): Promise<AIInsight[]> {
    try {
      const enhancedContext = await this.enhanceContext(context)
      
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
   * Ensure period context exists
   */
  private ensurePeriodContext(context: InsightsContext): InsightsContext {
    if (context.period) {
      return context
    }

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
   * Generate cache key with context awareness
   */
  private generateCacheKey(userId: string, context: InsightsContext, type: string): string {
    const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute buckets
    const habitsCount = context.habits?.length || 0
    const completionRate = context.stats?.completionRate || 0
    
    const periodKey = context.period 
      ? `${context.period.type}_${context.period.totalDays}`
      : (context.timeframe || 'default')
    
    const profileKey = context.userProfile ? 'personalized' : 'generic'
    
    return `${userId}_${type}_${periodKey}_${habitsCount}_${completionRate}_${profileKey}_${timestamp}`
  }

  /**
   * Clear cache
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
    
    this.userProfileCache = null
  }

  /**
   * Preload insights
   */
  async preloadInsights(userId: string, context: InsightsContext): Promise<void> {
    this.getInsights(userId, context, { forceRefresh: false }).catch(err => {
      console.warn('Preload insights failed:', err)
    })
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { insights: number; suggestions: number; moodInsights: number; hasProfile: boolean } {
    return {
      insights: this.insightsCache.size,
      suggestions: this.suggestionsCache.size,
      moodInsights: this.moodInsightsCache.size,
      hasProfile: !!this.userProfileCache
    }
  }

  /**
   * Fallback insights (profile-aware)
   */
  private getFallbackInsights(context: InsightsContext): AIInsight[] {
    const insights: AIInsight[] = []
    const stats = context.stats
    const profile = context.userProfile
    const timestamp = Date.now()

    if (!stats || stats.totalHabits === 0) {
      const focusMessage = profile?.focusAreas?.length 
        ? `Let's start with ${profile.focusAreas[0]} habits!` 
        : 'Create your first habit to begin building better routines.'
      
      return [{
        id: `fallback_welcome_${timestamp}`,
        type: 'motivation',
        title: 'Start Your Journey',
        description: focusMessage,
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
      const tip = profile?.dailyTimeCommitment === '5min' 
        ? 'Start with just 5-minute habits to build momentum.'
        : 'Try focusing on 1-2 core habits to build momentum.'
      
      insights.push({
        id: `fallback_low_completion_${timestamp}`,
        type: 'tip',
        title: 'Focus on Fewer Habits',
        description: tip,
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