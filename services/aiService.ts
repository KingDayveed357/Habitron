// services/aiService.ts
import { supabase } from './supabase';
import { HabitWithCompletion, HabitStats } from '@/types/habit';

export interface AIInsightRequest {
  type: 'home_insights' | 'mood_analysis' | 'habit_suggestions' | 'habit_detail' | 'chat';
  data?: any;
  message?: string;
  context?: AIContext;
}

export interface AIContext {
  habits?: HabitWithCompletion[];
  stats?: HabitStats;
  userProfile?: {
    name: string;
    preferences?: string[];
    timezone?: string;
  };
  conversationHistory?: ChatMessage[];
  moodData?: any[];
  habitHistory?: any[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  type?: 'text' | 'insight' | 'suggestion';
}

export interface AIResponse {
  success: boolean;
  message?: string;
  insights?: AIInsight[];
  suggestions?: HabitSuggestion[];
  error?: string;
  conversationId?: string;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'achievement' | 'warning' | 'tip' | 'motivation';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  action?: {
    label: string;
    type: 'navigate' | 'create_habit' | 'modify_habit';
    data: any;
  };
}

export interface HabitSuggestion {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  reasoning: string;
  targetCount: number;
  targetUnit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

class AIService {
  private static instance: AIService;
  private conversationCache = new Map<string, ChatMessage[]>();
  private rateLimitTracker = new Map<string, { count: number; resetTime: number }>();
  
  // Rate limiting: 50 requests per hour per user
  private readonly RATE_LIMIT = 50;
  private readonly RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const userLimit = this.rateLimitTracker.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimitTracker.set(userId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }
    
    if (userLimit.count >= this.RATE_LIMIT) {
      return false;
    }
    
    userLimit.count++;
    return true;
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

User Context:
- Name: ${context.userProfile?.name || 'User'}
- Total Habits: ${context.stats?.totalHabits || 0}
- Completed Today: ${context.stats?.completedToday || 0}
- Current Streak: ${context.stats?.activeStreak || 0}
- Completion Rate: ${context.stats?.completionRate || 0}%`;

    switch (type) {
      case 'home_insights':
        return `${basePrompt}

Task: Generate 2-3 personalized insights for the home screen based on the user's habit data. Focus on trends, achievements, or areas for improvement.

Response format: JSON array of insights with type, title, description, icon, and priority.`;

      case 'chat':
        return `${basePrompt}

Task: Respond to the user's message as a supportive AI coach. Provide helpful, personalized advice based on their habit data and conversation history.

Keep responses conversational, under 150 words, and actionable when appropriate.`;

      case 'habit_suggestions':
        return `${basePrompt}

Task: Suggest new habits based on the user's current habits, goals, and patterns. Consider complementary habits and progressive difficulty.

Response format: JSON array of habit suggestions with title, icon, category, description, reasoning, and difficulty.`;

      case 'mood_analysis':
        return `${basePrompt}

Task: Analyze mood patterns in relation to habit completion. Provide insights about correlations and suggestions for improvement.`;

      default:
        return basePrompt;
    }
  }

  async generateInsights(request: AIInsightRequest): Promise<AIResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check rate limiting
      if (!(await this.checkRateLimit(user.id))) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        };
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          type: request.type,
          message: request.message,
          data: request.data,
          context: request.context
        }
      });

      if (error) {
        console.error('AI Service Error:', error);
        return {
          success: false,
          error: 'Failed to generate AI response. Please try again.'
        };
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: 'Something went wrong. Please try again.'
      };
    }
  }

  async sendChatMessage(
    message: string, 
    context: AIContext, 
    conversationId?: string
  ): Promise<{ response: AIResponse; newMessage: ChatMessage }> {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const response = await this.generateInsights({
        type: 'chat',
        message,
        context: {
          ...context,
          conversationHistory: conversationId ? this.conversationCache.get(conversationId) : []
        }
      });

      if (response.success && response.message) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Update conversation cache
        const cacheKey = conversationId || user?.id || 'default';
        const history = this.conversationCache.get(cacheKey) || [];
        history.push(userMessage, aiMessage);
        
        // Keep only last 10 messages for context
        if (history.length > 10) {
          history.splice(0, history.length - 10);
        }
        
        this.conversationCache.set(cacheKey, history);

        return { response, newMessage: aiMessage };
      }

      throw new Error(response.error || 'Failed to get AI response');
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      return {
        response: { success: false, error: 'AI temporarily unavailable' },
        newMessage: errorMessage
      };
    }
  }

  async getHabitSuggestions(context: AIContext): Promise<HabitSuggestion[]> {
    const response = await this.generateInsights({
      type: 'habit_suggestions',
      context
    });

    return response.suggestions || [];
  }

  async getHomeInsights(context: AIContext): Promise<AIInsight[]> {
    const response = await this.generateInsights({
      type: 'home_insights',
      context
    });

    return response.insights || this.getFallbackInsights(context);
  }

  async analyzeMoodPatterns(context: AIContext): Promise<AIResponse> {
    return this.generateInsights({
      type: 'mood_analysis',
      context
    });
  }

  async getHabitDetailInsights(habitId: string, context: AIContext): Promise<AIInsight[]> {
    const response = await this.generateInsights({
      type: 'habit_detail',
      data: { habitId },
      context
    });

    return response.insights || [];
  }

  // Fallback insights when AI is unavailable
  private getFallbackInsights(context: AIContext): AIInsight[] {
    const insights: AIInsight[] = [];
    const stats = context.stats;

    if (!stats) return insights;

    // Completion rate insight
    if (stats.completionRate > 80) {
      insights.push({
        id: 'high_completion',
        type: 'achievement',
        title: 'Amazing Progress!',
        description: `Your ${stats.completionRate}% completion rate shows incredible consistency.`,
        icon: '🎉',
        priority: 'high'
      });
    } else if (stats.completionRate < 50) {
      insights.push({
        id: 'low_completion',
        type: 'tip',
        title: 'Room for Growth',
        description: 'Try starting with just one habit and building from there.',
        icon: '💡',
        priority: 'medium'
      });
    }

    // Streak insight
    if (stats.activeStreak > 7) {
      insights.push({
        id: 'streak_fire',
        type: 'achievement',
        title: 'On Fire!',
        description: `${stats.activeStreak} days of consistency - keep it going!`,
        icon: '🔥',
        priority: 'high'
      });
    }

    // Daily completion
    if (stats.completedToday === stats.totalHabits && stats.totalHabits > 0) {
      insights.push({
        id: 'perfect_day',
        type: 'achievement',
        title: 'Perfect Day!',
        description: 'You completed all your habits today. Celebrate this win!',
        icon: '⭐',
        priority: 'high'
      });
    }

    return insights.slice(0, 3); // Return max 3 insights
  }

  // Clear cache and reset rate limits (useful for testing)
  clearCache(): void {
    this.conversationCache.clear();
    this.rateLimitTracker.clear();
  }

  // Get conversation history
  getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversationCache.get(conversationId) || [];
  }
}

export const aiService = AIService.getInstance();