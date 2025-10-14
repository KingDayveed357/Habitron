// hooks/useInsights.ts - FIXED VERSION
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { 
  insightsService, 
  AIInsight, 
  HabitSuggestion, 
  MoodInsight,
  InsightsContext 
} from '@/services/AIServices/insights'
import { useAuth } from '@/hooks/useAuth'

interface UseInsightsOptions {
  autoLoad?: boolean
  cacheTTL?: number
  context: InsightsContext
  enableMoodInsights?: boolean
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
  cacheStats: { insights: number; suggestions: number; moodInsights: number }
}

export function useInsights(options: UseInsightsOptions): UseInsightsReturn {
  const { user } = useAuth()
  const { 
    autoLoad = false, 
    cacheTTL = 5 * 60 * 1000, 
    context,
    enableMoodInsights = false 
  } = options

  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  const [moodInsights, setMoodInsights] = useState<MoodInsight[]>([])
  const [loadingMoodInsights, setLoadingMoodInsights] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const [cacheStats, setCacheStats] = useState({ insights: 0, suggestions: 0, moodInsights: 0 })
  
  const mountedRef = useRef(true)
  const lastContextRef = useRef<string>('')
  
  // FIX #1: Single abort controller per request type
  const insightsAbortRef = useRef<AbortController | null>(null)
  const suggestionsAbortRef = useRef<AbortController | null>(null)
  const moodInsightsAbortRef = useRef<AbortController | null>(null)

  // Generate context hash for change detection
  const contextHash = useMemo(() => {
    if (!context) return ''
    
    return JSON.stringify({
      habits: context.habits?.length || 0,
      totalHabits: context.stats?.totalHabits || 0,
      completionRate: context.stats?.completionRate || 0,
      activeStreak: context.stats?.activeStreak || 0,
      timeframe: context.timeframe
    })
  }, [context])

  // FIX #2: Improved refresh with abort controller
  const refreshInsights = useCallback(async () => {
    if (!user) {
      console.log('⚠️ No user, skipping insights refresh')
      return
    }
    
    // Cancel any pending request
    if (insightsAbortRef.current) {
      insightsAbortRef.current.abort()
    }
    
    insightsAbortRef.current = new AbortController()

    try {
      setLoadingInsights(true)
      setError(null)

      console.log('🔄 Refreshing insights...')
      const result = await insightsService.getInsights(user.id, context, {
        forceRefresh: true,
        cacheTTL
      })

      if (!mountedRef.current) return

      if (Array.isArray(result)) {
        console.log(`✅ Setting ${result.length} insights`)
        setInsights(result)
        setCacheStats(insightsService.getCacheStats())
      } else {
        console.error('❌ Invalid insights result:', result)
        setInsights([])
        setError('Invalid response from server')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('⏹️ Request aborted')
        return
      }

      console.error('❌ Failed to load insights:', err)
      
      if (mountedRef.current) {
        setError(err.message || 'Failed to load insights')
        // Keep existing insights on error
        console.log('⚠️ Keeping existing insights after error')
      }
    } finally {
      if (mountedRef.current) {
        setLoadingInsights(false)
      }
      insightsAbortRef.current = null
    }
  }, [user, context, cacheTTL])

  // FIX #3: Improved suggestions generation
  const generateSuggestions = useCallback(async () => {
    if (!user) {
      console.log('⚠️ No user, skipping suggestions generation')
      return
    }
    
    if (suggestionsAbortRef.current) {
      suggestionsAbortRef.current.abort()
    }
    
    suggestionsAbortRef.current = new AbortController()

    try {
      setLoadingSuggestions(true)
      setError(null)

      console.log('🔄 Generating suggestions...')
      const result = await insightsService.getSuggestions(user.id, context, {
        forceRefresh: true,
        cacheTTL
      })

      if (!mountedRef.current) return

      if (Array.isArray(result)) {
        console.log(`✅ Setting ${result.length} suggestions`)
        setSuggestions(result)
        setCacheStats(insightsService.getCacheStats())
      } else {
        console.error('❌ Invalid suggestions result:', result)
        setSuggestions([])
        setError('Invalid response from server')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('⏹️ Suggestions request aborted')
        return
      }

      console.error('❌ Failed to generate suggestions:', err)
      
      if (mountedRef.current) {
        setError(err.message || 'Failed to generate suggestions')
      }
    } finally {
      if (mountedRef.current) {
        setLoadingSuggestions(false)
      }
      suggestionsAbortRef.current = null
    }
  }, [user, context, cacheTTL])

  // Refresh mood insights
  const refreshMoodInsights = useCallback(async () => {
    if (!user || !enableMoodInsights) {
      return
    }
    
    if (moodInsightsAbortRef.current) {
      moodInsightsAbortRef.current.abort()
    }
    
    moodInsightsAbortRef.current = new AbortController()

    try {
      setLoadingMoodInsights(true)
      setError(null)

      console.log('🔄 Refreshing mood insights...')
      const result = await insightsService.getMoodInsights(user.id, context, {
        forceRefresh: true,
        cacheTTL
      })

      if (!mountedRef.current) return

      if (Array.isArray(result)) {
        console.log(`✅ Setting ${result.length} mood insights`)
        setMoodInsights(result)
        setCacheStats(insightsService.getCacheStats())
      } else {
        console.error('❌ Invalid mood insights result:', result)
        setMoodInsights([])
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('⏹️ Mood insights request aborted')
        return
      }

      console.error('❌ Failed to load mood insights:', err)
      
      if (mountedRef.current) {
        setError(err.message || 'Failed to load mood insights')
      }
    } finally {
      if (mountedRef.current) {
        setLoadingMoodInsights(false)
      }
      moodInsightsAbortRef.current = null
    }
  }, [user, context, cacheTTL, enableMoodInsights])

  // Get habit-specific insights
  const getHabitInsights = useCallback(async (habitId: string): Promise<AIInsight[]> => {
    if (!user) return []

    try {
      return await insightsService.getHabitDetailInsights(user.id, habitId, context)
    } catch (err: any) {
      console.error('Failed to load habit insights:', err)
      return []
    }
  }, [user, context])

  // FIX #4: Improved auto-load logic
  useEffect(() => {
    if (!autoLoad || !user) return

    // Only load if context has changed significantly
    if (contextHash !== lastContextRef.current) {
      lastContextRef.current = contextHash
      
      console.log('📊 Context changed, loading insights...')
      
      // Load insights if we don't have any
      if (insights.length === 0 && !loadingInsights) {
        refreshInsights()
      }

      // Load mood insights if enabled
      if (enableMoodInsights && moodInsights.length === 0 && !loadingMoodInsights) {
        refreshMoodInsights()
      }
    }
  }, [autoLoad, user, contextHash, enableMoodInsights, insights.length, moodInsights.length, loadingInsights, loadingMoodInsights, refreshInsights, refreshMoodInsights])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Clear cache
  const clearCache = useCallback(() => {
    if (user) {
      insightsService.clearCache(user.id)
      setCacheStats(insightsService.getCacheStats())
    }
  }, [user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
  }, [])

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