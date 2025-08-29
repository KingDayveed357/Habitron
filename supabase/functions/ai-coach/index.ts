// supabase/functions/ai-coach/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  type: 'home_insights' | 'mood_analysis' | 'habit_suggestions' | 'habit_detail' | 'chat';
  message?: string;
  data?: any;
  context?: AIContext;
}

interface AIContext {
  data?: any;
  habits?: any[];
  stats?: {
    totalHabits: number;
    completedToday: number;
    activeStreak: number;
    completionRate: number;
  };
  userProfile?: {
    name: string;
    preferences?: string[];
    timezone?: string;
  };
  conversationHistory?: any[];
  moodData?: any[];
  habitHistory?: any[];
}

class GroqAIService {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildSystemPrompt(type: string, context: AIContext): string {
    const basePrompt = `You are Habitron's AI coach, a supportive and knowledgeable habit formation expert. You help users build better habits through personalized insights, motivation, and practical advice.

Key principles:
- Be encouraging but honest
- Provide actionable, specific advice
- Use behavior science principles
- Keep responses concise and engaging
- Personalize based on user data
- Focus on progress over perfection
- Use a warm, supportive tone
- Reference specific user data when relevant

User Context:
- Name: ${context.userProfile?.name || 'User'}
- Total Habits: ${context.stats?.totalHabits || 0}
- Completed Today: ${context.stats?.completedToday || 0}
- Current Streak: ${context.stats?.activeStreak || 0}
- Completion Rate: ${context.stats?.completionRate || 0}%
- Current Habits: ${context.habits?.map(h => `${h.title} (${h.category})`).join(', ') || 'None'}`;

    switch (type) {
      case 'home_insights':
        return `${basePrompt}

Task: Generate 2-3 personalized insights for the home screen based on the user's habit data. Focus on trends, achievements, or areas for improvement.

Analyze the user's data and provide insights that are:
1. Specific to their current situation
2. Actionable and motivating
3. Based on behavior science principles

Response must be valid JSON array with this exact structure:
[
  {
    "id": "unique_id",
    "type": "trend" | "achievement" | "warning" | "tip" | "motivation",
    "title": "Short compelling title (max 30 chars)",
    "description": "Specific insight (max 100 chars)",
    "icon": "relevant emoji",
    "priority": "high" | "medium" | "low"
  }
]

Only return the JSON array, no other text.`;

      case 'chat':
        return `${basePrompt}

Task: Respond to the user's message as a supportive AI coach. Provide helpful, personalized advice based on their habit data and conversation history.

Guidelines:
- Keep responses conversational and under 150 words
- Be specific and actionable when appropriate
- Reference their habit data when relevant
- Ask follow-up questions to better help them
- Encourage progress over perfection

Recent conversation: ${context.conversationHistory?.slice(-4).map(m => `${m.isUser ? 'User' : 'AI'}: ${m.text}`).join('\n') || 'No previous conversation'}

Respond naturally as their habit coach.`;

      case 'habit_suggestions':
        return `${basePrompt}

Task: Suggest 3-5 new habits based on the user's current habits, completion patterns, and gaps in their routine.

Consider:
- Complementary habits to their existing ones
- Progressive difficulty based on their success rate
- Common habit stacking opportunities
- Areas they might be neglecting (health, productivity, mindfulness, etc.)

Response must be valid JSON array:
[
  {
    "id": "unique_id",
    "title": "Habit title (max 50 chars)",
    "icon": "relevant emoji",
    "category": "category name",
    "description": "Brief description (max 100 chars)",
    "reasoning": "Why this habit suits them (max 150 chars)",
    "targetCount": 1,
    "targetUnit": "times|minutes|glasses|etc",
    "difficulty": "easy" | "medium" | "hard",
    "estimatedTime": "5 minutes|10 minutes|etc"
  }
]

Only return the JSON array, no other text.`;

      case 'mood_analysis':
        return `${basePrompt}

Mood data available: ${context.moodData ? 'Yes' : 'No'}

Task: Analyze the correlation between mood patterns and habit completion. Provide insights about:
- How habits affect mood
- Optimal timing recommendations
- Emotional patterns around habit completion

Provide actionable insights in conversational format.`;

      case 'habit_detail':
        return `${basePrompt}

Habit being analyzed: ${context.data?.habitId}
Habit data: ${context.habitHistory ? 'Available' : 'Limited'}

Task: Provide specific insights about this habit's performance, patterns, and optimization suggestions.

Response should be conversational and include:
- Performance analysis
- Pattern recognition
- Specific improvement suggestions
- Encouraging observations`;

      default:
        return basePrompt;
    }
  }

  private buildUserMessage(type: string, message?: string, context?: AIContext): string {
    switch (type) {
      case 'home_insights':
        return 'Generate personalized insights for my home screen based on my current habit data.';
      
      case 'chat':
        return message || 'Hello, I need help with my habits.';
      
      case 'habit_suggestions':
        return 'Suggest new habits that would complement my current routine and help me improve.';
      
      case 'mood_analysis':
        return 'Analyze my mood patterns in relation to my habit completion.';
      
      case 'habit_detail':
        return `Provide insights about my ${context?.data?.habitId || 'habit'} and how I can improve.`;
      
      default:
        return message || 'Help me with my habits.';
    }
  }

  async generateResponse(request: AIRequest): Promise<any> {
    const systemPrompt = this.buildSystemPrompt(request.type, request.context || {});
    const userMessage = this.buildUserMessage(request.type, request.message, request.context);

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: request.type === 'chat' ? 200 : 500,
      top_p: 0.9,
      stream: false
    };

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API Error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in Groq response');
      }

      return this.parseResponse(request.type, content);
    } catch (error) {
      console.error('Groq AI Service Error:', error);
      throw error;
    }
  }

  private parseResponse(type: string, content: string): any {
    try {
      switch (type) {
        case 'home_insights':
          // Try to parse as JSON first
          try {
            const insights = JSON.parse(content.trim());
            if (Array.isArray(insights)) {
              return { insights };
            }
          } catch {
            // Fallback: extract JSON from response if wrapped in markdown
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const insights = JSON.parse(jsonMatch[0]);
              return { insights };
            }
          }
          
          // Fallback to parsing text response
          return {
            insights: [{
              id: 'fallback_insight',
              type: 'tip',
              title: 'Keep Going!',
              description: 'Every small step counts toward building lasting habits.',
              icon: '💪',
              priority: 'medium'
            }]
          };

        case 'habit_suggestions':
          try {
            const suggestions = JSON.parse(content.trim());
            if (Array.isArray(suggestions)) {
              return { suggestions };
            }
          } catch {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const suggestions = JSON.parse(jsonMatch[0]);
              return { suggestions };
            }
          }
          
          return { suggestions: [] };

        case 'chat':
        case 'mood_analysis':
        case 'habit_detail':
        default:
          return { message: content.trim() };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        message: "I'm having trouble processing that right now. Could you try rephrasing your question?"
      };
    }
  }
}

serve(async (req:any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the API key from environment variables
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured')
    }

    // Parse request body
    const request: AIRequest = await req.json()
    
    // Validate request
    if (!request.type) {
      throw new Error('Request type is required')
    }

    // Initialize AI service
    const aiService = new GroqAIService(groqApiKey)
    
    // Generate response
    const result = await aiService.generateResponse(request)

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Edge Function Error:', error)
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error) || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to avoid client-side error handling issues
      },
    )
  }
})