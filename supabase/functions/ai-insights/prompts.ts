// supabase/functions/ai-insights/prompts.ts - ENHANCED ANALYTICAL PROMPTS
/**
 * 🎯 ANALYTICAL & PERFORMANCE-BASED PROMPT BUILDERS
 * 
 * These prompts generate statistical insights based on:
 * - Actual completion data from SQLite
 * - User's onboarding profile
 * - Time period analysis
 * - Habit frequency patterns
 * - Streak calculations
 * 
 * @version 4.0.0 - Analytical & Statistical Focus
 */

interface HabitContext {
  id: string;
  title: string;
  icon: string;
  category: string;
  target_count: number;
  target_unit: string;
  frequency_type: string;
  currentStreak?: number;
  completionRate?: number;
  is_active: boolean;
}

interface StatsContext {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
  activeStreak: number;
}

interface UserProfile {
  focusAreas?: string[];
  wakeupTime?: string;
  primaryChallenge?: string;
  routineLevel?: string;
  peakProductivityTime?: string;
  dailyTimeCommitment?: string;
  motivationFactors?: string[];
  hasCommitment?: boolean;
}

interface PeriodInfo {
  type: string;
  totalDays: number;
  label: string;
}

/**
 * 🔥 ENHANCED: General Insights with Statistical Analysis
 */
export function buildInsightsPrompt(
  habits: HabitContext[],
  stats: StatsContext,
  profile: UserProfile | undefined,
  period: PeriodInfo
): string {
  // Calculate habit performance metrics
  const performanceData = habits.map(h => ({
    name: h.title,
    rate: h.completionRate || 0,
    streak: h.currentStreak || 0,
    frequency: h.frequency_type
  }));

  const topPerformers = performanceData
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  const strugglingHabits = performanceData
    .filter(h => h.rate < 50)
    .slice(0, 3);

  const profileContext = profile ? buildPersonalizationContext(profile) : '';

  return `You are an AI habit performance analyst. Analyze the user's ${period.label.toLowerCase()} data and generate 2-3 actionable, data-driven insights.

📊 PERFORMANCE DATA (${period.totalDays} day period):
- Total Habits: ${stats.totalHabits}
- Completed Today: ${stats.completedToday}/${stats.totalHabits} (${Math.round((stats.completedToday / stats.totalHabits) * 100)}%)
- Overall Completion Rate: ${stats.completionRate}%
- Average Active Streak: ${stats.activeStreak} days

🏆 TOP PERFORMERS:
${topPerformers.map(h => `- ${h.name}: ${h.rate}% (${h.streak} day streak)`).join('\n')}

⚠️ NEEDS ATTENTION:
${strugglingHabits.length > 0 ? strugglingHabits.map(h => `- ${h.name}: ${h.rate}%`).join('\n') : 'All habits performing well'}

👤 USER PROFILE:${profileContext}

ANALYSIS REQUIREMENTS:
1. Identify performance patterns and trends from the data
2. Highlight statistical achievements (streaks, completion rates, improvements)
3. Pinpoint specific habits that need attention with data-backed reasoning
4. Provide actionable recommendations based on their profile and ${period.label.toLowerCase()}
5. Use encouraging language that acknowledges real progress

OUTPUT FORMAT (JSON array):
[
  {
    "id": "unique_id",
    "type": "achievement|trend|warning|tip|motivation",
    "title": "Data-driven title (5-8 words)",
    "description": "Statistical insight with specific numbers and actionable advice (30-50 words)",
    "icon": "relevant emoji",
    "priority": "high|medium|low",
    "actionable": true|false,
    "action": {
      "label": "Specific action button text",
      "type": "navigate|create_habit|modify_habit",
      "data": {}
    }
  }
]

EXAMPLES OF GOOD INSIGHTS:
✅ "Your 'Morning Meditation' has a 92% completion rate over ${period.label.toLowerCase()}—the highest of all habits. Consider building on this success by adding a complementary evening routine."
✅ "You've completed 'Exercise' only 3 times this week (43% rate). Try scheduling it during your peak energy time (${profile?.peakProductivityTime || 'morning'}) to improve consistency."
✅ "Amazing! You maintained a 12-day streak across 4 habits during ${period.label.toLowerCase()}. You're ${Math.round(stats.completionRate)}% consistent—keep this momentum going!"

❌ AVOID GENERIC STATEMENTS like:
- "Keep up the good work"
- "You're doing great"
- "Try to be more consistent"

Return 2-3 insights. Be specific, data-driven, and helpful.`;
}

/**
 * 🔥 ENHANCED: Habit Suggestions with Pattern Analysis
 */
export function buildSuggestionsPrompt(
  habits: HabitContext[],
  stats: StatsContext,
  profile: UserProfile | undefined,
  period: PeriodInfo
): string {
  const profileContext = profile ? buildPersonalizationContext(profile) : '';
  const existingCategories = [...new Set(habits.map(h => h.category))];
  const focusAreas = profile?.focusAreas || [];
  const missingAreas = focusAreas.filter(area => 
    !existingCategories.some(cat => 
      cat.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(cat.toLowerCase())
    )
  );

  return `You are an AI habit strategist. Based on performance data from ${period.label.toLowerCase()}, suggest 3-5 new habits that complement the user's existing routine and address gaps.

📊 CURRENT ROUTINE ANALYSIS:
- Active Habits: ${stats.totalHabits}
- Avg Completion Rate: ${stats.completionRate}%
- Categories Covered: ${existingCategories.join(', ')}
- User's Focus Areas: ${focusAreas.join(', ')}
- Missing Focus Areas: ${missingAreas.length > 0 ? missingAreas.join(', ') : 'All covered'}

🎯 EXISTING HABITS:
${habits.slice(0, 10).map(h => `- ${h.title} (${h.category}): ${h.completionRate || 0}% completion, ${h.frequency_type}`).join('\n')}

👤 USER PROFILE:${profileContext}

SUGGESTION CRITERIA:
1. Fill gaps in their stated focus areas: ${focusAreas.join(', ')}
2. Match their time commitment: ${profile?.dailyTimeCommitment || 'flexible'}
3. Address their challenge: ${profile?.primaryChallenge || 'consistency'}
4. Consider their productivity time: ${profile?.peakProductivityTime || 'any time'}
5. Complement existing successful habits
6. Vary difficulty levels
7. Be specific and actionable (not "Read more" but "Read 10 pages before bed")

OUTPUT FORMAT (JSON array):
[
  {
    "id": "unique_id",
    "title": "Specific habit title (3-5 words)",
    "icon": "relevant emoji",
    "category": "Health|Productivity|Mindfulness|Social|Learning|Finance|Other",
    "description": "What this habit is and how to do it (20-30 words)",
    "reasoning": "Why THIS habit is perfect for THEM based on their data and profile (30-50 words)",
    "targetCount": 1,
    "targetUnit": "time|times|minutes|pages|etc",
    "difficulty": "easy|medium|hard",
    "estimatedTime": "5 min|10-15 min|etc"
  }
]

EXAMPLES OF GOOD SUGGESTIONS:
✅ {
  "title": "10-Min Evening Stretch",
  "reasoning": "Your 'Morning Yoga' has 87% completion in ${period.label.toLowerCase()}. An evening counterpart could improve sleep quality (one of your focus areas) and leverage your existing yoga momentum."
}
✅ {
  "title": "Read 10 Pages Before Bed",
  "reasoning": "You want to focus on 'Learning' but have no reading habits yet. Starting with just 10 pages fits your '5-10 min' daily commitment and works well during evening wind-down."
}

❌ AVOID:
- Vague habits ("Be healthier", "Learn more")
- Habits identical to existing ones
- Ignoring their time constraints or challenges

Return 3-5 personalized, data-informed suggestions.`;
}

/**
 * 🔥 ENHANCED: Habit Detail Analysis
 */
export function buildHabitDetailPrompt(
  habitId: string,
  habit: HabitContext | undefined,
  allHabits: HabitContext[],
  period: PeriodInfo,
  profile: UserProfile | undefined
): string {
  if (!habit) {
    return `Habit not found. Return empty array.`;
  }

  const profileContext = profile ? buildPersonalizationContext(profile) : '';
  const avgCompletion = allHabits.length > 0
    ? Math.round(allHabits.reduce((sum, h) => sum + (h.completionRate || 0), 0) / allHabits.length)
    : 0;

  return `You are an AI habit coach analyzing a specific habit's performance over ${period.label.toLowerCase()}.

🎯 HABIT UNDER ANALYSIS:
- Name: ${habit.title}
- Category: ${habit.category}
- Target: ${habit.target_count} ${habit.target_unit} ${habit.frequency_type}
- Completion Rate (${period.label}): ${habit.completionRate || 0}%
- Current Streak: ${habit.currentStreak || 0} days
- User's Average: ${avgCompletion}%

📊 PERFORMANCE CONTEXT:
- Compared to user's average: ${(habit.completionRate || 0) > avgCompletion ? 'Above' : 'Below'} by ${Math.abs((habit.completionRate || 0) - avgCompletion)}%
- Streak Status: ${(habit.currentStreak || 0) > 7 ? 'Strong' : (habit.currentStreak || 0) > 3 ? 'Building' : 'Needs Attention'}

👤 USER PROFILE:${profileContext}

ANALYSIS REQUIREMENTS:
1. Provide statistical breakdown of performance in ${period.label.toLowerCase()}
2. Compare to their other habits
3. Identify specific barriers based on their profile
4. Give actionable advice to improve this specific habit
5. Suggest optimal timing based on their peak productivity

OUTPUT FORMAT (same as general insights):
Return 2-3 insights focused on THIS habit's performance and improvement strategies.`;
}

/**
 * 🔥 ENHANCED: Report Screen Insights (Period-Specific Analysis)
 */
export function buildReportInsightsPrompt(
  habits: HabitContext[],
  stats: StatsContext,
  period: PeriodInfo,
  profile: UserProfile | undefined
): string {
  // Calculate period-specific metrics
  const totalExpectedCompletions = habits.length * period.totalDays;
  const actualCompletions = Math.round((stats.completionRate / 100) * totalExpectedCompletions);
  const missedOpportunities = totalExpectedCompletions - actualCompletions;

  const strongHabits = habits.filter(h => (h.completionRate || 0) >= 80);
  const weakHabits = habits.filter(h => (h.completionRate || 0) < 50);
  const improvedHabits = habits.filter(h => (h.currentStreak || 0) > 7);

  const profileContext = profile ? buildPersonalizationContext(profile) : '';

  return `You are an AI performance analyst generating a statistical summary for ${period.label.toLowerCase()}.

📊 PERIOD STATISTICS (${period.totalDays} days):
- Total Habits Tracked: ${stats.totalHabits}
- Total Possible Completions: ${totalExpectedCompletions}
- Actual Completions: ${actualCompletions} (${stats.completionRate}%)
- Missed Opportunities: ${missedOpportunities}
- Average Streak: ${stats.activeStreak} days

🏆 PERFORMANCE BREAKDOWN:
- Strong Performers (≥80%): ${strongHabits.length} habits
  ${strongHabits.slice(0, 3).map(h => `  • ${h.title}: ${h.completionRate}%`).join('\n')}
  
- Needs Improvement (<50%): ${weakHabits.length} habits
  ${weakHabits.slice(0, 3).map(h => `  • ${h.title}: ${h.completionRate}%`).join('\n')}
  
- Building Momentum (7+ day streak): ${improvedHabits.length} habits

👤 USER PROFILE:${profileContext}

ANALYSIS REQUIREMENTS:
1. Provide a high-level statistical summary of ${period.label.toLowerCase()}
2. Identify key trends and patterns (improving, declining, stable)
3. Calculate performance metrics (completion rate, consistency, momentum)
4. Compare against typical benchmarks (80% is excellent, 50% is baseline)
5. Give actionable recommendations for next period
6. Celebrate specific achievements with numbers

OUTPUT FORMAT (JSON array of insights):
Generate 3-5 analytical insights that:
- Use specific statistics from this period
- Identify trends (week-over-week, month-over-month if applicable)
- Provide comparative analysis
- Suggest data-driven improvements
- Maintain an encouraging but honest tone

EXAMPLE INSIGHTS:
✅ "You completed ${actualCompletions} out of ${totalExpectedCompletions} possible habit instances in ${period.label.toLowerCase()} (${stats.completionRate}%). This puts you in the top quartile of habit trackers!"
✅ "Your 'Health' category habits averaged 78% completion, but 'Learning' habits only hit 34%. Consider moving learning tasks to ${profile?.peakProductivityTime || 'your peak energy time'}."
✅ "You built ${improvedHabits.length} habits into 7+ day streaks this ${period.type}. Focus on maintaining these while addressing the ${weakHabits.length} habits below 50%."

Return 3-5 period-specific, data-rich insights.`;
}

/**
 * Helper: Build personalization context
 */
function buildPersonalizationContext(profile: UserProfile): string {
  const parts: string[] = [];
  
  if (profile.focusAreas && profile.focusAreas.length > 0) {
    parts.push(`• Focus Areas: ${profile.focusAreas.join(', ')}`);
  }
  
  if (profile.wakeupTime) {
    parts.push(`• Wake Time: ${profile.wakeupTime}`);
  }
  
  if (profile.primaryChallenge) {
    parts.push(`• Primary Challenge: ${profile.primaryChallenge}`);
  }
  
  if (profile.peakProductivityTime) {
    parts.push(`• Peak Productivity: ${profile.peakProductivityTime}`);
  }
  
  if (profile.dailyTimeCommitment) {
    parts.push(`• Time Available: ${profile.dailyTimeCommitment}`);
  }
  
  if (profile.motivationFactors && profile.motivationFactors.length > 0) {
    parts.push(`• Motivated By: ${profile.motivationFactors.join(', ')}`);
  }
  
  return parts.length > 0 ? `\n${parts.join('\n')}` : '';
}