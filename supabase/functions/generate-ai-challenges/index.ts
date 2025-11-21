// supabase/functions/generate-ai-challenges/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserHabitData {
  activeHabits: any[];
  streakData: any[];
  missedHabits: any[];
  completionHistory: any[];
  userGoal: any;
  preferredDifficulty: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Generating AI challenges for user: ${user.id}`);

    // Fetch user data
    const userData = await fetchUserData(supabase, user.id);

    // Generate challenges using AI
    const challenges = await generateChallengesWithAI(userData);

    // Store challenges in database
    const storedChallenges = await storeChallenges(supabase, challenges);

    return new Response(
      JSON.stringify({ 
        success: true, 
        challenges: storedChallenges,
        count: storedChallenges.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error generating challenges:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate challenges' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchUserData(supabase: any, userId: string): Promise<UserHabitData> {
  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('goal, settings')
    .eq('id', userId)
    .single();

  // Fetch active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  // Fetch recent completions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: completions } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('completion_date', thirtyDaysAgo.toISOString().split('T')[0]);

  // Calculate streak data
  const streakData = habits?.map(habit => {
    const habitCompletions = completions?.filter(c => c.habit_id === habit.id) || [];
    return {
      habitId: habit.id,
      title: habit.title,
      currentStreak: calculateStreak(habitCompletions),
      completions: habitCompletions.length
    };
  }) || [];

  // Identify missed habits (habits not completed today)
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = new Set(
    completions?.filter(c => c.completion_date === today).map(c => c.habit_id) || []
  );
  const missedHabits = habits?.filter(h => !todayCompletions.has(h.id)) || [];

  return {
    activeHabits: habits || [],
    streakData,
    missedHabits,
    completionHistory: completions || [],
    userGoal: profile?.goal,
    preferredDifficulty: profile?.settings?.preferred_difficulty || 'Medium'
  };
}

function calculateStreak(completions: any[]): number {
  if (!completions.length) return 0;

  const sortedDates = completions
    .map(c => c.completion_date)
    .sort()
    .reverse();

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function generateChallengesWithAI(userData: UserHabitData): Promise<any[]> {
  const prompt = buildPrompt(userData);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert habit coach. Generate personalized challenges that are motivating, achievable, and aligned with the user\'s goals. Return ONLY valid JSON with no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`GROQ API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '[]';
  
  // Parse JSON response
  try {
    const challenges = JSON.parse(content);
    return Array.isArray(challenges) ? challenges : [];
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    return [];
  }
}

function buildPrompt(userData: UserHabitData): string {
  const { activeHabits, streakData, missedHabits, userGoal, preferredDifficulty } = userData;

  return `
Generate 3-5 personalized habit challenges for a user based on the following data:

**Active Habits:**
${activeHabits.map(h => `- ${h.title} (${h.category}, ${h.frequency_type})`).join('\n')}

**Current Streaks:**
${streakData.map(s => `- ${s.title}: ${s.currentStreak} days`).join('\n')}

**Missed Habits Today:**
${missedHabits.map(h => `- ${h.title}`).join('\n')}

**User Goal:**
${userGoal ? JSON.stringify(userGoal) : 'Not specified'}

**Preferred Difficulty:**
${preferredDifficulty}

Generate challenges that:
1. Build on existing habits
2. Address missed habits
3. Introduce complementary new habits
4. Match user's difficulty preference
5. Are achievable within 7-30 days

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Challenge title",
    "description": "Detailed description",
    "difficulty": "Easy|Medium|Hard",
    "duration_days": 7-30,
    "icon": "relevant emoji",
    "reasoning": "Why this challenge fits the user"
  }
]
`;
}

async function storeChallenges(supabase: any, challenges: any[]): Promise<any[]> {
  const challengesToStore = challenges.map(c => ({
    created_by: 'ai',
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    duration_days: c.duration_days,
    icon: c.icon || '🏆',
    ai_metadata: {
      reasoning: c.reasoning,
      generated_at: new Date().toISOString()
    },
    is_active: true
  }));

  const { data, error } = await supabase
    .from('challenges')
    .insert(challengesToStore)
    .select();

  if (error) {
    console.error('Error storing challenges:', error);
    throw error;
  }

  return data || [];
}