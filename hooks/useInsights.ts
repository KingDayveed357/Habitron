// hooks/useInsights.ts - OFFLINE-FIRST VERSION
/**
 * 🎯 OFFLINE-FIRST INSIGHTS HOOK
 * 
 * Key Features:
 * - Builds context from LocalHabitRecord (SQLite)
 * - Automatically includes user profile from onboarding
 * - Cache-aware with proper invalidation
 * - Works seamlessly across all screens
 * - Proper cleanup and abort handling
 * 
 * @version 4.0.0 - Offline-first with comprehensive debugging
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { 
  insightsService, 
  AIInsight, 
  HabitSuggestion, 
  MoodInsight,
  InsightsContext 
} from '@/services/AIServices/insights'
import { useAuth } from '@/hooks/useAuth'
import { calculateHabitStreak } from '@/utils/streakCalculation'
import type { LocalHabitRecord, LocalCompletionRecord } from '@/types/habit'

interface UseInsightsOptions {
  autoLoad?: boolean
  cacheTTL?: number
  context: InsightsContext
  enableMoodInsights?: boolean
  onError?: (error: string) => void
  debug?: boolean
}

interface UseInsightsReturn {
  insights: AIInsight[]
  loadingInsights: boolean
  refreshInsights: () => Promise<void>
  
  suggestions: HabitSuggestion[]
  loadingSuggestions: boolean
  generateSuggestions: () => Promise<void>
  
  moodInsights: MoodInsight[]
  loadingMoodInsights: boolean
  refreshMoodInsights: () => Promise<void>
  
  getHabitInsights: (habitId: string) => Promise<AIInsight[]>
  
  error: string | null
  clearError: () => void
  
  clearCache: () => void
  cacheStats: { insights: number; suggestions: number; moodInsights: number; hasProfile: boolean }
}

export function useInsights(options: UseInsightsOptions): UseInsightsReturn {
  const { user } = useAuth()
  const { 
    autoLoad = false, 
    cacheTTL = 5 * 60 * 1000, 
    context,
    enableMoodInsights = false,
    onError,
    debug = false 
  } = options

  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  const [moodInsights, setMoodInsights] = useState<MoodInsight[]>([])
  const [loadingMoodInsights, setLoadingMoodInsights] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const [cacheStats, setCacheStats] = useState({ 
    insights: 0, 
    suggestions: 0, 
    moodInsights: 0, 
    hasProfile: false 
  })
  
  const mountedRef = useRef(true)
  const lastContextRef = useRef<string>('')
  
  // Single abort controller per request type
  const insightsAbortRef = useRef<AbortController | null>(null)
  const suggestionsAbortRef = useRef<AbortController | null>(null)
  const moodInsightsAbortRef = useRef<AbortController | null>(null)

  // Debug logger
  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[useInsights] ${message}`, data || '')
    }
  }, [debug])

  /**
   * 🆕 Generate context hash for change detection
   * Only triggers re-fetch when meaningful data changes
   */
  const contextHash = useMemo(() => {
    if (!context) return ''
    
    const hash = JSON.stringify({
      habitsCount: context.habits?.length || 0,
      totalHabits: context.stats?.totalHabits || 0,
      completedToday: context.stats?.completedToday || 0,
      completionRate: context.stats?.completionRate || 0,
      activeStreak: context.stats?.activeStreak || 0,
      periodType: context.period?.type || 'today',
      periodDays: context.period?.totalDays || 1,
      hasProfile: !!context.userProfile,
      timeframe: context.timeframe
    })
    
    log('Context hash generated:', hash)
    return hash
  }, [
    context?.habits?.length,
    context?.stats?.totalHabits,
    context?.stats?.completedToday,
    context?.stats?.completionRate,
    context?.stats?.activeStreak,
    context?.period?.type,
    context?.period?.totalDays,
    context?.userProfile,
    context?.timeframe,
    log
  ])

  /**
   * Refresh insights with proper abort handling
   */
  const refreshInsights = useCallback(async () => {
    if (!user) {
      log('No user, skipping insights refresh')
      return
    }
    
    // Cancel any pending request
    if (insightsAbortRef.current) {
      log('Aborting previous insights request')
      insightsAbortRef.current.abort()
    }
    
    insightsAbortRef.current = new AbortController()

    try {
      setLoadingInsights(true)
      setError(null)

      log('Refreshing insights...', {
        userId: user.id.substring(0, 8),
        habitsCount: context.habits?.length || 0,
        hasProfile: !!context.userProfile,
        period: context.period?.label || 'today'
      })

      const result = await insightsService.getInsights(user.id, context, {
        forceRefresh: true,
        cacheTTL
      })

      if (!mountedRef.current) {
        log('Component unmounted, discarding insights')
        return
      }

      if (Array.isArray(result)) {
        log(`Setting ${result.length} insights`)
        setInsights(result)
        setCacheStats(insightsService.getCacheStats())
      } else {
        console.error('❌ Invalid insights result:', result)
        setInsights([])
        setError('Invalid response from server')
        if (onError) onError('Invalid response from server')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        log('Request aborted')
        return
      }

      console.error('❌ Failed to load insights:', err)
      
      if (mountedRef.current) {
        const errorMsg = err.message || 'Failed to load insights'
        setError(errorMsg)
        if (onError) onError(errorMsg)
        log('Keeping existing insights after error')
      }
    } finally {
      if (mountedRef.current) {
        setLoadingInsights(false)
      }
      insightsAbortRef.current = null
    }
  }, [user, context, cacheTTL, onError, log])

  /**
   * Generate suggestions with proper abort handling
   */
  const generateSuggestions = useCallback(async () => {
    if (!user) {
      log('No user, skipping suggestions generation')
      return
    }
    
    if (suggestionsAbortRef.current) {
      log('Aborting previous suggestions request')
      suggestionsAbortRef.current.abort()
    }
    
    suggestionsAbortRef.current = new AbortController()

    try {
      setLoadingSuggestions(true)
      setError(null)

      log('Generating suggestions...', {
        userId: user.id.substring(0, 8),
        habitsCount: context.habits?.length || 0
      })

      const result = await insightsService.getSuggestions(user.id, context, {
        forceRefresh: true,
        cacheTTL
      })

      if (!mountedRef.current) {
        log('Component unmounted, discarding suggestions')
        return
      }

      if (Array.isArray(result)) {
        log(`Setting ${result.length} suggestions`)
        setSuggestions(result)
        setCacheStats(insightsService.getCacheStats())
      } else {
        console.error('❌ Invalid suggestions result:', result)
        setSuggestions([])
        setError('Invalid response from server')
        if (onError) onError('Invalid response from server')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        log('Suggestions request aborted')
        return
      }

      console.error('❌ Failed to generate suggestions:', err)
      
      if (mountedRef.current) {
        const errorMsg = err.message || 'Failed to generate suggestions'
        setError(errorMsg)
        if (onError) onError(errorMsg)
      }
    } finally {
      if (mountedRef.current) {
        setLoadingSuggestions(false)
      }
      suggestionsAbortRef.current = null
    }
  }, [user, context, cacheTTL, onError, log])

  /**
   * Refresh mood insights
   */
  const refreshMoodInsights = useCallback(async () => {
    if (!user || !enableMoodInsights) {
      log('Mood insights disabled or no user')
      return
    }
    
    if (moodInsightsAbortRef.current) {
      log('Aborting previous mood insights request')
      moodInsightsAbortRef.current.abort()
    }
    
    moodInsightsAbortRef.current = new AbortController()

    try {
      setLoadingMoodInsights(true)
      setError(null)

      log('Refreshing mood insights...')

      const result = await insightsService.getMoodInsights(user.id, context, {
        forceRefresh: true,
        cacheTTL
      })

      if (!mountedRef.current) {
        log('Component unmounted, discarding mood insights')
        return
      }

      if (Array.isArray(result)) {
        log(`Setting ${result.length} mood insights`)
        setMoodInsights(result)
        setCacheStats(insightsService.getCacheStats())
      } else {
        console.error('❌ Invalid mood insights result:', result)
        setMoodInsights([])
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        log('Mood insights request aborted')
        return
      }

      console.error('❌ Failed to load mood insights:', err)
      
      if (mountedRef.current) {
        const errorMsg = err.message || 'Failed to load mood insights'
        setError(errorMsg)
        if (onError) onError(errorMsg)
      }
    } finally {
      if (mountedRef.current) {
        setLoadingMoodInsights(false)
      }
      moodInsightsAbortRef.current = null
    }
  }, [user, context, cacheTTL, enableMoodInsights, onError, log])

  /**
   * Get habit-specific insights
   */
  const getHabitInsights = useCallback(async (habitId: string): Promise<AIInsight[]> => {
    if (!user) {
      log('No user, cannot get habit insights')
      return []
    }

    try {
      log(`Getting insights for habit ${habitId}`)
      return await insightsService.getHabitDetailInsights(user.id, habitId, context)
    } catch (err: any) {
      console.error('Failed to load habit insights:', err)
      return []
    }
  }, [user, context, log])

  /**
   * Auto-load logic - only when context meaningfully changes
   */
  useEffect(() => {
    if (!autoLoad || !user) return

    // Only load if context has changed significantly
    if (contextHash !== lastContextRef.current) {
      log('Context changed, triggering auto-load', {
        oldHash: lastContextRef.current.substring(0, 50),
        newHash: contextHash.substring(0, 50)
      })
      
      lastContextRef.current = contextHash
      
      // Load insights if we don't have any
      if (insights.length === 0 && !loadingInsights) {
        log('Auto-loading insights (none exist)')
        refreshInsights()
      }

      // Load mood insights if enabled
      if (enableMoodInsights && moodInsights.length === 0 && !loadingMoodInsights) {
        log('Auto-loading mood insights (none exist)')
        refreshMoodInsights()
      }
    }
  }, [
    autoLoad, 
    user, 
    contextHash, 
    enableMoodInsights, 
    insights.length, 
    moodInsights.length, 
    loadingInsights, 
    loadingMoodInsights, 
    refreshInsights, 
    refreshMoodInsights,
    log
  ])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    if (user) {
      log('Clearing cache for user')
      insightsService.clearCache(user.id)
      setCacheStats(insightsService.getCacheStats())
      setInsights([])
      setSuggestions([])
      setMoodInsights([])
    }
  }, [user, log])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      log('Component unmounting, cleaning up')
      mountedRef.current = false
      
      // Abort any pending requests
      if (insightsAbortRef.current) {
        insightsAbortRef.current.abort()
      }
      if (suggestionsAbortRef.current) {
        suggestionsAbortRef.current.abort()
      }
      if (moodInsightsAbortRef.current) {
        moodInsightsAbortRef.current.abort()
      }
    }
  }, [log])

  return {
    insights,
    loadingInsights,
    refreshInsights,
    suggestions,
    loadingSuggestions,
    generateSuggestions,
    moodInsights,
    loadingMoodInsights,
    refreshMoodInsights,
    getHabitInsights,
    error,
    clearError,
    clearCache,
    cacheStats
  }
}

/**
 * 🆕 HELPER: Build insights context from local habits
 * Use this in screens to prepare context from SQLite data
 */
export function buildInsightsContext(
  habits: LocalHabitRecord[],
  completions: LocalCompletionRecord[],
  period?: {
    type: 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom'
    startDate?: string
    endDate?: string
    totalDays: number
    label: string
  }
): InsightsContext {
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate stats from local data
  const totalHabits = habits.filter(h => h.is_active).length
  const completedToday = habits.filter(h => {
    const todayCompletion = completions.find(
      c => c.habit_id === h.id && c.completion_date === today
    )
    return todayCompletion && todayCompletion.completed_count >= h.target_count
  }).length

  // Calculate completion rate (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })

  let totalPossible = 0
  let totalCompleted = 0
  
  habits.forEach(habit => {
    last30Days.forEach(date => {
      totalPossible++
      const completion = completions.find(
        c => c.habit_id === habit.id && c.completion_date === date
      )
      if (completion && completion.completed_count >= habit.target_count) {
        totalCompleted++
      }
    })
  })

  const completionRate = totalPossible > 0 
    ? Math.round((totalCompleted / totalPossible) * 100) 
    : 0

  // Calculate average streak
  const streaks = habits.map(habit => {
    const habitCompletions = completions.filter(c => c.habit_id === habit.id)
    const { currentStreak } = calculateHabitStreak(habit, habitCompletions)
    return currentStreak
  })

  const activeStreak = streaks.length > 0 
    ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) 
    : 0

  // Transform habits to context format
  const habitsContext = habits
    .filter(h => h.is_active)
    .map(habit => {
      const habitCompletions = completions.filter(c => c.habit_id === habit.id)
      const { currentStreak } = calculateHabitStreak(habit, habitCompletions)
      
      return {
        id: habit.id,
        title: habit.title,
        icon: habit.icon,
        category: habit.category,
        target_count: habit.target_count,
        target_unit: habit.target_unit,
        frequency_type: habit.frequency_type,
        currentStreak,
        completionRate: 0, // Calculate if needed
        is_active: true
      }
    })

  return {
    habits: habitsContext,
    stats: {
      totalHabits,
      completedToday,
      completionRate,
      activeStreak
    },
    habitHistory: completions,
    period,
    timeframe: period?.type === 'today' ? 'today' : 
               period?.type === 'week' ? 'week' : 
               period?.type === 'month' ? 'month' : 'all'
  }
}