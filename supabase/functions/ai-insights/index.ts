// // supabase/functions/ai-insights/index.ts
// /**
//  * AI Insights Edge Function - Backward Compatible Enhancement
//  * 
//  * ✅ ALL EXISTING FUNCTIONALITY PRESERVED
//  * ✨ NEW: Period-aware insights when period context provided
//  * 
//  * @version 2.0.0 - Backward compatible
//  */

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
// const GROQ_API_URL = 'https://api.groq.com/openai/v1'

// // ============================================================================
// // TYPES (All existing types preserved)
// // ============================================================================

// interface InsightsRequest {
//   userId: string
//   type: 'insights' | 'suggestions' | 'mood_analysis' | 'habit_detail'
//   habitId?: string
//   context?: {
//     habits?: any[]
//     stats?: {
//       totalHabits: number
//       completedToday: number
//       completionRate: number
//       activeStreak: number
//     }
//     userProfile?: {
//       name: string
//       timezone?: string
//       preferences?: string[]
//     }
//     moodData?: any[]
//     habitHistory?: any[]
//     timeframe?: 'today' | 'week' | 'month' | 'all'
//     // NEW but optional (backward compatible)
//     period?: {
//       type: 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom'
//       startDate?: string
//       endDate?: string
//       totalDays?: number
//       label?: string
//     }
//   }
// }

// interface AIInsight {
//   id: string
//   type: 'trend' | 'achievement' | 'warning' | 'tip' | 'motivation'
//   title: string
//   description: string
//   icon: string
//   priority: 'high' | 'medium' | 'low'
//   actionable?: boolean
//   action?: {
//     label: string
//     type: 'navigate' | 'create_habit' | 'modify_habit'
//     data: any
//   }
// }

// interface HabitSuggestion {
//   id: string
//   title: string
//   icon: string
//   category: string
//   description: string
//   reasoning: string
//   targetCount: number
//   targetUnit: string
//   difficulty: 'easy' | 'medium' | 'hard'
//   estimatedTime: string
// }

// interface MoodInsight {
//   id: string
//   type: 'correlation' | 'pattern' | 'recommendation'
//   title: string
//   description: string
//   moodTrend: 'improving' | 'declining' | 'stable'
//   correlatedHabits: string[]
//   confidence: number
// }

// // ============================================================================
// // RATE LIMITING (Existing functionality)
// // ============================================================================

// const rateLimits = new Map<string, { count: number; resetTime: number }>()
// const RATE_LIMIT = 30
// const RATE_LIMIT_WINDOW = 3600000 // 1 hour

// function checkRateLimit(userId: string): boolean {
//   const now = Date.now()
//   const userLimit = rateLimits.get(userId)
  
//   if (!userLimit || now > userLimit.resetTime) {
//     rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
//     return true
//   }
  
//   if (userLimit.count >= RATE_LIMIT) return false
//   userLimit.count++
//   return true
// }

// // ============================================================================
// // HELPER: Extract period context (NEW - but doesn't affect existing logic)
// // ============================================================================

// function getPeriodContext(context: any): { hasPeriod: boolean; label: string; days: number } {
//   if (context.period && context.period.label) {
//     return {
//       hasPeriod: true,
//       label: context.period.label,
//       days: context.period.totalDays || 1
//     }
//   }
  
//   // Fallback to timeframe for backward compatibility
//   const timeframe = context.timeframe || 'today'
//   return {
//     hasPeriod: false,
//     label: timeframe === 'today' ? 'today' : 
//            timeframe === 'week' ? 'this week' : 
//            timeframe === 'month' ? 'this month' : 'recently',
//     days: timeframe === 'today' ? 1 : 
//           timeframe === 'week' ? 7 : 
//           timeframe === 'month' ? 30 : 1
//   }
// }

// // ============================================================================
// // PROMPT BUILDERS (Enhanced but backward compatible)
// // ============================================================================

// function buildInsightsPrompt(context: any): string {
//   const stats = context.stats || {}
//   const habits = context.habits || []
//   const periodInfo = getPeriodContext(context)
  
//   return `You are an AI habit coach. Analyze the user's habit data and generate 2-3 personalized insights.

// User Data:
// - Analysis Period: ${periodInfo.label} (${periodInfo.days} day${periodInfo.days > 1 ? 's' : ''})
// - Total Habits: ${stats.totalHabits || 0}
// - Completed Today: ${stats.completedToday || 0}
// - Completion Rate: ${stats.completionRate || 0}%
// - Active Streak: ${stats.activeStreak || 0} days
// - Habits: ${habits.map((h: any) => h.title).join(', ') || 'None'}

// Generate insights focusing on:
// 1. Achievements and positive patterns${periodInfo.hasPeriod ? ` from ${periodInfo.label}` : ''}
// 2. Areas for improvement with actionable advice
// 3. Motivational encouragement
// 4. Trend analysis

// Output ONLY valid JSON array with this exact structure:
// [
//   {
//     "id": "unique_id",
//     "type": "achievement|trend|warning|tip|motivation",
//     "title": "Short catchy title (5-8 words)",
//     "description": "Detailed insight (20-40 words)",
//     "icon": "relevant emoji",
//     "priority": "high|medium|low",
//     "actionable": true|false,
//     "action": {
//       "label": "Action button text",
//       "type": "navigate|create_habit|modify_habit",
//       "data": {}
//     }
//   }
// ]

// Return 2-3 insights. Be encouraging, specific, and actionable.`
// }

// function buildSuggestionsPrompt(context: any): string {
//   const stats = context.stats || {}
//   const habits = context.habits || []
//   const periodInfo = getPeriodContext(context)
  
//   return `You are an AI habit coach. Suggest 3-5 new habits based on the user's current routine.

// User Data:
// - Performance Period: ${periodInfo.label}
// - Current Habits: ${habits.map((h: any) => `${h.title} (${h.category || 'General'})`).join(', ') || 'None'}
// - Completion Rate: ${stats.completionRate || 0}%
// - Active Streak: ${stats.activeStreak || 0} days

// Suggest habits that:
// 1. Complement existing habits
// 2. Fill gaps in their routine
// 3. Build on their current success${periodInfo.hasPeriod ? ` shown in ${periodInfo.label}` : ''}
// 4. Vary in difficulty (easy, medium, hard)
// 5. Cover different life areas (health, productivity, mindfulness, etc.)

// Output ONLY valid JSON array:
// [
//   {
//     "id": "unique_id",
//     "title": "Habit title (3-5 words)",
//     "icon": "relevant emoji",
//     "category": "Health|Productivity|Mindfulness|Social|Learning|Finance|Other",
//     "description": "What this habit is (15-25 words)",
//     "reasoning": "Why this habit is suggested for them (20-35 words)",
//     "targetCount": 1,
//     "targetUnit": "time|times|minutes|pages|etc",
//     "difficulty": "easy|medium|hard",
//     "estimatedTime": "5 min|10-15 min|etc"
//   }
// ]

// Return 3-5 suggestions. Be specific and personalized.`
// }

// function buildMoodAnalysisPrompt(context: any): string {
//   const moodData = context.moodData || []
//   const habits = context.habits || []
//   const periodInfo = getPeriodContext(context)
  
//   return `You are an AI habit and wellness coach. Analyze mood patterns and correlations with habits.

// User Data:
// - Analysis Period: ${periodInfo.label}
// - Mood Entries: ${moodData.length} records
// - Habits: ${habits.map((h: any) => h.title).join(', ') || 'None'}
// - Recent Mood Trend: ${moodData.length > 0 ? 'Available' : 'Limited data'}

// Analyze:
// 1. Mood trends over time
// 2. Correlations between habits and mood
// 3. Patterns in mood fluctuations
// 4. Recommendations for improvement

// Output ONLY valid JSON array:
// [
//   {
//     "id": "unique_id",
//     "type": "correlation|pattern|recommendation",
//     "title": "Insight title (5-8 words)",
//     "description": "Detailed analysis (25-45 words)",
//     "moodTrend": "improving|declining|stable",
//     "correlatedHabits": ["habit1", "habit2"],
//     "confidence": 0.75
//   }
// ]

// Return 2-4 mood insights. Be empathetic and data-driven.`
// }

// function buildHabitDetailPrompt(habitId: string, context: any): string {
//   const habit = context.habits?.find((h: any) => h.id === habitId)
//   const periodInfo = getPeriodContext(context)
  
//   return `You are an AI habit coach. Provide detailed insights for a specific habit.

// Habit: ${habit?.title || 'Unknown'}
// Category: ${habit?.category || 'General'}
// Period: ${periodInfo.label}
// Current Streak: ${habit?.currentStreak || 0} days
// Completion Rate: ${habit?.completionRate || 0}%

// Generate 2-3 insights:
// 1. Progress analysis${periodInfo.hasPeriod ? ` for ${periodInfo.label}` : ''}
// 2. Tips for improvement
// 3. Encouragement and motivation

// Output ONLY valid JSON array (same format as general insights).`
// }

// // ============================================================================
// // GROQ API CALL (Existing functionality preserved)
// // ============================================================================

// async function callGroqAPI(prompt: string, systemPrompt: string): Promise<any> {
//   const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${GROQ_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'llama-3.1-8b-instant',
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: prompt }
//       ],
//       temperature: 0.7,
//       max_tokens: 1500,
//       response_format: { type: "json_object" }
//     }),
//   })

//   if (!response.ok) {
//     const errorText = await response.text()
//     throw new Error(`Groq API error: ${response.status} - ${errorText}`)
//   }

//   const data = await response.json()
//   const content = data.choices[0].message.content
  
//   try {
//     return JSON.parse(content)
//   } catch (e) {
//     console.error('Failed to parse JSON response:', content)
//     throw new Error('Invalid JSON response from AI')
//   }
// }

// // ============================================================================
// // MAIN HANDLER (All existing logic preserved)
// // ============================================================================

// serve(async (req) => {
//   // CORS headers
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { 
//       headers: { 
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//       } 
//     })
//   }

//   try {
//     const startTime = Date.now()
    
//     // Auth check
//     const authHeader = req.headers.get('Authorization')
//     if (!authHeader) {
//       return new Response(
//         JSON.stringify({ error: 'Missing authorization header' }),
//         { status: 401, headers: { 'Content-Type': 'application/json' } }
//       )
//     }

//     const supabase = createClient(
//       Deno.env.get('SUPABASE_URL')!,
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
//       { global: { headers: { Authorization: authHeader } } }
//     )

//     const { data: { user }, error: authError } = await supabase.auth.getUser()
//     if (authError || !user) {
//       return new Response(
//         JSON.stringify({ error: 'Unauthorized' }),
//         { status: 401, headers: { 'Content-Type': 'application/json' } }
//       )
//     }

//     // Rate limiting
//     if (!checkRateLimit(user.id)) {
//       return new Response(
//         JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
//         { status: 429, headers: { 'Content-Type': 'application/json' } }
//       )
//     }

//     // Parse request
//     const body: InsightsRequest = await req.json()
//     const { type, habitId, context = {} } = body

//     let result: any = {}

//     // Route to appropriate handler (EXISTING LOGIC)
//     switch (type) {
//       case 'insights': {
//         const prompt = buildInsightsPrompt(context)
//         const response = await callGroqAPI(
//           prompt,
//           'You are a JSON-only AI habit coach. Output valid JSON arrays only.'
//         )
//         result = { insights: response.insights || response }
//         break
//       }

//       case 'suggestions': {
//         const prompt = buildSuggestionsPrompt(context)
//         const response = await callGroqAPI(
//           prompt,
//           'You are a JSON-only AI habit coach. Output valid JSON arrays only.'
//         )
//         result = { suggestions: response.suggestions || response }
//         break
//       }

//       case 'mood_analysis': {
//         const prompt = buildMoodAnalysisPrompt(context)
//         const response = await callGroqAPI(
//           prompt,
//           'You are a JSON-only AI wellness coach. Output valid JSON arrays only.'
//         )
//         result = { moodInsights: response.moodInsights || response }
//         break
//       }

//       case 'habit_detail': {
//         if (!habitId) {
//           throw new Error('habitId required for habit_detail type')
//         }
//         const prompt = buildHabitDetailPrompt(habitId, context)
//         const response = await callGroqAPI(
//           prompt,
//           'You are a JSON-only AI habit coach. Output valid JSON arrays only.'
//         )
//         result = { insights: response.insights || response }
//         break
//       }

//       default:
//         throw new Error(`Unknown type: ${type}`)
//     }

//     // Add metadata (EXISTING + enhanced with period info if available)
//     result.metadata = {
//       type,
//       latency_ms: Date.now() - startTime,
//       timestamp: new Date().toISOString(),
//       // NEW: Include period info if provided
//       ...(context.period && { period: context.period })
//     }

//     return new Response(JSON.stringify(result), {
//       headers: { 
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*'
//       },
//     })

//   } catch (error: any) {
//     console.error('Error:', error)
//     return new Response(
//       JSON.stringify({ 
//         error: error.message || 'Internal server error',
//         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//       }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     )
//   }
// })

// // ============================================================================
// // SUMMARY OF CHANGES
// // ============================================================================

// /*
// ✅ BACKWARD COMPATIBILITY GUARANTEED:

// 1. All existing method signatures preserved
// 2. All existing types unchanged
// 3. All existing response formats maintained
// 4. Rate limiting works exactly as before
// 5. Error handling unchanged
// 6. CORS configuration same

// ✨ NEW FEATURES (Opt-in only):

// 1. context.period is OPTIONAL - if not provided, works as before
// 2. getPeriodContext() automatically falls back to timeframe
// 3. Prompts enhanced to use period context when available
// 4. Metadata includes period info only if provided

// 🔄 MIGRATION PATH:

// Old code (still works):
// ```
// const context = {
//   habits: [...],
//   stats: {...},
//   timeframe: 'week'
// }
// ```

// New code (enhanced):
// ```
// const context = {
//   habits: [...],
//   stats: {...},
//   timeframe: 'week',
//   period: {
//     type: 'week',
//     label: 'This Week',
//     totalDays: 7
//   }
// }
// ```

// Both work perfectly! No breaking changes required.
// */

// AI INSIGHTS 2.0 - INTERFACES UPDATE
// supabase/functions/ai-insights/index.ts
/**
 * AI Insights Edge Function - Enhanced with Onboarding Personalization
 * 
 * ✅ ALL EXISTING FUNCTIONALITY PRESERVED
 * ✨ NEW: Uses onboarding data for hyper-personalized insights
 * 
 * @version 3.0.0 - Backward compatible with onboarding enhancement
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const GROQ_API_URL = 'https://api.groq.com/openai/v1'

// ============================================================================
// TYPES (Enhanced with onboarding profile)
// ============================================================================

interface UserProfile {
  focusAreas?: string[]
  wakeupTime?: string
  primaryChallenge?: string
  routineLevel?: string
  peakProductivityTime?: string
  dailyTimeCommitment?: string
  motivationFactors?: string[]
  hasCommitment?: boolean
}

interface InsightsRequest {
  userId: string
  type: 'insights' | 'suggestions' | 'mood_analysis' | 'habit_detail'
  habitId?: string
  context?: {
    habits?: any[]
    stats?: {
      totalHabits: number
      completedToday: number
      completionRate: number
      activeStreak: number
    }
    userProfile?: UserProfile
    moodData?: any[]
    habitHistory?: any[]
    timeframe?: 'today' | 'week' | 'month' | 'all'
    period?: {
      type: 'today' | 'week' | 'month' | 'last6months' | 'year' | 'lastyear' | 'alltime' | 'custom'
      startDate?: string
      endDate?: string
      totalDays?: number
      label?: string
    }
  }
}

interface AIInsight {
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
}

interface HabitSuggestion {
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

interface MoodInsight {
  id: string
  type: 'correlation' | 'pattern' | 'recommendation'
  title: string
  description: string
  moodTrend: 'improving' | 'declining' | 'stable'
  correlatedHabits: string[]
  confidence: number
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimits = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30
const RATE_LIMIT_WINDOW = 3600000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimits.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT) return false
  userLimit.count++
  return true
}

// ============================================================================
// HELPER: Extract period context
// ============================================================================

function getPeriodContext(context: any): { hasPeriod: boolean; label: string; days: number } {
  if (context.period && context.period.label) {
    return {
      hasPeriod: true,
      label: context.period.label,
      days: context.period.totalDays || 1
    }
  }
  
  const timeframe = context.timeframe || 'today'
  return {
    hasPeriod: false,
    label: timeframe === 'today' ? 'today' : 
           timeframe === 'week' ? 'this week' : 
           timeframe === 'month' ? 'this month' : 'recently',
    days: timeframe === 'today' ? 1 : 
          timeframe === 'week' ? 7 : 
          timeframe === 'month' ? 30 : 1
  }
}

// ============================================================================
// NEW: Build personalization context from user profile
// ============================================================================

function buildPersonalizationContext(profile?: UserProfile): string {
  if (!profile) return ''
  
  const parts: string[] = []
  
  if (profile.focusAreas && profile.focusAreas.length > 0) {
    parts.push(`User wants to improve: ${profile.focusAreas.join(', ')}`)
  }
  
  if (profile.wakeupTime) {
    parts.push(`Typical wake-up time: ${profile.wakeupTime}`)
  }
  
  if (profile.primaryChallenge) {
    const challengeMap: Record<string, string> = {
      'motivation': 'struggles with motivation',
      'consistency': 'struggles with consistency',
      'focus': 'has difficulty maintaining focus',
      'overwhelm': 'often feels overwhelmed',
      'procrastination': 'tends to procrastinate',
      'stress': 'struggles with stress management'
    }
    parts.push(`Primary challenge: ${challengeMap[profile.primaryChallenge] || profile.primaryChallenge}`)
  }
  
  if (profile.routineLevel) {
    const routineMap: Record<string, string> = {
      'no_routine': 'has no current routine',
      'inconsistent': 'has an inconsistent routine',
      'some_structure': 'has some routine structure',
      'fairly_structured': 'has a fairly structured routine',
      'very_structured': 'has a very structured and disciplined routine'
    }
    parts.push(`Current routine: ${routineMap[profile.routineLevel] || profile.routineLevel}`)
  }
  
  if (profile.peakProductivityTime) {
    const timeMap: Record<string, string> = {
      'early_morning': 'Early Morning (5-8 AM)',
      'morning': 'Morning (8-12 PM)',
      'afternoon': 'Afternoon (12-5 PM)',
      'evening': 'Evening (5-9 PM)',
      'night': 'Night (9 PM+)'
    }
    parts.push(`Most productive during: ${timeMap[profile.peakProductivityTime] || profile.peakProductivityTime}`)
  }
  
  if (profile.dailyTimeCommitment) {
    const timeMap: Record<string, string> = {
      '5min': '5-10 minutes per day',
      '15min': '15-30 minutes per day',
      '30min': '30-60 minutes per day',
      '60min': '1+ hours per day'
    }
    parts.push(`Can commit: ${timeMap[profile.dailyTimeCommitment] || profile.dailyTimeCommitment}`)
  }
  
  if (profile.motivationFactors && profile.motivationFactors.length > 0) {
    parts.push(`Motivated by: ${profile.motivationFactors.join(', ')}`)
  }
  
  return parts.length > 0 ? `\n\nUser Profile:\n${parts.join('\n')}` : ''
}

// ============================================================================
// ENHANCED PROMPT BUILDERS (Now with personalization)
// ============================================================================

function buildInsightsPrompt(context: any): string {
  const stats = context.stats || {}
  const habits = context.habits || []
  const periodInfo = getPeriodContext(context)
  const personalization = buildPersonalizationContext(context.userProfile)
  
  return `You are an AI habit coach. Analyze the user's habit data and generate 2-3 personalized insights.

User Data:
- Analysis Period: ${periodInfo.label} (${periodInfo.days} day${periodInfo.days > 1 ? 's' : ''})
- Total Habits: ${stats.totalHabits || 0}
- Completed Today: ${stats.completedToday || 0}
- Completion Rate: ${stats.completionRate || 0}%
- Active Streak: ${stats.activeStreak || 0} days
- Habits: ${habits.map((h: any) => h.title).join(', ') || 'None'}${personalization}

Generate insights that:
1. Acknowledge their achievements and positive patterns from ${periodInfo.label}
2. Address their specific challenges (if mentioned in profile)
3. Provide actionable advice aligned with their goals and time commitment
4. Use motivational language that resonates with their motivation factors
5. Consider their productivity patterns when suggesting habit times

Output ONLY valid JSON array with this exact structure:
[
  {
    "id": "unique_id",
    "type": "achievement|trend|warning|tip|motivation",
    "title": "Short catchy title (5-8 words)",
    "description": "Detailed insight (20-40 words)",
    "icon": "relevant emoji",
    "priority": "high|medium|low",
    "actionable": true|false,
    "action": {
      "label": "Action button text",
      "type": "navigate|create_habit|modify_habit",
      "data": {}
    }
  }
]

Return 2-3 insights. Be encouraging, specific, and highly personalized.`
}

function buildSuggestionsPrompt(context: any): string {
  const stats = context.stats || {}
  const habits = context.habits || []
  const periodInfo = getPeriodContext(context)
  const personalization = buildPersonalizationContext(context.userProfile)
  const profile = context.userProfile || {}
  
  return `You are an AI habit coach. Suggest 3-5 new habits based on the user's profile and current routine.

User Data:
- Performance Period: ${periodInfo.label}
- Current Habits: ${habits.map((h: any) => `${h.title} (${h.category || 'General'})`).join(', ') || 'None'}
- Completion Rate: ${stats.completionRate || 0}%
- Active Streak: ${stats.activeStreak || 0} days${personalization}

Suggestion Guidelines:
1. Focus on their stated focus areas: ${profile.focusAreas?.join(', ') || 'general improvement'}
2. Match their time commitment: ${profile.dailyTimeCommitment || 'any duration'}
3. Address their primary challenge: ${profile.primaryChallenge || 'habit building'}
4. Complement existing habits without overwhelming them
5. Vary difficulty levels (easy, medium, hard)
6. Schedule suggestions during their peak productivity time: ${profile.peakProductivityTime || 'any time'}

Output ONLY valid JSON array:
[
  {
    "id": "unique_id",
    "title": "Habit title (3-5 words)",
    "icon": "relevant emoji",
    "category": "Health|Productivity|Mindfulness|Social|Learning|Finance|Other",
    "description": "What this habit is (15-25 words)",
    "reasoning": "Why this habit is perfect for them based on their profile (25-40 words)",
    "targetCount": 1,
    "targetUnit": "time|times|minutes|pages|etc",
    "difficulty": "easy|medium|hard",
    "estimatedTime": "5 min|10-15 min|etc"
  }
]

Return 3-5 highly personalized suggestions. Make them feel understood and supported.`
}

function buildMoodAnalysisPrompt(context: any): string {
  const moodData = context.moodData || []
  const habits = context.habits || []
  const periodInfo = getPeriodContext(context)
  const personalization = buildPersonalizationContext(context.userProfile)
  
  return `You are an AI habit and wellness coach. Analyze mood patterns and correlations with habits.

User Data:
- Analysis Period: ${periodInfo.label}
- Mood Entries: ${moodData.length} records
- Habits: ${habits.map((h: any) => h.title).join(', ') || 'None'}
- Recent Mood Trend: ${moodData.length > 0 ? 'Available' : 'Limited data'}${personalization}

Analyze:
1. Mood trends over time
2. Correlations between habits and emotional wellbeing
3. How their challenges (from profile) might affect mood
4. Personalized recommendations based on their goals

Output ONLY valid JSON array:
[
  {
    "id": "unique_id",
    "type": "correlation|pattern|recommendation",
    "title": "Insight title (5-8 words)",
    "description": "Detailed analysis (25-45 words)",
    "moodTrend": "improving|declining|stable",
    "correlatedHabits": ["habit1", "habit2"],
    "confidence": 0.75
  }
]

Return 2-4 mood insights. Be empathetic, data-driven, and personalized.`
}

function buildHabitDetailPrompt(habitId: string, context: any): string {
  const habit = context.habits?.find((h: any) => h.id === habitId)
  const periodInfo = getPeriodContext(context)
  const personalization = buildPersonalizationContext(context.userProfile)
  
  return `You are an AI habit coach. Provide detailed insights for a specific habit.

Habit: ${habit?.title || 'Unknown'}
Category: ${habit?.category || 'General'}
Period: ${periodInfo.label}
Current Streak: ${habit?.currentStreak || 0} days
Completion Rate: ${habit?.completionRate || 0}%${personalization}

Generate 2-3 insights:
1. Progress analysis for ${periodInfo.label}
2. Personalized tips based on user's profile
3. Encouragement that aligns with their motivation factors

Output ONLY valid JSON array (same format as general insights).`
}

// ============================================================================
// GROQ API CALL (Unchanged)
// ============================================================================

async function callGroqAPI(prompt: string, systemPrompt: string): Promise<any> {
  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch (e) {
    console.error('Failed to parse JSON response:', content)
    throw new Error('Invalid JSON response from AI')
  }
}

// ============================================================================
// MAIN HANDLER (Enhanced but backward compatible)
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    })
  }

  try {
    const startTime = Date.now()
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body: InsightsRequest = await req.json()
    const { type, habitId, context = {} } = body

    let result: any = {}

    switch (type) {
      case 'insights': {
        const prompt = buildInsightsPrompt(context)
        const response = await callGroqAPI(
          prompt,
          'You are a JSON-only AI habit coach. Output valid JSON arrays only. Be highly personalized and empathetic.'
        )
        result = { insights: response.insights || response }
        break
      }

      case 'suggestions': {
        const prompt = buildSuggestionsPrompt(context)
        const response = await callGroqAPI(
          prompt,
          'You are a JSON-only AI habit coach. Output valid JSON arrays only. Be specific and personalized.'
        )
        result = { suggestions: response.suggestions || response }
        break
      }

      case 'mood_analysis': {
        const prompt = buildMoodAnalysisPrompt(context)
        const response = await callGroqAPI(
          prompt,
          'You are a JSON-only AI wellness coach. Output valid JSON arrays only.'
        )
        result = { moodInsights: response.moodInsights || response }
        break
      }

      case 'habit_detail': {
        if (!habitId) {
          throw new Error('habitId required for habit_detail type')
        }
        const prompt = buildHabitDetailPrompt(habitId, context)
        const response = await callGroqAPI(
          prompt,
          'You are a JSON-only AI habit coach. Output valid JSON arrays only.'
        )
        result = { insights: response.insights || response }
        break
      }

      default:
        throw new Error(`Unknown type: ${type}`)
    }

    result.metadata = {
      type,
      latency_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      ...(context.period && { period: context.period }),
      personalized: !!context.userProfile
    }

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    })

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})